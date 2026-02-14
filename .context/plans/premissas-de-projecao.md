---
status: ready
generated: 2026-02-14
agents:
  - type: "feature-developer"
    role: "Implementar formulários, server actions e integração com engine de cálculo"
  - type: "frontend-specialist"
    role: "Design da tabela inline editável conforme wireframes do PRD"
  - type: "test-writer"
    role: "Testes unitários dos novos componentes e server actions"
phases:
  - id: "phase-1"
    name: "Refatorar Types e Engine de Cálculo"
    prevc: "E"
  - id: "phase-2"
    name: "Página de Premissas com Tabela Inline Editável"
    prevc: "E"
  - id: "phase-3"
    name: "Auto-cálculo e Integração com Visualização"
    prevc: "E"
  - id: "phase-4"
    name: "Validação e Testes"
    prevc: "V"
---

# Plano: Premissas de Projeção e Engine de Cálculo

> Implementar página de Premissas de Projeção com tabela inline editável (conforme PRD seção B), integrar engine de cálculo do core e popular automaticamente dados calculados para exibição nas páginas de DRE Projetado e Balanço Projetado.

## Task Snapshot

- **Primary goal:** Permitir que o usuário defina premissas de projeção e, ao salvar, gerar automaticamente as projeções de DRE e Balanço Patrimonial visíveis nas respectivas páginas.
- **Success signal:** Ao salvar dados do Ano Base, as páginas de DRE Projetado e Balanço Projetado exibem projeções calculadas com crescimento 5% como padrão. Ao alterar premissas, as projeções atualizam instantaneamente.

## Princípio de Design: Premissas Inline por Conta

Conforme o PRD (seção B - Variáveis de Entrada e Projeção), as variáveis de projeção devem ser exibidas **na linha imediatamente abaixo da respectiva conta contábil**, em formato de tabela horizontal inline editável.

### Comportamento Padrão (Crescimento 5%)

Para permitir a primeira exibição de projeções mesmo sem o usuário ter preenchido premissas:

**DRE - Premissas padrão derivadas do Ano Base:**
| Premissa | Valor Padrão | Lógica |
|----------|-------------|--------|
| Taxa Crescimento Receita Bruta (%) | 5% | Crescimento moderado padrão |
| Taxa Impostos e Devoluções s/ Rec. Bruta (%) | `dreBase.impostosEDevolucoes / dreBase.receitaBruta * 100` | Margem do Ano Base |
| Taxa CMV s/ Rec. Líquida (%) | `dreBase.cmv / receitaLiquida * 100` | Margem do Ano Base |
| Taxa Despesas Operacionais s/ Rec. Líquida (%) | `dreBase.despesasOperacionais / receitaLiquida * 100` | Margem do Ano Base |
| Taxa IR/CSLL s/ LAIR (%) | `dreBase.irCSLL / lair * 100` | Margem do Ano Base |
| Taxa Dividendos s/ Lucro Líquido (%) | `dreBase.dividendos / lucroLiquido * 100` | Margem do Ano Base |

**Balanço Patrimonial - Premissas padrão derivadas do Ano Base:**
| Premissa | Valor Padrão | Lógica |
|----------|-------------|--------|
| Prazo Caixa e Equivalentes (dias) | `caixaEquivalentes / receitaLiquida * 360` | Prazo médio do Ano Base |
| Prazo Aplicações Financeiras (dias) | `aplicacoesFinanceiras / receitaLiquida * 360` | Prazo médio do Ano Base |
| Prazo Contas a Receber (dias) | `contasReceber / receitaBruta * 360` | Prazo médio do Ano Base |
| Prazo Estoques (dias) | `estoques / cmv * 360` | Prazo médio do Ano Base |
| Prazo Ativos Biológicos (dias) | `ativosBiologicos / receitaLiquida * 360` | Prazo médio do Ano Base |
| Prazo Fornecedores (dias) | `fornecedores / cmv * 360` | Prazo médio do Ano Base |
| Prazo Impostos a Pagar (dias) | `impostosAPagar / impostosEDevolucoes * 360` | Prazo médio do Ano Base |
| Prazo Obrigações Sociais (dias) | `obrigacoesSociais / despesasOperacionais * 360` | Prazo médio do Ano Base |
| Taxa Depreciação (%) | `depreciacaoAcumulada / imobilizadoBruto * 100` ou 10% | Taxa implícita do Ano Base |
| Índice Imobilizado/Vendas | `imobilizadoBruto / receitaBruta` | Índice do Ano Base |
| Taxa Novos Empréstimos (%) | 0% | Conservador |

---

## Diferenças entre PRD e Implementação Atual

O código atual (`src/core/types/index.ts`) usa interfaces simplificadas que **divergem** do PRD. Este plano alinha a implementação ao PRD.

### Types a Refatorar

| Interface | PRD | Código Atual | Ação |
|-----------|-----|-------------|------|
| `DREBaseInputs` | 6 campos (inclui `impostosEDevolucoes`, `dividendos`) | 5 campos (sem impostos/devoluções, sem dividendos) | **Expandir** |
| `DREProjectionInputs` | Objeto por ano com 6 taxas | Array de taxas separadas | **Reestruturar** |
| `DRECalculated` | 14 campos (inclui `receitaLiquida`, `ebitda`, `dividendos`) | 10 campos (faltam vários) | **Expandir** |
| `BalanceSheetBaseInputs` | Estrutura nested por seção (ativo circulante, realizável LP, passivo circulante, realizável LP, PL) | Flat com campos simples | **Reestruturar** |
| `BalanceSheetProjectionInputs` | 11 campos (prazos médios, taxas) | 4 campos | **Expandir** |
| `BalanceSheetCalculated` | Estrutura nested com totais por seção | Flat | **Reestruturar** |

---

## Fases de Implementação

### Phase 1 — Refatorar Types e Engine de Cálculo

**Objetivo:** Alinhar interfaces TypeScript e funções de cálculo ao PRD.

**Arquivos a Modificar:**
| Arquivo | Modificação |
|---------|-------------|
| `src/core/types/index.ts` | Expandir interfaces DRE e BP conforme PRD |
| `src/core/calculations/dre.ts` | Adaptar `calculateDRE` e `calculateAllDRE` para novas interfaces |
| `src/core/calculations/balanceSheet.ts` | Adaptar para prazos médios e nova estrutura nested |
| `src/core/calculations/fcff.ts` | Adaptar para novas interfaces de BP |
| `src/core/__fixtures__/sampleCompany.ts` | Atualizar fixtures para novas interfaces |
| `src/core/calculations/dre.test.ts` | Atualizar testes |
| `src/core/calculations/balanceSheet.test.ts` | Atualizar testes |

**Novas Interfaces (conforme PRD):**

```typescript
// DREBaseInputs expandido
interface DREBaseInputs {
  receitaBruta: number;
  impostosEDevolucoes: number;
  cmv: number;
  despesasOperacionais: number;
  irCSLL: number;
  dividendos: number;
}

// DREProjectionInputs por ano
interface DREProjectionInputs {
  year: number;
  receitaBrutaGrowth: number;       // % crescimento
  impostosEDevolucoesRate: number;  // % sobre Receita Bruta
  cmvRate: number;                   // % sobre Receita Líquida
  despesasOperacionaisRate: number;  // % sobre Receita Líquida
  irCSLLRate: number;               // % sobre LAIR
  dividendosRate: number;           // % sobre Lucro Líquido
}

// DRECalculated expandido
interface DRECalculated {
  year: number;
  receitaBruta: number;
  impostosEDevolucoes: number;
  receitaLiquida: number;
  cmv: number;
  lucroBruto: number;
  despesasOperacionais: number;
  ebit: number;
  depreciacaoAmortizacao: number;  // vem do BP
  ebitda: number;
  despesasFinanceiras: number;     // calculado separadamente
  lucroAntesIR: number;
  irCSLL: number;
  lucroLiquido: number;
  dividendos: number;
}

// BalanceSheetBaseInputs nested
interface BalanceSheetBaseInputs {
  ativoCirculante: {
    caixaEquivalentes: number;
    aplicacoesFinanceiras: number;
    contasReceber: number;
    estoques: number;
    ativosBiologicos: number;
    outrosCreditos: number;
  };
  ativoRealizavelLP: {
    investimentos: number;
    ativoImobilizadoBruto: number;
    depreciacaoAcumulada: number;
    intangivel: number;
  };
  passivoCirculante: {
    fornecedores: number;
    impostosAPagar: number;
    obrigacoesSociaisETrabalhistas: number;
    emprestimosFinanciamentosCP: number;
    outrasObrigacoes: number;
  };
  passivoRealizavelLP: {
    emprestimosFinanciamentosLP: number;
  };
  patrimonioLiquido: {
    capitalSocial: number;
    lucrosAcumulados: number;
  };
}

// BalanceSheetProjectionInputs expandido
interface BalanceSheetProjectionInputs {
  year: number;
  taxaDepreciacao: number;
  indiceImobilizadoVendas: number;
  prazoCaixaEquivalentes: number;
  prazoAplicacoesFinanceiras: number;
  prazoContasReceber: number;
  prazoEstoques: number;
  prazoAtivosBiologicos: number;
  prazoFornecedores: number;
  prazoImpostosAPagar: number;
  prazoObrigacoesSociais: number;
  taxaNovosEmprestimosFinanciamentos: number;
}
```

**Steps:**
1. Atualizar `src/core/types/index.ts` com interfaces do PRD
2. Criar função `generateDefaultProjectionInputs(dreBase, bpBase, years)` que calcula premissas padrão de crescimento 0 com base nos dados do Ano Base
3. Refatorar `calculateDRE` e `calculateAllDRE` para aceitar novo `DREProjectionInputs[]`
4. Refatorar `calculateBalanceSheet` e `calculateAllBalanceSheet` para prazos médios
5. Atualizar `calculateFCFF` para novas interfaces
6. Atualizar fixtures e testes

**Commit Checkpoint:** `feat(core): align types and calculations with PRD specifications`

---

### Phase 2 — Página de Premissas com Tabela Inline Editável

**Objetivo:** Criar a página de Premissas de Projeção conforme wireframes do PRD (seção B).

**Arquivos a Criar:**
| Arquivo | Descrição |
|---------|-----------|
| `src/app/(dashboard)/model/[id]/input/projections/page.tsx` | Página de Premissas com Tabs (DRE / Balanço) |
| `src/components/forms/DREProjectionForm.tsx` | Tabela inline editável de premissas DRE |
| `src/components/forms/BalanceSheetProjectionForm.tsx` | Tabela inline editável de premissas BP |
| `src/lib/actions/projections.ts` | Server actions para salvar premissas e disparar cálculos |

**Arquivos a Modificar:**
| Arquivo | Modificação |
|---------|-------------|
| `src/components/model-sidebar-nav.tsx` | Adicionar item "Premissas de Projeção" no menu |
| `src/components/forms/DREBaseForm.tsx` | Atualizar para novos campos (impostosEDevolucoes, dividendos) |
| `src/components/forms/BalanceSheetBaseForm.tsx` | Atualizar para estrutura nested do PRD |

**Layout da Tabela Inline (DRE) - Conforme PRD seção B:**
```
┌─ Premissas de Projeção - DRE ────────────────────────────────────────┐
│                                                                       │
│ Conta                      │ Ano 1   │ Ano 2   │ Ano 3   │ ...      │
│ ────────────────────────────────────────────────────────────────────  │
│ Receita Bruta              │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Taxa Crescimento (%)  │ [5,0%]  │ [5,0%]  │ [5,0%]  │          │
│ ────────────────────────────────────────────────────────────────────  │
│ Impostos e Devoluções      │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Taxa s/ Rec. Bruta (%)│ [17,0%] │ [17,0%] │ [17,0%] │          │
│ ────────────────────────────────────────────────────────────────────  │
│ Receita Líquida            │ (calc)  │ (calc)  │ (calc)  │          │
│ ────────────────────────────────────────────────────────────────────  │
│ CMV                        │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Taxa s/ Rec. Líq. (%) │ [50,0%] │ [50,0%] │ [50,0%] │          │
│ ────────────────────────────────────────────────────────────────────  │
│ Lucro Bruto                │ (calc)  │ (calc)  │ (calc)  │          │
│ ────────────────────────────────────────────────────────────────────  │
│ Despesas Operacionais      │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Taxa s/ Rec. Líq. (%) │ [20,0%] │ [20,0%] │ [20,0%] │          │
│ ────────────────────────────────────────────────────────────────────  │
│ EBIT                       │ (calc)  │ (calc)  │ (calc)  │          │
│ ────────────────────────────────────────────────────────────────────  │
│ Depreciação + Amortização  │ (calc)  │ (calc)  │ (calc)  │          │
│ ────────────────────────────────────────────────────────────────────  │
│ EBITDA                     │ (calc)  │ (calc)  │ (calc)  │          │
│ ────────────────────────────────────────────────────────────────────  │
│ IR/CSLL                    │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Taxa s/ LAIR (%)      │ [34,0%] │ [34,0%] │ [34,0%] │          │
│ ────────────────────────────────────────────────────────────────────  │
│ Lucro Líquido              │ (calc)  │ (calc)  │ (calc)  │          │
│ ────────────────────────────────────────────────────────────────────  │
│ Dividendos                 │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Taxa s/ Lucro Líq. (%)│ [30,0%] │ [30,0%] │ [30,0%] │          │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

**Layout da Tabela Inline (Balanço) - Conforme PRD seção B:**
```
┌─ Premissas de Projeção - Balanço Patrimonial ────────────────────────┐
│                                                                       │
│ Conta                      │ Ano 1   │ Ano 2   │ Ano 3   │ ...      │
│ ────────────────────────────────────────────────────────────────────  │
│ ATIVO CIRCULANTE                                                      │
│ ────────────────────────────────────────────────────────────────────  │
│ Caixa e Equivalentes       │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Prazo Médio (dias)    │ [30]    │ [30]    │ [30]    │          │
│ ────────────────────────────────────────────────────────────────────  │
│ Aplicações Financeiras     │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Prazo Médio (dias)    │ [20]    │ [20]    │ [20]    │          │
│ ────────────────────────────────────────────────────────────────────  │
│ Contas a Receber           │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Prazo Médio (dias)    │ [45]    │ [45]    │ [45]    │          │
│ ────────────────────────────────────────────────────────────────────  │
│ Estoques                   │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Prazo Médio (dias)    │ [60]    │ [60]    │ [60]    │          │
│ ────────────────────────────────────────────────────────────────────  │
│ Ativos Biológicos          │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Prazo Médio (dias)    │ [0]     │ [0]     │ [0]     │          │
│ ────────────────────────────────────────────────────────────────────  │
│ Total Ativo Circulante     │ (calc)  │ (calc)  │ (calc)  │          │
│ ────────────────────────────────────────────────────────────────────  │
│ PASSIVO CIRCULANTE                                                    │
│ ────────────────────────────────────────────────────────────────────  │
│ Fornecedores               │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Prazo Médio (dias)    │ [35]    │ [35]    │ [35]    │          │
│ ────────────────────────────────────────────────────────────────────  │
│ Impostos a Pagar           │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Prazo Médio (dias)    │ [30]    │ [30]    │ [30]    │          │
│ ────────────────────────────────────────────────────────────────────  │
│ Obrigações Sociais         │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Prazo Médio (dias)    │ [30]    │ [30]    │ [30]    │          │
│ ────────────────────────────────────────────────────────────────────  │
│ IMOBILIZADO                                                           │
│ ────────────────────────────────────────────────────────────────────  │
│ Imobilizado Bruto          │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Taxa Depreciação (%)  │ [10,0%] │ [10,0%] │ [10,0%] │          │
│   └─ Índice Imob/Vendas    │ [0,15]  │ [0,15]  │ [0,15]  │          │
│ ────────────────────────────────────────────────────────────────────  │
│ EMPRÉSTIMOS                                                           │
│ ────────────────────────────────────────────────────────────────────  │
│ Empréstimos CP + LP        │ (calc)  │ (calc)  │ (calc)  │          │
│   └─ Taxa Novos Emprést.(%)│ [0,0%]  │ [0,0%]  │ [0,0%]  │          │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

**Funcionalidades UX:**
- Inputs inline editáveis dentro da tabela (campos `<input>` na célula)
- Valores calculados (contas contábeis) exibidos em cinza/muted acima de cada premissa
- Linhas de premissa (editável) com fundo ligeiramente diferente para distinguir de linhas calculadas
- Botão "Copiar para todos os anos" ao lado do input do Ano 1 (replica valor)
- Tooltip explicativo em cada premissa (ex: "Aplicada sobre Receita Bruta")
- Tab navigation entre células de input
- Cálculo local em tempo real: ao alterar uma premissa, os valores calculados da tabela recalculam no client antes de salvar

**Steps:**
1. Criar página `input/projections/page.tsx` com Tabs (DRE / Balanço)
2. Implementar `DREProjectionForm` como tabela inline editável com TanStack Table
3. Implementar `BalanceSheetProjectionForm` como tabela inline editável
4. Criar server action `saveProjectionInputs` que salva premissas no `model_data`
5. Atualizar sidebar para incluir link para Premissas de Projeção
6. Atualizar formulários de Ano Base para os novos campos do PRD

**Commit Checkpoint:** `feat(ui): add projection inputs page with inline editable tables`

---

### Phase 3 — Auto-cálculo e Integração com Visualização

**Objetivo:** Ao salvar dados base OU premissas, calcular automaticamente projeções e salvar em `model_data.dre`, `model_data.balanceSheet` e `model_data.fcff`.

**Arquivos a Criar:**
| Arquivo | Descrição |
|---------|-----------|
| `src/lib/actions/calculate.ts` | Server action que executa cálculos e salva resultados |
| `src/lib/utils/defaultProjections.ts` | Função que gera premissas padrão a partir do Ano Base |

**Arquivos a Modificar:**
| Arquivo | Modificação |
|---------|-------------|
| `src/lib/actions/models.ts` | `saveDREBase` e `saveBalanceSheetBase` disparam auto-cálculo |
| `src/lib/actions/projections.ts` | `saveProjectionInputs` dispara auto-cálculo |
| `src/app/(dashboard)/model/[id]/view/dre/page.tsx` | Ajustar leitura para novo formato `DRECalculated` |
| `src/app/(dashboard)/model/[id]/view/balance-sheet/page.tsx` | Ajustar leitura para novo formato `BalanceSheetCalculated` |
| `src/components/tables/DRETable.tsx` | Adaptar para novos campos (receitaLiquida, ebitda, etc.) |
| `src/components/tables/BalanceSheetTable.tsx` | Adaptar para estrutura nested |

**Fluxo de Auto-cálculo:**

```
1. Usuário salva Dados Base (DRE e/ou BP)
   │
   ├─ Se ainda não existem premissas de projeção no model_data:
   │   └─ Gerar premissas padrão (crescimento 5%, margens do Ano Base)
   │      e salvar em model_data.dreProjection / model_data.bpProjection
   │
   ├─ Executar calculateAllDRE(dreBase, dreProjection, anosProjecao)
   ├─ Executar calculateAllBalanceSheet(bpBase, dreCalculated, bpProjection)
   ├─ Executar calculateAllFCFF(dreCalculated, bpCalculated)
   │
   └─ Salvar resultados em:
      ├─ model_data.dre = DRECalculated[]
      ├─ model_data.balanceSheet = BalanceSheetCalculated[]
      └─ model_data.fcff = FCFFCalculated[]

2. Usuário modifica Premissas de Projeção
   └─ Mesmo fluxo de cálculo acima
```

**Geração de Premissas Padrão (crescimento 0):**

```typescript
function generateDefaultDREProjection(
  dreBase: DREBaseInputs,
  years: number
): DREProjectionInputs[] {
  const receitaLiquida = dreBase.receitaBruta - dreBase.impostosEDevolucoes;
  const lucroBruto = receitaLiquida - dreBase.cmv;
  const ebit = lucroBruto - dreBase.despesasOperacionais;
  // despesasFinanceiras são calculadas separadamente (vem do BP)
  const lair = ebit; // simplificação para defaults
  const lucroLiquido = lair - dreBase.irCSLL;

  const defaultInputs = {
    receitaBrutaGrowth: 5,
    impostosEDevolucoesRate: dreBase.receitaBruta > 0
      ? (dreBase.impostosEDevolucoes / dreBase.receitaBruta) * 100 : 17,
    cmvRate: receitaLiquida > 0
      ? (dreBase.cmv / receitaLiquida) * 100 : 50,
    despesasOperacionaisRate: receitaLiquida > 0
      ? (dreBase.despesasOperacionais / receitaLiquida) * 100 : 20,
    irCSLLRate: lair > 0
      ? (dreBase.irCSLL / lair) * 100 : 34,
    dividendosRate: lucroLiquido > 0
      ? (dreBase.dividendos / lucroLiquido) * 100 : 0,
  };

  return Array.from({ length: years }, (_, i) => ({
    ...defaultInputs,
    year: i + 1,
  }));
}

function generateDefaultBPProjection(
  bpBase: BalanceSheetBaseInputs,
  dreBase: DREBaseInputs,
  years: number
): BalanceSheetProjectionInputs[] {
  const receitaLiquida = dreBase.receitaBruta - dreBase.impostosEDevolucoes;

  const defaultInputs = {
    prazoCaixaEquivalentes: receitaLiquida > 0
      ? Math.round(bpBase.ativoCirculante.caixaEquivalentes / receitaLiquida * 360) : 30,
    prazoAplicacoesFinanceiras: receitaLiquida > 0
      ? Math.round(bpBase.ativoCirculante.aplicacoesFinanceiras / receitaLiquida * 360) : 0,
    prazoContasReceber: dreBase.receitaBruta > 0
      ? Math.round(bpBase.ativoCirculante.contasReceber / dreBase.receitaBruta * 360) : 45,
    prazoEstoques: dreBase.cmv > 0
      ? Math.round(bpBase.ativoCirculante.estoques / dreBase.cmv * 360) : 60,
    prazoAtivosBiologicos: receitaLiquida > 0
      ? Math.round(bpBase.ativoCirculante.ativosBiologicos / receitaLiquida * 360) : 0,
    prazoFornecedores: dreBase.cmv > 0
      ? Math.round(bpBase.passivoCirculante.fornecedores / dreBase.cmv * 360) : 35,
    prazoImpostosAPagar: dreBase.impostosEDevolucoes > 0
      ? Math.round(bpBase.passivoCirculante.impostosAPagar / dreBase.impostosEDevolucoes * 360) : 30,
    prazoObrigacoesSociais: dreBase.despesasOperacionais > 0
      ? Math.round(bpBase.passivoCirculante.obrigacoesSociaisETrabalhistas / dreBase.despesasOperacionais * 360) : 30,
    taxaDepreciacao: bpBase.ativoRealizavelLP.ativoImobilizadoBruto > 0
      ? (bpBase.ativoRealizavelLP.depreciacaoAcumulada / bpBase.ativoRealizavelLP.ativoImobilizadoBruto) * 100 : 10,
    indiceImobilizadoVendas: dreBase.receitaBruta > 0
      ? bpBase.ativoRealizavelLP.ativoImobilizadoBruto / dreBase.receitaBruta : 0.15,
    taxaNovosEmprestimosFinanciamentos: 0,
  };

  return Array.from({ length: years }, (_, i) => ({
    ...defaultInputs,
    year: i + 1,
  }));
}
```

**Steps:**
1. Criar `src/lib/utils/defaultProjections.ts` com funções de geração de premissas padrão
2. Criar `src/lib/actions/calculate.ts` com server action `recalculateModel(modelId)`
3. Modificar `saveDREBase` para disparar `recalculateModel` após salvar
4. Modificar `saveBalanceSheetBase` para disparar `recalculateModel` após salvar
5. Modificar `saveProjectionInputs` para disparar `recalculateModel` após salvar
6. Ajustar páginas de visualização (DRE, BP) para ler novo formato de dados
7. Ajustar componentes de tabela (DRETable, BalanceSheetTable) para novos campos

**Commit Checkpoint:** `feat(engine): auto-calculate projections on save with 5%-growth defaults`

---

### Phase 4 — Validação e Testes

**Objetivo:** Garantir que todo o fluxo funciona corretamente end-to-end.

**Checklist:**
- [ ] Ao criar um novo modelo e preencher Dados Base, as páginas de DRE e Balanço Projetado exibem dados com crescimento 5%
- [ ] Ao abrir Premissas de Projeção, os valores padrão estão preenchidos corretamente (derivados do Ano Base)
- [ ] Ao alterar premissas e salvar, as projeções atualizam nas páginas de visualização
- [ ] Tabela inline editável funciona com navegação por Tab entre células
- [ ] Botão "Copiar para todos os anos" funciona corretamente
- [ ] Cálculos de DRE estão corretos (conforme fórmulas do PRD)
- [ ] Cálculos de BP estão corretos (prazos médios, depreciação, CAPEX conforme PRD)
- [ ] Balanço equilibra: Ativo Total = Passivo Total + PL
- [ ] Mock data funciona corretamente com novos formatos de interfaces
- [ ] Testes unitários passam para todas as funções de cálculo refatoradas
- [ ] Responsividade da tabela inline em diferentes tamanhos de tela

**Commit Checkpoint:** `test: validate projections flow end-to-end`

---

## Estrutura Final de model_data

Após implementação, o JSON `model_data` terá esta estrutura:

```typescript
{
  // Inputs do usuário - Ano Base
  dreBase: DREBaseInputs,
  balanceSheetBase: BalanceSheetBaseInputs,

  // Inputs do usuário - Premissas de Projeção (por ano)
  dreProjection: DREProjectionInputs[],
  bpProjection: BalanceSheetProjectionInputs[],
  anosProjecao: 5 | 10,

  // Resultados calculados (gerados automaticamente pelo engine)
  dre: DRECalculated[],
  balanceSheet: BalanceSheetCalculated[],
  fcff: FCFFCalculated[],
}
```

## Rollback

Se necessário reverter:
1. Restaurar `src/core/types/index.ts` para versão anterior (git checkout)
2. Restaurar funções de cálculo para versão anterior
3. Remover arquivos criados em `input/projections/` e novos componentes de forms
4. Restaurar formulários originais de DRE e Balanço Base
5. Verificar se rotas existentes ainda funcionam
