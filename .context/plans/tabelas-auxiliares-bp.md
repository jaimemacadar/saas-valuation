---
status: draft
generated: 2026-02-17
agents:
  - type: "feature-developer"
    role: "Implementar os componentes de tabelas auxiliares do BP"
  - type: "frontend-specialist"
    role: "Design e UX das tabs e tabelas inline"
  - type: "test-writer"
    role: "Testes unitários e de integração dos componentes"
docs:
  - "project-overview.md"
  - "architecture.md"
phases:
  - id: "phase-1"
    name: "Análise & Estruturação dos Dados"
    prevc: "P"
    agent: "architect-specialist"
  - id: "phase-2"
    name: "Implementação dos Componentes"
    prevc: "E"
    agent: "feature-developer"
  - id: "phase-3"
    name: "Validação & Testes"
    prevc: "V"
    agent: "test-writer"
---

# Tabelas Auxiliares do Balanço Patrimonial

> Criar tabelas auxiliares (Investimento, Capital de Giro, Empréstimos e Financiamentos) para ajuste de premissas de projeção do Balanço Patrimonial, com funcionalidades similares à DRETable, acessíveis via tabs na página do BP.

## Task Snapshot

- **Primary goal:** Adicionar à página de visualização do Balanço Patrimonial três tabelas auxiliares que permitam ao usuário visualizar e editar inline as premissas de projeção relacionadas, seguindo o mesmo padrão UX da DRETable (premissas colapsáveis, edição inline, copy-right, tendência linear, auto-save).
- **Success signal:** O usuário consegue navegar entre as tabs (Balanço Patrimonial, Investimento, Capital de Giro, Empréstimos) e editar premissas de projeção nas tabelas auxiliares com persistência automática.
- **Key references:**
  - [PRD - Motor de Cálculo](./PRD.md) — Fórmulas do BP (linhas 419-521)
  - [DRETable](../../src/components/tables/DRETable.tsx) — Componente de referência
  - [BalanceSheetTable](../../src/components/tables/BalanceSheetTable.tsx) — Tabela atual do BP
  - [Página do BP](../../src/app/(dashboard)/model/[id]/view/balance-sheet/page.tsx)

## Contexto do Codebase

### Padrões Existentes

- **DRETable** (`src/components/tables/DRETable.tsx`): Tabela que exibe contas calculadas + premissas inline editáveis. Usa row types (`total`, `subtotal`, `value`, `premise`, `annotation`), toggle global de premissas, `PremiseInput` com copy-right e trend, auto-save via `useDREProjectionPersist`.
- **BalanceSheetTable** (`src/components/tables/BalanceSheetTable.tsx`): Tabela hierárquica (expandable rows) com row types `section/item/subtotal/total`. Atualmente **somente leitura**.
- **Tabs**: Componente `@radix-ui/react-tabs` já usado nas páginas DRE (table/charts), FCFF, inputs base e projeções.
- **PremiseInput** (`src/components/tables/PremiseInput.tsx`): Componente uncontrolled para edição de premissas com navegação por teclado, copy-right e interpolação linear.
- **Persistência**: Hook `useDREProjectionPersist` com debounce de 800ms para auto-save via server action.

### Tipos Relevantes (PRD)

```typescript
interface BalanceSheetProjectionInputs {
  year: number;
  taxaDepreciacao: number;                    // % do Imobilizado Bruto
  indiceImobilizadoVendas: number;            // decimal, CAPEX como % da receita bruta
  prazoCaixaEquivalentes: number;             // dias
  prazoAplicacoesFinanceiras: number;         // dias
  prazoContasReceber: number;                 // dias
  prazoEstoques: number;                      // dias
  prazoAtivosBiologicos: number;              // dias
  prazoFornecedores: number;                  // dias
  prazoImpostosAPagar: number;                // dias
  prazoObrigacoesSociais: number;             // dias
  taxaNovosEmprestimosFinanciamentos: number; // %
}

interface BalanceSheetCalculated {
  // ... contas calculadas incluindo:
  depreciacaoAnual: number;
  capex: number;
  novosEmprestimosFinanciamentosCP: number;
  novosEmprestimosFinanciamentosLP: number;
  capitalGiro: number;
  ncg: number;
}
```

## Definição das Tabelas Auxiliares

### Tab 1: Balanço Patrimonial (existente)
Mantém a `BalanceSheetTable` atual sem alterações.

### Tab 2: Investimento (Layout Waterfall — Conciliação de Saldos)

Tabela de cálculo no formato de conciliação contábil: **Saldo Inicial → Movimentações → Saldo Final**. Premissas inline nas movimentações.

#### Bloco 1 — Saldo Inicial

| Linha | Tipo | Dados | Fonte |
|-------|------|-------|-------|
| **INVESTIMENTO** | `header` | — | — |
| Imobilizado Bruto (início) | `value` | `previousYear.ativoRealizavelLP.imobilizadoBruto` | `BalanceSheetCalculated` (ano anterior) |
| (-) Depr. Acumulada (início) | `value` | `previousYear.ativoRealizavelLP.depreciacaoAcumulada` | `BalanceSheetCalculated` (ano anterior) |
| **(=) Imobilizado Líquido Inicial** | `subtotal` | Imob. Bruto(início) - Depr. Acum.(início) | Calculado |

#### Bloco 2 — Movimentações do Período

| Linha | Tipo | Dados | Fonte |
|-------|------|-------|-------|
| **Movimentações do Período** | `header` | — | — |
| (+) CAPEX | `value` | `capex` | `BalanceSheetCalculated` |
| ↳ Índice Imobilizado-Vendas (%) | `premise` | `indiceImobilizadoVendas` | `BalanceSheetProjectionInputs` (editável) |
| (-) Depreciação do Período | `value` | `depreciacaoAnual` | `BalanceSheetCalculated` |
| ↳ Taxa de Depreciação (%) | `premise` | `taxaDepreciacao` | `BalanceSheetProjectionInputs` (editável) |

#### Bloco 3 — Saldo Final

| Linha | Tipo | Dados | Fonte |
|-------|------|-------|-------|
| **Saldos Finais** | `header` | — | — |
| Imobilizado Bruto (final) | `value` | `ativoRealizavelLP.imobilizadoBruto` | `BalanceSheetCalculated` |
| (-) Depr. Acumulada (final) | `value` | `ativoRealizavelLP.depreciacaoAcumulada` | `BalanceSheetCalculated` |
| **(=) Imobilizado Líquido Final** | `total` | `ativoRealizavelLP.imobilizado` | `BalanceSheetCalculated` |

> **Auditoria visual:** Imob. Líquido Final = Imob. Líquido Inicial + CAPEX - Depreciação do Período

**Premissas editáveis:** `indiceImobilizadoVendas`, `taxaDepreciacao`

**Comportamento no Ano Base:** Colunas de CAPEX e Depreciação do Período exibem "—". Saldos Inicial e Final são iguais.

### Tab 3: Capital de Giro (Layout Toggle por Bloco — AC / PC)

Premissas inline (próximas do valor), controladas por **toggle no header do bloco**. Um clique no header expande/colapsa todas as premissas de AC ou PC de uma vez.

#### Mecanismo de Visibilidade (3 níveis)

1. **Global:** botão "Exibir/Ocultar premissas" expande/colapsa tudo
2. **Por bloco:** toggle (Eye/EyeOff) no header AC ou PC (1 clique = 5 ou 3 premissas)
3. **Individual:** chevron por conta (opcional, mantém compatibilidade com DRETable)

#### Bloco AC — Ativo Circulante

| Linha | Tipo | Dados | Fonte | Visível (padrão) |
|-------|------|-------|-------|------------------|
| **ATIVO CIRCULANTE** [toggle] | `header` | — | — | sim |
| Caixa e Equivalentes | `value` | `ativoCirculante.caixaEquivalentes` | `BalanceSheetCalculated` | sim |
| ↳ Prazo Médio (dias) — Rec. Líquida | `premise` | `prazoCaixaEquivalentes` | `BalanceSheetProjectionInputs` (editável) | não (grupo AC) |
| Aplicações Financeiras | `value` | `ativoCirculante.aplicacoesFinanceiras` | `BalanceSheetCalculated` | sim |
| ↳ Prazo Médio (dias) — Rec. Líquida | `premise` | `prazoAplicacoesFinanceiras` | `BalanceSheetProjectionInputs` (editável) | não (grupo AC) |
| Contas a Receber | `value` | `ativoCirculante.contasReceber` | `BalanceSheetCalculated` | sim |
| ↳ Prazo Médio (dias) — Rec. Bruta | `premise` | `prazoContasReceber` | `BalanceSheetProjectionInputs` (editável) | não (grupo AC) |
| Estoques | `value` | `ativoCirculante.estoques` | `BalanceSheetCalculated` | sim |
| ↳ Prazo Médio (dias) — CMV | `premise` | `prazoEstoques` | `BalanceSheetProjectionInputs` (editável) | não (grupo AC) |
| Ativos Biológicos | `value` | `ativoCirculante.ativosBiologicos` | `BalanceSheetCalculated` | sim |
| ↳ Prazo Médio (dias) — Rec. Líquida | `premise` | `prazoAtivosBiologicos` | `BalanceSheetProjectionInputs` (editável) | não (grupo AC) |
| Outros Créditos | `value` | `ativoCirculante.outrosCreditos` | `BalanceSheetCalculated` | sim (sem premissa) |
| **Total Ativo Circulante** | `subtotal` | `ativoCirculante.total` | `BalanceSheetCalculated` | sim |

#### Bloco PC — Passivo Circulante

| Linha | Tipo | Dados | Fonte | Visível (padrão) |
|-------|------|-------|-------|------------------|
| **PASSIVO CIRCULANTE** [toggle] | `header` | — | — | sim |
| Fornecedores | `value` | `passivoCirculante.fornecedores` | `BalanceSheetCalculated` | sim |
| ↳ Prazo Médio (dias) — CMV | `premise` | `prazoFornecedores` | `BalanceSheetProjectionInputs` (editável) | não (grupo PC) |
| Impostos a Pagar | `value` | `passivoCirculante.impostosAPagar` | `BalanceSheetCalculated` | sim |
| ↳ Prazo Médio (dias) — Imp. Devoluções | `premise` | `prazoImpostosAPagar` | `BalanceSheetProjectionInputs` (editável) | não (grupo PC) |
| Obrig. Sociais e Trabalhistas | `value` | `passivoCirculante.obrigacoesSociaisETrabalhistas` | `BalanceSheetCalculated` | sim |
| ↳ Prazo Médio (dias) — Desp. Operacionais | `premise` | `prazoObrigacoesSociais` | `BalanceSheetProjectionInputs` (editável) | não (grupo PC) |
| Outras Obrigações | `value` | `passivoCirculante.outrasObrigacoes` | `BalanceSheetCalculated` | sim (sem premissa) |
| **Total Passivo Circ. (s/ Empréstimos)** | `subtotal` | soma sem empréstimos CP | Calculado | sim |

#### Resultados

| Linha | Tipo | Dados | Fonte | Visível (padrão) |
|-------|------|-------|-------|------------------|
| **Capital de Giro** | `total` | `capitalGiro` | `BalanceSheetCalculated` | sim |
| ↳ AC - PC + Emp. CP | `annotation` | fórmula de referência | — | sim |
| **NCG (Variação)** | `total` | `ncg` | `BalanceSheetCalculated` | sim |

> **Contagem de linhas:** Colapsado: 17 linhas | Só AC expandido: 22 | Só PC expandido: 20 | Tudo expandido: 25

**Premissas editáveis:** `prazoCaixaEquivalentes`, `prazoAplicacoesFinanceiras`, `prazoContasReceber`, `prazoEstoques`, `prazoAtivosBiologicos`, `prazoFornecedores`, `prazoImpostosAPagar`, `prazoObrigacoesSociais`

**Base de cálculo no label:** Cada premissa indica sua base de cálculo no label (ex: "— Rec. Líquida", "— CMV"), eliminando a dependência de tooltip.

#### Implementação do Toggle por Bloco

Adicionar campo `premiseGroup` ao row data:
- Premissas AC: `premiseGroup: "ativoCirculante"`
- Premissas PC: `premiseGroup: "passivoCirculante"`

Estado do componente: `expandedGroups: Set<string>` complementando o `expandedAccounts` existente. Header row recebe prop `toggleGroup` que expande/colapsa todas as premissas do grupo.

### Tab 4: Empréstimos e Financiamentos (Layout Blocos Paralelos — CP e LP separados)

Premissa compartilhada no topo, seguida de mini-waterfalls independentes para CP e LP.

#### Premissas Globais

| Linha | Tipo | Dados | Fonte |
|-------|------|-------|-------|
| **EMPRÉSTIMOS E FINANCIAMENTOS** | `header` | — | — |
| ↳ Taxa de Juros (% a.a.) | `premise` | `taxaJurosEmprestimo` | `BalanceSheetProjectionInputs` (editável) — base para Desp. Financeiras e Kd no WACC |

#### Bloco CP — Curto Prazo

| Linha | Tipo | Dados | Fonte |
|-------|------|-------|-------|
| **Curto Prazo (CP)** | `header` | — | — |
| ↳ Taxa Novos Empréstimos CP (%) | `premise` | `taxaNovosEmprestimosCP` | `BalanceSheetProjectionInputs` (editável) |
| Empréstimos CP (início) | `value` | `previousYear.passivoCirculante.emprestimosFinanciamentosCP` | `BalanceSheetCalculated` (ano anterior) |
| (+) Novos Empréstimos CP | `value` | `novosEmprestimosFinanciamentosCP` | `BalanceSheetCalculated` |
| **(=) Empréstimos CP (final)** | `subtotal` | `passivoCirculante.emprestimosFinanciamentosCP` | `BalanceSheetCalculated` |

#### Bloco LP — Longo Prazo

| Linha | Tipo | Dados | Fonte |
|-------|------|-------|-------|
| **Longo Prazo (LP)** | `header` | — | — |
| ↳ Taxa Novos Empréstimos LP (%) | `premise` | `taxaNovosEmprestimosLP` | `BalanceSheetProjectionInputs` (editável) |
| Empréstimos LP (início) | `value` | `previousYear.passivoRealizavelLP.emprestimosFinanciamentosLP` | `BalanceSheetCalculated` (ano anterior) |
| (+) Novos Empréstimos LP | `value` | `novosEmprestimosFinanciamentosLP` | `BalanceSheetCalculated` |
| **(=) Empréstimos LP (final)** | `subtotal` | `passivoRealizavelLP.emprestimosFinanciamentosLP` | `BalanceSheetCalculated` |

#### Totais e Juros

| Linha | Tipo | Dados | Fonte |
|-------|------|-------|-------|
| **(=) Dívida Total** | `total` | CP(final) + LP(final) | Calculado |
| Despesas Financeiras (Juros) | `annotation` | `despesasFinanceiras` = Dívida Total × Taxa de Juros | `BalanceSheetCalculated` → `DRECalculated` |

> **Auditoria visual:** Empréstimos(final) = Empréstimos(início) + Novos Empréstimos, para cada bloco CP e LP independentemente.
> **Fórmula Juros:** `despesasFinanceiras = (emprestimosCP + emprestimosLP) × taxaJurosEmprestimo`

**Premissas editáveis:** `taxaJurosEmprestimo`, `taxaNovosEmprestimosCP`, `taxaNovosEmprestimosLP`

**Comportamento no Ano Base:** Colunas de Novos Empréstimos e Despesas Financeiras exibem "—". Saldos Inicial e Final são iguais.

## Arquitetura da Solução

### Estrutura de Componentes

```
src/components/tables/
  ├── DRETable.tsx                          # Referência existente
  ├── BalanceSheetTable.tsx                 # Existente (sem alteração)
  ├── BalanceSheetAuxTable.tsx              # NOVO - Componente genérico base
  ├── InvestmentTable.tsx                   # NOVO - Tab Investimento
  ├── WorkingCapitalTable.tsx               # NOVO - Tab Capital de Giro
  └── LoansTable.tsx                        # NOVO - Tab Empréstimos

src/app/(dashboard)/model/[id]/view/balance-sheet/
  └── page.tsx                              # MODIFICAR - Adicionar tabs

src/hooks/
  └── useBPProjectionPersist.ts             # NOVO - Auto-save para premissas do BP
```

### Abordagem de Implementação

1. **Componente Base (`BalanceSheetAuxTable`):** Criar um componente reutilizável que implemente o padrão DRETable (row types, premissas colapsáveis, PremiseInput) mas configurável via props para diferentes conjuntos de linhas e premissas.

2. **Tabelas Específicas:** Cada tabela (`InvestmentTable`, `WorkingCapitalTable`, `LoansTable`) configura o `BalanceSheetAuxTable` com seu mapeamento específico de linhas, premissas e dados calculados.

3. **Hook de Persistência (`useBPProjectionPersist`):** Seguir o mesmo padrão do `useDREProjectionPersist` — debounce de 800ms, chamada a uma server action `saveBPProjection(modelId, data)`.

4. **Página com Tabs:** Modificar `balance-sheet/page.tsx` para usar `Tabs` com 4 abas: Balanço Patrimonial | Investimento | Capital de Giro | Empréstimos.

### Fluxo de Dados

```
BalanceSheetProjectionInputs (premissas editáveis)
        ↓ [auto-save via useBPProjectionPersist]
   Server Action → Supabase (model_data.balanceSheet.projectionInputs)
        ↓ [recálculo]
   calculateAllBalanceSheet() → BalanceSheetCalculated[]
        ↓ [re-render]
   Tabelas auxiliares exibem contas calculadas + premissas inline
```

## Working Phases

### Phase 1 — Análise & Estruturação dos Dados
> **Primary Agent:** `architect-specialist`

**Objetivo:** Validar a estrutura de dados e definir as interfaces dos novos componentes.

| # | Task | Agent | Status | Deliverable |
|---|------|-------|--------|-------------|
| 1.1 | Verificar se `BalanceSheetProjectionInputs` e `BalanceSheetCalculated` possuem todos os campos necessários para as 3 tabelas auxiliares | `architect-specialist` | pending | Confirmação ou proposta de ajuste nos tipos |
| 1.2 | Definir a interface de props do `BalanceSheetAuxTable` (row config, premise keys, data mapping) | `architect-specialist` | pending | Interface TypeScript documentada |
| 1.3 | Verificar se existe server action para salvar `balanceSheet.projectionInputs` ou se precisa ser criada | `architect-specialist` | pending | Mapeamento de server actions existentes/necessárias |

---

### Phase 2 — Atualização do Motor de Cálculo (Core)
> **Primary Agents:** `architect-specialist`, `backend-specialist`

**Objetivo:** Corrigir lacunas no motor de cálculo identificadas pela análise de impacto. Essas alterações são pré-requisito para as tabelas auxiliares funcionarem com dados corretos.

#### Diagnóstico (resultado da investigação)

| Aspecto | Estado Atual | Problema |
|---------|-------------|----------|
| Taxa empréstimos CP/LP | Uma única `taxaNovosEmprestimosFinanciamentos` | Não diferencia crescimento de dívida CP vs LP |
| Despesas Financeiras | **Sempre 0** nas projeções (`calculateAllDRE` passa 0) | Lucro líquido sobrestimado; LAIR incorreto |
| Taxa de Juros | **Não existe** no modelo | Sem cálculo de custo da dívida a partir dos empréstimos |
| Kd no WACC | Input manual pré-calculado | Não derivado de `Rf + Spread` conforme PRD |
| Integração DRE↔BP | **Não implementada** | Comentário no código: "Phase 1, Task #3" |
| WACC por ano | Fixo (único para todos os anos) | PRD define WACC variável por ano (E e D mudam) |

#### Fluxo de Cálculo Corrigido (sem circularidade)

```
Para cada ano i:
  1. DRE(i) [parcial] → calcula EBIT (não depende de desp. financeiras)
  2. BP(i) → usa DRE(i) para prazos médios, calcula empréstimos
  3. DespFinanceiras(i) = DívidaTotal(i) × taxaJurosEmprestimo
  4. DRE(i) [completa] → recalcula LAIR, IR/CSLL, Lucro Líquido com DespFinanceiras
  5. BP(i) → atualiza lucrosAcumulados com lucro líquido correto
  6. FCFF(i) = EBIT(i) - NCG(i) - CAPEX(i)  [EBIT não afetado]
  7. WACC(i) = f(Ke, Kd, E(i), D(i), T)  [E e D do BP(i)]
```

> **Nota:** Não há circularidade porque o FCFF usa EBIT (antes das despesas financeiras), e o EBIT não depende da dívida. A dependência circular só existiria se o FCFF usasse lucro líquido.

#### Tasks

| # | Task | Agent | Status | Deliverable |
|---|------|-------|--------|-------------|
| 2.1 | **Separar taxa de empréstimos CP/LP:** Substituir `taxaNovosEmprestimosFinanciamentos` por `taxaNovosEmprestimosCP` e `taxaNovosEmprestimosLP` em `BalanceSheetProjectionInputs` | `architect-specialist` | pending | `src/core/types/index.ts` atualizado |
| 2.2 | **Criar premissa `taxaJurosEmprestimo`:** Adicionar campo em `BalanceSheetProjectionInputs` (% a.a. sobre dívida total). Esta taxa será a base para o Custo da Dívida (Kd) no WACC | `architect-specialist` | pending | Interface atualizada + documentação da relação com WACC |
| 2.3 | **Atualizar `calculateBPProjetado`:** Usar taxas separadas CP/LP no cálculo de novos empréstimos. Adicionar cálculo de `despesasFinanceiras = dívidaTotal × taxaJurosEmprestimo` | `backend-specialist` | pending | `src/core/calculations/balanceSheet.ts` atualizado |
| 2.4 | **Implementar integração DRE↔BP:** Modificar `calculateAllDRE` (ou criar `calculateDREWithFinancials`) para receber `despesasFinanceiras` e `depreciacaoAnual` do BP calculado, eliminando os `0` hardcoded | `backend-specialist` | pending | `src/core/calculations/dre.ts` atualizado |
| 2.5 | **Atualizar orquestração em `recalculateModel`:** Implementar o fluxo iterativo DRE→BP→DRE (com despesas financeiras) na server action `recalculateModel` | `backend-specialist` | pending | `src/lib/actions/calculate.ts` atualizado |
| 2.6 | **Atualizar `fullValuation.ts`:** Integrar o novo fluxo na função de valuation completa | `backend-specialist` | pending | `src/core/calculations/fullValuation.ts` atualizado |
| 2.7 | **Atualizar defaults de projeção:** Ajustar `generateBalanceSheetProjectionDefaults` para incluir `taxaNovosEmprestimosCP`, `taxaNovosEmprestimosLP` e `taxaJurosEmprestimo` com valores default sensatos | `backend-specialist` | pending | `src/lib/utils/projection-defaults.ts` atualizado |
| 2.8 | **Atualizar formulários existentes:** Ajustar `BalanceSheetProjectionForm` e `BalanceSheetProjectionTable` para refletir as novas premissas (2 taxas de empréstimos + taxa de juros) | `frontend-specialist` | pending | Forms atualizados |
| 2.9 | **Atualizar testes unitários do core:** Ajustar testes de `balanceSheet.ts`, `dre.ts`, `fcff.ts` e `fullValuation.ts` para as novas premissas e integração DRE↔BP | `backend-specialist` | pending | Testes passando |
| 2.10 | **Atualizar fixtures/mocks:** Ajustar `sampleCompany.ts` e outros mocks para incluir as novas premissas | `backend-specialist` | pending | Fixtures atualizados |

#### Arquivos Impactados

```
src/core/types/index.ts                          # Interfaces: BalanceSheetProjectionInputs, BalanceSheetCalculated
src/core/calculations/balanceSheet.ts            # Cálculo BP: taxas separadas CP/LP + despesas financeiras
src/core/calculations/dre.ts                     # Integração: receber despesasFinanceiras do BP
src/core/calculations/fullValuation.ts           # Orquestração: fluxo iterativo DRE→BP→DRE
src/core/calculations/wacc.ts                    # Referência: Kd ← taxaJurosEmprestimo
src/lib/actions/calculate.ts                     # Server action: recalculateModel com novo fluxo
src/lib/utils/projection-defaults.ts             # Defaults: novas premissas
src/components/forms/BalanceSheetProjectionForm.tsx    # UI: campos de premissas atualizados
src/components/forms/BalanceSheetProjectionTable.tsx   # UI: tabela de premissas atualizada
src/lib/mock/sampleCompany.ts                    # Fixtures
```

#### Relação taxaJurosEmprestimo ↔ Custo da Dívida (Kd) no WACC

A `taxaJurosEmprestimo` serve como **proxy para o Custo da Dívida (Kd)** no WACC:

- **PRD define:** `Kd = Rf + Spread` (taxa livre de risco + spread da dívida)
- **Nova abordagem:** `taxaJurosEmprestimo` pode ser usada diretamente como Kd, ou como referência para o usuário definir o Kd no WACC
- **Decisão pendente:** Se `Kd = taxaJurosEmprestimo` automaticamente, ou se o usuário define Kd separadamente com a taxa de juros como sugestão

---

### Phase 3 — Implementação dos Componentes (Tabelas Auxiliares)
> **Primary Agent:** `feature-developer`

**Objetivo:** Implementar os componentes de tabela e integrar na página do BP.

| # | Task | Agent | Status | Deliverable |
|---|------|-------|--------|-------------|
| 3.1 | Criar hook `useBPProjectionPersist` seguindo padrão do `useDREProjectionPersist` | `feature-developer` | pending | `src/hooks/useBPProjectionPersist.ts` |
| 3.2 | Criar server action `saveBPProjection` (se necessário) | `feature-developer` | pending | Server action funcional |
| 3.3 | Criar componente `InvestmentTable` com premissas `indiceImobilizadoVendas` e `taxaDepreciacao` | `feature-developer` | pending | Componente funcional com edição inline |
| 3.4 | Criar componente `WorkingCapitalTable` com 8 premissas de prazos médios + toggle por bloco | `feature-developer` | pending | Componente funcional com edição inline |
| 3.5 | Criar componente `LoansTable` com premissas `taxaNovosEmprestimosCP`, `taxaNovosEmprestimosLP` e `taxaJurosEmprestimo` | `feature-developer` | pending | Componente funcional com edição inline |
| 3.6 | Modificar `balance-sheet/page.tsx` para adicionar sistema de tabs (BP, Investimento, Capital de Giro, Empréstimos) | `feature-developer` | pending | Página com 4 tabs funcionais |
| 3.7 | Garantir recálculo reativo: ao editar premissa → recalcular BP+DRE → atualizar todas as tabelas | `feature-developer` | pending | Integração com motor de cálculo |

---

### Phase 4 — Validação & Testes
> **Primary Agent:** `test-writer`

**Objetivo:** Validar a implementação e garantir qualidade.

| # | Task | Agent | Status | Deliverable |
|---|------|-------|--------|-------------|
| 4.1 | Testar navegação entre tabs e renderização correta de cada tabela | `test-writer` | pending | Testes de integração |
| 4.2 | Testar edição inline de premissas e auto-save | `test-writer` | pending | Testes de interação |
| 4.3 | Testar funcionalidades copy-right e trend nas premissas | `test-writer` | pending | Testes de UX |
| 4.4 | Validar consistência dos cálculos: despesas financeiras = dívida × taxa juros | `test-writer` | pending | Testes de cálculo |
| 4.5 | Validar integração DRE↔BP: lucro líquido correto → lucros acumulados corretos | `test-writer` | pending | Testes de integração |
| 4.6 | Testar taxas separadas CP/LP nos empréstimos | `test-writer` | pending | Testes de cálculo |
| 4.7 | Testar responsividade e acessibilidade das novas tabs | `test-writer` | pending | Testes visuais |

## Decisões Técnicas

1. **Componente base compartilhado vs. componentes independentes:** Usar um componente base `BalanceSheetAuxTable` que aceita configuração de linhas via props, evitando duplicação da lógica de premissas inline (PremiseInput, toggle, copy-right, trend).

2. **Reutilização do PremiseInput:** As premissas de prazos médios (dias) e taxas (%) usarão o mesmo `PremiseInput` existente, apenas ajustando o range de valores (prazos: 0-999 dias; taxas: 0-100%).

3. **Persistência unificada:** As premissas do BP serão salvas como um objeto `BalanceSheetProjectionInputs[]` completo (não fragmentado por tabela), mantendo consistência com o modelo de dados do PRD.

4. **Recálculo:** Ao alterar qualquer premissa em qualquer tab auxiliar, o motor de cálculo `calculateAllBalanceSheet()` é acionado para recalcular todo o BP, atualizando todas as tabs simultaneamente.

5. **Separação de taxas CP/LP:** `taxaNovosEmprestimosFinanciamentos` será substituída por `taxaNovosEmprestimosCP` e `taxaNovosEmprestimosLP`, permitindo cenários onde a empresa refinancia dívida de curto prazo diferentemente da de longo prazo.

6. **Taxa de Juros como ponte para WACC:** A `taxaJurosEmprestimo` calcula `despesasFinanceiras = dívidaTotal × taxa` no DRE e serve como referência para o Custo da Dívida (Kd) no WACC, criando consistência entre o modelo operacional e o modelo de valuation.

7. **Integração DRE↔BP sem circularidade:** O FCFF usa EBIT (antes das despesas financeiras), portanto não há dependência circular. O fluxo é: DRE(parcial) → BP → DespFinanceiras → DRE(completa) → Lucros Acumulados → BP(atualizado).
