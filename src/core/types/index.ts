// src/core/types/index.ts
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

export interface CashFlowStatement {
  years: number[];
  operatingCashFlow: number[];
  capex: number[];
  freeCashFlow: number[];
}

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

// Additional types for calculation engine
export interface CalculationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export interface DREBaseInputs {
  receita: number;
  custoMercadoriaVendida: number;
  despesasOperacionais: number;
  despesasFinanceiras: number;
  taxaImposto: number;
}

export interface DREProjectionInputs {
  taxaCrescimentoReceita: number[];
  taxaCMV: number[];
  taxaDespesasOperacionais: number[];
  taxaDespesasFinanceiras: number[];
}

export interface DRECalculated {
  ano: number;
  receita: number;
  cmv: number;
  lucrobruto: number;
  despesasOperacionais: number;
  ebit: number;
  despesasFinanceiras: number;
  lucroAntesImpostos: number;
  impostos: number;
  lucroLiquido: number;
}

export interface BalanceSheetBaseInputs {
  caixa: number;
  contasReceber: number;
  estoques: number;
  ativoCirculante: number;
  imobilizado: number;
  ativoTotal: number;
  contasPagar: number;
  passivoCirculante: number;
  passivoNaoCirculante: number;
  dividasLongoPrazo: number; // Mantido para compatibilidade, mas será somado em passivoNaoCirculante
  passivoTotal: number;
  patrimonioLiquido: number;
}

export interface BalanceSheetProjectionInputs {
  taxaCrescimentoAtivos: number[];
  taxaCrescimentoPassivos: number[];
  taxaDepreciacao: number;
  taxaCapex: number;
}

export interface BalanceSheetCalculated {
  ano: number;
  caixa: number;
  contasReceber: number;
  estoques: number;
  ativoCirculante: number;
  imobilizado: number;
  ativoTotal: number;
  contasPagar: number;
  passivoCirculante: number;
  passivoNaoCirculante: number;
  dividasLongoPrazo: number;
  passivoTotal: number;
  patrimonioLiquido: number;
  depreciacao: number;
  capex: number;
  capitalDeGiro: number;
}

export interface FCFFCalculated {
  ano: number;
  ebit: number;
  impostos: number;
  nopat: number;
  depreciacao: number;
  capex: number;
  variacaoNecessidadeCapitalGiro: number;
  fcff: number;
}

export interface WACCCalculation {
  custoCapitalProprio: number;
  custoCapitalTerceiros: number;
  wacc: number;
  pesoCapitalProprio: number;
  pesoCapitalTerceiros: number;
}

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

export interface FullValuationInput {
  dreBase: DREBaseInputs;
  dreProjection: DREProjectionInputs;
  balanceSheetBase: BalanceSheetBaseInputs;
  balanceSheetProjection: BalanceSheetProjectionInputs;
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
}
