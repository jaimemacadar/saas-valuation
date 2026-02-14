---
type: doc
name: glossary
description: Project terminology, type definitions, domain entities, and business rules
category: glossary
generated: 2026-01-27
updated: 2026-02-14
status: filled
scaffoldVersion: "2.0.0"
---

## Glossary & Domain Concepts

**SaaS Valuation**: A web application for modeling, analyzing, and valuing SaaS businesses using financial and operational data.

**Supabase**: Backend-as-a-service platform providing authentication, database, and storage.

**Valuation Model**: A set of assumptions and calculations used to estimate the value of a SaaS company.

**DRE (Demonstração do Resultado do Exercício)**: Income statement, a financial report showing revenues, expenses, and profit.

**Balance Sheet**: Financial statement showing assets, liabilities, and equity.

**FCFF (Free Cash Flow to Firm)**: Cash flow available to all capital providers after operating expenses and investments.

**WACC (Weighted Average Cost of Capital)**: Average rate a company is expected to pay to finance its assets.

**Sensitivity Analysis**: Technique to determine how different values of an input affect a particular output.

## Type Definitions

- [ValuationModel](../../src/types/valuation.ts#L3)
- [DCFAssumptions](../../src/types/valuation.ts#L19)
- [DCFResult](../../src/types/valuation.ts#L30)
- [User](../../src/types/user.ts#L2)
- [Company](../../src/types/company.ts#L2)
- [BalanceSheet](../../src/types/financial.ts#L23)
- [CalculationResult](../../src/types/index.ts#L8)
- [ApiResponse](../../src/types/index.ts#L14)
- [AuthSession](../../src/types/user.ts#L39)

## Enumerations

- [ValuationMethod](../../src/types/valuation.ts#L17)
- [UserRole](../../src/types/user.ts#L13)
- [SubscriptionTier](../../src/types/user.ts#L15)
- [Status](../../src/types/index.ts#L41)
- [Period](../../src/types/financial.ts#L65)
- [CompanySector](../../src/types/company.ts#L38)

## Core Terms

- **Model**: A saved set of company data and assumptions for valuation.
- **Assumptions**: Key variables and parameters used in financial models.
- **Projection**: Forecast of future financial results.
- **Inputs**: User-provided or calculated data used in models.
- **Result**: Output of a calculation or valuation process.

## Acronyms & Abbreviations

- **DRE**: Demonstração do Resultado do Exercício (Income Statement)
- **FCFF**: Free Cash Flow to Firm
- **WACC**: Weighted Average Cost of Capital

## Personas / Actors

- **Founder**: Wants to estimate company value for fundraising or exit.
- **Investor**: Evaluates SaaS companies for investment opportunities.
- **Analyst**: Runs scenarios and sensitivity analyses.

## Termos Técnicos do Projeto

### Sistema Mock

- **Mock Mode**: Modo de desenvolvimento que substitui Supabase por armazenamento em memória
- **Mock Store**: Store in-memory que simula banco de dados com CRUD completo
- **Mock Auth**: Sistema de autenticação simulada com sessões em memória
- **Auto-calculation**: Cálculo automático de campos derivados (lucro bruto, EBITDA, etc.)
- **Latency Simulation**: Atraso artificial (100-300ms) para simular requisições de rede

### Workflow PREVC

- **PREVC**: Plan → Review → Execute → Verify → Complete (metodologia de desenvolvimento)
- **Plan (P)**: Fase de planejamento da implementação
- **Review (R)**: Fase de revisão de código e design
- **Execute (E)**: Fase de implementação do código
- **Verify (V)**: Fase de testes e validação
- **Complete (C)**: Fase final de documentação e deploy
- **Workflow Scale**: Tamanho do projeto (QUICK, SMALL, MEDIUM, LARGE)
- **Phase Gates**: Pontos de aprovação entre fases do workflow

### Componentes e UI

- **PageHeader**: Componente reutilizável de cabeçalho com breadcrumbs
- **AppSidebar**: Barra lateral de navegação colapsável
- **ModelCard**: Card de modelo com ações CRUD
- **DevModeIndicator**: Badge visual indicando modo mock ativo
- **Tabs**: Componente de navegação horizontal (usado em DRE/Balanço)
- **shadcn/ui**: Biblioteca de componentes UI baseada em Radix UI
- **Server Component**: Componente React renderizado no servidor
- **Client Component**: Componente React renderizado no cliente (browser)

### Rotas e Navegação

- **Route Group**: Agrupamento lógico de rotas sem afetar URL (ex: `(auth)`, `(dashboard)`)
- **Dynamic Route**: Rota com parâmetros variáveis (ex: `/model/[id]`)
- **Middleware**: Função que executa antes de cada requisição
- **Protected Route**: Rota que requer autenticação
- **Public Route**: Rota acessível sem autenticação

### Arquitetura

- **Server Action**: Função assíncrona executada no servidor (Next.js)
- **Edge Runtime**: Ambiente de execução do middleware (baixa latência)
- **RLS**: Row Level Security (segurança em nível de linha no PostgreSQL)
- **JSONB**: Tipo de dados JSON binário do PostgreSQL
- **JWT**: JSON Web Token (usado para autenticação)
- **HTTP-only Cookie**: Cookie inacessível via JavaScript (proteção XSS)

## Termos Financeiros Detalhados

### DRE (Demonstração do Resultado do Exercício)

- **Receita Bruta**: Total de vendas antes de deduções
- **Lucro Bruto**: `Receita Bruta - CMV`
- **CMV**: Custo da Mercadoria Vendida / Custo dos Serviços Prestados
- **EBITDA**: Earnings Before Interest, Taxes, Depreciation and Amortization
  - Fórmula: `Lucro Bruto - Despesas Operacionais`
- **EBIT**: Earnings Before Interest and Taxes
  - Fórmula: `EBITDA - Depreciação`
- **Lucro Líquido**: Resultado final após todas as deduções
  - Fórmula: `EBIT - Despesas Financeiras - Impostos`

### Balanço Patrimonial

**Ativo:**
- **Ativo Circulante**: Bens e direitos de curto prazo (< 1 ano)
  - Caixa e Equivalentes
  - Contas a Receber
  - Estoques
- **Ativo Não Circulante**: Bens e direitos de longo prazo (> 1 ano)
  - Ativo Imobilizado (máquinas, equipamentos)
  - Ativo Intangível (software, patentes)

**Passivo:**
- **Passivo Circulante**: Obrigações de curto prazo (< 1 ano)
  - Fornecedores
  - Empréstimos CP (Curto Prazo)
- **Passivo Não Circulante**: Obrigações de longo prazo (> 1 ano)
  - Empréstimos LP (Longo Prazo)

**Patrimônio Líquido:**
- Capital Social
- Reservas
- Lucros Acumulados

**Equação Fundamental:**
```
Ativo Total = Passivo Total + Patrimônio Líquido
```

### Valuation

- **Enterprise Value (EV)**: Valor da empresa (operação)
- **Equity Value**: Valor do patrimônio líquido (equity)
- **Gordon Growth Model**: Método de cálculo do valor terminal com crescimento perpétuo
- **Exit Multiple**: Múltiplo de saída usado para calcular valor terminal
- **Terminal Value**: Valor da empresa no final do período de projeção
- **Discount Rate**: Taxa de desconto usada para trazer fluxos futuros a valor presente

## Tipos de Dados Principais

### Model

```typescript
interface Model {
  id: string
  user_id: string
  company_name: string
  valuation_date: string
  model_data: ModelData  // JSONB contendo DRE, Balanço, etc.
  created_at: string
  updated_at: string
}
```

### DREBaseInputs

```typescript
interface DREBaseInputs {
  receita: number
  custoMercadoriaVendida: number
  despesasOperacionais: number
  despesasFinanceiras: number
  taxaImposto: number
  // Campos calculados
  lucro_bruto?: number
  ebitda?: number
  lucro_liquido?: number
}
```

### BalanceSheetBaseInputs

```typescript
interface BalanceSheetBaseInputs {
  // Ativo Circulante
  caixa: number
  contasReceber: number
  estoques: number
  // Passivo
  fornecedores: number
  emprestimosCP: number
  // Patrimônio Líquido
  capitalSocial: number
  reservas: number
  lucrosAcumulados: number
}
```

## Convenções de Nomenclatura

- **Arquivos**: kebab-case (`model-sidebar-nav.tsx`)
- **Componentes**: PascalCase (`AppSidebar`, `PageHeader`)
- **Funções**: camelCase (`createModel`, `calculateDerivedFields`)
- **Tipos/Interfaces**: PascalCase (`Model`, `DREBaseInputs`)
- **Constantes**: UPPER_SNAKE_CASE (`MOCK_CONFIG`, `DEFAULT_VALUES`)
- **Variáveis**: camelCase (`modelData`, `userId`)

## Padrões de Código

### Server Actions

```typescript
// src/lib/actions/models.ts
export async function createModel(data: CreateModelInput) {
  const user = await requireAuth()

  // Validação
  if (!data.company_name) {
    return { success: false, error: 'Company name required' }
  }

  // Lógica
  const model = await db.create({ ...data, user_id: user.id })

  return { success: true, data: model }
}
```

### Componentes com Mock

```typescript
// Detectar modo mock
import { isMockMode } from '@/lib/mock/config'

if (isMockMode()) {
  // Usar mock data
  const data = await mockStore.getModels()
} else {
  // Usar Supabase
  const { data } = await supabase.from('models').select()
}
```

---

See also: [Project Overview](./project-overview.md), [Architecture](./architecture.md), [MOCK_MODE.md](../../MOCK_MODE.md)
