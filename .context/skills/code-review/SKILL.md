---
type: skill
name: Code Review
description: Review code quality, patterns, and best practices
skillSlug: code-review
phases: [R, V]
generated: 2026-01-24
status: filled
scaffoldVersion: "2.0.0"
---

# Code Review Guidelines

## Princípios Gerais

1. **Legibilidade primeiro**: Código é lido muito mais vezes do que escrito
2. **Simplicidade**: Evite over-engineering
3. **Consistência**: Siga padrões já estabelecidos no projeto
4. **Type Safety**: Aproveite TypeScript ao máximo

## Padrões do Projeto

### Estrutura de Arquivos

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Grupo de rotas de autenticação
│   ├── (dashboard)/       # Grupo de rotas do dashboard
│   └── auth/callback/     # Callback de OAuth
├── components/
│   ├── ui/                # Componentes base (shadcn)
│   ├── tables/            # Tabelas especializadas
│   ├── forms/             # Formulários
│   ├── charts/            # Gráficos
│   ├── layout/            # Layout components
│   └── __tests__/         # Testes de componentes
├── core/
│   ├── calculations/      # Lógica de cálculos financeiros
│   ├── types/             # Tipos core
│   └── validators/        # Schemas Zod
├── lib/
│   ├── actions/           # Server Actions
│   ├── mock/              # Sistema de mock
│   ├── supabase/          # Cliente Supabase
│   └── utils/             # Utilitários
├── types/                 # Tipos de domínio
└── hooks/                 # React hooks customizados
```

### TypeScript

#### ✅ BOM

```typescript
// Tipos bem definidos
interface DRECalculationInput {
  receitaBruta: number;
  impostosSobreVendas: number;
  custosMercadorias: number;
}

// Função com tipo de retorno explícito
function calculateDRE(input: DRECalculationInput): DRECalculated {
  // ...
}

// Usar tipos do projeto
import type { FinancialModel } from '@/core/types';
```

#### ❌ EVITAR

```typescript
// any desnecessário
function processData(data: any) { }

// Tipo não exportado quando deveria ser reutilizável
function calculate(input: { a: number; b: number }) { }

// Missing return type
function calculate(input: DREInput) {
  return { result: 0 }; // Qual o tipo?
}
```

### Server vs Client Components

#### Server Components (Padrão)

```typescript
// src/app/(dashboard)/dashboard/page.tsx
import { getModels } from '@/lib/actions/models';

export default async function DashboardPage() {
  const models = await getModels();

  return <div>{/* ... */}</div>;
}
```

#### Client Components

```typescript
// src/components/forms/LoginForm.tsx
'use client';

import { useState } from 'react';
import { signIn } from '@/lib/actions/auth';

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  // ...
}
```

**Quando usar Client:**
- Estado interativo (useState, useReducer)
- Event handlers
- Browser APIs (localStorage, window)
- Hooks do React (useEffect, useContext)

### Server Actions

#### ✅ Padrão Correto

```typescript
// src/lib/actions/models.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createModel(data: CreateModelInput) {
  // 1. Autenticação
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  // 2. Validação
  const validated = createModelSchema.parse(data);

  // 3. Operação
  const { data: model, error } = await supabase
    .from('financial_models')
    .insert({ ...validated, user_id: user.id })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // 4. Revalidação
  revalidatePath('/dashboard');

  return { success: true, data: model };
}
```

### Cálculos Financeiros

Localização: `src/core/calculations/`

#### ✅ Padrão

```typescript
// src/core/calculations/dre.ts
import { z } from 'zod';
import type { DREBaseInputs, DRECalculated } from '@/core/types';

// 1. Schema de validação
const dreInputSchema = z.object({
  receitaBruta: z.number().min(0),
  impostosSobreVendas: z.number().min(0).max(100),
  // ...
});

// 2. Função de cálculo pura
export function calculateDRE(inputs: DREBaseInputs): DRECalculated {
  // Validação
  const validated = dreInputSchema.parse(inputs);

  // Cálculo step-by-step
  const receitaLiquida = validated.receitaBruta * (1 - validated.impostosSobreVendas / 100);
  const lucroOperacional = receitaLiquida - validated.custosMercadorias;

  // Tratamento de edge cases
  if (receitaLiquida === 0) {
    return { /* valores seguros */ };
  }

  return {
    receitaLiquida,
    lucroOperacional,
    margemLiquida: (lucroOperacional / receitaLiquida) * 100,
  };
}
```

#### Checklist para Cálculos

- [ ] Função pura (mesma entrada = mesma saída)
- [ ] Validação de inputs com Zod
- [ ] Tratamento de divisão por zero
- [ ] Comentários explicando fórmulas complexas
- [ ] Testes com valores conhecidos
- [ ] Edge cases cobertos

### Componentes

#### ✅ Componente Bem Estruturado

```typescript
// src/components/tables/DRETable.tsx
'use client';

import type { DRECalculated } from '@/core/types';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DRETableProps {
  data: DRECalculated[];
  currency?: 'BRL' | 'USD';
}

export function DRETable({ data, currency = 'BRL' }: DRETableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Linha</TableHead>
          {data.map((_, i) => (
            <TableHead key={i}>Ano {i + 1}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Receita Bruta</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{formatCurrency(d.receitaBruta, currency)}</TableCell>
          ))}
        </TableRow>
        {/* ... */}
      </TableBody>
    </Table>
  );
}
```

#### Checklist para Componentes

- [ ] Props tipadas com interface
- [ ] Default props quando apropriado
- [ ] Decomposição adequada (não muito grande)
- [ ] Nomes descritivos
- [ ] Memoização se necessário (useMemo, useCallback)
- [ ] Acessibilidade (aria-labels, semantic HTML)

### Mock System

O projeto usa um sistema de mock para desenvolvimento sem Supabase.

#### ✅ Usando Mock System

```typescript
// src/lib/actions/models.ts
import { isMockMode } from '@/lib/mock/config';
import { getMockStore } from '@/lib/mock/store';

export async function getModels() {
  // Mock mode
  if (isMockMode()) {
    const store = getMockStore();
    return {
      success: true,
      data: store.getModels(),
    };
  }

  // Produção
  const supabase = await createClient();
  // ...
}
```

### Formatação e Estilo

#### Formatters

Use os formatters do projeto em `src/lib/utils/formatters.ts`:

```typescript
import { formatCurrency, formatPercentage, formatCompactNumber } from '@/lib/utils/formatters';

// Moeda
formatCurrency(1234.56, 'BRL')  // "R$ 1.234,56"

// Porcentagem
formatPercentage(0.1523)  // "15,23%"

// Números grandes
formatCompactNumber(1234567)  // "1,23M"
```

#### Tailwind CSS

- Use `cn()` para combinar classes condicionalmente
- Siga ordem: layout → spacing → typography → colors → effects
- Mobile-first (base styles sem prefix, `md:`, `lg:` para maiores)

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "flex flex-col gap-4",  // Layout
  "p-6 rounded-lg",       // Spacing & borders
  "text-sm font-medium",  // Typography
  "bg-white text-gray-900", // Colors
  isActive && "ring-2 ring-blue-500" // Conditional
)} />
```

## Padrões de Segurança

### ✅ Input Validation

```typescript
// SEMPRE validar no servidor
'use server';

export async function updateModel(id: string, data: UpdateModelInput) {
  // Validação com Zod
  const validated = updateModelSchema.parse(data);

  // Verificar ownership
  const model = await getModelById(id);
  if (model.user_id !== currentUser.id) {
    throw new Error('Unauthorized');
  }

  // Proceder
}
```

### ❌ Evitar

```typescript
// SQL Injection (NÃO fazer)
await supabase.rpc('raw_query', { query: `SELECT * FROM models WHERE id = ${id}` });

// XSS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Secrets no código
const API_KEY = "sk_live_123456789";
```

## Performance

### Otimizações Comuns

1. **Server Components**: Use por padrão
2. **Dynamic imports**: Para componentes pesados
```typescript
const HeavyChart = dynamic(() => import('@/components/charts/HeavyChart'), {
  loading: () => <Skeleton />,
});
```
3. **Memoização**: Para cálculos caros
```typescript
const expensiveValue = useMemo(() => calculateWACC(inputs), [inputs]);
```

## Checklist de Review

### Geral
- [ ] Código limpo e legível
- [ ] Nomes descritivos
- [ ] Sem código comentado/debug
- [ ] Sem console.log em produção

### TypeScript
- [ ] Tipos bem definidos
- [ ] Sem `any` desnecessário
- [ ] Interfaces exportadas quando reutilizáveis

### React
- [ ] Server/Client component apropriado
- [ ] Props tipadas
- [ ] Hooks usados corretamente
- [ ] Sem memory leaks (cleanup de useEffect)

### Segurança
- [ ] Inputs validados
- [ ] Autenticação verificada
- [ ] Sem secrets expostos

### Performance
- [ ] Sem re-renders desnecessários
- [ ] Cálculos pesados memoizados
- [ ] Images otimizadas

### Testes
- [ ] Lógica crítica testada
- [ ] Edge cases cobertos
