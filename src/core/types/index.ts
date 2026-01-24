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
