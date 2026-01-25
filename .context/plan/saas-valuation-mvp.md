# Plano de Implementação - SaaS de Valuation de Empresas

**Status:** ✅ Fase 1.5 Completa - Autenticação Implementada  
**Última Atualização:** 2026-01-25  
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

## 📦 Estrutura de Dados

### Modelo de Dados Principal

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

---

## 🧮 Motor de Cálculo

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

### Fórmulas do DRE (Conforme Regras de Negócio)

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

### Fórmulas do Balanço Patrimonial (Conforme Regras de Negócio)

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

### Fórmulas do Fluxo de Caixa da Firma (FCFF)

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

### Fórmulas do WACC (Conforme Regras de Negócio)

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

## 📚 Bibliotecas e Ferramentas Complementares

### Gerenciamento de Estado

**Recomendação: Zustand**

- **Por quê:** Mais simples que Redux, menor boilerplate
- **Alternativa:** Redux Toolkit (para projetos maiores)

```bash
npm install zustand
```

### Formulários

**Recomendação: React Hook Form + Zod**

- **Por quê:** Performance, validação tipada, integração com shadcn/ui
- **Recursos:** Validação em tempo real, gerenciamento de estado de formulários

```bash
npm install react-hook-form zod @hookform/resolvers
```

### Tabelas (Experiência Excel-like)

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

### Gráficos e Visualizações

**Recomendação: Recharts**

- **Por quê:** Componentes React nativos, fácil integração
- **Tipos:** Gráficos de linha, barra, área para projeções
- **Alternativa:** Chart.js (mais recursos) ou Victory (mais declarativo)

```bash
npm install recharts
```

### Manipulação de Números Financeiros

**Recomendação: dinero.js ou decimal.js**

- **Por quê:** Precisão decimal, operações monetárias
- **Uso:** Evitar erros de arredondamento em cálculos financeiros

```bash
npm install decimal.js
```

### Formatação de Números

**Recomendação: Intl.NumberFormat (nativo) ou numeral.js**

- **Por quê:** Formatação de moeda, percentuais, números grandes

```bash
npm install numeral  # opcional
```

### Persistência Local

**Recomendação: Dexie.js (wrapper do IndexedDB)**

- **Por quê:** Armazenar modelos financeiros localmente
- **Recursos:** Queries, indexação, performance

```bash
npm install dexie
```

### Exportação de Dados

**Recomendação: xlsx (SheetJS)**

- **Por quê:** Exportar projeções para Excel
- **Uso:** Geração de planilhas com dados calculados

```bash
npm install xlsx
```

### DatePicker e Calendário

**Recomendação: date-fns**

- **Por quê:** Manipulação de datas leve e funcional
- **Uso:** Cálculo de períodos anuais

```bash
npm install date-fns
```

---

## 🎨 Experiência de Usuário (UX/UI)

### Fluxo de Navegação

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

### Componentes de Interface

#### Entrada de Variáveis

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

#### Demonstrações Financeiras Projetadas

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

#### Gráficos de Projeção

**Tipos de Gráficos:**

1. **Linha:** Evolução de receita, lucro, EBITDA ao longo do tempo
2. **Barra Empilhada:** Composição de custos e despesas
3. **Waterfall:** Construção do FCL ano a ano
4. **Área:** EBITDA margin evolution

**Localização:** Abaixo ou ao lado das tabelas de demonstrações

#### Análise de Sensibilidade

**Formato Recomendado:**

- **Tabela de Tornado:** Variáveis ordenadas por impacto no valuation
- **Grid de Sensibilidade:** Matriz 2D com duas variáveis
- **Gráfico de Cenários:** Comparação de múltiplos cenários

### Layout da Aplicação

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

## 🎨 Design System

Sistema centralizado para gerenciamento e manutenção das decisões de design da aplicação.

### Estrutura do Design System

```
src/
├── styles/
│   ├── design-system/
│   │   ├── tokens/
│   │   │   ├── colors.ts          # Paleta de cores
│   │   │   ├── typography.ts      # Fontes e tamanhos
│   │   │   ├── spacing.ts         # Espaçamentos
│   │   │   ├── shadows.ts         # Sombras
│   │   │   ├── borders.ts         # Bordas e raios
│   │   │   ├── breakpoints.ts     # Breakpoints responsivos
│   │   │   └── index.ts           # Export centralizado
│   │   ├── themes/
│   │   │   ├── light.ts           # Tema claro
│   │   │   ├── dark.ts            # Tema escuro
│   │   │   └── index.ts           # Theme provider
│   │   ├── components/
│   │   │   ├── button.ts          # Variantes de botão
│   │   │   ├── input.ts           # Variantes de input
│   │   │   ├── card.ts            # Variantes de card
│   │   │   ├── table.ts           # Estilos de tabela
│   │   │   └── index.ts           # Export componentes
│   │   └── index.ts               # Entry point do Design System
│   └── globals.css                # CSS global com tokens
```

### 🎨 Tokens de Design

#### Paleta de Cores

```typescript
// src/styles/design-system/tokens/colors.ts
export const colors = {
  // Cores Primárias - Azul Profissional
  primary: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6", // Principal
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
    950: "#172554",
  },

  // Cores Secundárias - Slate (Cinza Neutro)
  secondary: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B", // Principal
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
    950: "#020617",
  },

  // Cores de Sucesso - Verde
  success: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E", // Principal
    600: "#16A34A",
    700: "#15803D",
    800: "#166534",
    900: "#14532D",
  },

  // Cores de Alerta - Amarelo
  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B", // Principal
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },

  // Cores de Erro - Vermelho
  error: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444", // Principal
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
  },

  // Cores Financeiras (específicas para valuation)
  financial: {
    positive: "#10B981", // Verde para valores positivos
    negative: "#EF4444", // Vermelho para valores negativos
    neutral: "#6B7280", // Cinza para valores neutros
    highlight: "#8B5CF6", // Roxo para destaques
    projection: "#06B6D4", // Ciano para projeções
  },

  // Cores de Background
  background: {
    primary: "#FFFFFF",
    secondary: "#F8FAFC",
    tertiary: "#F1F5F9",
    inverse: "#0F172A",
  },

  // Cores de Texto
  text: {
    primary: "#0F172A",
    secondary: "#475569",
    tertiary: "#94A3B8",
    inverse: "#FFFFFF",
    disabled: "#CBD5E1",
  },

  // Cores de Borda
  border: {
    default: "#E2E8F0",
    strong: "#CBD5E1",
    focus: "#3B82F6",
  },
} as const;

export type ColorToken = typeof colors;
```

#### Tipografia

```typescript
// src/styles/design-system/tokens/typography.ts
export const typography = {
  // Família de Fontes
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "Fira Code", "monospace"],
    display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
  },

  // Tamanhos de Fonte
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },

  // Peso da Fonte
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Altura de Linha
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },

  // Presets de Texto (combinações prontas)
  presets: {
    // Headings
    h1: {
      fontSize: "2.25rem", // 36px
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontSize: "1.875rem", // 30px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.025em",
    },
    h3: {
      fontSize: "1.5rem", // 24px
      fontWeight: 600,
      lineHeight: 1.375,
    },
    h4: {
      fontSize: "1.25rem", // 20px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.125rem", // 18px
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1rem", // 16px
      fontWeight: 600,
      lineHeight: 1.5,
    },

    // Body Text
    bodyLarge: {
      fontSize: "1.125rem", // 18px
      fontWeight: 400,
      lineHeight: 1.75,
    },
    body: {
      fontSize: "1rem", // 16px
      fontWeight: 400,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: "0.875rem", // 14px
      fontWeight: 400,
      lineHeight: 1.5,
    },

    // Labels & Captions
    label: {
      fontSize: "0.875rem", // 14px
      fontWeight: 500,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: "0.75rem", // 12px
      fontWeight: 400,
      lineHeight: 1.5,
    },

    // Números Financeiros
    financialLarge: {
      fontSize: "2rem", // 32px
      fontWeight: 700,
      lineHeight: 1.2,
      fontFamily: "mono",
    },
    financialMedium: {
      fontSize: "1.25rem", // 20px
      fontWeight: 600,
      lineHeight: 1.3,
      fontFamily: "mono",
    },
    financialSmall: {
      fontSize: "0.875rem", // 14px
      fontWeight: 500,
      lineHeight: 1.4,
      fontFamily: "mono",
    },
  },
} as const;

export type TypographyToken = typeof typography;
```

#### Espaçamento

```typescript
// src/styles/design-system/tokens/spacing.ts
export const spacing = {
  // Escala Base (em rem)
  0: "0",
  px: "1px",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px

  // Espaçamentos Semânticos
  component: {
    xs: "0.5rem", // 8px - Padding interno mínimo
    sm: "0.75rem", // 12px - Padding padrão pequeno
    md: "1rem", // 16px - Padding padrão
    lg: "1.5rem", // 24px - Padding grande
    xl: "2rem", // 32px - Padding extra grande
  },

  layout: {
    gutter: "1.5rem", // 24px - Gap entre colunas
    section: "3rem", // 48px - Gap entre seções
    page: "2rem", // 32px - Padding da página
    sidebar: "16rem", // 256px - Largura da sidebar
    header: "4rem", // 64px - Altura do header
  },
} as const;

export type SpacingToken = typeof spacing;
```

#### Sombras

```typescript
// src/styles/design-system/tokens/shadows.ts
export const shadows = {
  none: "none",

  // Sombras Elevação
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",

  // Sombras Internas
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  innerMd: "inset 0 4px 6px 0 rgb(0 0 0 / 0.1)",

  // Sombras de Foco
  focus: "0 0 0 3px rgb(59 130 246 / 0.5)",
  focusError: "0 0 0 3px rgb(239 68 68 / 0.5)",
  focusSuccess: "0 0 0 3px rgb(34 197 94 / 0.5)",

  // Sombras para Cards
  card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  cardHover:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  cardActive:
    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",

  // Sombras para Dropdown/Modal
  dropdown:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  modal: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
} as const;

export type ShadowToken = typeof shadows;
```

#### Bordas e Raios

```typescript
// src/styles/design-system/tokens/borders.ts
export const borders = {
  // Larguras de Borda
  width: {
    none: "0",
    thin: "1px",
    medium: "2px",
    thick: "4px",
  },

  // Raios de Borda
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    "2xl": "1rem", // 16px
    "3xl": "1.5rem", // 24px
    full: "9999px", // Circular
  },

  // Presets de Componentes
  components: {
    button: "0.5rem", // 8px
    input: "0.5rem", // 8px
    card: "0.75rem", // 12px
    modal: "1rem", // 16px
    badge: "9999px", // Pill
    avatar: "9999px", // Circular
  },
} as const;

export type BorderToken = typeof borders;
```

#### Breakpoints Responsivos

```typescript
// src/styles/design-system/tokens/breakpoints.ts
export const breakpoints = {
  // Valores em pixels
  values: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },

  // Media queries prontas
  up: {
    sm: "@media (min-width: 640px)",
    md: "@media (min-width: 768px)",
    lg: "@media (min-width: 1024px)",
    xl: "@media (min-width: 1280px)",
    "2xl": "@media (min-width: 1536px)",
  },

  down: {
    sm: "@media (max-width: 639px)",
    md: "@media (max-width: 767px)",
    lg: "@media (max-width: 1023px)",
    xl: "@media (max-width: 1279px)",
    "2xl": "@media (max-width: 1535px)",
  },

  // Containers
  container: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1400px",
  },
} as const;

export type BreakpointToken = typeof breakpoints;
```

### 🌓 Sistema de Temas

```typescript
// src/styles/design-system/themes/light.ts
import { colors } from "../tokens/colors";

export const lightTheme = {
  name: "light",
  colors: {
    // Backgrounds
    background: colors.background.primary,
    backgroundSecondary: colors.background.secondary,
    backgroundTertiary: colors.background.tertiary,

    // Surfaces (cards, modals)
    surface: "#FFFFFF",
    surfaceHover: colors.secondary[50],
    surfaceActive: colors.secondary[100],

    // Text
    textPrimary: colors.text.primary,
    textSecondary: colors.text.secondary,
    textTertiary: colors.text.tertiary,
    textDisabled: colors.text.disabled,

    // Borders
    border: colors.border.default,
    borderStrong: colors.border.strong,
    borderFocus: colors.border.focus,

    // Interactive
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    primaryActive: colors.primary[700],

    // Status
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],

    // Financial
    positive: colors.financial.positive,
    negative: colors.financial.negative,
    neutral: colors.financial.neutral,
  },
} as const;

// src/styles/design-system/themes/dark.ts
import { colors } from "../tokens/colors";

export const darkTheme = {
  name: "dark",
  colors: {
    // Backgrounds
    background: colors.secondary[900],
    backgroundSecondary: colors.secondary[800],
    backgroundTertiary: colors.secondary[700],

    // Surfaces (cards, modals)
    surface: colors.secondary[800],
    surfaceHover: colors.secondary[700],
    surfaceActive: colors.secondary[600],

    // Text
    textPrimary: colors.secondary[50],
    textSecondary: colors.secondary[300],
    textTertiary: colors.secondary[400],
    textDisabled: colors.secondary[500],

    // Borders
    border: colors.secondary[700],
    borderStrong: colors.secondary[600],
    borderFocus: colors.primary[400],

    // Interactive
    primary: colors.primary[400],
    primaryHover: colors.primary[300],
    primaryActive: colors.primary[500],

    // Status
    success: colors.success[400],
    warning: colors.warning[400],
    error: colors.error[400],

    // Financial
    positive: "#34D399",
    negative: "#F87171",
    neutral: colors.secondary[400],
  },
} as const;
```

### 🔧 Implementação Tailwind CSS

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";
import { colors } from "./src/styles/design-system/tokens/colors";
import { typography } from "./src/styles/design-system/tokens/typography";
import { spacing } from "./src/styles/design-system/tokens/spacing";
import { shadows } from "./src/styles/design-system/tokens/shadows";
import { borders } from "./src/styles/design-system/tokens/borders";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        financial: colors.financial,
      },
      fontFamily: {
        sans: typography.fontFamily.sans,
        mono: typography.fontFamily.mono,
        display: typography.fontFamily.display,
      },
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
      spacing: {
        "component-xs": spacing.component.xs,
        "component-sm": spacing.component.sm,
        "component-md": spacing.component.md,
        "component-lg": spacing.component.lg,
        "component-xl": spacing.component.xl,
        "layout-gutter": spacing.layout.gutter,
        "layout-section": spacing.layout.section,
        "layout-page": spacing.layout.page,
        "layout-sidebar": spacing.layout.sidebar,
        "layout-header": spacing.layout.header,
      },
      boxShadow: shadows,
      borderRadius: borders.radius,
      borderWidth: borders.width,
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
```

### 📦 CSS Global com Variáveis

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Colors */
    --color-primary: 59 130 246;
    --color-primary-foreground: 255 255 255;

    /* Backgrounds */
    --background: 255 255 255;
    --background-secondary: 248 250 252;
    --foreground: 15 23 42;

    /* Cards */
    --card: 255 255 255;
    --card-foreground: 15 23 42;

    /* Borders */
    --border: 226 232 240;
    --border-focus: 59 130 246;

    /* Inputs */
    --input: 226 232 240;
    --ring: 59 130 246;

    /* Status Colors */
    --success: 34 197 94;
    --warning: 245 158 11;
    --error: 239 68 68;

    /* Financial */
    --financial-positive: 16 185 129;
    --financial-negative: 239 68 68;
    --financial-neutral: 107 114 128;

    /* Radius */
    --radius: 0.5rem;
  }

  .dark {
    --background: 15 23 42;
    --background-secondary: 30 41 59;
    --foreground: 248 250 252;

    --card: 30 41 59;
    --card-foreground: 248 250 252;

    --border: 51 65 85;
    --border-focus: 96 165 250;

    --input: 51 65 85;
    --ring: 96 165 250;

    --financial-positive: 52 211 153;
    --financial-negative: 248 113 113;
    --financial-neutral: 148 163 184;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings:
      "rlig" 1,
      "calt" 1;
  }

  /* Typography Base */
  h1 {
    @apply text-4xl font-bold tracking-tight;
  }
  h2 {
    @apply text-3xl font-semibold tracking-tight;
  }
  h3 {
    @apply text-2xl font-semibold;
  }
  h4 {
    @apply text-xl font-semibold;
  }
  h5 {
    @apply text-lg font-semibold;
  }
  h6 {
    @apply text-base font-semibold;
  }
}

@layer utilities {
  /* Financial Number Utilities */
  .financial-positive {
    @apply text-financial-positive font-mono font-semibold;
  }

  .financial-negative {
    @apply text-financial-negative font-mono font-semibold;
  }

  .financial-neutral {
    @apply text-financial-neutral font-mono;
  }

  /* Card Variants */
  .card-elevated {
    @apply bg-card shadow-card hover:shadow-cardHover transition-shadow;
  }

  .card-outlined {
    @apply bg-card border border-border;
  }

  /* Focus States */
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2;
  }
}
```

### 🧩 Componentes Base Estilizados

```typescript
// src/styles/design-system/components/button.ts
export const buttonVariants = {
  base: "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",

  variants: {
    variant: {
      primary:
        "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700",
      secondary:
        "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300",
      outline:
        "border border-border bg-transparent hover:bg-secondary-50 active:bg-secondary-100",
      ghost: "bg-transparent hover:bg-secondary-50 active:bg-secondary-100",
      destructive:
        "bg-error-500 text-white hover:bg-error-600 active:bg-error-700",
      success:
        "bg-success-500 text-white hover:bg-success-600 active:bg-success-700",
    },
    size: {
      xs: "h-7 px-2 text-xs",
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-6 text-base",
      xl: "h-12 px-8 text-lg",
      icon: "h-10 w-10",
    },
  },

  defaultVariants: {
    variant: "primary",
    size: "md",
  },
} as const;

// src/styles/design-system/components/input.ts
export const inputVariants = {
  base: "flex w-full rounded-lg border bg-background px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",

  variants: {
    variant: {
      default: "border-border focus-visible:border-primary-500",
      error: "border-error-500 focus-visible:ring-error-500",
      success: "border-success-500 focus-visible:ring-success-500",
    },
    size: {
      sm: "h-8 px-2 text-sm",
      md: "h-10 px-3 text-sm",
      lg: "h-12 px-4 text-base",
    },
  },

  defaultVariants: {
    variant: "default",
    size: "md",
  },
} as const;

// src/styles/design-system/components/card.ts
export const cardVariants = {
  base: "rounded-xl border bg-card text-card-foreground",

  variants: {
    variant: {
      default: "border-border shadow-card",
      elevated: "border-transparent shadow-lg",
      outlined: "border-border shadow-none",
      ghost: "border-transparent bg-transparent shadow-none",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },

  defaultVariants: {
    variant: "default",
    padding: "md",
  },
} as const;

// src/styles/design-system/components/table.ts
export const tableVariants = {
  // Tabelas financeiras específicas
  financial: {
    table: "w-full text-sm",
    header: "bg-secondary-50 dark:bg-secondary-800",
    headerCell:
      "px-4 py-3 text-left font-semibold text-secondary-700 dark:text-secondary-300",
    headerCellNumeric:
      "px-4 py-3 text-right font-semibold text-secondary-700 dark:text-secondary-300 font-mono",
    row: "border-b border-border hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors",
    cell: "px-4 py-3",
    cellNumeric: "px-4 py-3 text-right font-mono",
    cellPositive: "px-4 py-3 text-right font-mono text-financial-positive",
    cellNegative: "px-4 py-3 text-right font-mono text-financial-negative",
    footer: "bg-secondary-100 dark:bg-secondary-700 font-semibold",
    footerCell: "px-4 py-3",
  },
} as const;
```

### 📤 Export Centralizado

```typescript
// src/styles/design-system/index.ts
// Tokens
export * from "./tokens/colors";
export * from "./tokens/typography";
export * from "./tokens/spacing";
export * from "./tokens/shadows";
export * from "./tokens/borders";
export * from "./tokens/breakpoints";

// Themes
export * from "./themes/light";
export * from "./themes/dark";

// Component Styles
export * from "./components/button";
export * from "./components/input";
export * from "./components/card";
export * from "./components/table";
```

### ✅ Tarefas de Implementação do Design System

**Status:** 🔲 Não Iniciado  
**Esforço:** 1-2 dias

**Tarefas:**

1. 🔲 Criar estrutura de pastas do Design System
2. 🔲 Implementar arquivos de tokens (colors, typography, spacing, shadows, borders, breakpoints)
3. 🔲 Configurar sistema de temas (light/dark)
4. 🔲 Integrar tokens no `tailwind.config.ts`
5. 🔲 Criar variáveis CSS no `globals.css`
6. 🔲 Implementar variantes de componentes base
7. 🔲 Criar export centralizado
8. 🔲 Atualizar componentes existentes para usar Design System
9. 🔲 Documentar uso dos tokens no código

**Critérios de Aceite:**

- Todos os tokens exportados e funcionando
- Tema claro/escuro alternando corretamente
- Componentes usando tokens do Design System
- Build sem erros TypeScript

---

## �🎯 Fases de Desenvolvimento

### 📦 Fase 1: Setup e Fundação (1-2 semanas)

**Status:** ✅ Concluída em 2026-01-24  
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
   import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
   import { NextResponse } from "next/server";
   import type { NextRequest } from "next/server";

   export async function middleware(req: NextRequest) {
     const res = NextResponse.next();
     const supabase = createMiddlewareClient({ req, res });
     const {
       data: { session },
     } = await supabase.auth.getSession();

     // Proteger rotas do dashboard
     if (req.nextUrl.pathname.startsWith("/dashboard") && !session) {
       return NextResponse.redirect(new URL("/login", req.url));
     }

     return res;
   }

   export const config = {
     matcher: ["/dashboard/:path*", "/model/:path*", "/profile/:path*"],
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
   import { createBrowserClient } from "@supabase/ssr";

   export function createClient() {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
     );
   }

   // src/lib/supabase/server.ts (Server Components/Actions)
   import { createServerClient } from "@supabase/ssr";
   import { cookies } from "next/headers";

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
             cookieStore.set({ name, value: "", ...options });
           },
         },
       },
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
   "use server";

   import { createClient } from "@/lib/supabase/server";
   import { redirect } from "next/navigation";
   import { revalidatePath } from "next/cache";

   export async function signIn(formData: FormData) {
     const supabase = createClient();
     const email = formData.get("email") as string;
     const password = formData.get("password") as string;

     const { error } = await supabase.auth.signInWithPassword({
       email,
       password,
     });

     if (error) {
       return { error: error.message };
     }

     revalidatePath("/", "layout");
     redirect("/dashboard");
   }

   export async function signUp(formData: FormData) {
     /* ... */
   }
   export async function signOut() {
     /* ... */
   }
   export async function resetPassword(formData: FormData) {
     /* ... */
   }
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
   import { createClient } from "@/lib/supabase/server";
   import { redirect } from "next/navigation";

   export async function requireAuth() {
     const supabase = createClient();
     const {
       data: { user },
     } = await supabase.auth.getUser();

     if (!user) {
       redirect("/login");
     }

     return user;
   }
   ```

**1.5.5 - Persistência de Modelos via Server Actions**

1. ✅ Criar Server Actions para modelos (`src/lib/actions/models.ts`)

   ```typescript
   "use server";

   import { createClient } from "@/lib/supabase/server";
   import { revalidatePath } from "next/cache";
   import type { FinancialModel } from "@/core/types";

   export async function createModel(data: Partial<FinancialModel>) {
     const supabase = createClient();
     const {
       data: { user },
     } = await supabase.auth.getUser();

     const { data: model, error } = await supabase
       .from("financial_models")
       .insert({ ...data, user_id: user!.id })
       .select()
       .single();

     if (error) throw error;

     revalidatePath("/dashboard");
     return model;
   }

   export async function updateModel(
     id: string,
     data: Partial<FinancialModel>,
   ) {
     const supabase = createClient();

     const { error } = await supabase
       .from("financial_models")
       .update({ ...data, updated_at: new Date().toISOString() })
       .eq("id", id);

     if (error) throw error;

     revalidatePath(`/model/${id}`);
   }

   export async function deleteModel(id: string) {
     /* ... */
   }
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

> 📌 **Referência:** As fórmulas detalhadas de DRE, Balanço Patrimonial, FCFF e WACC estão documentadas na seção [Motor de Cálculo](#motor-de-calculo). Use essa seção como fonte canônica para implementação das funções de cálculo.

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
   import Decimal from "decimal.js";
   import type {
     DREBaseInputs,
     DREProjectionInputs,
     DRECalculated,
     CalculationResult,
   } from "../types";

   export function calculateDRE(
     baseInputs: DREBaseInputs,
     projectionInputs: DREProjectionInputs,
     previousYear: DRECalculated,
     depreciacaoAmortizacao: number,
     despesasFinanceiras: number,
   ): CalculationResult<DRECalculated> {
     // Implementação com decimal.js para precisão
     const receitaBruta = new Decimal(previousYear.receitaBruta).times(
       1 + projectionInputs.taxaCrescimentoReceita / 100,
     );
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
   import type { FinancialModelInput, FullValuationResult } from "../types";
   import { validateFinancialModelInput } from "../validators";
   import { calculateAllDRE } from "./dre";
   import { calculateAllBalanceSheet } from "./balanceSheet";
   import { calculateAllFCFF } from "./fcff";
   import { calculateValuation } from "./valuation";

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
     input: FinancialModelInput,
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
   export { executeFullValuation } from "./calculations/fullValuation";

   // Funções individuais de cálculo
   export { calculateDRE, calculateAllDRE } from "./calculations/dre";
   export {
     calculateBalanceSheet,
     calculateAllBalanceSheet,
   } from "./calculations/balanceSheet";
   export { calculateFCFF, calculateAllFCFF } from "./calculations/fcff";
   export { calculateWACC } from "./calculations/wacc";
   export { calculateValuation } from "./calculations/valuation";
   export {
     calculateSensitivityUnivariate,
     calculateSensitivityBivariate,
   } from "./calculations/sensitivity";

   // Validators
   export {
     validateDREBaseInputs,
     validateFinancialModelInput,
   } from "./validators";

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
   } from "./types";
   ```

**2.2 - Server Actions para Cálculos**

1. ✅ Criar Server Action para valuation (`src/lib/actions/valuation.ts`)

   ```typescript
   "use server";

   import { executeFullValuation } from "@/core";
   import { createClient } from "@/lib/supabase/server";
   import type { FinancialModelInput, FullValuationResult } from "@/core/types";

   export async function calculateValuationAction(
     modelId: string,
     input: FinancialModelInput,
   ): Promise<FullValuationResult> {
     // 1. Verificar autenticação
     const supabase = createClient();
     const {
       data: { user },
     } = await supabase.auth.getUser();
     if (!user) {
       return { success: false, errors: [{ message: "Não autenticado" }] };
     }

     // 2. Executar cálculo no servidor
     const result = executeFullValuation(input);

     // 3. Salvar resultado no modelo (opcional)
     if (result.success && modelId) {
       await supabase
         .from("financial_models")
         .update({
           data: { ...input, results: result.data },
           updated_at: new Date().toISOString(),
         })
         .eq("id", modelId);
     }

     return result;
   }
   ```

**2.3 - API Routes para Acesso Externo**

1. ✅ Criar API Route para valuation (`src/app/api/valuation/route.ts`)

   ```typescript
   // src/app/api/valuation/route.ts
   import { NextRequest, NextResponse } from "next/server";
   import { createClient } from "@/lib/supabase/server";
   import { executeFullValuation } from "@/core";
   import type { FinancialModelInput } from "@/core/types";

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
       const {
         data: { user },
       } = await supabase.auth.getUser();

       // Alternativa: verificar API Key no header
       const apiKey = request.headers.get("X-API-Key");

       if (!user && !apiKey) {
         return NextResponse.json(
           { success: false, error: "Unauthorized" },
           { status: 401 },
         );
       }

       // 2. Validar e executar
       const input: FinancialModelInput = await request.json();
       const result = executeFullValuation(input);

       // 3. Retornar resultado
       return NextResponse.json(result);
     } catch (error) {
       return NextResponse.json(
         { success: false, error: "Internal server error" },
         { status: 500 },
       );
     }
   }

   /**
    * GET /api/valuation?modelId=xxx
    *
    * Retorna o último resultado de valuation de um modelo salvo.
    */
   export async function GET(request: NextRequest) {
     const modelId = request.nextUrl.searchParams.get("modelId");
     // ... implementação
   }
   ```

2. ✅ Criar API Route para sensibilidade (`src/app/api/sensitivity/route.ts`)

   ```typescript
   // src/app/api/sensitivity/route.ts
   import { NextRequest, NextResponse } from "next/server";
   import {
     calculateSensitivityUnivariate,
     calculateSensitivityBivariate,
   } from "@/core";

   export async function POST(request: NextRequest) {
     const { type, ...params } = await request.json();

     if (type === "univariate") {
       const result = calculateSensitivityUnivariate(
         params.baseModel,
         params.variableName,
         params.baseValue,
         params.minValue,
         params.maxValue,
         params.step,
       );
       return NextResponse.json({ success: true, data: result });
     }

     if (type === "bivariate") {
       const result = calculateSensitivityBivariate(
         params.baseModel,
         params.variable1Name,
         params.variable1Values,
         params.variable2Name,
         params.variable2Values,
       );
       return NextResponse.json({ success: true, data: result });
     }

     return NextResponse.json(
       { success: false, error: "Invalid type" },
       { status: 400 },
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
   import { defineConfig } from "vitest/config";

   export default defineConfig({
     test: {
       include: ["src/core/**/*.test.ts"],
       environment: "node", // Core não precisa de DOM
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

_Objetivos e tarefas permanecem similares, mas com implementação via Server Components e API Routes._

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
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // Para grids grandes, considerar streaming
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (const scenario of scenarios) {
        const result = calculateScenario(scenario);
        controller.enqueue(encoder.encode(JSON.stringify(result) + "\n"));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson" },
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
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  const modelId = request.nextUrl.searchParams.get("modelId");

  // Carregar modelo e gerar Excel
  const workbook = generateExcelWorkbook(model);
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${model.companyName}_Valuation.xlsx"`,
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

| Risco                             | Probabilidade | Impacto | Mitigação                                |
| --------------------------------- | ------------- | ------- | ---------------------------------------- |
| Complexidade do App Router        | Média         | Médio   | Seguir docs oficiais, começar simples    |
| Confusão Server/Client Components | Alta          | Médio   | Documentar bem, `'use client'` explícito |
| Cold starts em API Routes         | Baixa         | Baixo   | Usar Vercel (otimizado), considerar Edge |
| Latência de Server Actions        | Baixa         | Médio   | Feedback visual (loading states)         |

---

## 📚 Referências Atualizadas

- **Next.js:** https://nextjs.org/docs
- **Next.js App Router:** https://nextjs.org/docs/app
- **Server Actions:** https://nextjs.org/docs/app/api-reference/functions/server-actions
- **Supabase + Next.js:** https://supabase.com/docs/guides/auth/server-side/nextjs
- **Route Handlers:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers

_(demais referências permanecem)_

---

## 📅 Timeline Estimado (Atualizado)

**Total:** 14-20 semanas (3.5-5 meses com 1 desenvolvedor full-time)

| Fase                            | Duração     | Acumulado         |
| ------------------------------- | ----------- | ----------------- |
| Fase 1: Setup Next.js           | 1-2 semanas | 1-2 semanas       |
| Fase 1.5: Auth + Server Actions | 1-2 semanas | 2-4 semanas       |
| Fase 2: Motor de Cálculo + API  | 3-4 semanas | 5-8 semanas       |
| Fase 3: Visualização            | 2-3 semanas | 7-11 semanas      |
| Fase 4: Valuation               | 2 semanas   | 9-13 semanas      |
| Fase 5: Sensibilidade           | 2 semanas   | 11-15 semanas     |
| Fase 6: Exportação              | 1 semana    | 12-16 semanas     |
| Fase 7: Refinamento             | 2-4 semanas | **14-20 semanas** |

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
     bpCalculated: BalanceSheetCalculated,
   ): CalculationResult<FCFFCalculated>;
   ```

   **Fórmula:**
   - FCFF(i) = EBIT(i) - NCG(i) - CAPEX(i)

4. ✅ Implementar cálculo de WACC (`core/calculations/wacc.ts`)

   ```typescript
   export function calculateWACC(
     assumptions: Assumptions,
     bpCalculated: BalanceSheetCalculated,
   ): CalculationResult<WACCCalculation>;
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
   import Decimal from "decimal.js";

   const receitaBruta = new Decimal(previousYear.receitaBruta).times(
     1 + projectionInputs.receitaBrutaGrowth / 100,
   );
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
     input: FinancialModelInput,
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

   export function validateDREBaseInputs(
     data: unknown,
   ): ValidationResult<DREBaseInputs> {
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
   export { executeFullValuation } from "./calculations/fullValuation";
   export { calculateDRE, calculateAllDRE } from "./calculations/dre";
   export {
     calculateBalanceSheet,
     calculateAllBalanceSheet,
   } from "./calculations/balanceSheet";
   export { calculateFCFF, calculateAllFCFF } from "./calculations/fcff";
   export { calculateWACC } from "./calculations/wacc";
   export { calculateValuation } from "./calculations/valuation";
   export {
     validateDREBaseInputs,
     validateFinancialModelInput,
   } from "./validators";
   export type {
     FinancialModel,
     FinancialModelInput,
     DRECalculated,
     BalanceSheetCalculated,
     FCFFCalculated,
     ValuationResults,
     FullValuationResult,
     CalculationResult,
   } from "./types";
   ```

**Critério de Aceite para Core:**

```typescript
// Deve ser possível executar valuation completo assim:
import { executeFullValuation } from "./core";

const inputData = {
  /* ... */
};
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
     return new Intl.NumberFormat("pt-BR", {
       style: "currency",
       currency: "BRL",
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
     return fcff.map((f) => f.fcff);
   }
   ```

2. ✅ Implementar cálculo de Valor Presente dos FCLs (`core/calculations/valuation.ts`)

   ```typescript
   export function calculatePresentValue(
     fcl: number[],
     waccByYear: number[],
   ): number[] {
     return fcl.map((fcl, i) => {
       const discountFactor = waccByYear
         .slice(0, i + 1)
         .reduce((acc, wacc) => acc * (1 + wacc / 100), 1);
       return fcl / discountFactor;
     });
   }
   ```

3. ✅ Implementar cálculo de Valor Terminal (`core/calculations/valuation.ts`)

   ```typescript
   export function calculateTerminalValue(
     lastYearFCL: number,
     wacc: number,
     perpetualGrowthRate: number,
   ): number {
     // Valor Terminal = FCL(último ano) × (1 + g) / (WACC - g)
     return (
       (lastYearFCL * (1 + perpetualGrowthRate / 100)) /
       (wacc / 100 - perpetualGrowthRate / 100)
     );
   }

   export function calculatePresentValueTerminal(
     terminalValue: number,
     waccByYear: number[],
   ): number {
     const discountFactor = waccByYear.reduce(
       (acc, wacc) => acc * (1 + wacc / 100),
       1,
     );
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
     step: number,
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
     variable2Values: number[],
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
   self.addEventListener("message", (e) => {
     const { model, scenarios } = e.data;
     const results = scenarios.map((scenario) => calculateValuation(scenario));
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
   import * as XLSX from "xlsx";

   export function exportToExcel(model: FinancialModel): void {
     // Criar workbook
     const wb = XLSX.utils.book_new();

     // Aba 1: DRE Projetado
     const dreFData = model.dre.calculatedAccounts.map((dre) => ({
       Ano: dre.year,
       "Receita Bruta": dre.receitaBruta,
       "Impostos e Devoluções": dre.impostosEDevolucoes,
       "Receita Líquida": dre.receitaLiquida,
       CMV: dre.cmv,
       "Lucro Bruto": dre.lucroBruto,
       "Despesas Operacionais": dre.despesasOperacionais,
       EBIT: dre.ebit,
       EBITDA: dre.ebitda,
       "Lucro Líquido": dre.lucroLiquido,
     }));
     const dreWS = XLSX.utils.json_to_sheet(dreData);
     XLSX.utils.book_append_sheet(wb, dreWS, "DRE");

     // Aba 2: Balanço Patrimonial
     // ... similar

     // Aba 3: Fluxo de Caixa Livre
     // ... similar

     // Aba 4: Valuation
     const valuationData = [
       {
         Métrica: "Enterprise Value",
         Valor: model.valuationResults.enterpriseValue,
       },
       { Métrica: "Equity Value", Valor: model.valuationResults.equityValue },
       { Métrica: "Preço por Ação", Valor: model.valuationResults.sharePrice },
     ];
     const valuationWS = XLSX.utils.json_to_sheet(valuationData);
     XLSX.utils.book_append_sheet(wb, valuationWS, "Valuation");

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
   
   **Data:** ${new Date().toLocaleDateString("pt-BR")}
   
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
   ${model.sensitivity ? renderSensitivityAnalysis(model.sensitivity) : "Não disponível"}
     `;
   }
   ```

2. ✅ Converter Markdown para HTML (opcional)

   ```bash
   npm install marked
   ```

   ```typescript
   import { marked } from "marked";

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
     [],
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
   import { useToast } from "@/components/ui/use-toast";

   const { toast } = useToast();

   toast({
     title: "Modelo salvo com sucesso!",
     description: "Suas alterações foram sincronizadas na nuvem.",
     variant: "default",
   });
   ```

4. ✅ Retry automático em caso de falha de rede
   ```typescript
   async function saveModelWithRetry(
     data: FinancialModel,
     retries = 3,
   ): Promise<void> {
     try {
       await supabase.from("financial_models").update(data);
     } catch (error) {
       if (retries > 0) {
         await new Promise((resolve) => setTimeout(resolve, 1000));
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

| Risco                                 | Probabilidade | Impacto | Mitigação                                                                            |
| ------------------------------------- | ------------- | ------- | ------------------------------------------------------------------------------------ |
| Complexidade dos cálculos financeiros | Média         | Alto    | Validar fórmulas com especialista financeiro, testes unitários extensivos            |
| Performance com 10 anos de projeção   | Média         | Médio   | Otimização precoce (memoização), web workers para cálculos pesados                   |
| UX confusa para usuários não técnicos | Alta          | Alto    | Testes de usabilidade desde Fase 3, tooltips e ajuda contextual                      |
| Precisão decimal em cálculos          | Baixa         | Alto    | Usar decimal.js para operações financeiras (evitar erros de arredondamento)          |
| Falhas de autenticação/segurança      | Baixa         | Crítico | Usar Supabase Auth (testado e auditado), RLS no banco, nunca expor segredos no front |
| Perda de dados do usuário             | Baixa         | Alto    | Auto-save frequente (2s debounce), backups automáticos do Supabase, versionamento    |
| Scope creep (expansão de escopo)      | Alta          | Médio   | Manter foco no MVP, adiar features para v2.0, revisões semanais de progresso         |

---

## 📚 Referências

- **Regras de Negócio:** [Regras de Negocio (Jaime).md](<../Regras%20de%20Negocio%20(Jaime).md>)
- **Contexto Geral:** [Contexto para Plano de App (Jaime).md](<../Contexto%20para%20Plano%20de%20App%20(Jaime).md>)
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

| Fase                      | Duração     | Acumulado         |
| ------------------------- | ----------- | ----------------- |
| Fase 1: Setup             | 1-2 semanas | 1-2 semanas       |
| Fase 1.5: Autenticação    | 1-2 semanas | 2-4 semanas       |
| Fase 2: Entrada e Cálculo | 3-4 semanas | 5-8 semanas       |
| Fase 3: Visualização      | 2-3 semanas | 7-11 semanas      |
| Fase 4: Valuation         | 2 semanas   | 9-13 semanas      |
| Fase 5: Sensibilidade     | 2 semanas   | 11-15 semanas     |
| Fase 6: Exportação        | 1 semana    | 12-16 semanas     |
| Fase 7: Refinamento       | 1-2 semanas | **13-18 semanas** |

---

**Última Atualização:** 2026-01-22  
**Versão do Plano:** 1.0  
**Status Geral:** 🟡 Planejamento Concluído, Aguardando Início da Implementação
