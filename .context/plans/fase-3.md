---
status: filled
progress: 100
generated: 2026-01-29
agents:
  - type: "frontend-specialist"
    role: "Implementar tabelas financeiras, gráficos e navegação"
  - type: "architect-specialist"
    role: "Definir estrutura de componentes Server/Client e rotas"
  - type: "test-writer"
    role: "Escrever testes para componentes de visualização"
  - type: "code-reviewer"
    role: "Revisar qualidade dos componentes e padrões de código"
  - type: "performance-optimizer"
    role: "Garantir performance na renderização de tabelas e gráficos"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "development-workflow.md"
  - "testing-strategy.md"
phases:
  - id: "phase-1"
    name: "Discovery & Setup"
    prevc: "P"
  - id: "phase-2"
    name: "Implementação de Tabelas e Gráficos"
    prevc: "E"
  - id: "phase-3"
    name: "Navegação, UX e Validação"
    prevc: "V"
lastUpdated: "2026-01-29T18:30:26.459Z"
---

# Fase 3: Visualização de Demonstrações

> Criar componentes de visualização para demonstrações financeiras projetadas (DRE, Balanço Patrimonial, FCFF), implementar gráficos interativos com Recharts e navegação fluida entre seções do modelo.

## Task Snapshot

- **Primary goal:** Permitir que o usuário visualize as projeções financeiras calculadas pelo motor da Fase 2 em tabelas formatadas e gráficos interativos.
- **Success signal:** Tabelas renderizam projeções de 5-10 anos sem lag, gráficos são interativos (hover mostra valores), navegação é intuitiva (< 2 cliques para qualquer seção), números formatados corretamente (R$, %).
- **Key references:**
  - [PRD - Fase 3](./PRD.md) — Especificação detalhada
  - [Core Types](../../src/core/types/index.ts) — Tipos DRECalculated, BalanceSheetCalculated, FCFFCalculated
  - [Core Calculations](../../src/core/calculations/) — Motor de cálculo da Fase 2

## Codebase Context

- **Motor de cálculo (Fase 2):** Completo — `src/core/calculations/` contém DRE, Balanço, FCFF, WACC, Valuation, Sensibilidade
- **Tipos existentes:** `DRECalculated`, `BalanceSheetCalculated`, `FCFFCalculated`, `ValuationCalculated`, `FullValuationResult`
- **Funções de entrada:** `executeFullValuation()`, `executeQuickValuation()` em `src/core/calculations/fullValuation.ts`
- **Validadores:** `src/core/validators/index.ts` — Validação com Zod
- **Autenticação (Fase 1.5):** Completa — Supabase Auth, RLS, middleware
- **UI Base:** shadcn/ui instalado, Tailwind CSS configurado
- **Stack:** Next.js (App Router), TypeScript, Supabase, Zustand (`src/store/uiStore.ts`)

## Agent Lineup

| Agent | Role in this plan | First responsibility focus |
| --- | --- | --- |
| Architect Specialist | Definir estrutura de rotas, Server vs Client Components, data fetching | Desenhar arquitetura de páginas `/model/[id]/view/*` |
| Frontend Specialist | Implementar tabelas, gráficos e componentes de navegação | Construir `DRETable`, `BalanceSheetTable`, `FCFFTable` |
| Test Writer | Escrever testes para componentes de visualização e formatadores | Testar funções de formatação e renderização de tabelas |
| Code Reviewer | Revisar implementação, padrões e acessibilidade | Garantir consistência com shadcn/ui e boas práticas |
| Performance Optimizer | Otimizar renderização de tabelas grandes e gráficos | Profiling de renderização com 10 anos de projeção |

## Dependencies

- **Fase 2 (Motor de Cálculo):** Completa — Tipos e funções de cálculo disponíveis
- **Fase 1.5 (Autenticação):** Completa — Server Actions e proteção de rotas
- **Novas dependências NPM:**
  - `@tanstack/react-table` — Tabelas financeiras interativas
  - `recharts` — Gráficos de projeção

## Risk Assessment

| Risk | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Performance com tabelas de 10+ anos | Média | Alto | Virtualização de linhas, memoização, lazy loading |
| Recharts bundle size impactando LCP | Média | Médio | Dynamic import com `next/dynamic`, loading skeleton |
| UX confusa para usuários não técnicos | Alta | Alto | Tooltips explicativos, legendas claras, formatação brasileira |
| Responsividade em telas pequenas | Média | Médio | Scroll horizontal em tabelas, gráficos responsivos |

## Assumptions

- O motor de cálculo da Fase 2 retorna dados no formato `DRECalculated[]`, `BalanceSheetCalculated[]`, `FCFFCalculated[]`
- Os modelos financeiros são carregados do Supabase via Server Actions existentes (`getModelById`)
- A formatação segue padrão brasileiro (R$, separador de milhar com ponto, decimal com vírgula)

---

## Working Phases

### Phase 1 — Discovery & Setup

**Objetivo:** Instalar dependências, criar estrutura de rotas e utilitários de formatação.

**Steps:**

1. [x] Instalar dependências: `@tanstack/react-table`, `recharts` *(completed: 2026-01-29T18:25:38.194Z)*
2. Criar utilitários de formatação (`src/lib/utils/formatters.ts`):
   - `formatCurrency(value)` — R$ com Intl.NumberFormat pt-BR
   - `formatPercentage(value)` — Formato `X,XX%`
   - `formatCompactNumber(value)` — 10M, 1,5B, 300K
3. Criar estrutura de rotas:
   - `src/app/(dashboard)/model/[id]/view/dre/page.tsx`
   - `src/app/(dashboard)/model/[id]/view/balance-sheet/page.tsx`
   - `src/app/(dashboard)/model/[id]/view/fcff/page.tsx`
4. Definir quais componentes serão Server vs Client Components

**Commit Checkpoint:** `git commit -m "feat(fase-3): setup dependencies, formatters and route structure"`

---

### Phase 2 — Implementação de Tabelas e Gráficos

**Objetivo:** Construir os componentes de visualização principal.

#### 2.1 — Tabelas Financeiras

**DRE Table** (`src/components/tables/DRETable.tsx`) — Client Component:
- Colunas: Ano 0 (base), Ano 1, ..., Ano N
- Linhas: Receita Bruta, Impostos, Receita Líquida, CMV, Lucro Bruto, Desp. Op., EBIT, EBITDA, LAIR, IR/CSLL, Lucro Líquido, Dividendos
- Formatação: R$ para valores absolutos, % para margens
- Highlight: Linhas de totais (Receita Líquida, EBIT, Lucro Líquido) com negrito e borda superior
- Distinção visual: inputs (fundo branco) vs calculadas (fundo cinza claro)

**Balance Sheet Table** (`src/components/tables/BalanceSheetTable.tsx`) — Client Component:
- Seções expansíveis: Ativo Circulante, Ativo LP, Passivo Circulante, Passivo LP, Patrimônio Líquido
- Drill-down: Expandir/colapsar seções
- Validação visual: Ativo = Passivo + PL (indicador verde/vermelho)

**FCFF Table** (`src/components/tables/FCFFTable.tsx`) — Client Component:
- Linhas: EBIT, Depreciação, CAPEX, NCG, FCFF
- Highlight: FCFF final por ano
- Cor condicional: verde (positivo) / vermelho (negativo)

#### 2.2 — Gráficos

**Revenue & Profit Chart** (`src/components/charts/RevenueChart.tsx`):
- Tipo: LineChart (Recharts)
- Séries: Receita Líquida, Lucro Líquido
- Tooltip com `formatCurrency`

**Cost Composition Chart** (`src/components/charts/CostCompositionChart.tsx`):
- Tipo: BarChart empilhado
- Componentes: CMV, Despesas Operacionais, IR/CSLL
- Visualizar estrutura de custos por ano

**EBITDA Margin Chart** (`src/components/charts/EBITDAChart.tsx`):
- Tipo: ComposedChart (Linha + Area)
- Linha: EBITDA absoluto
- Area: Margem EBITDA (%)
- Eixo Y duplo (valor e percentual)

**FCFF Chart** (`src/components/charts/FCFFChart.tsx`):
- Tipo: BarChart
- Barras: FCFF por ano
- Cor verde (positivo) / vermelho (negativo)

#### 2.3 — Server Pages (Data Fetching)

Cada page em `/model/[id]/view/*` será um Server Component que:
1. [x] Carrega o modelo do Supabase via `getModelById(id)` *(completed: 2026-01-29T18:30:26.459Z)*
2. Passa os dados calculados para o Client Component (tabela/gráfico)
3. Usa `<Suspense>` com skeleton para loading state

**Commit Checkpoint:** `git commit -m "feat(fase-3): implement financial tables and projection charts"`

---

### Phase 3 — Navegação, UX e Validação

**Objetivo:** Implementar navegação entre seções, feedback visual e testes.

#### 3.1 — Navegação e Layout

**Sidebar de navegação** (atualizar `src/components/app-sidebar.tsx`):
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

**Breadcrumbs** — Server Component:
- Indicar caminho: Dashboard > Modelo X > DRE Projetado

**Indicadores de completude:**
- Badge verde: Seção completa
- Badge amarelo: Parcialmente preenchida
- Badge vermelho: Não preenchida

#### 3.2 — Loading States e Tratamento de Erros

- Skeleton screens para cada tabela/gráfico (`DRETableSkeleton`, etc.)
- Mensagens de erro amigáveis
- Retry em caso de falha

#### 3.3 — Testes

- Testes unitários para `formatCurrency`, `formatPercentage`, `formatCompactNumber`
- Testes de componente para tabelas (verifica renderização correta dos dados)
- Testes visuais: tabelas com 5 e 10 anos de projeção

**Commit Checkpoint:** `git commit -m "feat(fase-3): add navigation, loading states and tests"`

---

## Entregáveis

- [ ] Tabelas financeiras responsivas e formatadas (DRE, BP, FCFF)
- [ ] Gráficos interativos de projeção (Receita, Custos, EBITDA, FCFF)
- [ ] Navegação fluida entre seções (Sidebar + Breadcrumbs)
- [ ] Feedback visual de estado (loading, erro, completo)
- [ ] Design consistente com shadcn/ui
- [ ] Testes unitários para formatadores e componentes

## Critérios de Aceite

- Tabelas renderizam projeções de 5 ou 10 anos sem lag perceptível
- Gráficos são interativos (hover mostra valores formatados em R$)
- Navegação intuitiva (< 2 cliques para qualquer seção)
- Números formatados corretamente no padrão brasileiro (R$, %)
- Build sem erros TypeScript
- Responsivo em telas >= 768px

## Rollback Plan

### Rollback Triggers
- Bugs críticos que quebram funcionalidades existentes (auth, dashboard)
- Performance degradada (tabelas com lag > 500ms)
- Erros de cálculo na exibição dos dados

### Rollback Procedures
- **Phase 1:** Remover dependências e rotas criadas — sem impacto em dados
- **Phase 2:** Reverter commits de componentes — sem impacto em dados (visualização apenas)
- **Phase 3:** Reverter alterações na sidebar — restaurar navegação anterior

### Post-Rollback Actions
1. Documentar razão do rollback
2. Identificar causa raiz
3. Corrigir e re-implementar

## Execution History

> Last updated: 2026-01-29T18:30:26.459Z | Progress: 100%

### phase-1 [DONE]
- Started: 2026-01-29T18:25:38.194Z
- Completed: 2026-01-29T18:25:38.194Z

- [x] Step 1: Step 1 *(2026-01-29T18:25:38.194Z)*
  - Output: src/lib/utils/formatters.ts
  - Notes: Formatadores criados: formatCurrency, formatPercentage, formatCompactNumber, formatNumber, formatMultiple, formatCellWithColor

### phase-2 [DONE]
- Started: 2026-01-29T18:30:26.459Z
- Completed: 2026-01-29T18:30:26.459Z

- [x] Step 1: Step 1 *(2026-01-29T18:30:26.459Z)*
  - Output: src/components/tables/, src/components/charts/, src/app/(dashboard)/model/[id]/view/
  - Notes: Implementadas todas as tabelas (DRE, Balanço, FCFF) e gráficos (Revenue, CostComposition, EBITDA, FCFF). Navegação sidebar atualizada. Loading states e error handling adicionados.
