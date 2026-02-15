// src/core/index.ts
/**
 * Motor de Cálculo Financeiro
 *
 * Este módulo fornece funções puras para cálculos de valuation de empresas usando o método FCD (Fluxo de Caixa Descontado).
 *
 * IMPORTANTE: Este módulo NÃO deve importar React, Next.js ou qualquer biblioteca de UI.
 * Todas as funções são server-side e devem usar decimal.js para precisão financeira.
 *
 * @module core
 */

// Export types
export * from "./types";

// Export validators
export {
  DREBaseInputsSchema,
  DREProjectionInputsSchema,
  BalanceSheetBaseInputsSchema,
  BalanceSheetProjectionInputsSchema,
  WACCCalculationSchema,
  FullValuationInputSchema,
  validateInput,
} from "./validators/index.js";

export type {
  DREBaseInputsValidated,
  DREProjectionInputsValidated,
  BalanceSheetBaseInputsValidated,
  BalanceSheetProjectionInputsValidated,
  WACCCalculationValidated,
  FullValuationInputValidated,
} from "./validators/index.js";

// Export calculation functions
export { calculateDREBase, calculateDREProjetado, calculateAllDRE } from "./calculations/dre.js";
export {
  calculateBPBase,
  calculateBPProjetado,
  calculateAllBalanceSheet,
} from "./calculations/balanceSheet.js";
export { calculateFCFF, calculateAllFCFF } from "./calculations/fcff.js";
export { calculateWACC, calculateCAPM } from "./calculations/wacc.js";
export {
  calculateValuation,
  calculateSharePrice,
} from "./calculations/valuation.js";
export {
  calculateSensitivityUnivariate,
  calculateSensitivityBivariate,
} from "./calculations/sensitivity.js";
export {
  executeFullValuation,
  executeQuickValuation,
} from "./calculations/fullValuation.js";

// Export sensitivity types
export type {
  SensitivityUnivariateInput,
  SensitivityUnivariateResult,
  SensitivityBivariateInput,
  SensitivityBivariateResult,
} from "./calculations/sensitivity.js";
