// src/core/types/index.ts

// ============================================================
// Interfaces genéricas (legado - mantidas para compatibilidade)
// ============================================================

/** @deprecated Use FullValuationInput + FullValuationResult */
export interface FinancialModel {
  id: string;
  userId: string;
  companyName: string;
  ticker?: string;
  createdAt: Date;
  updatedAt: Date;
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  assumptions: Assumptions;
  results?: ValuationResults;
}

/** @deprecated Use DRECalculated */
export interface IncomeStatement {
  years: number[];
  revenue: number[];
  cogs: number[];
  grossProfit: number[];
  operatingExpenses: number[];
  ebit: number[];
  interestExpense: number[];
  taxRate: number[];
  netIncome: number[];
}

/** @deprecated Use BalanceSheetCalculated */
export interface BalanceSheet {
  years: number[];
  cash: number[];
  accountsReceivable: number[];
  inventory: number[];
  currentAssets: number[];
  ppe: number[];
  totalAssets: number[];
  accountsPayable: number[];
  currentLiabilities: number[];
  longTermDebt: number[];
  totalLiabilities: number[];
  equity: number[];
}

/** @deprecated Use FCFFCalculated */
export interface CashFlowStatement {
  years: number[];
  operatingCashFlow: number[];
  capex: number[];
  freeCashFlow: number[];
}

/** @deprecated Use WACCCalculation */
export interface Assumptions {
  wacc: number;
  terminalGrowthRate: number;
  projectionYears: number;
  taxRate: number;
  riskFreeRate?: number;
  marketRiskPremium?: number;
  beta?: number;
  debtCost?: number;
  debtToEquity?: number;
}

/** @deprecated Use ValuationCalculated */
export interface ValuationResults {
  presentValueCashFlows: number[];
  terminalValue: number;
  presentValueTerminalValue: number;
  enterpriseValue: number;
  equityValue: number;
  sharePrice?: number;
  sharesOutstanding?: number;
}

export interface APIRequest {
  model: Partial<FinancialModel>;
  action: "calculate" | "sensitivity" | "save";
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================
// Resultado genérico de cálculos
// ============================================================

export interface CalculationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// ============================================================
// DRE - Demonstração do Resultado do Exercício
// ============================================================

/**
 * Dados de entrada do Ano Base da DRE.
 * Valores absolutos inseridos pelo usuário.
 */
export interface DREBaseInputs {
  receitaBruta: number;
  impostosEDevolucoes: number;
  cmv: number;
  despesasOperacionais: number;
  irCSLL: number;
  dividendos: number;
}

/**
 * Premissas de projeção da DRE para um ano específico.
 * Taxas percentuais (em %, ex: 5 = 5%).
 */
export interface DREProjectionInputs {
  year: number;
  receitaBrutaGrowth: number;       // % crescimento sobre receita bruta anterior
  impostosEDevolucoesRate: number;  // % sobre Receita Bruta
  cmvRate: number;                   // % sobre Receita Líquida
  despesasOperacionaisRate: number;  // % sobre Receita Líquida
  irCSLLRate: number;               // % sobre LAIR
  dividendosRate: number;           // % sobre Lucro Líquido
}

/**
 * DRE calculada para um ano (projetado ou ano base).
 * Todos os valores em R$.
 */
export interface DRECalculated {
  year: number;
  receitaBruta: number;
  impostosEDevolucoes: number;
  receitaLiquida: number;
  cmv: number;
  lucroBruto: number;
  despesasOperacionais: number;
  ebit: number;
  depreciacaoAmortizacao: number;  // vem do Balanço Patrimonial
  ebitda: number;
  despesasFinanceiras: number;     // calculado via BP (juros sobre dívida)
  lucroAntesIR: number;
  irCSLL: number;
  lucroLiquido: number;
  dividendos: number;
}

// ============================================================
// Balanço Patrimonial
// ============================================================

/**
 * Dados de entrada do Ano Base do Balanço Patrimonial.
 * Estrutura nested por seção contábil.
 */
export interface BalanceSheetBaseInputs {
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

/**
 * Premissas de projeção do Balanço Patrimonial para um ano específico.
 * Prazos em dias, taxas em % (ex: 10 = 10%).
 */
export interface BalanceSheetProjectionInputs {
  year: number;
  taxaDepreciacao: number;           // % sobre Imobilizado Bruto
  indiceImobilizadoVendas: number;   // decimal (ex: 0.15 = 15% da receita bruta)

  // Prazos médios - Ativo Circulante (dias)
  prazoCaixaEquivalentes: number;
  prazoAplicacoesFinanceiras: number;
  prazoContasReceber: number;
  prazoEstoques: number;
  prazoAtivosBiologicos: number;

  // Prazos médios - Passivo Circulante (dias)
  prazoFornecedores: number;
  prazoImpostosAPagar: number;
  prazoObrigacoesSociais: number;

  // Empréstimos
  taxaNovosEmprestimosCP: number;  // % de crescimento da dívida de Curto Prazo
  taxaNovosEmprestimosLP: number;  // % de crescimento da dívida de Longo Prazo
  taxaJurosEmprestimo: number;     // % a.a. sobre dívida total → base para Kd no WACC
}

/**
 * Balanço Patrimonial calculado para um ano.
 * Estrutura nested com totais por seção.
 */
export interface BalanceSheetCalculated {
  year: number;

  ativoCirculante: {
    caixaEquivalentes: number;
    aplicacoesFinanceiras: number;
    contasReceber: number;
    estoques: number;
    ativosBiologicos: number;
    outrosCreditos: number;
    total: number;
  };

  ativoRealizavelLP: {
    investimentos: number;
    imobilizadoBruto: number;
    depreciacaoAcumulada: number;
    imobilizado: number; // Imobilizado Bruto - Depreciação Acumulada
    intangivel: number;
    total: number;
  };

  passivoCirculante: {
    fornecedores: number;
    impostosAPagar: number;
    obrigacoesSociaisETrabalhistas: number;
    emprestimosFinanciamentosCP: number;
    outrasObrigacoes: number;
    total: number;
  };

  passivoRealizavelLP: {
    emprestimosFinanciamentosLP: number;
    total: number;
  };

  patrimonioLiquido: {
    capitalSocial: number;
    lucrosAcumulados: number;
    total: number;
  };

  // Contas auxiliares calculadas
  depreciacaoAnual: number;
  capex: number;
  novosEmprestimosFinanciamentosCP: number;
  novosEmprestimosFinanciamentosLP: number;
  despesasFinanceiras: number; // dívida total × taxaJurosEmprestimo
  capitalGiro: number;
  ncg: number; // Necessidade de Capital de Giro (variação)

  // Totais gerais
  ativoTotal: number;
  passivoTotal: number; // Passivo + PL
}

// ============================================================
// FCFF - Fluxo de Caixa Livre para a Firma
// ============================================================

export interface FCFFCalculated {
  year: number;
  ebit: number;
  impostos: number;
  nopat: number;
  depreciacaoAmortizacao: number;
  capex: number;
  ncg: number; // Variação do Capital de Giro
  fcff: number; // FCFF = EBIT - NCG - CAPEX (conforme PRD)
}

// ============================================================
// WACC
// ============================================================

export interface WACCCalculation {
  custoCapitalProprio: number;
  custoCapitalTerceiros: number;
  wacc: number;
  pesoCapitalProprio: number;
  pesoCapitalTerceiros: number;
}

// ============================================================
// Valuation
// ============================================================

export interface ValuationInputs {
  fcff: FCFFCalculated[];
  wacc: number;
  taxaCrescimentoPerpetuo: number;
  anoBase: number;
}

export interface ValuationCalculated {
  valorPresenteFCFF: number[];
  valorTerminal: number;
  valorPresenteTerminal: number;
  valorEmpresa: number;
  valorPatrimonioLiquido: number;
}

// ============================================================
// Full Valuation (Orquestração Completa)
// ============================================================

export interface FullValuationInput {
  dreBase: DREBaseInputs;
  dreProjection: DREProjectionInputs[];
  balanceSheetBase: BalanceSheetBaseInputs;
  balanceSheetProjection: BalanceSheetProjectionInputs[];
  wacc: WACCCalculation;
  taxaCrescimentoPerpetuo: number;
  anosProjecao: number;
}

export interface FullValuationResult {
  dre: DRECalculated[];
  balanceSheet: BalanceSheetCalculated[];
  fcff: FCFFCalculated[];
  valuation: ValuationCalculated;
  wacc: WACCCalculation;
  indicadores?: IndicadoresCalculated[];
}

// ============================================================
// Indicadores Financeiros
// ============================================================

export interface IndicadorCalculated {
  year: number;
  id: string;
  label: string;
  value: number;
  format: "multiple" | "percentage" | "currency" | "number";
  numerator: number;
  denominator: number;
}

export interface IndicadoresCalculated {
  year: number;
  indicadores: IndicadorCalculated[];
}
