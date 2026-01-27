## 3. Estrutura de Dados

### 3.1 Modelo de Dados Principal

```typescript
interface FinancialModel {
  id: string;
  companyName: string;
  projectionYears: 5 | 10;
  baseYear: number;

  // Demonstrações Financeiras
  dre: IncomeStatement;
  balanceSheet: BalanceSheet;
  cashFlow: CashFlowStatement;

  // Premissas de Valuation e WACC
  assumptions: Assumptions;
  waccCalculations: WACCCalculation[]; // Um por ano

  // Análise de Sensibilidade
  sensitivity?: SensitivityAnalysis;

  // Resultados de Valuation
  valuationResults?: ValuationResults;
}

interface IncomeStatement {
  baseYearInputs: DREBaseInputs;
  projectionInputs: DREProjectionInputs[]; // Um por ano
  calculatedAccounts: DRECalculated[]; // Um por ano
}

interface DREBaseInputs {
  receitaBruta: number;
  impostosEDevolucoes: number;
  cmv: number;
  despesasOperacionais: number;
  irCSLL: number;
  dividendos: number;
}

interface DREProjectionInputs {
  year: number;
  receitaBrutaGrowth: number; // %
  impostosEDevolucoesRate: number; // %
  cmvRate: number; // %
  despesasOperacionaisRate: number; // %
  irCSLLRate: number; // %
  dividendosRate: number; // %
}

interface DRECalculated {
  year: number;
  receitaBruta: number;
  impostosEDevolucoes: number;
  receitaLiquida: number;
  cmv: number;
  lucroBruto: number;
  despesasOperacionais: number;
  ebit: number;
  depreciacaoAmortizacao: number;
  ebitda: number;
  despesasFinanceiras: number;
  lucroAntesIR: number;
  irCSLL: number;
  lucroLiquido: number;
  dividendos: number;
}

interface BalanceSheet {
  baseYearInputs: BalanceSheetBaseInputs;
  projectionInputs: BalanceSheetProjectionInputs[];
  calculatedAccounts: BalanceSheetCalculated[];
}

interface BalanceSheetBaseInputs {
  // Ativo Circulante
  ativoCirculante: {
    caixaEquivalentes: number;
    aplicacoesFinanceiras: number;
    contasReceber: number;
    estoques: number;
    ativosBiologicos: number;
    outrosCreditos: number;
  };

  // Ativo Realizável a Longo Prazo
  ativoRealizavelLP: {
    investimentos: number;
    ativoImobilizadoBruto: number;
    depreciacaoAcumulada: number;
    intangivel: number;
  };

  // Passivo Circulante
  passivoCirculante: {
    fornecedores: number;
    impostosAPagar: number;
    obrigacoesSociaisETrabalhistas: number;
    emprestimosFinanciamentosCP: number;
    outrasObrigacoes: number;
  };

  // Passivo Realizável a Longo Prazo
  passivoRealizavelLP: {
    emprestimosFinanciamentosLP: number;
  };

  // Patrimônio Líquido
  patrimonioLiquido: {
    capitalSocial: number;
    lucrosAcumulados: number;
  };
}

interface BalanceSheetProjectionInputs {
  year: number;
  taxaDepreciacao: number; // %
  indiceImobilizadoVendas: number;

  // Prazos Médios - Ativo Circulante
  prazoCaixaEquivalentes: number; // dias
  prazoAplicacoesFinanceiras: number;
  prazoContasReceber: number;
  prazoEstoques: number;
  prazoAtivosBiologicos: number;

  // Prazos Médios - Passivo Circulante
  prazoFornecedores: number;
  prazoImpostosAPagar: number;
  prazoObrigacoesSociais: number;

  // Empréstimos e Financiamentos
  taxaNovosEmprestimosFinanciamentos: number; // %
}

interface BalanceSheetCalculated {
  year: number;

  // Ativo Circulante Calculado
  ativoCirculante: {
    caixaEquivalentes: number;
    aplicacoesFinanceiras: number;
    contasReceber: number;
    estoques: number;
    ativosBiologicos: number;
    outrosCreditos: number;
    total: number;
  };

  // Ativo Realizável a LP Calculado
  ativoRealizavelLP: {
    investimentos: number;
    imobilizadoBruto: number;
    depreciacaoAcumulada: number;
    imobilizado: number; // Imobilizado Bruto - Depreciação Acumulada
    intangivel: number;
    total: number;
  };

  // Passivo Circulante Calculado
  passivoCirculante: {
    fornecedores: number;
    impostosAPagar: number;
    obrigacoesSociaisETrabalhistas: number;
    emprestimosFinanciamentosCP: number;
    outrasObrigacoes: number;
    total: number;
  };

  // Passivo Realizável a LP Calculado
  passivoRealizavelLP: {
    emprestimosFinanciamentosLP: number;
    outrasRealizacoesLP: number;
    total: number;
  };

  // Patrimônio Líquido Calculado
  patrimonioLiquido: {
    capitalSocial: number;
    lucrosAcumulados: number;
    total: number;
  };

  // Contas Auxiliares Calculadas
  depreciacaoAnual: number;
  capex: number;
  novosEmprestimosFinanciamentosCP: number;
  novosEmprestimosFinanciamentosLP: number;
  capitalGiro: number;
  ncg: number; // Necessidade de Capital de Giro (variação)
}

interface Assumptions {
  // Parâmetros do WACC
  taxaLivreDeRisco: number; // Rf - Risk-free rate
  beta: number; // β - Beta do ativo
  premioRiscoMercado: number; // ERP - Equity Risk Premium
  spreadDivida: number; // Spread da dívida sobre Rf
  taxaImposto: number; // T - Tax rate

  // Parâmetros de Valuation
  perpetualGrowthRate: number; // Taxa de crescimento perpétuo (g)

  // Contas Calculadas do WACC (derivadas)
  custoCapitalProprio?: number; // Ke = Rf + β * ERP
  custoDivida?: number; // Kd = Rf + Spread
  wacc?: number; // Calculado: (E/(E+D)) * Ke + (D/(E+D)) * Kd * (1-T)
}

interface SensitivityAnalysis {
  variables: SensitivityVariable[];
  scenarios: Scenario[];
}

interface SensitivityVariable {
  name: string;
  baseValue: number;
  minValue: number;
  maxValue: number;
  step: number;
}

interface Scenario {
  id: string;
  name: string;
  variableChanges: Record<string, number>;
  results: ValuationResults;
}

interface ValuationResults {
  enterpriseValue: number;
  equityValue: number;
  sharePrice: number;
  fcfProjections: number[];
}

// Interface para Fluxo de Caixa da Firma (FCFF)
interface CashFlowStatement {
  calculatedAccounts: FCFFCalculated[];
}

interface FCFFCalculated {
  year: number;
  ebit: number;
  depreciacaoAmortizacao: number;
  capex: number;
  capitalGiro: number;
  ncg: number; // Variação do Capital de Giro
  fcff: number; // FCFF = EBIT - NCG - CAPEX
}

// Interface para cálculo do WACC
interface WACCCalculation {
  year: number;
  patrimonioLiquido: number; // E
  divida: number; // D = Empréstimos CP + Empréstimos LP
  custoCapitalProprio: number; // Ke = Rf + β * ERP
  custoDivida: number; // Kd = Rf + Spread
  taxaImposto: number; // T
  wacc: number; // WACC = (E/(E+D)) * Ke + (D/(E+D)) * Kd * (1-T)
}
```

### 3.2 Motor de Cálculo

O motor de cálculo será implementado como um conjunto de funções puras que:

1. Recebem dados de entrada (inputs base + premissas)
2. Aplicam fórmulas definidas nas regras de negócio
3. Retornam contas calculadas

> **⚠️ Nota para Integração com API (Agente de IA):**
> Todas as funções de cálculo devem seguir o padrão:
>
> - **Input:** Objeto tipado com todos os dados necessários
> - **Output:** Objeto tipado com resultado ou erro (`CalculationResult<T>`)
> - **Sem dependências externas:** React, DOM, localStorage proibidos
> - **Serialização JSON garantida:** Sem funções, classes complexas ou referências circulares

#### 3.2.1 Fórmulas do DRE (Conforme Regras de Negócio)

```typescript
// Cálculo da DRE Projetada
function calculateDRE(
  baseInputs: DREBaseInputs,
  projectionInputs: DREProjectionInputs,
  previousYear: DRECalculated,
  depreciacaoAmortizacao: number, // Vem do BP
  despesasFinanceiras: number, // Calculado separadamente
): DRECalculated {
  // Receita Bruta(i+1) = Receita Bruta(i) * (1 + Taxa Receita Bruta)
  const receitaBruta =
    previousYear.receitaBruta * (1 + projectionInputs.receitaBrutaGrowth / 100);

  // Impostos e Devoluções = Receita Bruta * Taxa Impostos e Devoluções
  const impostosEDevolucoes =
    receitaBruta * (projectionInputs.impostosEDevolucoesRate / 100);

  // Receita Líquida = Receita Bruta - Impostos e Devoluções
  const receitaLiquida = receitaBruta - impostosEDevolucoes;

  // CMV = Receita Líquida * Taxa CMV
  const cmv = receitaLiquida * (projectionInputs.cmvRate / 100);

  // Lucro Bruto = Receita Líquida - CMV
  const lucroBruto = receitaLiquida - cmv;

  // Despesas Operacionais = Receita Líquida * Taxa Despesas Operacionais
  const despesasOperacionais =
    receitaLiquida * (projectionInputs.despesasOperacionaisRate / 100);

  // Lucro Operacional = Lucro Bruto - Despesas Operacionais
  const lucroOperacional = lucroBruto - despesasOperacionais;

  // EBIT = Lucro Operacional
  const ebit = lucroOperacional;

  // EBITDA = EBIT + Depreciação + Amortização
  const ebitda = ebit + depreciacaoAmortizacao;

  // Lucro Antes do IR/CSLL = Lucro Operacional - Despesas Financeiras
  const lucroAntesIR = lucroOperacional - despesasFinanceiras;

  // IR/CSLL = Lucro Antes do IR/CSLL * Taxa IR/CSLL
  const irCSLL = lucroAntesIR * (projectionInputs.irCSLLRate / 100);

  // Lucro Líquido = Lucro Antes do IR/CSLL - IR/CSLL
  const lucroLiquido = lucroAntesIR - irCSLL;

  // Dividendos = Lucro Líquido * Taxa Dividendos
  const dividendos = lucroLiquido * (projectionInputs.dividendosRate / 100);

  return {
    year: projectionInputs.year,
    receitaBruta,
    impostosEDevolucoes,
    receitaLiquida,
    cmv,
    lucroBruto,
    despesasOperacionais,
    ebit,
    depreciacaoAmortizacao,
    ebitda,
    despesasFinanceiras,
    lucroAntesIR,
    irCSLL,
    lucroLiquido,
    dividendos,
  };
}
```

#### 3.2.2 Fórmulas do Balanço Patrimonial (Conforme Regras de Negócio)

```typescript
// Cálculo do Balanço Patrimonial Projetado
function calculateBalanceSheet(
  baseInputs: BalanceSheetBaseInputs,
  projectionInputs: BalanceSheetProjectionInputs,
  previousYear: BalanceSheetCalculated,
  dreCalculated: DRECalculated,
): BalanceSheetCalculated {
  // === DEPRECIAÇÃO ===
  // Depreciação Anual(i+1) = Imobilizado Bruto(i) * Taxa de Depreciação
  const depreciacaoAnual =
    previousYear.ativoRealizavelLP.imobilizadoBruto *
    (projectionInputs.taxaDepreciacao / 100);

  // Depreciação Acumulada(i+1) = Depreciação Acumulada(i) + Depreciação Anual(i)
  const depreciacaoAcumulada =
    previousYear.ativoRealizavelLP.depreciacaoAcumulada + depreciacaoAnual;

  // === IMOBILIZADO ===
  // CAPEX(i) = Índice Imobilizado-Vendas(i) * Receita Bruta(i)
  const capex =
    projectionInputs.indiceImobilizadoVendas * dreCalculated.receitaBruta;

  // Imobilizado Bruto(i+1) = Imobilizado Bruto(i) + CAPEX
  const imobilizadoBruto =
    previousYear.ativoRealizavelLP.imobilizadoBruto + capex;

  // Imobilizado(i) = Imobilizado Bruto(i) - Depreciação Acumulada(i)
  const imobilizado = imobilizadoBruto - depreciacaoAcumulada;

  // === ATIVO CIRCULANTE (Prazos Médios) ===
  // Fórmula geral: Conta = (Prazo Médio / 360) * Base de Cálculo
  const caixaEquivalentes =
    (projectionInputs.prazoCaixaEquivalentes / 360) *
    dreCalculated.receitaLiquida;
  const aplicacoesFinanceiras =
    (projectionInputs.prazoAplicacoesFinanceiras / 360) *
    dreCalculated.receitaLiquida;
  const contasReceber =
    (projectionInputs.prazoContasReceber / 360) * dreCalculated.receitaBruta;
  const estoques = (projectionInputs.prazoEstoques / 360) * dreCalculated.cmv;
  const ativosBiologicos =
    (projectionInputs.prazoAtivosBiologicos / 360) *
    dreCalculated.receitaLiquida;

  // Outros Créditos = Ativo Circulante(i-1) - Demais contas (mantido proporcional)
  const outrosCreditos = previousYear.ativoCirculante.outrosCreditos;

  // === PASSIVO CIRCULANTE (Prazos Médios) ===
  const fornecedores =
    (projectionInputs.prazoFornecedores / 360) * dreCalculated.cmv;
  const impostosAPagar =
    (projectionInputs.prazoImpostosAPagar / 360) *
    dreCalculated.impostosEDevolucoes;
  const obrigacoesSociaisETrabalhistas =
    (projectionInputs.prazoObrigacoesSociais / 360) *
    dreCalculated.despesasOperacionais;

  // === EMPRÉSTIMOS E FINANCIAMENTOS ===
  // Novos Empréstimos CP(i) = Empréstimos CP(i) * Taxa Novos Empréstimos
  const novosEmprestimosCP =
    previousYear.passivoCirculante.emprestimosFinanciamentosCP *
    (projectionInputs.taxaNovosEmprestimosFinanciamentos / 100);
  const emprestimosFinanciamentosCP =
    previousYear.passivoCirculante.emprestimosFinanciamentosCP +
    novosEmprestimosCP;

  // Novos Empréstimos LP(i) = Empréstimos LP(i) * Taxa Novos Empréstimos
  const novosEmprestimosLP =
    previousYear.passivoRealizavelLP.emprestimosFinanciamentosLP *
    (projectionInputs.taxaNovosEmprestimosFinanciamentos / 100);
  const emprestimosFinanciamentosLP =
    previousYear.passivoRealizavelLP.emprestimosFinanciamentosLP +
    novosEmprestimosLP;

  // === TOTAIS ===
  const totalAtivoCirculante =
    caixaEquivalentes +
    aplicacoesFinanceiras +
    contasReceber +
    estoques +
    ativosBiologicos +
    outrosCreditos;
  const totalPassivoCirculante =
    fornecedores +
    impostosAPagar +
    obrigacoesSociaisETrabalhistas +
    emprestimosFinanciamentosCP +
    previousYear.passivoCirculante.outrasObrigacoes;

  // === CAPITAL DE GIRO E NCG ===
  // Capital de Giro(i) = Ativo Circulante(i) - Passivo Circulante(i) + Empréstimos(i)
  const capitalGiro =
    totalAtivoCirculante - totalPassivoCirculante + emprestimosFinanciamentosCP;

  // NCG(i+1) = Capital de Giro(i+1) - Capital de Giro(i)
  const ncg = capitalGiro - previousYear.capitalGiro;

  // ... retornar estrutura completa
}
```

#### 3.2.3 Fórmulas do Fluxo de Caixa da Firma (FCFF)

```typescript
// Cálculo do FCFF (Conforme Regras de Negócio)
function calculateFCFF(
  dreCalculated: DRECalculated,
  bpCalculated: BalanceSheetCalculated,
): FCFFCalculated {
  // FCFF(i) = EBIT(i) - NCG(i) - CAPEX(i)
  const fcff = dreCalculated.ebit - bpCalculated.ncg - bpCalculated.capex;

  return {
    year: dreCalculated.year,
    ebit: dreCalculated.ebit,
    depreciacaoAmortizacao: bpCalculated.depreciacaoAnual,
    capex: bpCalculated.capex,
    capitalGiro: bpCalculated.capitalGiro,
    ncg: bpCalculated.ncg,
    fcff,
  };
}
```

#### 3.2.4 Fórmulas do WACC (Conforme Regras de Negócio)

```typescript
// Cálculo do WACC
function calculateWACC(
  assumptions: Assumptions,
  bpCalculated: BalanceSheetCalculated,
): WACCCalculation {
  // Patrimônio Líquido (E)
  const E = bpCalculated.patrimonioLiquido.total;

  // Dívida (D) = Empréstimos CP + Empréstimos LP
  const D =
    bpCalculated.passivoCirculante.emprestimosFinanciamentosCP +
    bpCalculated.passivoRealizavelLP.emprestimosFinanciamentosLP;

  // Custo do Capital Próprio: Ke = Rf + β * ERP
  const Ke =
    assumptions.taxaLivreDeRisco +
    assumptions.beta * assumptions.premioRiscoMercado;

  // Custo da Dívida: Kd = Rf + Spread
  const Kd = assumptions.taxaLivreDeRisco + assumptions.spreadDivida;

  // Taxa de Imposto (T)
  const T = assumptions.taxaImposto;

  // WACC = (E/(E+D)) * Ke + (D/(E+D)) * Kd * (1-T)
  const wacc = (E / (E + D)) * Ke + (D / (E + D)) * Kd * (1 - T);

  return {
    year: bpCalculated.year,
    patrimonioLiquido: E,
    divida: D,
    custoCapitalProprio: Ke,
    custoDivida: Kd,
    taxaImposto: T,
    wacc,
  };
}
```

---

## 4. Bibliotecas e Ferramentas Complementares

### 4.1 Gerenciamento de Estado

**Recomendação: Zustand**

- **Por quê:** Mais simples que Redux, menor boilerplate
- **Alternativa:** Redux Toolkit (para projetos maiores)

```bash
npm install zustand
```

### 4.2 Formulários

**Recomendação: React Hook Form + Zod**

- **Por quê:** Performance, validação tipada, integração com shadcn/ui
- **Recursos:** Validação em tempo real, gerenciamento de estado de formulários

```bash
npm install react-hook-form zod @hookform/resolvers
```

### 4.3 Tabelas (Experiência Excel-like)

**Recomendação: AG Grid Community ou TanStack Table**

**Opção 1: AG Grid Community**

- **Pros:** Funcionalidades tipo Excel (edição inline, cópia/cola, exportação)
- **Contras:** Biblioteca pesada, curva de aprendizado

```bash
npm install ag-grid-react ag-grid-community
```

**Opção 2: TanStack Table (react-table)**

- **Pros:** Leve, flexível, headless (total controle de UI)
- **Contras:** Requer mais customização para features tipo Excel

```bash
npm install @tanstack/react-table
```

**Recomendação:** Começar com TanStack Table + customizações próprias

### 4.4 Gráficos e Visualizações

**Recomendação: Recharts**

- **Por quê:** Componentes React nativos, fácil integração
- **Tipos:** Gráficos de linha, barra, área para projeções
- **Alternativa:** Chart.js (mais recursos) ou Victory (mais declarativo)

```bash
npm install recharts
```

### 4.5 Manipulação de Números Financeiros

**Recomendação: dinero.js ou decimal.js**

- **Por quê:** Precisão decimal, operações monetárias
- **Uso:** Evitar erros de arredondamento em cálculos financeiros

```bash
npm install decimal.js
```

### 4.6 Formatação de Números

**Recomendação: Intl.NumberFormat (nativo) ou numeral.js**

- **Por quê:** Formatação de moeda, percentuais, números grandes

```bash
npm install numeral  # opcional
```

### 4.7 Persistência Local

**Recomendação: Dexie.js (wrapper do IndexedDB)**

- **Por quê:** Armazenar modelos financeiros localmente
- **Recursos:** Queries, indexação, performance

```bash
npm install dexie
```

### 4.8 Exportação de Dados

**Recomendação: xlsx (SheetJS)**

- **Por quê:** Exportar projeções para Excel
- **Uso:** Geração de planilhas com dados calculados

```bash
npm install xlsx
```

### 4.9 DatePicker e Calendário

**Recomendação: date-fns**

- **Por quê:** Manipulação de datas leve e funcional
- **Uso:** Cálculo de períodos anuais

```bash
npm install date-fns
```

---

## 5. Experiência de Usuário (UX/UI)

### 5.1 Fluxo de Navegação

```
0. Páginas Públicas (Landing, Pricing)
   ↓
1. Autenticação
   ├─ Login (email/senha ou OAuth)
   ├─ Cadastro
   └─ Recuperação de Senha
   ↓
2. Dashboard Inicial (Meus Modelos)
   ↓
3. Criar Novo Modelo / Carregar Modelo
   ↓
4. Configuração Básica (Nome empresa, período projeção)
   ↓
5. Entrada de Dados do Ano Base
   ├─ DRE Ano Base
   └─ Balanço Ano Base
   ↓
6. Entrada de Premissas de Projeção
   ├─ Premissas DRE (por ano)
   └─ Premissas BP (por ano)
   ↓
7. Visualização de Projeções
   ├─ DRE Projetado
   ├─ BP Projetado
   └─ Fluxo de Caixa Livre
   ↓
8. Valuation (FCD)
   ↓
9. Análise de Sensibilidade
```

### 5.2 Componentes de Interface

#### 5.2.1 Entrada de Variáveis

A entrada de variáveis será dividida em duas estruturas distintas, conforme definido nas Regras de Negócio:

---

**A) Variáveis de Entrada do Ano Base (Ano 0)**

São os valores absolutos do ano base da projeção. Apresentadas em formato de **formulário vertical com campos individuais**.

**Formato Recomendado:**

- **Cards organizados por seção:** DRE, Balanço Patrimonial (Ativo, Passivo, PL)
- **Inputs Numéricos Especializados:** Com formatação automática de moeda (R$)
- **Validação em tempo real:** Feedback visual de erros

**Exemplo de Estrutura (DRE Ano Base):**

```
┌─ Variáveis do Ano Base - DRE ───────────────┐
│                                              │
│ Receita Bruta:           [R$ 10.000.000,00] │
│ Impostos e Devoluções:   [R$  1.700.000,00] │
│ CMV:                     [R$  4.150.000,00] │
│ Despesas Operacionais:   [R$  1.660.000,00] │
│ IR/CSLL:                 [R$    580.000,00] │
│ Dividendos:              [R$    348.000,00] │
│                                              │
└──────────────────────────────────────────────┘
```

**Exemplo de Estrutura (Balanço Patrimonial Ano Base):**

```
┌─ Variáveis do Ano Base - Ativo Circulante ──┐
│                                              │
│ Caixa e Equivalentes:    [R$  2.000.000,00] │
│ Aplicações Financeiras:  [R$  1.500.000,00] │
│ Contas a Receber:        [R$  3.200.000,00] │
│ Estoques:                [R$  2.800.000,00] │
│ Ativos Biológicos:       [R$          0,00] │
│ Outros Créditos:         [R$    500.000,00] │
│                                              │
└──────────────────────────────────────────────┘
```

---

**B) Variáveis de Entrada de Projeção (Anos 1 a N)**

São taxas percentuais ou prazos médios aplicados para calcular as projeções. Apresentadas em formato de **tabela horizontal inline editável**, com a variável de projeção posicionada na linha imediatamente abaixo da respectiva conta.

**Formato Recomendado:**

- **Tabela com anos nas colunas:** Anos 1, 2, 3... até 5 ou 10
- **Linha de premissa abaixo de cada conta:** Input editável por ano
- **Inputs Percentuais ou Dias:** Com formatação automática (% ou dias)
- **Copiar valor para direita:** Facilitar preenchimento de valores iguais

**Exemplo de Estrutura (Premissas DRE):**

```
┌─ Premissas de Projeção - DRE ────────────────────────────────────────────────┐
│                                                                               │
│ Conta                      │ Ano 1   │ Ano 2   │ Ano 3   │ Ano 4   │ Ano 5   │
│ ─────────────────────────────────────────────────────────────────────────────│
│ Receita Bruta              │         │         │         │         │         │
│   └─ Taxa Crescimento (%)  │ [15,0%] │ [12,0%] │ [10,0%] │ [8,0%]  │ [6,0%]  │
│ ─────────────────────────────────────────────────────────────────────────────│
│ Impostos e Devoluções      │         │         │         │         │         │
│   └─ Taxa s/ Rec. Bruta (%)│ [17,0%] │ [17,0%] │ [17,0%] │ [17,0%] │ [17,0%] │
│ ─────────────────────────────────────────────────────────────────────────────│
│ CMV                        │         │         │         │         │         │
│   └─ Taxa s/ Rec. Líq. (%) │ [50,0%] │ [49,0%] │ [48,0%] │ [48,0%] │ [47,0%] │
│ ─────────────────────────────────────────────────────────────────────────────│
│ Despesas Operacionais      │         │         │         │         │         │
│   └─ Taxa s/ Rec. Líq. (%) │ [20,0%] │ [19,0%] │ [18,0%] │ [18,0%] │ [17,0%] │
│ ─────────────────────────────────────────────────────────────────────────────│
│ IR/CSLL                    │         │         │         │         │         │
│   └─ Taxa s/ LAIR (%)      │ [34,0%] │ [34,0%] │ [34,0%] │ [34,0%] │ [34,0%] │
│ ─────────────────────────────────────────────────────────────────────────────│
│ Dividendos                 │         │         │         │         │         │
│   └─ Taxa s/ Lucro Líq. (%)│ [30,0%] │ [30,0%] │ [30,0%] │ [30,0%] │ [30,0%] │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Exemplo de Estrutura (Premissas Balanço Patrimonial):**

```
┌─ Premissas de Projeção - Balanço Patrimonial ────────────────────────────────┐
│                                                                               │
│ Conta                      │ Ano 1   │ Ano 2   │ Ano 3   │ Ano 4   │ Ano 5   │
│ ─────────────────────────────────────────────────────────────────────────────│
│ ATIVO CIRCULANTE                                                              │
│ ─────────────────────────────────────────────────────────────────────────────│
│ Caixa e Equivalentes       │         │         │         │         │         │
│   └─ Prazo Médio (dias)    │ [30]    │ [30]    │ [30]    │ [30]    │ [30]    │
│ ─────────────────────────────────────────────────────────────────────────────│
│ Contas a Receber           │         │         │         │         │         │
│   └─ Prazo Médio (dias)    │ [45]    │ [45]    │ [42]    │ [40]    │ [40]    │
│ ─────────────────────────────────────────────────────────────────────────────│
│ Estoques                   │         │         │         │         │         │
│   └─ Prazo Médio (dias)    │ [60]    │ [58]    │ [55]    │ [55]    │ [50]    │
│ ─────────────────────────────────────────────────────────────────────────────│
│ PASSIVO CIRCULANTE                                                            │
│ ─────────────────────────────────────────────────────────────────────────────│
│ Fornecedores               │         │         │         │         │         │
│   └─ Prazo Médio (dias)    │ [35]    │ [35]    │ [35]    │ [35]    │ [35]    │
│ ─────────────────────────────────────────────────────────────────────────────│
│ IMOBILIZADO                                                                   │
│ ─────────────────────────────────────────────────────────────────────────────│
│ Imobilizado Bruto          │         │         │         │         │         │
│   └─ Taxa Depreciação (%)  │ [10,0%] │ [10,0%] │ [10,0%] │ [10,0%] │ [10,0%] │
│   └─ Índice Imob/Vendas    │ [0,15]  │ [0,15]  │ [0,14]  │ [0,14]  │ [0,13]  │
│ ─────────────────────────────────────────────────────────────────────────────│
│ EMPRÉSTIMOS E FINANCIAMENTOS                                                  │
│ ─────────────────────────────────────────────────────────────────────────────│
│ Empréstimos CP + LP        │         │         │         │         │         │
│   └─ Taxa Novos Emprést.(%)│ [5,0%]  │ [5,0%]  │ [3,0%]  │ [2,0%]  │ [0,0%]  │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

**Funcionalidades de UX para Entrada de Projeção:**

- **Copiar valor para todos os anos:** Botão para replicar valor do Ano 1 para demais anos
- **Aplicar tendência:** Definir valor inicial, final e interpolar automaticamente
- **Highlight de célula ativa:** Facilitar navegação por teclado (Tab, Enter)
- **Tooltips explicativos:** Indicar sobre qual base a taxa é aplicada

#### 5.2.2 Demonstrações Financeiras Projetadas

**Formato Recomendado:**

- **Tabela Responsiva:** Anos nas colunas, contas nas linhas
- **Highlight de Contas Calculadas:** Visual diferente para inputs vs calculados
- **Drill-down:** Expandir/colapsar seções (Ativo, Passivo, etc.)

**Exemplo:**

```
┌─ DRE Projetado ─────────────────────────┐
│                Ano 0  Ano 1  Ano 2  ... │
│ Receita Bruta  10.0M  11.5M  12.9M      │
│ (-) Impostos   (1.7M) (2.0M) (2.2M)     │
│ ────────────────────────────────────    │
│ Receita Líq.   8.3M   9.5M   10.7M      │
│ ...                                      │
└──────────────────────────────────────────┘
```

#### 5.2.3 Gráficos de Projeção

**Tipos de Gráficos:**

1. **Linha:** Evolução de receita, lucro, EBITDA ao longo do tempo
2. **Barra Empilhada:** Composição de custos e despesas
3. **Waterfall:** Construção do FCL ano a ano
4. **Área:** EBITDA margin evolution

**Localização:** Abaixo ou ao lado das tabelas de demonstrações

#### 5.2.4 Análise de Sensibilidade

**Formato Recomendado:**

- **Tabela de Tornado:** Variáveis ordenadas por impacto no valuation
- **Grid de Sensibilidade:** Matriz 2D com duas variáveis
- **Gráfico de Cenários:** Comparação de múltiplos cenários

### 5.3 Layout da Aplicação

**Estrutura:**

```
┌────────────────────────────────────────────────────────┐
│ Header (Logo, Nome Modelo, Ações)    [Avatar/Menu Usuário] │
├────┬───────────────────────────────────────────────────┤
│Sidebar│ Main Content Area                                │
│       │                                                   │
│ - Dashboard │                                             │
│ - Inputs  │                                               │
│ - DRE     │                                               │
│ - Balanço │                                               │
│ - FCL     │                                               │
│ - Valuation│                                              │
│ - Sensibilidade│                                          │
│           │                                               │
│ --------- │                                               │
│ - Perfil  │                                               │
│ - Sair    │                                               │
└────┴───────────────────────────────────────────────────┘
```

**Design System:**

- Usar componentes shadcn/ui como base
- Customizar tema com cores neutras e profissionais
- Tipografia clara e legível para números financeiros
- Espaçamento generoso entre seções

---
