---
status: filled
generated: 2026-02-26
agents:
  - type: "feature-developer"
    role: "Implementar nova conta Caixa e Aplicações Financeiras no core e UI"
  - type: "test-writer"
    role: "Escrever testes unitários para os novos cálculos"
  - type: "frontend-specialist"
    role: "Criar tabela CashApplicationsTable seguindo Design System"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "design-system.md"
  - "development-workflow.md"
  - "testing-strategy.md"
phases:
  - id: "phase-1"
    name: "Tipos e Lógica de Cálculo"
    prevc: "P"
    agent: "feature-developer"
  - id: "phase-2"
    name: "Implementação Core + UI"
    prevc: "E"
    agent: "feature-developer"
  - id: "phase-3"
    name: "Testes e Validação"
    prevc: "V"
    agent: "test-writer"
---

# Aplicações Financeiras — Nova conta no Balanço Patrimonial

> Substituir as contas separadas "Caixa e Equivalentes" e "Aplicações Financeiras" por uma conta unificada **"Caixa e Aplicações Financeiras"** no Balanço Patrimonial, com lógica de Saldo Inicial + Novas Aplicações + Receitas Financeiras, tabela dedicada e premissas editáveis.

## Task Snapshot

- **Primary goal:** Criar a conta "Caixa e Aplicações Financeiras" que substitui Caixa e Equivalentes no ativo circulante do BP, com cálculo baseado em saldo inicial + novas aplicações (fluxo de caixa a definir) + receitas financeiras (taxa de juros × saldo inicial).
- **Success signal:** O BP projetado exibe a nova conta "Caixa e Aplicações Financeiras" no lugar de "Caixa e Equivalentes" e "Aplicações Financeiras", com tabela dedicada abaixo da InvestmentTable, premissa de Taxa de Juros editável e receitas financeiras calculadas automaticamente.
- **Key references:**
  - [PRD](./PRD.md) — Estrutura de dados e fórmulas do BP
  - [Architecture](../docs/architecture.md) — Padrões de cálculo e tipos
  - [Design System](../docs/design-system.md) — Tokens, RowTypes, padrão de tabelas

## Contexto do Codebase

### Arquivos Impactados

| Arquivo | Tipo de Mudança | Descrição |
| --- | --- | --- |
| `src/core/types/index.ts` | Modificação | Adicionar campos `caixaAplicacoesFinanceiras`, `receitasFinanceiras`, `novasAplicacoes` em `BalanceSheetCalculated`; adicionar `taxaJurosAplicacoes` em `BalanceSheetProjectionInputs`; remover/depreciar `prazoCaixaEquivalentes` e `prazoAplicacoesFinanceiras` |
| `src/core/calculations/balanceSheet.ts` | Modificação | Substituir cálculo de `acCaixa` e `acAplicacoes` (prazo médio) pela nova lógica: Saldo Inicial + Novas Aplicações + Receitas Financeiras |
| `src/components/tables/CashApplicationsTable.tsx` | **Novo** | Tabela de Caixa e Aplicações Financeiras (padrão InvestmentTable) |
| `src/components/tables/InvestmentTable.tsx` | Nenhuma | Referência de padrão (não é modificado) |
| `src/components/tables/BalanceSheetTable.tsx` | Modificação | Atualizar referências de Caixa/Aplicações → Caixa e Aplicações Financeiras |
| `src/app/(dashboard)/model/[id]/balanco-patrimonial/page.tsx` | Modificação | Renderizar CashApplicationsTable abaixo de InvestmentTable |
| Testes em `__tests__/` | **Novo/Modificação** | Testes para calculateBPBase e calculateBPProjetado com nova conta |

### Dependências entre Contas

```
Caixa e Aplicações Financeiras (ano N) =
    Saldo Inicial (= Caixa e Aplicações do ano N-1)
  + Novas Aplicações (= conta de fluxo de caixa, a definir posteriormente → 0 por padrão)
  + Receitas Financeiras (= Taxa de Juros × Saldo Inicial)

Onde:
  Saldo Inicial (ano 0) = Caixa e Equivalentes + Aplicações Financeiras (do BalanceSheetBaseInputs)
  Taxa de Juros = premissa % editável por ano (taxaJurosAplicacoes em BalanceSheetProjectionInputs)
```

### Impacto no Ativo Circulante

```
ANTES:
  Ativo Circulante = Caixa + Aplicações + Contas a Receber + Estoques + Ativos Biológicos + Outros

DEPOIS:
  Ativo Circulante = Caixa e Aplicações Financeiras + Contas a Receber + Estoques + Ativos Biológicos + Outros
```

## Working Phases

### Phase 1 — Tipos e Premissas (PREVC: P)
> **Primary Agent:** `feature-developer`

**Objective:** Definir tipos TypeScript e premissas para a nova conta.

**Tasks**

| # | Task | Agent | Status | Deliverable |
|---|------|-------|--------|-------------|
| 1.1 | Adicionar campo `taxaJurosAplicacoes: number` (% a.a.) em `BalanceSheetProjectionInputs` | `feature-developer` | pending | Tipo atualizado |
| 1.2 | Adicionar campos em `BalanceSheetCalculated.ativoCirculante`: substituir `caixaEquivalentes` e `aplicacoesFinanceiras` por `caixaAplicacoesFinanceiras` | `feature-developer` | pending | Tipo atualizado |
| 1.3 | Adicionar contas auxiliares em `BalanceSheetCalculated`: `receitasFinanceiras`, `novasAplicacoes` | `feature-developer` | pending | Tipo atualizado |
| 1.4 | Remover campos obsoletos: `prazoCaixaEquivalentes`, `prazoAplicacoesFinanceiras` de `BalanceSheetProjectionInputs` | `feature-developer` | pending | Tipo limpo |
| 1.5 | Atualizar `BalanceSheetBaseInputs.ativoCirculante`: substituir `caixaEquivalentes` + `aplicacoesFinanceiras` por `caixaAplicacoesFinanceiras` (ou manter ambos e somar no calculateBPBase) | `feature-developer` | pending | Tipo definido |

**Decisão 1.5:** Manter `caixaEquivalentes` e `aplicacoesFinanceiras` no `BalanceSheetBaseInputs` (input do ano base) para não quebrar formulários existentes. No `calculateBPBase`, somar ambos para criar `caixaAplicacoesFinanceiras`. No `BalanceSheetCalculated`, expor apenas `caixaAplicacoesFinanceiras`.

---

### Phase 2 — Lógica de Cálculo (PREVC: E)
> **Primary Agent:** `feature-developer`

**Objective:** Implementar os cálculos no motor de cálculo (`balanceSheet.ts`).

**Tasks**

| # | Task | Agent | Status | Deliverable |
|---|------|-------|--------|-------------|
| 2.1 | **`calculateBPBase`**: Somar `caixaEquivalentes + aplicacoesFinanceiras` → `caixaAplicacoesFinanceiras`; remover campos individuais do resultado; ajustar totalAC | `feature-developer` | pending | Função atualizada |
| 2.2 | **`calculateBPProjetado`**: Implementar nova lógica — `saldoInicial = bpAnterior.ativoCirculante.caixaAplicacoesFinanceiras`; `receitasFinanceiras = saldoInicial × (taxaJurosAplicacoes / 100)`; `novasAplicacoes = 0` (placeholder para FCFF futuro); `caixaAplicacoesFinanceiras = saldoInicial + novasAplicacoes + receitasFinanceiras` | `feature-developer` | pending | Função atualizada |
| 2.3 | Remover cálculos de `acCaixa` e `acAplicacoes` (prazo médio / 360 × receita) | `feature-developer` | pending | Código limpo |
| 2.4 | Atualizar totalAC para usar `caixaAplicacoesFinanceiras` em vez de `acCaixa + acAplicacoes` | `feature-developer` | pending | Total correto |
| 2.5 | Garantir que `receitasFinanceiras` e `novasAplicacoes` são expostas em `BalanceSheetCalculated` para uso na tabela | `feature-developer` | pending | Campos exportados |

**Fórmulas implementadas:**

```typescript
// Em calculateBPBase:
const caixaAplicacoesFinanceiras = new Decimal(bpBase.ativoCirculante.caixaEquivalentes)
  .plus(bpBase.ativoCirculante.aplicacoesFinanceiras);
// receitasFinanceiras = 0 (ano base)
// novasAplicacoes = 0 (ano base)

// Em calculateBPProjetado:
const saldoInicial = new Decimal(bpAnterior.ativoCirculante.caixaAplicacoesFinanceiras);
const taxaJurosAplicacoes = new Decimal(premissas.taxaJurosAplicacoes ?? 0).div(100);
const receitasFinanceiras = saldoInicial.times(taxaJurosAplicacoes);
const novasAplicacoes = new Decimal(0); // placeholder — será definido pelo FCFF
const caixaAplicacoesFinanceiras = saldoInicial.plus(novasAplicacoes).plus(receitasFinanceiras);

// totalAC = caixaAplicacoesFinanceiras + contasReceber + estoques + ativosBio + outros
```

---

### Phase 3 — Tabela CashApplicationsTable (PREVC: E)
> **Primary Agent:** `frontend-specialist`

**Objective:** Criar componente de tabela para Caixa e Aplicações Financeiras, seguindo o padrão da InvestmentTable.

**Tasks**

| # | Task | Agent | Status | Deliverable |
|---|------|-------|--------|-------------|
| 3.1 | Criar `src/components/tables/CashApplicationsTable.tsx` seguindo estrutura da InvestmentTable | `frontend-specialist` | pending | Componente criado |
| 3.2 | Implementar linhas da tabela (ver estrutura abaixo) | `frontend-specialist` | pending | Linhas corretas |
| 3.3 | Implementar premissa editável para `taxaJurosAplicacoes` | `frontend-specialist` | pending | Input funcional |
| 3.4 | Renderizar tabela na página de Balanço Patrimonial, abaixo da InvestmentTable | `frontend-specialist` | pending | Tabela visível |
| 3.5 | Suportar auto-save com debounce (mesmo hook `useBPProjectionPersist`) | `frontend-specialist` | pending | Persistência OK |

**Estrutura de Linhas da Tabela:**

| # | Label | RowType | Fonte do Valor |
|---|-------|---------|----------------|
| 1 | **Caixa e Aplicações (início)** | `header` | `bpAnterior.ativoCirculante.caixaAplicacoesFinanceiras` |
| 2 | (+) Novas Aplicações | `value` | `bp.novasAplicacoes` (= 0 por enquanto) |
| 3 | (+) Receitas Financeiras | `value` | `bp.receitasFinanceiras` |
| 4 | ↳ Taxa de Juros (%) | `premise` | `premissas.taxaJurosAplicacoes` — editável |
| 5 | **(=) Caixa e Aplicações (final)** | `total` | `bp.ativoCirculante.caixaAplicacoesFinanceiras` |

**Props do componente:**

```typescript
interface CashApplicationsTableProps {
  data: BalanceSheetCalculated[];
  projectionInputs?: BalanceSheetProjectionInputs[];
  modelId?: string;
  onProjectionChange?: (data: BalanceSheetProjectionInputs[]) => void;
}
```

**Padrões visuais (do Design System):**
- Container: `rounded-md border bg-card overflow-x-auto`
- Coluna de label: `sticky left-0 z-10` com bg do tipo
- RowType maps: `ROW_BG` e `CELL_BG` conforme design-system.md
- Valores numéricos: `text-right tabular-nums`; negativos → `text-red-600`
- Toggle Decimais + Exibir/Ocultar Premissas na toolbar
- Navegação: Tab (próximo ano), Enter (próxima premissa), Escape (cancelar)

---

### Phase 4 — Atualização de Componentes Dependentes (PREVC: E)
> **Primary Agent:** `feature-developer`

**Objective:** Atualizar componentes que referenciam as contas antigas.

**Tasks**

| # | Task | Agent | Status | Deliverable |
|---|------|-------|--------|-------------|
| 4.1 | Atualizar `BalanceSheetTable.tsx` — substituir linhas de "Caixa e Equivalentes" e "Aplicações Financeiras" por "Caixa e Aplicações Financeiras" | `feature-developer` | pending | Tabela BP atualizada |
| 4.2 | Atualizar `WorkingCapitalTable.tsx` se referencia Caixa separadamente | `feature-developer` | pending | Tabela CG atualizada |
| 4.3 | Atualizar formulários de entrada do ano base se necessário (manter inputs separados, somar no cálculo) | `feature-developer` | pending | Formulários compatíveis |
| 4.4 | Atualizar mock data em `src/lib/mock/` para refletir nova estrutura | `feature-developer` | pending | Mock atualizado |
| 4.5 | Atualizar gráficos de Capital de Giro se referenciam Caixa separadamente | `feature-developer` | pending | Gráficos atualizados |

---

### Phase 5 — Testes e Validação (PREVC: V)
> **Primary Agent:** `test-writer`

**Objective:** Garantir correção dos cálculos e integridade da UI.

**Tasks**

| # | Task | Agent | Status | Deliverable |
|---|------|-------|--------|-------------|
| 5.1 | Testes unitários para `calculateBPBase` com nova conta unificada | `test-writer` | pending | Testes passando |
| 5.2 | Testes unitários para `calculateBPProjetado` — verificar saldo inicial + receitas financeiras | `test-writer` | pending | Testes passando |
| 5.3 | Testar que totalAC é calculado corretamente com a nova conta | `test-writer` | pending | Testes passando |
| 5.4 | Testar cenário com `taxaJurosAplicacoes = 0` (sem receitas financeiras) | `test-writer` | pending | Edge case coberto |
| 5.5 | Testar cenário com `novasAplicacoes = 0` (placeholder FCFF) | `test-writer` | pending | Edge case coberto |
| 5.6 | Verificar que `ativoTotal === passivoTotal` após mudanças (equilíbrio do balanço) | `test-writer` | pending | Invariante mantida |
| 5.7 | Rodar `npm run typecheck` e `npm run lint` sem erros | `test-writer` | pending | CI verde |

---

## Risk Assessment

### Identified Risks

| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Quebra de compatibilidade com modelos salvos no Supabase | Alta | Alta | Manter campos antigos no BaseInputs; migrar gradualmente | `feature-developer` |
| Desequilíbrio do Balanço (Ativo ≠ Passivo+PL) | Média | Alta | Testes automatizados verificando invariante | `test-writer` |
| Novas Aplicações = 0 pode confundir usuários | Baixa | Baixa | Tooltip explicativo na tabela: "Será calculado pelo FCFF" | `frontend-specialist` |
| Impacto em FCFF/Valuation downstream | Baixa | Média | Receitas Financeiras não afetam EBIT; verificar FCFF | `feature-developer` |

### Decisões de Design

1. **Manter inputs separados no ano base:** `caixaEquivalentes` e `aplicacoesFinanceiras` continuam como inputs no formulário do ano base para não quebrar UX. São somados em `calculateBPBase`.
2. **Conta unificada no resultado:** `BalanceSheetCalculated` expõe apenas `caixaAplicacoesFinanceiras` (sem os campos individuais).
3. **Novas Aplicações = 0:** Placeholder — será conectado ao FCFF em implementação futura.
4. **Receitas Financeiras sobre saldo inicial:** Evita circularidade (mesmo padrão usado para despesas financeiras de empréstimos).
5. **Premissa `taxaJurosAplicacoes`:** Separada da `taxaJurosEmprestimo` existente — são taxas distintas (aplicações vs dívida).

## Rollback Plan

### Rollback Triggers
- Testes de equilíbrio do balanço falhando
- Modelos existentes quebrando ao carregar
- Erros de TypeScript em cascata em muitos arquivos

### Rollback Procedures
- **Git revert** dos commits da feature branch
- Nenhum impacto em dados persistidos (campos novos são aditivos)
- Restaurar tipos antigos via `git checkout main -- src/core/types/index.ts`

## Evidence & Follow-up

### Artifacts
- PR com todas as mudanças
- Testes unitários novos passando
- Screenshot da CashApplicationsTable renderizada
- `npm run typecheck` limpo

### Follow-up Actions
| Action | Owner | Due |
|--------|-------|-----|
| Conectar `novasAplicacoes` ao FCFF quando implementado | `feature-developer` | Próximo sprint |
| Avaliar impacto das Receitas Financeiras na DRE (contra-partida) | `feature-developer` | Próximo sprint |
| Adicionar CashApplicationsTable ao styleguide | `frontend-specialist` | Após merge |
| Atualizar architecture.md com documentação da nova conta | `documentation-writer` | Após merge |
