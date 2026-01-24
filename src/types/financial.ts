// src/types/financial.ts
import { Decimal } from "decimal.js";

export interface IncomeStatementLine {
  label: string;
  values: Decimal[];
  isCalculated?: boolean;
}

export interface IncomeStatement {
  revenue: Decimal[];
  cogs: Decimal[];
  grossProfit: Decimal[];
  operatingExpenses: Decimal[];
  ebitda: Decimal[];
  depreciation: Decimal[];
  ebit: Decimal[];
  interestExpense: Decimal[];
  ebt: Decimal[];
  taxes: Decimal[];
  netIncome: Decimal[];
}

export interface BalanceSheet {
  cash: Decimal[];
  receivables: Decimal[];
  inventory: Decimal[];
  currentAssets: Decimal[];
  ppe: Decimal[];
  totalAssets: Decimal[];
  payables: Decimal[];
  shortTermDebt: Decimal[];
  currentLiabilities: Decimal[];
  longTermDebt: Decimal[];
  totalLiabilities: Decimal[];
  equity: Decimal[];
}

export interface CashFlow {
  operatingCashFlow: Decimal[];
  capex: Decimal[];
  freeCashFlow: Decimal[];
  changeInWorkingCapital: Decimal[];
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
