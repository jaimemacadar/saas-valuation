---
type: skill
name: Api Design
description: Design RESTful APIs following best practices
skillSlug: api-design
phases: [P, R]
generated: 2026-01-24
status: filled
scaffoldVersion: "2.0.0"
---

# API Design Guidelines

## Convenções do Projeto

Este projeto usa **Server Actions** (Next.js) ao invés de REST APIs tradicionais. No entanto, princípios REST ainda se aplicam ao design.

### Server Actions vs REST

```typescript
// ❌ REST tradicional (não usado)
// GET /api/models
// POST /api/models
// PUT /api/models/:id
// DELETE /api/models/:id

// ✅ Server Actions (padrão do projeto)
// src/lib/actions/models.ts
export async function getModels()
export async function createModel(data: CreateModelInput)
export async function updateModel(id: string, data: UpdateModelInput)
export async function deleteModel(id: string)
```

## Estrutura de Server Actions

### Localização

```
src/lib/actions/
├── auth.ts           # Autenticação
├── models.ts         # CRUD de modelos
└── [feature].ts      # Outras features
```

### Padrão de Nomenclatura

```typescript
// Verbos CRUD
getModels()           // READ (list)
getModelById(id)      // READ (single)
createModel(data)     // CREATE
updateModel(id, data) // UPDATE
deleteModel(id)       // DELETE
duplicateModel(id)    // Operação especial

// Operações de negócio
calculateValuation(inputs)
exportModelToExcel(id)
shareModel(id, userId)
```

### Estrutura Padrão de Action

```typescript
// src/lib/actions/models.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isMockMode } from '@/lib/mock/config';

// 1. Tipos e Validação
const createModelSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  company_name: z.string().optional(),
  model_type: z.enum(['DCF', 'Multiples', 'DDM']),
});

type CreateModelInput = z.infer<typeof createModelSchema>;

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

// 2. Action
export async function createModel(
  input: CreateModelInput
): Promise<ActionResult<FinancialModel>> {
  try {
    // 3. Validação de Input
    const validated = createModelSchema.parse(input);

    // 4. Mock Mode Check
    if (isMockMode()) {
      return handleMockCreateModel(validated);
    }

    // 5. Autenticação
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // 6. Autorização (se necessário)
    // Check user permissions, ownership, etc.

    // 7. Operação Principal
    const { data, error } = await supabase
      .from('financial_models')
      .insert({
        ...validated,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return { success: false, error: 'Failed to create model' };
    }

    // 8. Side Effects
    revalidatePath('/dashboard');

    // 9. Retorno
    return { success: true, data };

  } catch (error) {
    // 10. Error Handling
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input data' };
    }

    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
```

## Validação de Inputs

### Schemas Zod

```typescript
// src/lib/actions/models.ts

// Schema base
const modelBaseSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome muito longo'),
  description: z.string().max(1000).optional(),
  company_name: z.string().max(255).optional(),
  model_type: z.enum(['DCF', 'Multiples', 'DDM']),
});

// Schema para create (pode ter campos obrigatórios extras)
const createModelSchema = modelBaseSchema.extend({
  // Campos adicionais para criação
});

// Schema para update (todos os campos opcionais)
const updateModelSchema = modelBaseSchema.partial().extend({
  // Apenas campos que podem ser atualizados
});

// Validação com mensagens customizadas
const validateModelData = (data: unknown) => {
  const result = createModelSchema.safeParse(data);

  if (!result.success) {
    // Formatar erros para o usuário
    const errors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
};
```

## Response Format

### Padrão de Retorno

```typescript
// Sucesso sem dados
type SuccessResult = {
  success: true;
};

// Sucesso com dados
type SuccessWithDataResult<T> = {
  success: true;
  data: T;
};

// Erro simples
type ErrorResult = {
  success: false;
  error: string;
};

// Erro com detalhes
type DetailedErrorResult = {
  success: false;
  error: string;
  details?: Record<string, string[]>; // Field errors
  code?: string; // Error code
};

// Union type
type ActionResult<T = void> = T extends void
  ? SuccessResult | ErrorResult
  : SuccessWithDataResult<T> | ErrorResult;
```

### Exemplos de Retorno

```typescript
// Sucesso
return { success: true, data: model };

// Erro de validação
return {
  success: false,
  error: 'Dados inválidos',
  details: {
    name: ['Nome é obrigatório'],
    email: ['Email inválido'],
  },
};

// Erro de negócio
return {
  success: false,
  error: 'Não é possível deletar modelo com dados vinculados',
  code: 'MODEL_HAS_DEPENDENCIES',
};

// Erro de permissão
return {
  success: false,
  error: 'Você não tem permissão para esta ação',
  code: 'FORBIDDEN',
};
```

## Autenticação e Autorização

### Pattern de Auth

```typescript
// Helper function para autenticação
async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return user;
}

// Uso em actions
export async function getModels() {
  const user = await requireAuth();

  // Mock mode
  if (isMockMode()) {
    return { success: true, data: getMockModels() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('financial_models')
    .select('*')
    .eq('user_id', user.id); // Filtrar por usuário

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
```

### Ownership Check

```typescript
export async function updateModel(
  id: string,
  input: UpdateModelInput
) {
  const user = await requireAuth();
  const validated = updateModelSchema.parse(input);

  // Verificar ownership
  const supabase = await createClient();
  const { data: model } = await supabase
    .from('financial_models')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!model || model.user_id !== user.id) {
    return {
      success: false,
      error: 'Modelo não encontrado ou você não tem permissão',
    };
  }

  // Proceder com update...
}
```

## Error Handling

### Categorias de Erros

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} não encontrado`, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('Não autenticado', 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super('Sem permissão', 'FORBIDDEN', 403);
  }
}
```

### Error Handler

```typescript
// Wrapper para actions com error handling
export function withErrorHandling<T extends any[], R>(
  action: (...args: T) => Promise<ActionResult<R>>
) {
  return async (...args: T): Promise<ActionResult<R>> => {
    try {
      return await action(...args);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Dados inválidos',
          details: error.flatten().fieldErrors,
        };
      }

      if (error instanceof AppError) {
        return {
          success: false,
          error: error.message,
          code: error.code,
        };
      }

      console.error('Unexpected error:', error);
      return {
        success: false,
        error: 'Erro inesperado. Tente novamente.',
      };
    }
  };
}

// Uso
export const createModel = withErrorHandling(async (input: CreateModelInput) => {
  // ... implementação
});
```

## Rate Limiting & Throttling

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10s
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(
    identifier
  );

  if (!success) {
    throw new AppError(
      `Rate limit exceeded. Try again in ${reset - Date.now()}ms`,
      'RATE_LIMIT_EXCEEDED',
      429
    );
  }

  return { limit, remaining, reset };
}

// Uso em action
export async function createModel(input: CreateModelInput) {
  const user = await requireAuth();

  // Rate limit por usuário
  await checkRateLimit(`create-model:${user.id}`);

  // ... rest of implementation
}
```

## Paginação

```typescript
// Types
type PaginationParams = {
  page?: number;
  pageSize?: number;
};

type PaginatedResult<T> = {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

// Implementation
export async function getModels(
  params: PaginationParams = {}
): Promise<ActionResult<PaginatedResult<FinancialModel>>> {
  const user = await requireAuth();
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const offset = (page - 1) * pageSize;

  const supabase = await createClient();

  // Get total count
  const { count } = await supabase
    .from('financial_models')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Get paginated data
  const { data, error } = await supabase
    .from('financial_models')
    .select('*')
    .eq('user_id', user.id)
    .range(offset, offset + pageSize - 1);

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      data: data || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    },
  };
}
```

## Filtros e Ordenação

```typescript
type FilterParams = {
  modelType?: 'DCF' | 'Multiples' | 'DDM';
  search?: string;
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
};

export async function getModels(
  filters: FilterParams & PaginationParams = {}
) {
  const user = await requireAuth();
  const supabase = await createClient();

  let query = supabase
    .from('financial_models')
    .select('*')
    .eq('user_id', user.id);

  // Filtros
  if (filters.modelType) {
    query = query.eq('model_type', filters.modelType);
  }

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
    );
  }

  // Ordenação
  const sortBy = filters.sortBy || 'created_at';
  const sortOrder = filters.sortOrder || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Paginação
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const offset = (page - 1) * pageSize;
  query = query.range(offset, offset + pageSize - 1);

  const { data, error } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
```

## Checklist de API Design

### Server Action

- [ ] Validação de input com Zod
- [ ] Autenticação verificada
- [ ] Autorização verificada (ownership)
- [ ] Mock mode suportado
- [ ] Error handling apropriado
- [ ] Tipo de retorno ActionResult
- [ ] Revalidação de cache quando necessário
- [ ] Logs de erro apropriados

### Validação

- [ ] Schema Zod definido
- [ ] Mensagens de erro em português
- [ ] Edge cases cobertos
- [ ] Tipos inferidos do schema

### Segurança

- [ ] Inputs sanitizados
- [ ] SQL injection preveni (usar query builder)
- [ ] Rate limiting (se necessário)
- [ ] Permissões verificadas

### Performance

- [ ] Queries otimizadas
- [ ] Apenas campos necessários selecionados
- [ ] Paginação implementada
- [ ] Cache considerado
