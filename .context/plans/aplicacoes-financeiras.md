---
status: filled
generated: 2026-02-26
agents:
  - type: "feature-developer"
    role: "Implementar lógica de Aplicações Financeiras com cálculo por saldo no core e UI"
  - type: "test-writer"
    role: "Escrever testes unitários para os novos cálculos"
  - type: "frontend-specialist"
    role: "Criar tabela FinancialApplicationsTable seguindo Design System"
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

# Aplicações Financeiras — Lógica de Saldo no Balanço Patrimonial

> Alterar a projeção de **Aplicações Financeiras** de prazo médio para lógica de saldo (Saldo Inicial + Novas Aplicações + Receitas Financeiras), mantendo **Caixa e Equivalentes** como conta separada com cálculo por prazo médio. Caixa permanece no Capital de Giro.

## Task Snapshot

- **Primary goal:** Mudar apenas a conta "Aplicações Financeiras" para cálculo baseado em saldo, adicionando receitas financeiras via taxa de juros. Manter "Caixa e Equivalentes" inalterado (prazo médio).
- **Success signal:** O BP projetado exibe "Caixa e Equivalentes" (prazo médio) e "Aplicações Financeiras" (saldo) como contas separadas; tabela dedicada de Aplicações Financeiras com premissa de Taxa de Juros editável; Caixa continua na tabela de Capital de Giro.
- **Key references:**
  - [Architecture](../docs/architecture.md) — Padrões de cálculo e tipos
  - [Design System](../docs/design-system.md) — Tokens, RowTypes, padrão de tabelas

## Contexto do Codebase

### Arquivos Impactados

| Arquivo | Tipo de Mudança | Descrição |
| --- | --- | --- |
| `src/core/types/index.ts` | Modificação | Adicionar `taxaJurosAplicacoes` em `BalanceSheetProjectionInputs`; remover `prazoAplicacoesFinanceiras`; manter `prazoCaixaEquivalentes`. Adicionar `receitasFinanceiras`, `novasAplicacoes` em `BalanceSheetCalculated`. Manter `caixaEquivalentes` e `aplicacoesFinanceiras` separados. |
| `src/core/calculations/balanceSheet.ts` | Modificação | Apenas Aplicações Financeiras usa lógica de saldo. Caixa continua prazo médio. |
| `src/components/tables/CashApplicationsTable.tsx` | **Novo** | Tabela de Aplicações Financeiras (padrão InvestmentTable) |
| `src/components/tables/BalanceSheetTable.tsx` | Nenhuma | Mantém "Caixa e Equivalentes" e "Aplicações Financeiras" separados (sem mudança) |
| `src/components/tables/WorkingCapitalTable.tsx` | Modificação | Manter Caixa e Equivalentes com prazo médio; remover apenas prazo de Aplicações Financeiras |
| `src/app/(dashboard)/model/[id]/view/balance-sheet/page.tsx` | Modificação | Renderizar CashApplicationsTable em nova aba |

### Dependências entre Contas

```
Caixa e Equivalentes (ano N) = Receita Bruta × prazoCaixaEquivalentes / 360
  (SEM MUDANÇA — continua no Capital de Giro)

Aplicações Financeiras (ano N) =
    Saldo Inicial (= Aplicações Financeiras do ano N-1)
  + Novas Aplicações (= 0 por padrão, FCFF futuro)
  + Receitas Financeiras (= Taxa de Juros × Saldo Inicial)

Onde:
  Saldo Inicial (ano 0) = aplicacoesFinanceiras do BalanceSheetBaseInputs
  Taxa de Juros = premissa % editável (taxaJurosAplicacoes)
```

### Impacto no Ativo Circulante

```
ANTES:
  AC = Caixa(prazo) + Aplicações(prazo) + Contas a Receber + Estoques + AtBio + Outros

DEPOIS:
  AC = Caixa(prazo) + Aplicações(saldo) + Contas a Receber + Estoques + AtBio + Outros
       ^^^^^^^^^^^^   ^^^^^^^^^^^^^^^^
       SEM MUDANÇA    NOVA LÓGICA
```

## Working Phases

### Phase 1 — Tipos e Premissas (PREVC: P)
> **Primary Agent:** `feature-developer`

**Objective:** Ajustar tipos TypeScript para suportar a nova lógica de Aplicações.

**Tasks**

| # | Task | Status | Deliverable |
|---|------|--------|-------------|
| 1.1 | Adicionar `taxaJurosAplicacoes: number` em `BalanceSheetProjectionInputs` | pending | Tipo atualizado |
| 1.2 | Remover `prazoAplicacoesFinanceiras` de `BalanceSheetProjectionInputs` | pending | Campo removido |
| 1.3 | **Manter** `prazoCaixaEquivalentes` em `BalanceSheetProjectionInputs` | pending | Campo mantido |
| 1.4 | **Manter** `caixaEquivalentes` e `aplicacoesFinanceiras` separados em `BalanceSheetCalculated.ativoCirculante` | pending | Sem mudança no tipo |
| 1.5 | Adicionar `receitasFinanceiras` e `novasAplicacoes` em `BalanceSheetCalculated` (contas auxiliares) | pending | Campos adicionados |

---

### Phase 2 — Lógica de Cálculo (PREVC: E)
> **Primary Agent:** `feature-developer`

**Objective:** Implementar cálculo de saldo para Aplicações Financeiras, mantendo Caixa por prazo médio.

**Tasks**

| # | Task | Status | Deliverable |
|---|------|--------|-------------|
| 2.1 | **`calculateBPBase`**: Manter `caixaEquivalentes` e `aplicacoesFinanceiras` separados; receitasFinanceiras=0, novasAplicacoes=0 | pending | Função atualizada |
| 2.2 | **`calculateBPProjetado`**: Manter cálculo de `caixaEquivalentes` por prazo médio | pending | Sem mudança |
| 2.3 | **`calculateBPProjetado`**: Substituir cálculo de `aplicacoesFinanceiras` (prazo médio) pela nova lógica de saldo | pending | Nova fórmula |
| 2.4 | totalAC = caixa + aplicações(saldo) + contasReceber + estoques + ativosBio + outros | pending | Total correto |

**Fórmulas:**

```typescript
// Caixa e Equivalentes — SEM MUDANÇA
const acCaixa = receitaBruta.times(premissas.prazoCaixaEquivalentes).div(360);

// Aplicações Financeiras — NOVA LÓGICA
const saldoInicial = new Decimal(bpAnterior.ativoCirculante.aplicacoesFinanceiras);
const taxaJuros = new Decimal(premissas.taxaJurosAplicacoes ?? 0).div(100);
const receitasFinanceiras = saldoInicial.times(taxaJuros);
const novasAplicacoes = new Decimal(0); // placeholder FCFF
const acAplicacoes = saldoInicial.plus(novasAplicacoes).plus(receitasFinanceiras);

// Total AC
const totalAC = acCaixa.plus(acAplicacoes).plus(acContasReceber)...;
```

---

### Phase 3 — Tabela CashApplicationsTable (PREVC: E)
> **Primary Agent:** `frontend-specialist`

**Objective:** Tabela dedicada para Aplicações Financeiras.

**Estrutura de Linhas:**

| # | Label | RowType | Fonte do Valor |
|---|-------|---------|----------------|
| 1 | **Aplicações Financeiras (início)** | `header` | `bpAnterior.ativoCirculante.aplicacoesFinanceiras` |
| 2 | (+) Novas Aplicações | `value` | `bp.novasAplicacoes` (= 0 por enquanto) |
| 3 | (+) Receitas Financeiras | `value` | `bp.receitasFinanceiras` |
| 4 | ↳ Taxa de Juros (% a.a.) | `premise` | `premissas.taxaJurosAplicacoes` — editável |
| 5 | **(=) Aplicações Financeiras (final)** | `total` | `bp.ativoCirculante.aplicacoesFinanceiras` |

---

### Phase 4 — Atualização de Componentes Dependentes (PREVC: E)

**Tasks**

| # | Task | Status | Deliverable |
|---|------|--------|-------------|
| 4.1 | `WorkingCapitalTable.tsx` — manter Caixa e Equivalentes com `prazoCaixaEquivalentes`; remover apenas prazo de Aplicações Financeiras (valor continua, sem premissa de prazo) | pending | Tabela CG atualizada |
| 4.2 | `BalanceSheetTable.tsx` — nenhuma mudança (ambas as contas já aparecem separadas) | pending | Sem mudança |
| 4.3 | Atualizar fixtures `sampleCompany.ts` — remover `prazoAplicacoesFinanceiras`, adicionar `taxaJurosAplicacoes` | pending | Fixtures atualizados |
| 4.4 | Renderizar `CashApplicationsTable` na página de Balanço Patrimonial (nova aba) | pending | Aba visível |

---

### Phase 5 — Testes e Validação (PREVC: V)

| # | Task | Status | Deliverable |
|---|------|--------|-------------|
| 5.1 | Testar `calculateBPBase` — caixaEquivalentes e aplicacoesFinanceiras separados | pending | Testes passando |
| 5.2 | Testar `calculateBPProjetado` — caixa por prazo médio, aplicações por saldo | pending | Testes passando |
| 5.3 | Testar receitas financeiras = taxaJuros × saldo inicial | pending | Testes passando |
| 5.4 | Verificar `ativoTotal === passivoTotal` (equilíbrio do balanço) | pending | Invariante mantida |
| 5.5 | `npm run typecheck` limpo | pending | CI verde |

---

## Decisões de Design

1. **Contas separadas no BP:** `caixaEquivalentes` e `aplicacoesFinanceiras` permanecem como campos distintos em `BalanceSheetCalculated`.
2. **Caixa = prazo médio:** `caixaEquivalentes` continua com cálculo `receitaBruta × prazoCaixaEquivalentes / 360`.
3. **Aplicações = saldo:** `aplicacoesFinanceiras` muda para `saldoInicial + novasAplicacoes + receitasFinanceiras`.
4. **Caixa no Capital de Giro:** `caixaEquivalentes` permanece na `WorkingCapitalTable` com premissa de prazo médio.
5. **Aplicações fora do Capital de Giro:** `aplicacoesFinanceiras` tem tabela própria (`CashApplicationsTable`), sem premissa de prazo na WorkingCapitalTable.
6. **Novas Aplicações = 0:** Placeholder para FCFF futuro.
7. **Receitas Financeiras sobre saldo inicial:** Evita circularidade.
8. **Premissa `taxaJurosAplicacoes`:** Separada da `taxaJurosEmprestimo`.

## Rollback Plan

- **Git revert** dos commits
- Nenhum impacto em dados persistidos (campo novo `taxaJurosAplicacoes` é aditivo)
- Restaurar `prazoAplicacoesFinanceiras` via revert
