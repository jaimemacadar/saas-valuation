// src/types/financial.ts

export interface IncomeStatementLine {
  label: string;
  values: number[];
  isCalculated?: boolean;
}

export interface IncomeStatement {
  revenue: number[];
  cogs: number[];
  grossProfit: number[];
  operatingExpenses: number[];
  ebitda: number[];
  depreciation: number[];
  ebit: number[];
  interestExpense: number[];
  ebt: number[];
  taxes: number[];
  netIncome: number[];
}

export interface BalanceSheet {
  cash: number[];
  receivables: number[];
  inventory: number[];
  currentAssets: number[];
  ppe: number[];
  totalAssets: number[];
  payables: number[];
  shortTermDebt: number[];
  currentLiabilities: number[];
  longTermDebt: number[];
  totalLiabilities: number[];
  equity: number[];
}

export interface CashFlow {
  operatingCashFlow: number[];
  capex: number[];
  freeCashFlow: number[];
  changeInWorkingCapital: number[];
}

export interface ProjectionAssumptions {
  revenueGrowthRate: number[];
  cogsPercentage: number[];
  opexPercentage: number[];
  taxRate: number;
  capexPercentage: number[];
  depreciationPercentage: number[];
  workingCapitalDays: {
    receivables: number;
    inventory: number;
    payables: number;
  };
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export type Period = "annual" | "quarterly" | "monthly";
