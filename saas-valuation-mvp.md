# Plano de Implementação - SaaS de Valuation de Empresas

**Status:** 🟡 Planejamento  
**Última Atualização:** 2026-01-22  
**Timeline Estimado:** 13-18 semanas (3.5-4.5 meses)

---

## 📋 Resumo Executivo

Desenvolvimento completo de aplicativo SaaS para valuation de empresas negociadas em bolsa usando método de Fluxo de Caixa Descontado (FCD).

# Plano de Implementação - SaaS de Valuation de Empresas

**Status:** 🟡 Planejamento  
**Última Atualização:** 2026-01-24  
**Timeline Estimado:** 14-20 semanas (3.5-5 meses)

---

## 📋 Resumo Executivo

Desenvolvimento completo de aplicativo SaaS para valuation de empresas negociadas em bolsa usando método de Fluxo de Caixa Descontado (FCD).

### Stack Tecnológica
- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Estilização:** Tailwind CSS + shadcn/ui
- **Autenticação:** Supabase Auth (email/senha + OAuth Google/GitHub)
- **Backend/BaaS:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **API:** Next.js API Routes + Server Actions
- **Estado (Cliente):** Zustand (apenas para estado de UI)
- **Formulários:** React Hook Form + Zod
- **Cálculos:** decimal.js (precisão financeira) - **executados no servidor**
- **Gráficos:** Recharts
- **Tabelas:** TanStack Table

### Arquitetura
- **Full-Stack Modular** com Next.js App Router
- **Server-First:** Motor de cálculo executa 100% no servidor (Server Components + API Routes)
- **Core Module Isolation:** Lógica de negócio isolada em `src/core/` (zero dependências de React/DOM)
- **API REST Nativa:** Endpoints em `/api/` para acesso programático (agentes de IA, integrações)
- **Padrão Result:** Funções puras retornam `CalculationResult<T>` com tipagem forte
- **Row Level Security:** Isolamento de dados por usuário no Supabase
- **Server Actions:** Operações de cálculo e persistência via Server Actions

### Benefícios da Arquitetura Next.js
- ✅ Motor de cálculo no servidor (segurança, performance, reuso)
- ✅ API REST integrada (sem necessidade de backend separado)
- ✅ SSR/SSG para páginas públicas (SEO, performance)
- ✅ Server Components reduzem bundle do cliente
- ✅ Middleware para autenticação centralizada
- ✅ Pronto para deploy na Vercel (edge functions, analytics)

### Escopo MVP
✅ Autenticação e contas de usuário (email/senha + OAuth)  
✅ Salvamento de modelos na nuvem (por usuário)  
✅ Projeções de DRE (5 ou 10 anos)  
✅ Projeções de Balanço Patrimonial (5 ou 10 anos)  
✅ Cálculo de Fluxo de Caixa Livre (FCFF)  
✅ Valuation por Fluxo de Caixa Descontado  
✅ Análise de sensibilidade básica  
✅ Exportação para Excel  
✅ **API REST para cálculos (novo no MVP)**  

❌ Multi-tenancy (v2.0)  
❌ Importação automática de dados externos (v2.0)  
❌ Análise comparativa de múltiplas empresas (v3.0)  

---

## 🎯 Fases de Desenvolvimento

### 📦 Fase 1: Setup e Fundação (1-2 semanas)
**Status:** 🔄 Requer Atualização  
**Esforço:** 1-2 pessoa-semanas

**Objetivos:**
- Setup do projeto Next.js 14+ com App Router
- Configuração Tailwind + shadcn/ui
- Estrutura de pastas para Full-Stack
- Definição de tipos TypeScript

**Tarefas:**
1. ✅ Criar projeto com Next.js + TypeScript
    ```bash
    npx create-next-app@latest saas-valuation --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
    cd saas-valuation
    npm install
    ```

2. ✅ Configurar Tailwind CSS (já incluído no create-next-app)

3. ✅ Instalar shadcn/ui e componentes básicos
    ```bash
    npx shadcn-ui@latest init
    npx shadcn-ui@latest add button input label card table tabs toast skeleton
    ```

4. ✅ Criar estrutura de pastas (App Router + Core isolado)
    ```
    src/
    ├── app/                    # Next.js App Router
    │   ├── (auth)/             # Grupo de rotas de autenticação
    │   │   ├── login/
    │   │   ├── signup/
    │   │   └── forgot-password/
    │   ├── (dashboard)/        # Grupo de rotas protegidas
    │   │   ├── dashboard/
    │   │   ├── model/[id]/
    │   │   └── profile/
    │   ├── api/                # API Routes
    │   │   ├── valuation/
    │   │   │   └── route.ts
    │   │   ├── sensitivity/
    │   │   │   └── route.ts
    │   │   └── models/
    │   │       └── route.ts
    │   ├── layout.tsx
    │   └── page.tsx
    ├── core/                   # Lógica de negócio PURA (zero deps React/Next)
    │   ├── calculations/       # Funções de cálculo
    │   │   ├── dre.ts
    │   │   ├── balanceSheet.ts
    │   │   ├── fcff.ts
    │   │   ├── wacc.ts
    │   │   ├── valuation.ts
    │   │   ├── sensitivity.ts
    │   │   └── fullValuation.ts
    │   ├── validators/         # Schemas Zod
    │   │   ├── dreValidator.ts
    │   │   ├── balanceSheetValidator.ts
    │   │   └── assumptionsValidator.ts
    │   ├── types/              # Tipos compartilhados
    │   │   └── index.ts
    │   └── index.ts            # Entry point público
    ├── components/             # Componentes React (Client Components)
    │   ├── ui/                 # shadcn/ui components
    │   ├── forms/              # Formulários de entrada
    │   ├── tables/             # Tabelas financeiras
    │   ├── charts/             # Gráficos Recharts
    │   └── layout/             # Header, Sidebar, etc.
    ├── lib/                    # Utilitários
    │   ├── supabase/           # Cliente Supabase (server + client)
    │   │   ├── client.ts       # createBrowserClient
    │   │   ├── server.ts       # createServerClient
    │   │   └── middleware.ts   # Auth middleware
    │   ├── actions/            # Server Actions
    │   │   ├── valuation.ts
    │   │   ├── models.ts
    │   │   └── auth.ts
    │   └── utils/
    │       └── formatters.ts
    ├── hooks/                  # Custom hooks (client-only)
    │   ├── useAuth.ts
    │   └── useModels.ts
    ├── store/                  # Zustand (estado de UI apenas)
    │   └── uiStore.ts
    └── middleware.ts           # Next.js Middleware (auth guard)
    ```

5. ✅ Definir interfaces TypeScript principais (em `src/core/types/`)
    - `FinancialModel` (modelo completo)
    - `IncomeStatement` (DRE)
    - `BalanceSheet` (BP)
    - `CashFlowStatement` (FCFF)
    - `Assumptions` (premissas WACC)
    - `ValuationResults` (resultados)
    - `APIRequest` / `APIResponse` (tipos para API)

6. ✅ Setup de Zustand para estado de UI (apenas client-side)
    ```bash
    npm install zustand
    ```
   
    ```typescript
    // src/store/uiStore.ts
    // Apenas para estado de UI: sidebar aberta, tema, etc.
    // Dados de modelos vêm do servidor via props/fetch
    ```

7. ✅ Criar componentes de layout
    - `Header` (logo, nome do modelo, menu usuário) - Server Component
    - `Sidebar` (navegação entre demonstrações) - Client Component
    - `MainContent` (área de conteúdo) - Server Component wrapper

8. ✅ Configurar Next.js Middleware para proteção de rotas
    ```typescript
    // src/middleware.ts
    import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
    import { NextResponse } from 'next/server';
    import type { NextRequest } from 'next/server';

    export async function middleware(req: NextRequest) {
       const res = NextResponse.next();
       const supabase = createMiddlewareClient({ req, res });
       const { data: { session } } = await supabase.auth.getSession();

       // Proteger rotas do dashboard
       if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
          return NextResponse.redirect(new URL('/login', req.url));
       }

       return res;
    }

    export const config = {
       matcher: ['/dashboard/:path*', '/model/:path*', '/profile/:path*'],
    };
    ```

**Entregáveis:**
- [x] Projeto Next.js configurado e funcionando (`npm run dev`)
- [x] Estrutura de pastas separando core/app/components
- [x] Middleware de autenticação configurado
- [x] Componentes de layout básicos renderizando
- [x] Tipos TypeScript em `src/core/types/`

**Critérios de Aceite:**
- Build sem erros TypeScript (`npm run build`)
- Hot reload funcionando
- Componentes shadcn/ui renderizando corretamente
- Middleware redirecionando rotas não autenticadas

---


### 🔐 Fase 1.5: Autenticação e Contas de Usuário (1-2 semanas)
**Status:** 🔄 Requer Atualização para Next.js  
**Esforço:** 1-2 pessoa-semanas

**Objetivos:**
- Implementar sistema de autenticação com Supabase + Next.js
- Usar Server Actions para operações de auth
- Configurar Middleware para proteção de rotas
- Implementar persistência de modelos por usuário

**Tarefas:**

**1.5.1 - Setup do Supabase para Next.js**
1. ✅ Criar projeto no Supabase (https://supabase.com)
2. ✅ Configurar tabelas no banco de dados (igual ao plano original)

3. ✅ Instalar e configurar cliente Supabase para Next.js:
    ```bash
    npm install @supabase/supabase-js @supabase/ssr
    ```

4. ✅ Criar clientes Supabase separados:
    ```typescript
    // src/lib/supabase/client.ts (Client Components)
    import { createBrowserClient } from '@supabase/ssr';

    export function createClient() {
       return createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
       );
    }

    // src/lib/supabase/server.ts (Server Components/Actions)
    import { createServerClient } from '@supabase/ssr';
    import { cookies } from 'next/headers';

    export function createClient() {
       const cookieStore = cookies();
       return createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
             cookies: {
                get(name: string) {
                   return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                   cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                   cookieStore.set({ name, value: '', ...options });
                },
             },
          }
       );
    }
    ```

5. ✅ Criar variáveis de ambiente (`.env.local`):
    ```
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```

**1.5.2 - Server Actions para Autenticação**
1. ✅ Criar Server Actions para auth (`src/lib/actions/auth.ts`)
    ```typescript
    'use server';

    import { createClient } from '@/lib/supabase/server';
    import { redirect } from 'next/navigation';
    import { revalidatePath } from 'next/cache';

    export async function signIn(formData: FormData) {
       const supabase = createClient();
       const email = formData.get('email') as string;
       const password = formData.get('password') as string;

       const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
       });

       if (error) {
          return { error: error.message };
       }

       revalidatePath('/', 'layout');
       redirect('/dashboard');
    }

    export async function signUp(formData: FormData) { /* ... */ }
    export async function signOut() { /* ... */ }
    export async function resetPassword(formData: FormData) { /* ... */ }
    ```

**1.5.3 - Páginas de Autenticação (App Router)**
1. ✅ Página de Login (`app/(auth)/login/page.tsx`)
    - Server Component com formulário
    - Form action aponta para Server Action
    - Validação client-side com Zod (via Client Component filho)

2. ✅ Página de Cadastro (`app/(auth)/signup/page.tsx`)
3. ✅ Página de Recuperação (`app/(auth)/forgot-password/page.tsx`)

**1.5.4 - Middleware e Proteção de Rotas**
1. ✅ Middleware já configurado na Fase 1
2. ✅ Criar helper para verificar auth em Server Components:
    ```typescript
    // src/lib/auth.ts
    import { createClient } from '@/lib/supabase/server';
    import { redirect } from 'next/navigation';

    export async function requireAuth() {
       const supabase = createClient();
       const { data: { user } } = await supabase.auth.getUser();
     
       if (!user) {
          redirect('/login');
       }
     
       return user;
    }
    ```

**1.5.5 - Persistência de Modelos via Server Actions**
1. ✅ Criar Server Actions para modelos (`src/lib/actions/models.ts`)
    ```typescript
    'use server';

    import { createClient } from '@/lib/supabase/server';
    import { revalidatePath } from 'next/cache';
    import type { FinancialModel } from '@/core/types';

    export async function createModel(data: Partial<FinancialModel>) {
       const supabase = createClient();
       const { data: { user } } = await supabase.auth.getUser();

       const { data: model, error } = await supabase
          .from('financial_models')
          .insert({ ...data, user_id: user!.id })
          .select()
          .single();

       if (error) throw error;

       revalidatePath('/dashboard');
       return model;
    }

    export async function updateModel(id: string, data: Partial<FinancialModel>) {
       const supabase = createClient();

       const { error } = await supabase
          .from('financial_models')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id);

       if (error) throw error;

       revalidatePath(`/model/${id}`);
    }

    export async function deleteModel(id: string) { /* ... */ }
    ```

2. ✅ Carregar modelos em Server Components:
    ```typescript
    // app/(dashboard)/dashboard/page.tsx
    import { createClient } from '@/lib/supabase/server';
    import { requireAuth } from '@/lib/auth';

    export default async function DashboardPage() {
       const user = await requireAuth();
       const supabase = createClient();

       const { data: models } = await supabase
          .from('financial_models')
          .select('*')
          .order('updated_at', { ascending: false });

       return <DashboardContent models={models ?? []} />;
    }
    ```

**Entregáveis:**
- [x] Auth funcionando via Server Actions
- [x] Middleware protegendo rotas autenticadas
- [x] Perfil editável via Server Actions
- [x] Modelos salvos e carregados via Server Components/Actions
- [x] RLS funcionando (testado com 2 contas)

**Critérios de Aceite:**
- Login/logout funcionam sem erros
- Rotas protegidas redirecionam para /login
- Server Components carregam dados autenticados
- Dados persistem entre sessões

---

### 🧮 Fase 2: Motor de Cálculo no Servidor (3-4 semanas)
**Status:** 🔲 Não Iniciado  
**Esforço:** 3-4 pessoa-semanas

**Objetivos:**
- Implementar motor de cálculo em `src/core/` (100% servidor)
- Expor cálculos via Server Actions E API Routes
- Criar formulários de entrada com validação
- **Garantir que core/ não importa nada de React/Next/DOM**

**Tarefas:**

**2.1 - Core Module (Lógica Pura)**
1. ✅ Implementar cálculos de DRE (`src/core/calculations/dre.ts`)
    - Funções puras, sem side effects
    - Usa apenas `decimal.js` e tipos próprios
    - **Não importa nada de React, Next.js, ou browser APIs**

    ```typescript
    // src/core/calculations/dre.ts
    import Decimal from 'decimal.js';
    import type { DREBaseInputs, DREProjectionInputs, DRECalculated, CalculationResult } from '../types';

    export function calculateDRE(
       baseInputs: DREBaseInputs,
       projectionInputs: DREProjectionInputs,
       previousYear: DRECalculated,
       depreciacaoAmortizacao: number,
       despesasFinanceiras: number
    ): CalculationResult<DRECalculated> {
       // Implementação com decimal.js para precisão
       const receitaBruta = new Decimal(previousYear.receitaBruta)
          .times(1 + projectionInputs.taxaCrescimentoReceita / 100);
       // ... resto dos cálculos
    }
    ```

2. ✅ Implementar todos os módulos de cálculo:
    - `dre.ts` - Demonstração de Resultado
    - `balanceSheet.ts` - Balanço Patrimonial
    - `fcff.ts` - Fluxo de Caixa Livre
    - `wacc.ts` - Custo Médio Ponderado de Capital
    - `valuation.ts` - Valuation por FCD
    - `sensitivity.ts` - Análise de Sensibilidade

3. ✅ Criar entry point único (`src/core/calculations/fullValuation.ts`)
    ```typescript
    // src/core/calculations/fullValuation.ts
    import type { FinancialModelInput, FullValuationResult } from '../types';
    import { validateFinancialModelInput } from '../validators';
    import { calculateAllDRE } from './dre';
    import { calculateAllBalanceSheet } from './balanceSheet';
    import { calculateAllFCFF } from './fcff';
    import { calculateValuation } from './valuation';

    /**
      * Executa valuation completo de uma empresa.
      * 
      * @description Esta função é o entry point principal do motor de cálculo.
      * Pode ser chamada tanto por Server Actions quanto por API Routes.
      * Retorna resultado 100% serializável para JSON.
      * 
      * @param input - Dados financeiros base e premissas de projeção
      * @returns Resultado com projeções e valuation
      */
    export function executeFullValuation(
       input: FinancialModelInput
    ): FullValuationResult {
       // 1. Validar inputs
       const validation = validateFinancialModelInput(input);
       if (!validation.success) {
          return { success: false, errors: validation.errors };
       }

       // 2. Calcular projeções
       const dreProjections = calculateAllDRE(input);
       const bpProjections = calculateAllBalanceSheet(input, dreProjections);
       const fcffProjections = calculateAllFCFF(dreProjections, bpProjections);

       // 3. Calcular valuation
       const valuation = calculateValuation(fcffProjections, input.assumptions);

       return {
          success: true,
          data: {
             dre: dreProjections,
             balanceSheet: bpProjections,
             cashFlow: fcffProjections,
             valuation,
          },
       };
    }
    ```

4. ✅ Criar `src/core/index.ts` como API pública do módulo:
    ```typescript
    // src/core/index.ts
    // Entry point público - tudo que pode ser importado externamente

    // Função principal de valuation
    export { executeFullValuation } from './calculations/fullValuation';

    // Funções individuais de cálculo
    export { calculateDRE, calculateAllDRE } from './calculations/dre';
    export { calculateBalanceSheet, calculateAllBalanceSheet } from './calculations/balanceSheet';
    export { calculateFCFF, calculateAllFCFF } from './calculations/fcff';
    export { calculateWACC } from './calculations/wacc';
    export { calculateValuation } from './calculations/valuation';
    export { calculateSensitivityUnivariate, calculateSensitivityBivariate } from './calculations/sensitivity';

    // Validators
    export { validateDREBaseInputs, validateFinancialModelInput } from './validators';

    // Types
    export type {
       FinancialModel,
       FinancialModelInput,
       DRECalculated,
       BalanceSheetCalculated,
       FCFFCalculated,
       ValuationResults,
       FullValuationResult,
       CalculationResult,
       SensitivityResult,
    } from './types';
    ```

**2.2 - Server Actions para Cálculos**
1. ✅ Criar Server Action para valuation (`src/lib/actions/valuation.ts`)
    ```typescript
    'use server';

    import { executeFullValuation } from '@/core';
    import { createClient } from '@/lib/supabase/server';
    import type { FinancialModelInput, FullValuationResult } from '@/core/types';

    export async function calculateValuationAction(
       modelId: string,
       input: FinancialModelInput
    ): Promise<FullValuationResult> {
       // 1. Verificar autenticação
       const supabase = createClient();
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) {
          return { success: false, errors: [{ message: 'Não autenticado' }] };
       }

       // 2. Executar cálculo no servidor
       const result = executeFullValuation(input);

       // 3. Salvar resultado no modelo (opcional)
       if (result.success && modelId) {
          await supabase
             .from('financial_models')
             .update({ 
                data: { ...input, results: result.data },
                updated_at: new Date().toISOString(),
             })
             .eq('id', modelId);
       }

       return result;
    }
    ```

**2.3 - API Routes para Acesso Externo**
1. ✅ Criar API Route para valuation (`src/app/api/valuation/route.ts`)
    ```typescript
    // src/app/api/valuation/route.ts
    import { NextRequest, NextResponse } from 'next/server';
    import { createClient } from '@/lib/supabase/server';
    import { executeFullValuation } from '@/core';
    import type { FinancialModelInput } from '@/core/types';

    /**
      * POST /api/valuation
      * 
      * Executa valuation completo via API.
      * Pode ser usado por agentes de IA, integrações externas, etc.
      * 
      * @body FinancialModelInput - Dados do modelo financeiro
      * @returns FullValuationResult - Resultado do valuation
      */
    export async function POST(request: NextRequest) {
       try {
          // 1. Verificar autenticação (API Key ou Session)
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
       
          // Alternativa: verificar API Key no header
          const apiKey = request.headers.get('X-API-Key');
       
          if (!user && !apiKey) {
             return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
             );
          }

          // 2. Validar e executar
          const input: FinancialModelInput = await request.json();
          const result = executeFullValuation(input);

          // 3. Retornar resultado
          return NextResponse.json(result);

       } catch (error) {
          return NextResponse.json(
             { success: false, error: 'Internal server error' },
             { status: 500 }
          );
       }
    }

    /**
      * GET /api/valuation?modelId=xxx
      * 
      * Retorna o último resultado de valuation de um modelo salvo.
      */
    export async function GET(request: NextRequest) {
       const modelId = request.nextUrl.searchParams.get('modelId');
       // ... implementação
    }
    ```

2. ✅ Criar API Route para sensibilidade (`src/app/api/sensitivity/route.ts`)
    ```typescript
    // src/app/api/sensitivity/route.ts
    import { NextRequest, NextResponse } from 'next/server';
    import { calculateSensitivityUnivariate, calculateSensitivityBivariate } from '@/core';

    export async function POST(request: NextRequest) {
       const { type, ...params } = await request.json();

       if (type === 'univariate') {
          const result = calculateSensitivityUnivariate(
             params.baseModel,
             params.variableName,
             params.baseValue,
             params.minValue,
             params.maxValue,
             params.step
          );
          return NextResponse.json({ success: true, data: result });
       }

       if (type === 'bivariate') {
          const result = calculateSensitivityBivariate(
             params.baseModel,
             params.variable1Name,
             params.variable1Values,
             params.variable2Name,
             params.variable2Values
          );
          return NextResponse.json({ success: true, data: result });
       }

       return NextResponse.json(
          { success: false, error: 'Invalid type' },
          { status: 400 }
       );
    }
    ```

**2.4 - Formulários de Entrada (Client Components)**
1. ✅ Formulário DRE Ano Base
    - Client Component com React Hook Form
    - Chama Server Action ao submeter
    - Validação com Zod (shared entre client/server)

    ```typescript
    // src/components/forms/DREBaseForm.tsx
    'use client';

    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import { dreBaseInputsSchema } from '@/core/validators';
    import { calculateValuationAction } from '@/lib/actions/valuation';
    import { useTransition } from 'react';

    export function DREBaseForm({ modelId }: { modelId: string }) {
       const [isPending, startTransition] = useTransition();
     
       const form = useForm({
          resolver: zodResolver(dreBaseInputsSchema),
       });

       const onSubmit = (data) => {
          startTransition(async () => {
             const result = await calculateValuationAction(modelId, data);
             // Handle result
          });
       };

       return (
          <form onSubmit={form.handleSubmit(onSubmit)}>
             {/* Campos do formulário */}
             <button type="submit" disabled={isPending}>
                {isPending ? 'Calculando...' : 'Calcular'}
             </button>
          </form>
       );
    }
    ```

2. ✅ Demais formulários (BP Ano Base, Premissas DRE, Premissas BP)

**2.5 - Testes do Core**
1. ✅ Configurar Vitest para testar core isoladamente
    ```bash
    npm install -D vitest
    ```

    ```typescript
    // vitest.config.ts
    import { defineConfig } from 'vitest/config';

    export default defineConfig({
       test: {
          include: ['src/core/**/*.test.ts'],
          environment: 'node', // Core não precisa de DOM
       },
    });
    ```

2. ✅ Testes unitários para todas as funções de cálculo
    - Coverage > 80% para `src/core/`
    - Testar edge cases (valores zero, negativos, muito grandes)

**Entregáveis:**
- [ ] Core module 100% isolado (sem deps React/Next)
- [ ] Server Actions funcionando para cálculos
- [ ] API Routes para acesso externo
- [ ] Formulários de entrada validados
- [ ] Testes unitários passando (>80% coverage em core/)
- [ ] Documentação JSDoc completa

**Critérios de Aceite:**
- `executeFullValuation()` funciona chamando diretamente em Node.js
- API Route `/api/valuation` retorna resultado correto
- Server Action atualiza modelo no banco após cálculo
- Core module não importa React, Next, ou APIs de browser

---

### 📊 Fase 3: Visualização de Demonstrações (2-3 semanas)
**Status:** 🔲 Não Iniciado  
**Esforço:** 2-3 pessoa-semanas

**Objetivos:**
- Criar componentes de tabela para DRE, BP e FCL
- Implementar gráficos de projeção com Recharts
- Usar Server Components onde possível, Client Components para interatividade

**Tarefas:**

**3.1 - Tabelas Financeiras**
1. ✅ Componente de tabela DRE (`src/app/(dashboard)/model/[id]/dre/page.tsx`)
    ```typescript
    // Server Component - carrega dados no servidor
    import { createClient } from '@/lib/supabase/server';
    import { DRETable } from '@/components/tables/DRETable';

    export default async function DREPage({ params }: { params: { id: string } }) {
       const supabase = createClient();
       const { data: model } = await supabase
          .from('financial_models')
          .select('*')
          .eq('id', params.id)
          .single();

       return <DRETable data={model?.data?.results?.dre ?? []} />;
    }
    ```

    ```typescript
    // src/components/tables/DRETable.tsx
    'use client'; // Client Component para interatividade

    import { useReactTable, ... } from '@tanstack/react-table';
    import type { DRECalculated } from '@/core/types';

    export function DRETable({ data }: { data: DRECalculated[] }) {
       // TanStack Table implementation
    }
    ```

2. ✅ Componente de tabela BP (similar)
3. ✅ Componente de tabela FCFF (similar)

**3.2 - Gráficos (Client Components)**
1. ✅ Gráficos com Recharts
    ```typescript
    // src/components/charts/RevenueChart.tsx
    'use client';

    import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

    export function RevenueChart({ data }) {
       return (
          <LineChart data={data}>
             {/* ... */}
          </LineChart>
       );
    }
    ```

**3.3 - Layout e Navegação**
1. ✅ Sidebar com navegação (Client Component para estado de expansão)
2. ✅ Breadcrumbs (Server Component)
3. ✅ Loading states com Suspense
    ```typescript
    // app/(dashboard)/model/[id]/dre/page.tsx
    import { Suspense } from 'react';
    import { DRETableSkeleton } from '@/components/tables/DRETableSkeleton';

    export default async function DREPage({ params }) {
       return (
          <Suspense fallback={<DRETableSkeleton />}>
             <DRETableLoader modelId={params.id} />
          </Suspense>
       );
    }
    ```

**Entregáveis:**
- [ ] Tabelas financeiras responsivas (Server + Client Components)
- [ ] Gráficos interativos (Client Components)
- [ ] Navegação fluida com loading states
- [ ] Design consistente com shadcn/ui

---

### 💰 Fase 4: Valuation e FCD (2 semanas)
**Status:** 🔲 Não Iniciado  
**Esforço:** 2 pessoa-semanas

*Objetivos e tarefas permanecem similares, mas com implementação via Server Components e API Routes.*

**Principais Mudanças:**
- Dashboard de valuation como Server Component (carrega dados no servidor)
- Formulário de premissas como Client Component (interatividade)
- Cálculos via Server Action ou API Route

---

### 📈 Fase 5: Análise de Sensibilidade (2 semanas)
**Status:** 🔲 Não Iniciado  
**Esforço:** 2 pessoa-semanas

**Principais Mudanças:**
- Cálculos de sensibilidade via API Route (pode demorar)
- Usar loading states/streaming para feedback
- Considerar route handlers com streaming para grids grandes

```typescript
// src/app/api/sensitivity/route.ts
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
   // Para grids grandes, considerar streaming
   const encoder = new TextEncoder();
   const stream = new ReadableStream({
      async start(controller) {
         for (const scenario of scenarios) {
            const result = calculateScenario(scenario);
            controller.enqueue(encoder.encode(JSON.stringify(result) + '\n'));
         }
         controller.close();
      },
   });

   return new Response(stream, {
      headers: { 'Content-Type': 'application/x-ndjson' },
   });
}
```

---

### 📤 Fase 6: Exportação e Relatórios (1 semana)
**Status:** 🔲 Não Iniciado  
**Esforço:** 1 pessoa-semana

**Principais Mudanças:**
- Exportação Excel via API Route (gera arquivo no servidor)
- Download via Response com headers corretos

```typescript
// src/app/api/export/excel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
   const modelId = request.nextUrl.searchParams.get('modelId');
  
   // Carregar modelo e gerar Excel
   const workbook = generateExcelWorkbook(model);
   const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

   return new NextResponse(buffer, {
      headers: {
         'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'Content-Disposition': `attachment; filename="${model.companyName}_Valuation.xlsx"`,
      },
   });
}
```

---

### ✨ Fase 7: Refinamento e Polimento (1-2 semanas)
**Status:** 🔲 Não Iniciado  
**Esforço:** 1-2 pessoa-semanas

**Principais Mudanças para Next.js:**

**7.1 - Performance**
1. ✅ Server Components por padrão (menor bundle)
2. ✅ Streaming com Suspense para carregamento progressivo
3. ✅ Route Segment Config para caching:
    ```typescript
    // app/(dashboard)/dashboard/page.tsx
    export const revalidate = 60; // Revalidar a cada 60 segundos
    ```

4. ✅ Parallel Routes para loading states independentes
5. ✅ Intercepting Routes para modais

**7.2 - Error Handling**
1. ✅ Error boundaries via `error.tsx`
    ```typescript
    // app/(dashboard)/model/[id]/error.tsx
    'use client';

    export default function Error({
       error,
       reset,
    }: {
       error: Error;
       reset: () => void;
    }) {
       return (
          <div>
             <h2>Algo deu errado!</h2>
             <button onClick={reset}>Tentar novamente</button>
          </div>
       );
    }
    ```

2. ✅ Not found via `not-found.tsx`
3. ✅ Loading states via `loading.tsx`

**7.3 - Testes**
1. ✅ Testes E2E com Playwright
    ```bash
    npm install -D @playwright/test
    ```

2. ✅ Testes de API Routes
3. ✅ Testes de Server Actions (mock Supabase)

---

## 📡 Documentação da API (Novo)

### Endpoints Disponíveis

#### POST /api/valuation
Executa valuation completo de um modelo financeiro.

**Request:**
```json
{
   "dre": {
      "baseYearInputs": { ... },
      "projectionInputs": [ ... ]
   },
   "balanceSheet": { ... },
   "assumptions": {
      "taxaLivreDeRisco": 10,
      "beta": 1.2,
      "premioRiscoMercado": 6,
      "spreadDivida": 2,
      "taxaImposto": 34,
      "taxaCrescimentoPerpetuo": 3,
      "sharesOutstanding": 10000000
   }
}
```

**Response:**
```json
{
   "success": true,
   "data": {
      "dre": [ ... ],
      "balanceSheet": [ ... ],
      "cashFlow": [ ... ],
      "valuation": {
         "enterpriseValue": 150000000,
         "equityValue": 140000000,
         "sharePrice": 14.00,
         "terminalValue": 70000000,
         "pvTerminal": 45000000
      }
   }
}
```

#### POST /api/sensitivity
Executa análise de sensibilidade.

#### GET /api/export/excel?modelId=xxx
Exporta modelo para Excel.

---

## 📊 Métricas de Sucesso do MVP

### MVP será considerado sucesso se:

**Funcionalidade:**
- [ ] ✅ Autenticação funciona via Server Actions
- [ ] ✅ Modelos são salvos e carregados via Server Components
- [ ] ✅ Motor de cálculo executa 100% no servidor
- [ ] ✅ **API REST funciona para acesso externo**
- [ ] ✅ Cálculos produzem resultados matematicamente corretos
- [ ] ✅ Exportação para Excel funciona via API Route

**Performance:**
- [ ] ✅ TTFB < 200ms para páginas do dashboard
- [ ] ✅ Lighthouse score > 90 (Performance, SSR ajuda)
- [ ] ✅ Recálculo de valuation < 500ms via Server Action

**Qualidade:**
- [ ] ✅ Core module é 100% independente de React/Next
- [ ] ✅ Testes passando (>80% coverage em core/)
- [ ] ✅ Zero erros não tratados (error.tsx funciona)

---

## 🚀 Roadmap Futuro (Pós-MVP)

### Versão 2.0
- [ ] Multi-tenancy (organizações/times)
- [ ] Webhooks para notificações de cálculo concluído
- [ ] Rate limiting avançado para API
- [ ] Documentação OpenAPI (Swagger)
- [ ] SDK oficial publicado no npm

### Versão 3.0
- [ ] Edge Runtime para cálculos (Vercel Edge Functions)
- [ ] Streaming de resultados para grids grandes
- [ ] Mobile app (React Native) consumindo a API

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Complexidade do App Router | Média | Médio | Seguir docs oficiais, começar simples |
| Confusão Server/Client Components | Alta | Médio | Documentar bem, `'use client'` explícito |
| Cold starts em API Routes | Baixa | Baixo | Usar Vercel (otimizado), considerar Edge |
| Latência de Server Actions | Baixa | Médio | Feedback visual (loading states) |

---

## 📚 Referências Atualizadas

- **Next.js:** https://nextjs.org/docs
- **Next.js App Router:** https://nextjs.org/docs/app
- **Server Actions:** https://nextjs.org/docs/app/api-reference/functions/server-actions
- **Supabase + Next.js:** https://supabase.com/docs/guides/auth/server-side/nextjs
- **Route Handlers:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers

*(demais referências permanecem)*

---

## 📅 Timeline Estimado (Atualizado)

**Total:** 14-20 semanas (3.5-5 meses com 1 desenvolvedor full-time)

| Fase | Duração | Acumulado |
|------|---------|-----------|
| Fase 1: Setup Next.js | 1-2 semanas | 1-2 semanas |
| Fase 1.5: Auth + Server Actions | 1-2 semanas | 2-4 semanas |
| Fase 2: Motor de Cálculo + API | 3-4 semanas | 5-8 semanas |
| Fase 3: Visualização | 2-3 semanas | 7-11 semanas |
| Fase 4: Valuation | 2 semanas | 9-13 semanas |
| Fase 5: Sensibilidade | 2 semanas | 11-15 semanas |
| Fase 6: Exportação | 1 semana | 12-16 semanas |
| Fase 7: Refinamento | 2-4 semanas | **14-20 semanas** |

> **Nota:** Timeline aumentado ligeiramente para acomodar aprendizado do App Router e implementação da API.

---

**Última Atualização:** 2026-01-24  
**Versão do Plano:** 2.0 (Next.js)  
**Status Geral:** 🟡 Planejamento Atualizado para Next.js
   - Depreciação Anual(i) = Imobilizado Bruto(i-1) × Taxa Depreciação
   - CAPEX(i) = Índice Imob/Vendas × Receita Bruta(i)
   - Imobilizado Bruto(i) = Imobilizado Bruto(i-1) + CAPEX(i)
   - Contas a Receber(i) = (Prazo / 360) × Receita Bruta(i)
   - Estoques(i) = (Prazo / 360) × CMV(i)
   - Fornecedores(i) = (Prazo / 360) × CMV(i)
   - Capital de Giro(i) = Ativo Circulante(i) - Passivo Circulante(i) + Empréstimos(i)
   - NCG(i) = Capital de Giro(i) - Capital de Giro(i-1)

3. ✅ Implementar cálculo de Fluxo de Caixa Livre (`core/calculations/fcff.ts`)
   ```typescript
   export function calculateFCFF(
     dreCalculated: DRECalculated,
     bpCalculated: BalanceSheetCalculated
   ): CalculationResult<FCFFCalculated>
   ```

   **Fórmula:**
   - FCFF(i) = EBIT(i) - NCG(i) - CAPEX(i)

4. ✅ Implementar cálculo de WACC (`core/calculations/wacc.ts`)
   ```typescript
   export function calculateWACC(
     assumptions: Assumptions,
     bpCalculated: BalanceSheetCalculated
   ): CalculationResult<WACCCalculation>
   ```

   **Fórmulas:**
   - E = Patrimônio Líquido
   - D = Empréstimos CP + Empréstimos LP
   - Ke = Rf + β × ERP
   - Kd = Rf + Spread
   - WACC = (E/(E+D)) × Ke + (D/(E+D)) × Kd × (1-T)

5. ✅ Usar `decimal.js` para precisão financeira
   ```bash
   npm install decimal.js
   ```

   ```typescript
   import Decimal from 'decimal.js';

   const receitaBruta = new Decimal(previousYear.receitaBruta)
     .times(1 + projectionInputs.receitaBrutaGrowth / 100);
   ```

6. ✅ Testes unitários das funções de cálculo
   ```bash
   npm install -D vitest @vitest/ui
   ```

   - Testar cada função de cálculo com dados mockados
   - Validar fórmulas contra casos conhecidos
   - Coverage > 80% para `core/calculations/`

**2.4 - Estruturação do Core para API (Agente de IA)**
1. ✅ Extrair funções de cálculo para `src/core/calculations/`
   - `dre.ts`, `balanceSheet.ts`, `fcff.ts`, `wacc.ts`, `valuation.ts`
   - **Zero dependências de React, DOM, localStorage**
   - Apenas importar: `decimal.js`, `zod`, tipos próprios

2. ✅ Criar função `executeFullValuation()` como entry point único
   ```typescript
   // core/calculations/fullValuation.ts
   export function executeFullValuation(
     input: FinancialModelInput
   ): FullValuationResult {
     // 1. Validar inputs
     const validation = validateFinancialModelInput(input);
     if (!validation.success) {
       return { success: false, errors: validation.errors };
     }

     // 2. Calcular projeções (DRE, BP, FCFF)
     const dreProjections = calculateAllDRE(input);
     const bpProjections = calculateAllBalanceSheet(input, dreProjections);
     const fcffProjections = calculateAllFCFF(dreProjections, bpProjections);

     // 3. Calcular valuation
     const valuation = calculateValuation(fcffProjections, input.assumptions);

     return { success: true, data: { dre: dreProjections, balanceSheet: bpProjections, cashFlow: fcffProjections, valuation } };
   }
   ```

3. ✅ Documentar inputs e outputs com JSDoc
   ```typescript
   /**
    * Executa valuation completo de uma empresa.
    * 
    * @param input - Dados financeiros base e premissas de projeção
    * @returns Resultado com projeções (DRE, BP, FCFF) e valuation (EV, Equity Value)
    * 
    * @example
    * const result = executeFullValuation({
    *   dre: { baseYearInputs: {...}, projectionInputs: [...] },
    *   balanceSheet: {...},
    *   assumptions: { taxaLivreDeRisco: 0.10, beta: 1.2, ... }
    * });
    * 
    * if (result.success) {
    *   console.log(result.data.valuation.enterpriseValue);
    * }
    */
   ```

4. ✅ Criar schemas Zod em `src/core/validators/`
   ```typescript
   // core/validators/dreValidator.ts
   export const dreBaseInputsSchema = z.object({
     receitaBruta: z.number().nonnegative(),
     impostosEDevolucoes: z.number().nonnegative(),
     cmv: z.number().nonnegative(),
     despesasOperacionais: z.number().nonnegative(),
     irCSLL: z.number().nonnegative(),
     dividendos: z.number().nonnegative(),
   });

   export function validateDREBaseInputs(data: unknown): ValidationResult<DREBaseInputs> {
     const result = dreBaseInputsSchema.safeParse(data);
     if (result.success) {
       return { success: true, data: result.data };
     } else {
       return { success: false, errors: result.error.errors };
     }
   }
   ```

5. ✅ Garantir que todos os tipos são serializáveis (JSON-safe)
   - Sem classes, apenas interfaces/types
   - Sem funções, Map, Set
   - Sem referências circulares
   - Números representados como `number` (não Decimal no output)

6. ✅ Criar `src/core/index.ts` exportando API pública
   ```typescript
   // core/index.ts - Entry point do módulo core
   export { executeFullValuation } from './calculations/fullValuation';
   export { calculateDRE, calculateAllDRE } from './calculations/dre';
   export { calculateBalanceSheet, calculateAllBalanceSheet } from './calculations/balanceSheet';
   export { calculateFCFF, calculateAllFCFF } from './calculations/fcff';
   export { calculateWACC } from './calculations/wacc';
   export { calculateValuation } from './calculations/valuation';
   export { validateDREBaseInputs, validateFinancialModelInput } from './validators';
   export type {
     FinancialModel,
     FinancialModelInput,
     DRECalculated,
     BalanceSheetCalculated,
     FCFFCalculated,
     ValuationResults,
     FullValuationResult,
     CalculationResult,
   } from './types';
   ```

**Critério de Aceite para Core:**
```typescript
// Deve ser possível executar valuation completo assim:
import { executeFullValuation } from './core';

const inputData = { /* ... */ };
const result = executeFullValuation(inputData);

// result é 100% serializável para JSON
const json = JSON.stringify(result);
console.log(json); // OK, sem erros
```

**Entregáveis:**
- [ ] Formulários de entrada funcionais e validados
- [ ] Motor de cálculo implementado e testado
- [ ] Dados fluindo: input → store → cálculos → resultados
- [ ] **Core isolado e exportável (sem dependências de UI)**
- [ ] **Função `executeFullValuation()` funcionando standalone**
- [ ] Testes unitários passando (>80% coverage em `core/`)
- [ ] Documentação JSDoc completa

**Critérios de Aceite:**
- Usuário preenche ano base e premissas sem erros
- Cálculos produzem resultados matematicamente corretos
- Validações bloqueiam inputs inválidos com feedback claro
- Testes unitários validam fórmulas contra casos conhecidos
- **Core pode ser importado e usado sem inicializar React**

---

### 📊 Fase 3: Visualização de Demonstrações (2-3 semanas)
**Status:** 🔲 Não Iniciado  
**Esforço:** 2-3 pessoa-semanas

**Objetivos:**
- Criar componentes de tabela para DRE, BP e FCL
- Implementar gráficos de projeção com Recharts
- Navegação fluida entre demonstrações

**Tarefas:**

**3.1 - Tabelas Financeiras**
1. ✅ Componente de tabela DRE projetado (`/model/:id/view/dre`)
   ```bash
   npm install @tanstack/react-table
   ```

   - Colunas: Ano 0 (base), Ano 1, ..., Ano N
   - Linhas: Receita Bruta, Impostos, Receita Líquida, CMV, Lucro Bruto, Desp. Op., EBIT, EBITDA, LAIR, IR/CSLL, Lucro Líquido, Dividendos
   - Formatação: R$ para valores absolutos, % para margens
   - Highlight: Linhas de totais (Receita Líquida, EBIT, Lucro Líquido)

2. ✅ Componente de tabela BP projetado (`/model/:id/view/balance-sheet`)
   - Seções expansíveis: Ativo Circulante, Ativo LP, Passivo Circulante, Passivo LP, Patrimônio Líquido
   - Drill-down: Expandir/colapsar seções
   - Validação visual: Ativo = Passivo + PL (indicador verde/vermelho)

3. ✅ Componente de tabela FCFF (`/model/:id/view/fcff`)
   - Linhas: EBIT, Depreciação, CAPEX, NCG, FCFF
   - Highlight: FCFF final por ano

4. ✅ Formatação de números (`lib/utils/formatters.ts`)
   ```typescript
   export function formatCurrency(value: number): string {
     return new Intl.NumberFormat('pt-BR', {
       style: 'currency',
       currency: 'BRL',
       minimumFractionDigits: 0,
       maximumFractionDigits: 0,
     }).format(value);
   }

   export function formatPercentage(value: number): string {
     return `${value.toFixed(2)}%`;
   }

   export function formatCompactNumber(value: number): string {
     // 10.000.000 → 10,0M
     if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
     if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
     if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
     return value.toString();
   }
   ```

5. ✅ Highlight de contas calculadas vs inputs
   - Inputs: fundo branco
   - Calculadas: fundo cinza claro
   - Totais: negrito, borda superior

**3.2 - Gráficos**
1. ✅ Gráfico de evolução de receita e lucro (linha)
   ```bash
   npm install recharts
   ```

   ```typescript
   import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

   <LineChart data={data}>
     <CartesianGrid strokeDasharray="3 3" />
     <XAxis dataKey="year" />
     <YAxis />
     <Tooltip formatter={(value) => formatCurrency(value)} />
     <Legend />
     <Line type="monotone" dataKey="receitaLiquida" stroke="#8884d8" name="Receita Líquida" />
     <Line type="monotone" dataKey="lucroLiquido" stroke="#82ca9d" name="Lucro Líquido" />
   </LineChart>
   ```

2. ✅ Gráfico de composição de custos (barra empilhada)
   - Componentes: CMV, Despesas Operacionais, IR/CSLL
   - Visualizar estrutura de custos por ano

3. ✅ Gráfico de margem EBITDA (linha + área)
   - Linha: EBITDA absoluto
   - Área: Margem EBITDA (%)
   - Eixo Y duplo (valor e percentual)

4. ✅ Gráfico de FCFF (barra)
   - Barras: FCFF por ano
   - Cor verde (FCFF positivo) / vermelho (negativo)

5. ✅ Integração com shadcn/ui Card
   - Cada gráfico em um Card com título e descrição
   - Responsivo (diminui em telas pequenas)

**3.3 - Navegação e UX**
1. ✅ Sidebar de navegação entre demonstrações
   ```
   Dashboard
   ─────────────
   Entrada de Dados
   ├─ Ano Base
   │  ├─ DRE
   │  └─ Balanço Patrimonial
   └─ Premissas de Projeção
      ├─ DRE
      └─ Balanço Patrimonial
   ─────────────
   Visualizações
   ├─ DRE Projetado
   ├─ Balanço Projetado
   ├─ Fluxo de Caixa Livre
   └─ Valuation
   ─────────────
   Análise de Sensibilidade
   ```

2. ✅ Breadcrumbs
   - Indicar caminho atual: Dashboard > Modelo X > DRE Projetado

3. ✅ Indicadores de completude de dados
   - Badge verde: Seção completa
   - Badge amarelo: Parcialmente preenchida
   - Badge vermelho: Não preenchida

4. ✅ Loading states e tratamento de erros
   - Skeleton screens para carregamento
   - Mensagens de erro amigáveis
   - Retry em caso de falha

**Entregáveis:**
- [ ] Tabelas financeiras responsivas e formatadas corretamente
- [ ] Gráficos interativos de projeção (Recharts)
- [ ] Navegação fluida entre seções (Sidebar + Breadcrumbs)
- [ ] Feedback visual de estado da aplicação (loading, erro, completo)
- [ ] Design consistente com shadcn/ui

**Critérios de Aceite:**
- Tabelas renderizam projeções de 5 ou 10 anos sem lag
- Gráficos são interativos (hover mostra valores)
- Navegação é intuitiva (< 2 cliques para qualquer seção)
- Números estão formatados corretamente (R$, %)

---

### 💰 Fase 4: Valuation e FCD (2 semanas)
**Status:** 🔲 Não Iniciado  
**Esforço:** 2 pessoa-semanas

**Objetivos:**
- Implementar cálculo de Fluxo de Caixa Descontado
- Interface para inputs de valuation (WACC, taxa perpétua)
- Visualização de resultados de valuation

**Tarefas:**

**4.1 - Formulário de Premissas de Valuation**
1. ✅ Formulário de premissas (`/model/:id/input/assumptions`)
   - Taxa Livre de Risco (Rf) - %
   - Beta (β)
   - Prêmio de Risco de Mercado (ERP) - %
   - Spread da Dívida - %
   - Taxa de Imposto (T) - %
   - Taxa de Crescimento Perpétuo (g) - %

2. ✅ Validações e ranges recomendados
   - Rf: 5% a 15% (Selic histórico)
   - Beta: 0.5 a 2.0
   - ERP: 5% a 10%
   - Spread: 0% a 5%
   - Taxa Imposto: 34% (padrão Brasil)
   - g: 2% a 4% (crescimento perpétuo conservador)

3. ✅ Cálculo automático de Ke e Kd
   - Ke = Rf + β × ERP
   - Kd = Rf + Spread
   - Exibir valores calculados em tempo real

**4.2 - Motor de Valuation**
1. ✅ Implementar cálculo de FCL projetado (`core/calculations/fcl.ts`)
   ```typescript
   export function calculateFCL(fcff: FCFFCalculated[]): number[] {
     // FCFF já é o FCL (Fluxo de Caixa Livre da Firma)
     return fcff.map(f => f.fcff);
   }
   ```

2. ✅ Implementar cálculo de Valor Presente dos FCLs (`core/calculations/valuation.ts`)
   ```typescript
   export function calculatePresentValue(
     fcl: number[],
     waccByYear: number[]
   ): number[] {
     return fcl.map((fcl, i) => {
       const discountFactor = waccByYear.slice(0, i + 1).reduce((acc, wacc) => acc * (1 + wacc / 100), 1);
       return fcl / discountFactor;
     });
   }
   ```

3. ✅ Implementar cálculo de Valor Terminal (`core/calculations/valuation.ts`)
   ```typescript
   export function calculateTerminalValue(
     lastYearFCL: number,
     wacc: number,
     perpetualGrowthRate: number
   ): number {
     // Valor Terminal = FCL(último ano) × (1 + g) / (WACC - g)
     return (lastYearFCL * (1 + perpetualGrowthRate / 100)) / (wacc / 100 - perpetualGrowthRate / 100);
   }

   export function calculatePresentValueTerminal(
     terminalValue: number,
     waccByYear: number[]
   ): number {
     const discountFactor = waccByYear.reduce((acc, wacc) => acc * (1 + wacc / 100), 1);
     return terminalValue / discountFactor;
   }
   ```

4. ✅ Implementar cálculo de Enterprise Value e Equity Value (`core/calculations/valuation.ts`)
   ```typescript
   export function calculateValuation(
     fcffProjections: FCFFCalculated[],
     waccCalculations: WACCCalculation[],
     assumptions: Assumptions
   ): ValuationResults {
     // 1. Calcular VP dos FCLs
     const fcl = fcffProjections.map(f => f.fcff);
     const wacc = waccCalculations.map(w => w.wacc);
     const pvFCL = calculatePresentValue(fcl, wacc);

     // 2. Calcular Valor Terminal
     const lastYearFCL = fcl[fcl.length - 1];
     const averageWACC = wacc.reduce((a, b) => a + b, 0) / wacc.length;
     const terminalValue = calculateTerminalValue(lastYearFCL, averageWACC, assumptions.perpetualGrowthRate);
     const pvTerminal = calculatePresentValueTerminal(terminalValue, wacc);

     // 3. Enterprise Value = Soma dos VP dos FCLs + VP do Valor Terminal
     const enterpriseValue = pvFCL.reduce((a, b) => a + b, 0) + pvTerminal;

     // 4. Equity Value = Enterprise Value - Dívida Líquida
     const lastYearBP = /* obter último BP */;
     const dividaLiquida = lastYearBP.passivoCirculante.emprestimosFinanciamentosCP +
                           lastYearBP.passivoRealizavelLP.emprestimosFinanciamentosLP -
                           lastYearBP.ativoCirculante.caixaEquivalentes -
                           lastYearBP.ativoCirculante.aplicacoesFinanceiras;
     const equityValue = enterpriseValue - dividaLiquida;

     // 5. Preço por Ação = Equity Value / Número de Ações (input do usuário)
     const sharePrice = equityValue / assumptions.sharesOutstanding;

     return {
       enterpriseValue,
       equityValue,
       sharePrice,
       fcfProjections: fcl,
       pvFCL,
       terminalValue,
       pvTerminal,
       dividaLiquida,
     };
   }
   ```

**4.3 - Dashboard de Resultados de Valuation**
1. ✅ Card de resumo de valuation (`/model/:id/view/valuation`)
   ```
   ┌─ Resultados de Valuation ────────────────────────┐
   │                                                   │
   │ Enterprise Value (Valor da Firma)                 │
   │ R$ 150.000.000,00                                 │
   │                                                   │
   │ (-) Dívida Líquida                                │
   │ R$ (10.000.000,00)                                │
   │                                                   │
   │ Equity Value (Valor do Patrimônio Líquido)        │
   │ R$ 140.000.000,00                                 │
   │                                                   │
   │ Preço por Ação (10.000.000 ações)                 │
   │ R$ 14,00                                          │
   │                                                   │
   └───────────────────────────────────────────────────┘
   ```

2. ✅ Tabela de composição do Enterprise Value
   ```
   ┌─ Composição do Valor ─────────────────────────────┐
   │ Componente                        │ Valor         │ % do Total │
   │ ─────────────────────────────────────────────────────────────── │
   │ VP do FCFF (Anos 1-5)             │ R$ 80,0M      │ 53%        │
   │ VP do Valor Terminal              │ R$ 70,0M      │ 47%        │
   │ ─────────────────────────────────────────────────────────────── │
   │ Enterprise Value                  │ R$ 150,0M     │ 100%       │
   └───────────────────────────────────────────────────────────────┘
   ```

3. ✅ Gráfico waterfall de componentes de valor
   - Barras: VP FCFF Ano 1, Ano 2, ..., Ano N, VP Valor Terminal
   - Acumulação visual até Enterprise Value
   - Dedução de Dívida Líquida → Equity Value

4. ✅ Gráfico de bridge (Valor Presente por ano)
   - Barras: VP FCFF por ano
   - Visualizar contribuição de cada ano para o valor total

**Entregáveis:**
- [ ] Motor de valuation implementado e testado
- [ ] Interface de inputs de valuation (premissas WACC)
- [ ] Dashboard com resultados: EV, Equity Value, Preço/Ação
- [ ] Gráfico waterfall de componentes de valor
- [ ] Tabela de composição do valor

**Critérios de Aceite:**
- Cálculo de valuation produz resultados coerentes
- Fórmulas validadas contra exemplos conhecidos
- Interface exibe resultados de forma clara e visual
- Gráficos ajudam a entender composição do valor

---

### 📈 Fase 5: Análise de Sensibilidade (2 semanas)
**Status:** 🔲 Não Iniciado  
**Esforço:** 2 pessoa-semanas

**Objetivos:**
- Implementar análise de sensibilidade univariada
- Implementar análise de sensibilidade bivariada
- Visualizações de cenários

**Tarefas:**

**5.1 - Análise de Sensibilidade Univariada**
1. ✅ Seletor de variáveis para sensibilidade
   - Variáveis disponíveis: WACC, Taxa Crescimento Perpétuo, Taxa Crescimento Receita (Ano 1), Beta, Rf, etc.
   - Usuário seleciona uma variável

2. ✅ Definição de ranges e steps
   - Valor base (atual)
   - Range: -X% a +Y% (ex: -20% a +20%)
   - Step: 5% (gera 9 cenários)

3. ✅ Cálculo de cenários (N variações)
   ```typescript
   // core/calculations/sensitivity.ts
   export function calculateSensitivityUnivariate(
     baseModel: FinancialModel,
     variableName: string,
     baseValue: number,
     minValue: number,
     maxValue: number,
     step: number
   ): SensitivityResult[] {
     const scenarios: SensitivityResult[] = [];
     for (let value = minValue; value <= maxValue; value += step) {
       // Clonar modelo e alterar variável
       const modelClone = { ...baseModel };
       setVariable(modelClone, variableName, value);
       
       // Recalcular valuation
       const result = executeFullValuation(modelClone);
       
       scenarios.push({
         variableValue: value,
         enterpriseValue: result.data.valuation.enterpriseValue,
         equityValue: result.data.valuation.equityValue,
         sharePrice: result.data.valuation.sharePrice,
       });
     }
     return scenarios;
   }
   ```

4. ✅ Tabela de tornado (impacto por variável)
   ```
   ┌─ Análise de Tornado ──────────────────────────────────────────┐
   │ Variável                  │ -20%      │ Valor Base │ +20%      │ Variação │
   │ ─────────────────────────────────────────────────────────────────────────│
   │ WACC                      │ R$ 180M   │ R$ 150M    │ R$ 125M   │ ±18%     │
   │ Taxa Cresc. Perpétuo      │ R$ 130M   │ R$ 150M    │ R$ 175M   │ ±15%     │
   │ Taxa Cresc. Receita (A1)  │ R$ 140M   │ R$ 150M    │ R$ 160M   │ ±7%      │
   │ Beta                      │ R$ 155M   │ R$ 150M    │ R$ 145M   │ ±3%      │
   └──────────────────────────────────────────────────────────────────────────┘
   ```

   - Ordenar variáveis por impacto (variação %)
   - Gráfico de tornado (barras horizontais)

5. ✅ Gráfico de sensibilidade (linha)
   - Eixo X: Valor da variável (-20% a +20%)
   - Eixo Y: Equity Value
   - Linha mostrando relação

**5.2 - Análise de Sensibilidade Bivariada**
1. ✅ Seletor de duas variáveis
   - Ex: WACC (eixo X) vs Taxa Crescimento Perpétuo (eixo Y)

2. ✅ Grid de sensibilidade 2D
   ```
   ┌─ Análise Bivariada: WACC vs Taxa Crescimento Perpétuo ───────┐
   │                │ WACC                                          │
   │ Taxa Cresc. g  │ 8%     │ 10%    │ 12%    │ 14%    │ 16%      │
   │ ────────────────────────────────────────────────────────────── │
   │ 2%             │ 140M   │ 120M   │ 105M   │ 92M    │ 82M      │
   │ 3%             │ 165M   │ 140M   │ 120M   │ 105M   │ 92M      │
   │ 4%             │ 200M   │ 165M   │ 140M   │ 120M   │ 105M     │
   │ 5%             │ 250M   │ 200M   │ 165M   │ 140M   │ 120M     │
   └───────────────────────────────────────────────────────────────┘
   ```

   - Células coloridas por heatmap (verde = alto valor, vermelho = baixo)
   - Célula central = valor base

3. ✅ Implementar cálculo de grid
   ```typescript
   export function calculateSensitivityBivariate(
     baseModel: FinancialModel,
     variable1Name: string,
     variable1Values: number[],
     variable2Name: string,
     variable2Values: number[]
   ): number[][] {
     const grid: number[][] = [];
     for (const v1 of variable1Values) {
       const row: number[] = [];
       for (const v2 of variable2Values) {
         const modelClone = { ...baseModel };
         setVariable(modelClone, variable1Name, v1);
         setVariable(modelClone, variable2Name, v2);
         const result = executeFullValuation(modelClone);
         row.push(result.data.valuation.equityValue);
       }
       grid.push(row);
     }
     return grid;
   }
   ```

**5.3 - Comparação de Cenários**
1. ✅ Criar cenários nomeados
   - Cenário Base (valores atuais)
   - Cenário Otimista (+20% crescimento, -2pp WACC)
   - Cenário Pessimista (-20% crescimento, +2pp WACC)

2. ✅ Tabela de comparação
   ```
   ┌─ Comparação de Cenários ──────────────────────────────────────┐
   │ Métrica              │ Base      │ Otimista  │ Pessimista     │
   │ ─────────────────────────────────────────────────────────────── │
   │ Enterprise Value     │ R$ 150M   │ R$ 180M   │ R$ 120M        │
   │ Equity Value         │ R$ 140M   │ R$ 170M   │ R$ 110M        │
   │ Preço por Ação       │ R$ 14,00  │ R$ 17,00  │ R$ 11,00       │
   │ WACC Médio           │ 12,5%     │ 10,5%     │ 14,5%          │
   └───────────────────────────────────────────────────────────────┘
   ```

3. ✅ Gráfico de comparação (barras agrupadas)
   - Comparar EV, Equity Value e Preço/Ação entre cenários

**5.4 - Performance (Web Workers)**
1. ✅ Implementar cálculo em Web Worker (opcional, se lento)
   ```typescript
   // workers/valuationWorker.ts
   self.addEventListener('message', (e) => {
     const { model, scenarios } = e.data;
     const results = scenarios.map(scenario => calculateValuation(scenario));
     self.postMessage(results);
   });
   ```

   - Usar quando calcular > 20 cenários
   - Não bloquear UI durante cálculo

**Entregáveis:**
- [ ] Análise de sensibilidade univariada funcional
- [ ] Grid de sensibilidade 2D (bivariada)
- [ ] Gráfico de tornado (ordenado por impacto)
- [ ] Comparação visual de cenários (Base, Otimista, Pessimista)
- [ ] Cálculo não bloqueia UI (Web Workers se necessário)

**Critérios de Aceite:**
- Usuário seleciona variável e vê impacto no valuation
- Grid 2D renderiza em < 2 segundos
- Cenários são salvos e podem ser recuperados
- Gráficos facilitam comparação visual

---

### 📤 Fase 6: Exportação e Relatórios (1 semana)
**Status:** 🔲 Não Iniciado  
**Esforço:** 1 pessoa-semana

**Objetivos:**
- Exportar modelos para Excel (XLSX)
- Gerar relatórios completos

**Tarefas:**

**6.1 - Exportação para Excel**
1. ✅ Instalar biblioteca de exportação
   ```bash
   npm install xlsx
   ```

2. ✅ Implementar exportação de DRE/BP/FCFF (`lib/export/excelExporter.ts`)
   ```typescript
   import * as XLSX from 'xlsx';

   export function exportToExcel(model: FinancialModel): void {
     // Criar workbook
     const wb = XLSX.utils.book_new();

     // Aba 1: DRE Projetado
     const dreFData = model.dre.calculatedAccounts.map(dre => ({
       Ano: dre.year,
       'Receita Bruta': dre.receitaBruta,
       'Impostos e Devoluções': dre.impostosEDevolucoes,
       'Receita Líquida': dre.receitaLiquida,
       CMV: dre.cmv,
       'Lucro Bruto': dre.lucroBruto,
       'Despesas Operacionais': dre.despesasOperacionais,
       EBIT: dre.ebit,
       EBITDA: dre.ebitda,
       'Lucro Líquido': dre.lucroLiquido,
     }));
     const dreWS = XLSX.utils.json_to_sheet(dreData);
     XLSX.utils.book_append_sheet(wb, dreWS, 'DRE');

     // Aba 2: Balanço Patrimonial
     // ... similar

     // Aba 3: Fluxo de Caixa Livre
     // ... similar

     // Aba 4: Valuation
     const valuationData = [
       { Métrica: 'Enterprise Value', Valor: model.valuationResults.enterpriseValue },
       { Métrica: 'Equity Value', Valor: model.valuationResults.equityValue },
       { Métrica: 'Preço por Ação', Valor: model.valuationResults.sharePrice },
     ];
     const valuationWS = XLSX.utils.json_to_sheet(valuationData);
     XLSX.utils.book_append_sheet(wb, valuationWS, 'Valuation');

     // Download
     XLSX.writeFile(wb, `${model.companyName}_Valuation.xlsx`);
   }
   ```

3. ✅ Botão de exportação na interface
   - Localização: Header (ícone download)
   - Tooltip: "Exportar para Excel"
   - Ação: Chama `exportToExcel(model)`

**6.2 - Relatório Completo (Markdown/HTML)**
1. ✅ Gerar relatório em formato Markdown
   ```typescript
   export function generateReport(model: FinancialModel): string {
     return `
   # Relatório de Valuation - ${model.companyName}

   **Data:** ${new Date().toLocaleDateString('pt-BR')}

   ## 1. Resumo Executivo
   - **Enterprise Value:** ${formatCurrency(model.valuationResults.enterpriseValue)}
   - **Equity Value:** ${formatCurrency(model.valuationResults.equityValue)}
   - **Preço por Ação:** ${formatCurrency(model.valuationResults.sharePrice)}

   ## 2. Premissas de Valuation
   - **Taxa Livre de Risco (Rf):** ${model.assumptions.taxaLivreDeRisco}%
   - **Beta (β):** ${model.assumptions.beta}
   - **Prêmio de Risco de Mercado (ERP):** ${model.assumptions.premioRiscoMercado}%
   - **WACC Médio:** ${model.waccCalculations.reduce((a, b) => a + b.wacc, 0) / model.waccCalculations.length}%

   ## 3. Projeções Financeiras
   ### DRE Projetado
   ${renderDRETable(model.dre.calculatedAccounts)}

   ## 4. Análise de Sensibilidade
   ${model.sensitivity ? renderSensitivityAnalysis(model.sensitivity) : 'Não disponível'}
     `;
   }
   ```

2. ✅ Converter Markdown para HTML (opcional)
   ```bash
   npm install marked
   ```

   ```typescript
   import { marked } from 'marked';

   export function generateHTMLReport(model: FinancialModel): string {
     const markdown = generateReport(model);
     return marked(markdown);
   }
   ```

3. ✅ Botão de download de relatório
   - Formato: HTML ou PDF (futura implementação)
   - Download como arquivo

**6.3 - Histórico de Versões (Opcional)**
1. ✅ Salvar snapshot do modelo ao exportar
   - Tabela `model_versions` no Supabase
   - Armazenar: timestamp, dados completos (JSONB)

2. ✅ Interface para ver versões anteriores
   - Lista de versões com data/hora
   - Botão "Restaurar" para voltar a uma versão

**Entregáveis:**
- [ ] Exportação para Excel funcionando (DRE, BP, FCFF, Valuation)
- [ ] Relatório completo downloadável (HTML ou Markdown)
- [ ] Botões de exportação visíveis e funcionais
- [ ] (Opcional) Histórico de versões implementado

**Critérios de Aceite:**
- Arquivo Excel contém todas as demonstrações formatadas
- Relatório HTML é legível e contém todas as informações relevantes
- Download funciona em todos os navegadores modernos

---

### ✨ Fase 7: Refinamento e Polimento (1-2 semanas)
**Status:** 🔲 Não Iniciado  
**Esforço:** 1-2 pessoa-semanas

**Objetivos:**
- Melhorias de UX/UI
- Performance optimization
- Tratamento de erros robusto
- Documentação de usuário

**Tarefas:**

**7.1 - Revisão de UX**
1. ✅ Testes de usabilidade com 3-5 usuários beta
   - Observar fluxo de criação de modelo completo
   - Identificar pontos de confusão
   - Coletar feedback (survey)

2. ✅ Ajustes baseados em feedback
   - Simplificar formulários se muito complexos
   - Adicionar tooltips onde necessário
   - Melhorar mensagens de erro

3. ✅ Responsividade mobile (básica)
   - Testar em tablet e smartphone
   - Layout adaptável (sidebar colapsa em menu hamburger)

**7.2 - Performance Optimization**
1. ✅ Memoização de componentes
   ```typescript
   import React from 'react';

   export const DRETable = React.memo(({ data }: { data: DRECalculated[] }) => {
     // Componente só re-renderiza se data mudar
     return <table>...</table>;
   });
   ```

2. ✅ useMemo para cálculos pesados
   ```typescript
   const dreProjections = useMemo(() => {
     return calculateAllDRE(baseInputs, projectionInputs);
   }, [baseInputs, projectionInputs]);
   ```

3. ✅ Virtualização para tabelas grandes (opcional)
   ```bash
   npm install @tanstack/react-virtual
   ```

   - Usar se tabela > 100 linhas
   - Renderizar apenas linhas visíveis

4. ✅ Debouncing de inputs
   ```typescript
   const debouncedSave = useMemo(
     () => debounce((data) => saveModel(data), 2000),
     []
   );

   useEffect(() => {
     debouncedSave(model);
   }, [model]);
   ```

5. ✅ Lazy loading de rotas
   ```typescript
   import { lazy, Suspense } from 'react';

   const ValuationView = lazy(() => import('./views/ValuationView'));

   <Suspense fallback={<LoadingSpinner />}>
     <ValuationView />
   </Suspense>
   ```

**7.3 - Tratamento de Erros**
1. ✅ Error Boundary global
   ```typescript
   class ErrorBoundary extends React.Component {
     componentDidCatch(error, errorInfo) {
       // Log erro para serviço de monitoramento
       console.error(error, errorInfo);
     }
     render() {
       if (this.state.hasError) {
         return <ErrorFallback />;
       }
       return this.props.children;
     }
   }
   ```

2. ✅ Mensagens de erro amigáveis
   - Evitar stack traces técnicos
   - Sugerir ação corretiva
   - Exemplo: "Receita Bruta deve ser maior que zero. Por favor, verifique o valor inserido."

3. ✅ Toast notifications para feedback
   ```bash
   npx shadcn-ui@latest add toast
   ```

   ```typescript
   import { useToast } from '@/components/ui/use-toast';

   const { toast } = useToast();

   toast({
     title: 'Modelo salvo com sucesso!',
     description: 'Suas alterações foram sincronizadas na nuvem.',
     variant: 'default',
   });
   ```

4. ✅ Retry automático em caso de falha de rede
   ```typescript
   async function saveModelWithRetry(data: FinancialModel, retries = 3): Promise<void> {
     try {
       await supabase.from('financial_models').update(data);
     } catch (error) {
       if (retries > 0) {
         await new Promise(resolve => setTimeout(resolve, 1000));
         return saveModelWithRetry(data, retries - 1);
       }
       throw error;
     }
   }
   ```

**7.4 - Loading States e Skeleton Screens**
1. ✅ Skeleton screens para carregamento inicial
   ```typescript
   {loading ? (
     <Skeleton className="h-[400px] w-full" />
   ) : (
     <DRETable data={dre} />
   )}
   ```

2. ✅ Spinner para ações assíncronas
   - Salvar modelo
   - Calcular sensibilidade
   - Exportar Excel

**7.5 - Tooltips e Ajuda Contextual**
1. ✅ Tooltips em todos os inputs complexos
   ```typescript
   <Tooltip>
     <TooltipTrigger>
       <Label>Taxa Livre de Risco (Rf)</Label>
     </TooltipTrigger>
     <TooltipContent>
       <p>Taxa de retorno de um ativo sem risco, geralmente a Selic (Brasil) ou Treasury 10Y (EUA).</p>
     </TooltipContent>
   </Tooltip>
   ```

2. ✅ Modal de ajuda com guia rápido
   - Botão "?" no Header
   - Modal com passo a passo de uso

3. ✅ Tour guiado (opcional, biblioteca react-joyride)
   - Primeira vez que usuário acessa, tour automático
   - Destacar principais funcionalidades

**7.6 - Documentação de Usuário**
1. ✅ Criar página de ajuda (`/help`)
   - Como criar um modelo
   - Como interpretar resultados de valuation
   - Glossário de termos financeiros

2. ✅ FAQ
   - O que é WACC?
   - Como definir taxa de crescimento perpétuo?
   - Como interpretar análise de sensibilidade?

3. ✅ Vídeo tutorial (opcional)
   - Screencast demonstrando criação de modelo completo

**7.7 - Testes Finais**
1. ✅ Smoke tests (principais fluxos)
   - Criar conta → Login → Criar modelo → Inserir dados → Ver valuation → Exportar

2. ✅ Testes de regressão
   - Rodar suite de testes unitários e integração
   - Garantir coverage > 80%

3. ✅ Testes cross-browser
   - Chrome, Firefox, Edge, Safari
   - Verificar compatibilidade

4. ✅ Testes de performance
   - Lighthouse (score > 80 para Performance, Accessibility, Best Practices)
   - Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

**Entregáveis:**
- [ ] Aplicação polida e responsiva (desktop + tablet)
- [ ] Performance otimizada (< 500ms para recalcular projeções)
- [ ] Tratamento de erros robusto (mensagens amigáveis, retry automático)
- [ ] Loading states e skeleton screens implementados
- [ ] Tooltips e ajuda contextual em todas as seções complexas
- [ ] Documentação de usuário (página /help e FAQ)
- [ ] Testes de usabilidade concluídos (taxa de sucesso > 80%)
- [ ] Testes automatizados passando (coverage > 80%)

**Critérios de Aceite:**
- Usuário beta consegue criar modelo completo sem ajuda externa
- Performance Lighthouse > 80 em todas as categorias
- Zero erros não tratados (Error Boundary captura tudo)
- Feedback visual claro em todas as ações (loading, sucesso, erro)

---

## 📊 Métricas de Sucesso do MVP

### MVP será considerado sucesso se:

**Funcionalidade:**
- [ ] ✅ Autenticação funciona sem falhas (cadastro, login, logout, recuperação)
- [ ] ✅ Modelos são salvos na nuvem e carregados corretamente
- [ ] ✅ Isolamento de dados por usuário (RLS funcionando, testado com 2+ contas)
- [ ] ✅ Cálculos de DRE, BP e FCFF estão matematicamente corretos (validados contra casos conhecidos)
- [ ] ✅ Valuation por FCD funciona e produz resultados coerentes
- [ ] ✅ Análise de sensibilidade básica funciona (univariada e bivariada)
- [ ] ✅ Exportação para Excel funciona corretamente (todas as demonstrações)

**Usabilidade:**
- [ ] ✅ Usuário consegue criar um modelo completo em < 30 minutos
- [ ] ✅ Interface é intuitiva (taxa de sucesso em testes de usabilidade > 80%)
- [ ] ✅ Navegação é fluida (< 2 cliques para qualquer seção)

**Performance:**
- [ ] ✅ Performance é aceitável (recálculo de projeções < 500ms)
- [ ] ✅ Lighthouse score > 80 (Performance, Accessibility, Best Practices)

**Qualidade:**
- [ ] ✅ Testes unitários passando (coverage > 80% em `core/`)
- [ ] ✅ Zero erros não tratados em produção (Error Boundary funcionando)
- [ ] ✅ Core module é 100% independente de UI (pode ser importado standalone)

---

## 🚀 Roadmap Futuro (Pós-MVP)

### Versão 2.0
- [ ] Multi-tenancy (organizações/times com permissões)
- [ ] Compartilhamento de modelos entre usuários
- [ ] Importação de dados de APIs financeiras (B3, Yahoo Finance)
- [ ] Exportação para PDF (relatório formatado)
- [ ] **API REST para acesso programático (Agente de IA)**
  - [ ] Endpoint `POST /api/valuation` (executa valuation completo)
  - [ ] Endpoint `POST /api/sensitivity` (análise de sensibilidade)
  - [ ] Autenticação via API Key
  - [ ] Rate limiting e documentação OpenAPI
- [ ] **SDK TypeScript para agentes de IA**
  - [ ] Publicar `@saas-valuation/core` no npm
  - [ ] Documentação de integração com exemplos

### Versão 3.0
- [ ] Análise comparativa de múltiplas empresas (tabela lado a lado)
- [ ] Valuation por múltiplos (P/E, EV/EBITDA, P/B)
- [ ] Geração automática de relatórios PDF (design profissional)
- [ ] Mobile app (React Native) com funcionalidades básicas
- [ ] Integração com ferramentas de BI (Power BI, Tableau)

---

## ⚠️ Riscos e Mitigações

| Risco                                 | Probabilidade | Impacto | Mitigação                                                                 |
| ------------------------------------- | ------------- | ------- | ------------------------------------------------------------------------- |
| Complexidade dos cálculos financeiros | Média         | Alto    | Validar fórmulas com especialista financeiro, testes unitários extensivos |
| Performance com 10 anos de projeção   | Média         | Médio   | Otimização precoce (memoização), web workers para cálculos pesados        |
| UX confusa para usuários não técnicos | Alta          | Alto    | Testes de usabilidade desde Fase 3, tooltips e ajuda contextual           |
| Precisão decimal em cálculos          | Baixa         | Alto    | Usar decimal.js para operações financeiras (evitar erros de arredondamento) |
| Falhas de autenticação/segurança      | Baixa         | Crítico | Usar Supabase Auth (testado e auditado), RLS no banco, nunca expor segredos no front |
| Perda de dados do usuário             | Baixa         | Alto    | Auto-save frequente (2s debounce), backups automáticos do Supabase, versionamento |
| Scope creep (expansão de escopo)      | Alta          | Médio   | Manter foco no MVP, adiar features para v2.0, revisões semanais de progresso |

---

## 📚 Referências

- **Regras de Negócio:** [Regras de Negocio (Jaime).md](../Regras%20de%20Negocio%20(Jaime).md)
- **Contexto Geral:** [Contexto para Plano de App (Jaime).md](../Contexto%20para%20Plano%20de%20App%20(Jaime).md)
- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org
- **Vite:** https://vitejs.dev
- **Tailwind CSS:** https://tailwindcss.com
- **shadcn/ui:** https://ui.shadcn.com
- **Supabase:** https://supabase.com/docs
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Zustand:** https://github.com/pmndrs/zustand
- **React Hook Form:** https://react-hook-form.com
- **Zod:** https://zod.dev
- **Recharts:** https://recharts.org
- **TanStack Table:** https://tanstack.com/table
- **decimal.js:** https://mikemcl.github.io/decimal.js/
- **Vitest:** https://vitest.dev

---

## 📅 Timeline Estimado

**Total:** 13-18 semanas (3.5-4.5 meses com 1 desenvolvedor full-time)

| Fase                        | Duração     | Acumulado   |
| --------------------------- | ----------- | ----------- |
| Fase 1: Setup               | 1-2 semanas | 1-2 semanas |
| Fase 1.5: Autenticação      | 1-2 semanas | 2-4 semanas |
| Fase 2: Entrada e Cálculo   | 3-4 semanas | 5-8 semanas |
| Fase 3: Visualização        | 2-3 semanas | 7-11 semanas |
| Fase 4: Valuation           | 2 semanas   | 9-13 semanas |
| Fase 5: Sensibilidade       | 2 semanas   | 11-15 semanas |
| Fase 6: Exportação          | 1 semana    | 12-16 semanas |
| Fase 7: Refinamento         | 1-2 semanas | **13-18 semanas** |

---

**Última Atualização:** 2026-01-22  
**Versão do Plano:** 1.0  
**Status Geral:** 🟡 Planejamento Concluído, Aguardando Início da Implementação
