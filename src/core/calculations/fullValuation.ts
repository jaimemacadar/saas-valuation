/**
 * Motor de Cálculo Completo (Full Valuation)
 *
 * Orquestra todos os cálculos: DRE → BP → FCFF → Valuation
 * Esta é a função principal do motor de cálculo.
 */

import type {
  FullValuationInput,
  FullValuationResult,
  CalculationResult,
} from "../types/index.js";
import {
  validateInput,
  FullValuationInputSchema,
} from "../validators/index.js";
import { calculateAllDRE } from "./dre.js";
import { calculateAllBalanceSheet } from "./balanceSheet.js";
import { calculateAllFCFF } from "./fcff.js";
import { calculateValuation } from "./valuation.js";

/**
 * Executa valuation completo da empresa
 *
 * Esta função orquestra todo o processo:
 * 1. Valida inputs
 * 2. Calcula projeção de DRE
 * 3. Calcula projeção de Balanço Patrimonial
 * 4. Calcula FCFF (Free Cash Flow to Firm)
 * 5. Calcula Valuation por DCF
 *
 * @param input - Dados completos para valuation
 * @returns Resultado com todas as projeções e valuation final
 */
export function executeFullValuation(
  input: FullValuationInput,
): CalculationResult<FullValuationResult> {
  try {
    // 1. Validar inputs
    const validationResult = validateInput(FullValuationInputSchema, input);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.errors,
      };
    }

    const validatedInput = validationResult.data;

    // 2. Calcular projeção de DRE
    const dreResult = calculateAllDRE(
      validatedInput.dreBase,
      validatedInput.dreProjection,
      validatedInput.anosProjecao,
    );

    if (!dreResult.success || !dreResult.data) {
      return {
        success: false,
        errors: dreResult.errors || ["Erro ao calcular DRE"],
      };
    }

    const dreProjetado = dreResult.data;

    // 3. Calcular projeção de Balanço Patrimonial
    const bpResult = calculateAllBalanceSheet(
      {
        ...validatedInput.balanceSheetBase,
        passivoNaoCirculante:
          validatedInput.balanceSheetBase.dividasLongoPrazo ?? 0,
      },
      dreProjetado,
      validatedInput.balanceSheetProjection,
    );

    if (!bpResult.success || !bpResult.data) {
      return {
        success: false,
        errors: bpResult.errors || ["Erro ao calcular Balanço Patrimonial"],
      };
    }

    const bpProjetado = bpResult.data;

    // 4. Calcular FCFF (Free Cash Flow to Firm)
    const fcffResult = calculateAllFCFF(dreProjetado, bpProjetado);

    if (!fcffResult.success || !fcffResult.data) {
      return {
        success: false,
        errors: fcffResult.errors || ["Erro ao calcular FCFF"],
      };
    }

    const fcffProjetado = fcffResult.data;

    // 5. Calcular Valuation por DCF
    const valuationResult = calculateValuation({
      fcff: fcffProjetado,
      wacc: validatedInput.wacc.wacc,
      taxaCrescimentoPerpetuo: validatedInput.taxaCrescimentoPerpetuo,
      anoBase: 0,
    });

    if (!valuationResult.success || !valuationResult.data) {
      return {
        success: false,
        errors: valuationResult.errors || ["Erro ao calcular Valuation"],
      };
    }

    const valuation = valuationResult.data;

    // Montar resultado completo
    const fullResult: FullValuationResult = {
      dre: dreProjetado,
      balanceSheet: bpProjetado,
      fcff: fcffProjetado,
      valuation: valuation,
      wacc: validatedInput.wacc,
    };

    return {
      success: true,
      data: fullResult,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao executar valuation completo: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Executa valuation rápido com valores padrão
 *
 * Útil para testes e demos.
 *
 * @param receita - Receita do ano base
 * @param anosProjecao - Número de anos a projetar
 * @returns Resultado do valuation
 */
export function executeQuickValuation(
  receita: number,
  anosProjecao: number = 5,
): CalculationResult<FullValuationResult> {
  // Premissas padrão simplificadas
  const input: FullValuationInput = {
    dreBase: {
      receita: receita,
      custoMercadoriaVendida: receita * 0.4,
      despesasOperacionais: receita * 0.3,
      despesasFinanceiras: receita * 0.05,
      taxaImposto: 0.34,
    },
    dreProjection: {
      taxaCrescimentoReceita: Array(anosProjecao).fill(0.1),
      taxaCMV: Array(anosProjecao).fill(0.4),
      taxaDespesasOperacionais: Array(anosProjecao).fill(0.3),
      taxaDespesasFinanceiras: Array(anosProjecao).fill(0.05),
    },
    balanceSheetBase: {
      caixa: receita * 0.1,
      contasReceber: receita * 0.15,
      estoques: receita * 0.1,
      ativoCirculante: receita * 0.35,
      imobilizado: receita * 0.5,
      ativoTotal: receita * 0.85,
      contasPagar: receita * 0.1,
      passivoCirculante: receita * 0.15,
      passivoNaoCirculante: receita * 0.2,
      dividasLongoPrazo: receita * 0.2,
      passivoTotal: receita * 0.35,
      patrimonioLiquido: receita * 0.5,
    },
    balanceSheetProjection: {
      taxaCrescimentoAtivos: Array(anosProjecao).fill(0.1),
      taxaCrescimentoPassivos: Array(anosProjecao).fill(0.08),
      taxaDepreciacao: 0.1,
      taxaCapex: 0.05,
    },
    wacc: {
      custoCapitalProprio: 0.12,
      custoCapitalTerceiros: 0.08,
      wacc: 0.105,
      pesoCapitalProprio: 0.7,
      pesoCapitalTerceiros: 0.3,
    },
    taxaCrescimentoPerpetuo: 0.03,
    anosProjecao: anosProjecao,
  };

  return executeFullValuation(input);
}
