// src/types/valuation.ts
import { Decimal } from "decimal.js";

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
  projectedCashFlows: Decimal[];
  discountFactors: Decimal[];
  presentValues: Decimal[];
  terminalValue: Decimal;
  terminalValuePV: Decimal;
  enterpriseValue: Decimal;
  equityValue: Decimal;
  sharePrice?: Decimal;
  sharesOutstanding?: Decimal;
}

export interface SensitivityAnalysis {
  variable1: string;
  variable2: string;
  variable1Range: number[];
  variable2Range: number[];
  results: Decimal[][];
}

export interface ValuationSummary {
  method: string;
  value: Decimal;
  valuePerShare?: Decimal;
  createdAt: Date;
}
