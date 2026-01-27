// src/types/valuation.ts

export interface ValuationModel {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  method: ValuationMethod;
  projectionYears: number;
  baseYear: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export type ValuationMethod = "DCF" | "DDM" | "Multiples" | "APV";

export interface DCFAssumptions {
  wacc: number;
  terminalGrowthRate: number;
  taxRate: number;
  riskFreeRate: number;
  marketRiskPremium: number;
  beta: number;
  costOfDebt: number;
  debtToEquityRatio: number;
}

export interface DCFResult {
  projectedCashFlows: number[];
  discountFactors: number[];
  presentValues: number[];
  terminalValue: number;
  terminalValuePV: number;
  enterpriseValue: number;
  equityValue: number;
  sharePrice?: number;
  sharesOutstanding?: number;
}

export interface SensitivityAnalysis {
  variable1: string;
  variable2: string;
  variable1Range: number[];
  variable2Range: number[];
  results: number[][];
}

export interface ValuationSummary {
  method: string;
  value: number;
  valuePerShare?: number;
  createdAt: Date;
}
