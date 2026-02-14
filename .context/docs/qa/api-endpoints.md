---
slug: api-endpoints
category: features
generatedAt: 2026-01-27T02:46:36.358Z
updatedAt: 2026-02-14
relevantFiles:
  - ../../../src/lib/actions/auth.ts
  - ../../../src/lib/actions/models.ts
---

# What API endpoints are available?

A aplicação utiliza **Next.js Server Actions** em vez de API routes tradicionais. Todas as Server Actions são type-safe e incluem validação com Zod.

## Server Actions Disponíveis

### 🔐 Autenticação (`src/lib/actions/auth.ts`)

#### `signIn(prevState, formData)`
Autentica um usuário existente.

**Parâmetros:**
- `email` (string): Email do usuário
- `password` (string): Senha (mínimo 6 caracteres)

**Retorno:**
```typescript
{
  error?: string;
  success?: boolean;
  message?: string;
}
```

**Comportamento:**
- Valida credenciais com Zod
- Mock mode: usa autenticação simulada
- Produção: usa Supabase Auth
- Redireciona para `/dashboard` em caso de sucesso

---

#### `signUp(prevState, formData)`
Cria uma nova conta de usuário.

**Parâmetros:**
- `email` (string): Email válido
- `password` (string): Senha (mínimo 6 caracteres)
- `confirmPassword` (string): Confirmação de senha
- `name` (string): Nome completo (mínimo 2 caracteres)

**Retorno:**
```typescript
{
  error?: string;
  success?: boolean;
  message?: string;
}
```

**Validações:**
- Email válido
- Senhas devem coincidir
- Nome com mínimo 2 caracteres
- Senha com mínimo 6 caracteres

---

#### `signOut()`
Encerra a sessão do usuário.

**Retorno:**
```typescript
{
  error?: string;
  success?: boolean;
}
```

**Comportamento:**
- Limpa sessão no servidor
- Mock mode: limpa cookie de sessão mock
- Produção: chama Supabase signOut
- Redireciona para `/login`

---

#### `resetPassword(prevState, formData)`
Envia email de recuperação de senha.

**Parâmetros:**
- `email` (string): Email cadastrado

**Retorno:**
```typescript
{
  error?: string;
  success?: boolean;
  message?: string;
}
```

---

#### `updatePassword(prevState, formData)`
Atualiza senha do usuário autenticado.

**Parâmetros:**
- `password` (string): Nova senha (mínimo 6 caracteres)
- `confirmPassword` (string): Confirmação da nova senha

**Retorno:**
```typescript
{
  error?: string;
  success?: boolean;
  message?: string;
}
```

---

#### `signInWithOAuth(provider)`
Autentica via provedor OAuth (Google/GitHub).

**Parâmetros:**
- `provider` (string): "google" ou "github"

**Retorno:**
```typescript
{
  error?: string;
  url?: string;
}
```

---

### 📊 Modelos Financeiros (`src/lib/actions/models.ts`)

#### `getModels()`
Lista todos os modelos do usuário autenticado.

**Retorno:**
```typescript
{
  success?: boolean;
  data?: FinancialModelBasic[];
  error?: string;
}

type FinancialModelBasic = {
  id: string;
  user_id: string;
  company_name: string;
  ticker_symbol?: string;
  description?: string;
  model_data: unknown;
  created_at: string;
  updated_at: string;
}
```

**Comportamento:**
- Requer autenticação
- Ordenado por `updated_at` (mais recentes primeiro)
- Mock mode: retorna dados do store in-memory
- Produção: consulta tabela `financial_models`

---

#### `getModelById(id: string)`
Busca um modelo específico por ID.

**Parâmetros:**
- `id` (string): UUID do modelo

**Retorno:**
```typescript
{
  success?: boolean;
  data?: FinancialModelBasic;
  error?: string;
}
```

**Segurança:**
- Valida que o modelo pertence ao usuário autenticado (RLS)

---

#### `createModel(formData)`
Cria um novo modelo de valuation.

**Parâmetros:**
```typescript
{
  company_name: string;
  ticker_symbol?: string;
  description?: string;
  model_data?: unknown;
}
```

**Retorno:**
```typescript
{
  success?: boolean;
  data?: { id: string };
  error?: string;
}
```

**Comportamento:**
- Gera UUID automático
- Inicializa `model_data` vazio se não fornecido
- Mock mode: armazena em memória com latência simulada
- Produção: insere em `financial_models`

---

#### `updateModel(id, formData)`
Atualiza dados de um modelo existente.

**Parâmetros:**
- `id` (string): UUID do modelo
- `formData` (objeto): Campos a atualizar

**Retorno:**
```typescript
{
  success?: boolean;
  error?: string;
}
```

**Segurança:**
- Apenas o dono pode atualizar (RLS)

---

#### `deleteModel(id: string)`
Exclui um modelo permanentemente.

**Parâmetros:**
- `id` (string): UUID do modelo

**Retorno:**
```typescript
{
  success?: boolean;
  error?: string;
}
```

**Segurança:**
- Apenas o dono pode deletar (RLS)

---

#### `duplicateModel(id: string)`
Cria uma cópia de um modelo existente.

**Parâmetros:**
- `id` (string): UUID do modelo a duplicar

**Retorno:**
```typescript
{
  success?: boolean;
  data?: { id: string };
  error?: string;
}
```

**Comportamento:**
- Gera novo UUID
- Copia todos os dados do modelo original
- Adiciona sufixo " (Cópia)" ao nome da empresa
- Atualiza timestamps para data atual

---

#### `saveDREBase(modelId, data)`
Salva dados de DRE (Demonstração de Resultado) do ano base.

**Parâmetros:**
- `modelId` (string): UUID do modelo
- `data` (objeto): Dados da DRE

**Retorno:**
```typescript
{
  success?: boolean;
  error?: string;
}
```

---

#### `saveBalanceSheetBase(modelId, data)`
Salva dados de Balanço Patrimonial do ano base.

**Parâmetros:**
- `modelId` (string): UUID do modelo
- `data` (objeto): Dados do Balanço

**Retorno:**
```typescript
{
  success?: boolean;
  error?: string;
}
```

**Validações:**
- Verifica equação contábil: Ativo = Passivo + Patrimônio Líquido

---

## Tipos de Resposta

### ActionResult
```typescript
type ActionResult<T = unknown> = {
  data?: T;
  error?: string;
  success?: boolean;
  message?: string;
};
```

### Códigos de Erro Comuns

| Erro | Descrição |
|------|-----------|
| "Email ou senha incorretos" | Credenciais inválidas no login |
| "Erro ao carregar modelos" | Falha na consulta de modelos |
| "Modelo não encontrado" | ID de modelo inexistente ou sem permissão |
| "As senhas não coincidem" | Senha e confirmação diferentes |
| "Email inválido" | Formato de email incorreto |

---

## Modo Mock vs Produção

Todas as Server Actions suportam dois modos:

### Mock Mode (`NEXT_PUBLIC_USE_MOCK_DATA=true`)
- Dados armazenados em memória
- Latência simulada (100-300ms)
- Autenticação simulada com sessões
- Sem necessidade de Supabase

### Produção Mode
- Supabase Auth para autenticação
- PostgreSQL para persistência
- Row Level Security (RLS) ativo
- Transações ACID

---

## Segurança

### Row Level Security (RLS)
Todas as operações de modelos são protegidas por RLS:
```sql
-- Exemplo de política RLS
CREATE POLICY "Users can only see their own models"
ON financial_models FOR SELECT
USING (auth.uid() = user_id);
```

### Validação
Todos os inputs são validados com **Zod** antes do processamento.

### Autenticação
- Middleware protege rotas do dashboard
- JWT tokens gerenciados pelo Supabase
- Refresh automático de sessões

---

## Ver Também

- [Authentication Flow](./authentication.md)
- [Database Schema](./database.md)
- [Architecture Overview](../architecture.md)