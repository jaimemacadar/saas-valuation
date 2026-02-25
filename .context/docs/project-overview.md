---
type: doc
name: project-overview
description: High-level overview of the project, its purpose, and key components
category: overview
generated: 2026-01-27
updated: 2026-02-25
status: filled
scaffoldVersion: "2.0.0"
---

## Project Overview

SaaS Valuation is a web application that empowers founders, investors, and analysts to model, analyze, and value SaaS businesses. By combining financial statements, projections, and industry assumptions, it delivers robust valuation outputs and scenario analysis.

## Codebase Reference

> **Detailed Analysis**: For complete symbol counts, architecture layers, and dependency graphs, see [`codebase-map.json`](./codebase-map.json).

## Quick Facts

- Root: `/c/Dev/3-Projeto Saas Valuation/saas-valuation`
- Languages: TypeScript (majority), JavaScript, CSS
- Entry: [src/app/layout.tsx](../../src/app/layout.tsx)
- Full analysis: [`codebase-map.json`](./codebase-map.json)

## Entry Points

- [middleware.ts](../../middleware.ts)
- [src/app/layout.tsx](../../src/app/layout.tsx)
- [src/app/(auth)/login/page.tsx](<../../src/app/(auth)/login/page.tsx>)
- [src/app/(dashboard)/model/[id]/](<../../src/app/(dashboard)/model/[id]/>)

## Key Exports

See [`codebase-map.json`](./codebase-map.json) for the complete list of exports, types, and functions.

## File Structure & Code Organization

- `src/app/` — UI, routing, and pages
  - `styleguide/` — Design System visual (tokens, componentes, dark mode toggle)
    - `components/grafico-combinado/` — Showcase do GraficoCombinado
    - `components/tabelas/` — Showcase das Tabelas Financeiras
- `src/components/` — UI components and layout
  - `charts/GraficoCombinado.tsx` — Componente genérico de gráfico composto
  - `tables/` — Tabelas financeiras (InvestmentTable, WorkingCapitalTable, LoansTable, DRETable, FCFFTable)
- `src/core/` — Domain logic and calculations
- `src/lib/` — Utilities and integrations
- `src/types/` — Shared type definitions
- `src/styles/` — Design system and global styles

## Key Features

### 🔐 Autenticação e Usuários
- Login/Signup com Supabase Auth
- Reset de senha por email
- Proteção de rotas via middleware
- Sessões persistentes

### 📊 Gestão de Modelos
- **CRUD completo de modelos** de valuation
- Dashboard com lista de modelos (cards visuais)
- Criação de novos modelos com wizard
- Duplicação de modelos existentes
- Exclusão com confirmação

### 💰 Visualização Financeira
- **DRE (Demonstração de Resultado)** - tabs por ano com visualização em tabela e gráficos
  - **Premissas Inline Editáveis** - Edição direta de percentuais de projeção na tabela
    - 🠒 **Copiar para Direita** - Botão para replicar valor do Ano 1 para todos os anos
    - 📈 **Aplicar Tendência** - Popover com interpolação linear entre valor inicial e final
    - ⌨️ **Navegação por Teclado** - Tab (próximo ano), Enter (próxima premissa), Shift+Tab (anterior), Escape (cancelar)
    - ℹ️ **Tooltips Informativos** - Ícone Info com explicação da base de cálculo de cada premissa
    - 💾 **Auto-save com Debounce** - Persistência automática após 800ms de inatividade com indicador visual
  - Gráficos de Receita, Composição de Custos e EBITDA
  - Carregamento dinâmico de componentes de visualização
  - Cálculos em tempo real ao editar premissas
- **Balanço Patrimonial** - tabs por ano com visualização em tabela e gráficos
  - **Investimentos** (`InvestmentChartSection`) — Gráfico de Capex e Imobilizado Líquido
  - **Capital de Giro** (`WorkingCapitalChartSection`) — Gráfico de Caixa, Contas a Receber, Estoque e Fornecedores
  - **Empréstimos** (`LoansChartSection`) — Gráfico de dívida CP/LP com indicador Empréstimos/EBITDA
    - Despesas financeiras calculadas separadamente para CP e LP (saldo inicial para evitar circularidade)
    - Linhas separadas de despesas financeiras CP/LP na tabela de empréstimos
  - **Indicadores** — Registry extensível: Vendas/Imobilizado, Empréstimos/EBITDA (via `calculateIndicadores`)
- **FCFF (Free Cash Flow to Firm)** - projeções com visualização em tabela e gráficos
  - Gráfico de evolução do fluxo de caixa livre
- Cálculos automáticos de campos dependentes

### 📝 Entrada de Dados
- Formulários de entrada para Ano Base
- Tabs horizontais: DRE | Balanço Patrimonial
- Validação de balanço (Ativo = Passivo + PL)
- Premissas de Projeção
- **FinancialInput** - Componente especializado para entrada de valores monetários
  - Formatação automática em tempo real (R$ com separadores pt-BR)
  - Parse e validação de entrada
  - Sincronização bidirecional de valores

### 🚧 Modo Mock para Desenvolvimento
- **Sistema completo de mock data** sem necessidade de Supabase
- Autenticação simulada com usuários pré-configurados
- Dados de exemplo para testes
- Cálculos automáticos de campos financeiros
- Latência simulada para realismo
- **Documentação**: [MOCK_MODE.md](../../MOCK_MODE.md)

## Technology Stack Summary

- **Framework**: Next.js 15 (App Router) + React 19
- **Linguagem**: TypeScript
- **Backend**: Supabase (Auth + PostgreSQL + Storage)
- **UI**: Tailwind CSS + Radix UI + shadcn/ui
- **Charts**: Recharts (carregamento dinâmico com Next.js dynamic)
- **Forms**: React Hook Form + Zod
- **Cálculos**: Decimal.js para precisão financeira
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + TypeScript ESLint
- **Development**: Mock system para desenvolvimento offline

## Getting Started Checklist

1. Install dependencies with `npm install`.
2. Run the development server with `npm run dev`.
3. Build for production with `npm run build`.
4. Run tests with `npm run test`.
5. Review [Development Workflow](./development-workflow.md) for day-to-day tasks.

---

See also: [Architecture Notes](./architecture.md), [Development Workflow](./development-workflow.md), [Tooling](./tooling.md), [`codebase-map.json`](./codebase-map.json)
