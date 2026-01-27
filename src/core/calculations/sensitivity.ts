// Interface auxiliar para permitir acesso dinâmico sem usar 'any'
interface ModifiedInput {
  [key: string]: unknown;
}
/**
 * Análise de Sensibilidade
 *
 * Implementa análises de sensibilidade univariada e bivariada.
 * Usa decimal.js para precisão financeira.
 */

import type { FullValuationInput, CalculationResult } from "../types/index.js";
import { executeFullValuation } from "./fullValuation.js";

export interface SensitivityUnivariateInput {
  baseInput: FullValuationInput;
  variableName: keyof FullValuationInput;
  range: number[];
}

export interface SensitivityUnivariateResult {
  variable: string;
  values: number[];
  valuations: number[];
}

export interface SensitivityBivariateInput {
  baseInput: FullValuationInput;
  variable1Name: keyof FullValuationInput;
  variable2Name: keyof FullValuationInput;
  range1: number[];
  range2: number[];
}

export interface SensitivityBivariateResult {
  variable1: string;
  variable2: string;
  values1: number[];
  values2: number[];
  valuationGrid: number[][];
}

/**
 * Executa análise de sensibilidade univariada
 *
 * @param input - Configuração da análise
 * @returns Resultado com valores e valuations
 */
export function calculateSensitivityUnivariate(
  input: SensitivityUnivariateInput,
): CalculationResult<SensitivityUnivariateResult> {
  try {
    const valuations: number[] = [];

    for (const value of input.range) {
      // Criar cópia do input base e alterar a variável
      const modifiedInput = { ...input.baseInput };

      // Atualizar o valor da variável
      if (input.variableName === "taxaCrescimentoPerpetuo") {
        modifiedInput.taxaCrescimentoPerpetuo = value;
      } else if (input.variableName === "anosProjecao") {
        modifiedInput.anosProjecao = value;
      } else {
        // Para outras variáveis, fazer update apropriado
        (modifiedInput as ModifiedInput)[input.variableName as string] = value;
      }

      // Executar valuation
      const result = executeFullValuation(modifiedInput);

      if (!result.success || !result.data) {
        return {
          success: false,
          errors: result.errors || [
            `Erro ao calcular valuation para ${input.variableName} = ${value}`,
          ],
        };
      }

      valuations.push(result.data.valuation.valorEmpresa);
    }

    const sensitivityResult: SensitivityUnivariateResult = {
      variable: String(input.variableName),
      values: input.range,
      valuations: valuations,
    };

    return {
      success: true,
      data: sensitivityResult,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro na análise de sensibilidade univariada: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Executa análise de sensibilidade bivariada (grid 2D)
 *
 * @param input - Configuração da análise
 * @returns Resultado com grid de valuations
 */
export function calculateSensitivityBivariate(
  input: SensitivityBivariateInput,
): CalculationResult<SensitivityBivariateResult> {
  try {
    const valuationGrid: number[][] = [];

    for (const value1 of input.range1) {
      const row: number[] = [];

      for (const value2 of input.range2) {
        // Criar cópia do input base e alterar as variáveis
        const modifiedInput = { ...input.baseInput };

        // Atualizar valores
        if (input.variable1Name === "taxaCrescimentoPerpetuo") {
          modifiedInput.taxaCrescimentoPerpetuo = value1;
        } else {
          (modifiedInput as ModifiedInput)[input.variable1Name as string] =
            value1;
        }

        if (input.variable2Name === "taxaCrescimentoPerpetuo") {
          modifiedInput.taxaCrescimentoPerpetuo = value2;
        } else {
          (modifiedInput as ModifiedInput)[input.variable2Name as string] =
            value2;
        }

        // Executar valuation
        const result = executeFullValuation(modifiedInput);

        if (!result.success || !result.data) {
          return {
            success: false,
            errors: result.errors || [
              `Erro ao calcular valuation para ${input.variable1Name} = ${value1}, ${input.variable2Name} = ${value2}`,
            ],
          };
        }

        row.push(result.data.valuation.valorEmpresa);
      }

      valuationGrid.push(row);
    }

    const sensitivityResult: SensitivityBivariateResult = {
      variable1: String(input.variable1Name),
      variable2: String(input.variable2Name),
      values1: input.range1,
      values2: input.range2,
      valuationGrid: valuationGrid,
    };

    return {
      success: true,
      data: sensitivityResult,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro na análise de sensibilidade bivariada: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}
