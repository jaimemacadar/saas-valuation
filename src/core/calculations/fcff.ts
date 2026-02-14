/**
 * Cálculos de FCFF (Free Cash Flow to Firm)
 *
 * Calcula o Fluxo de Caixa Livre para a Firma baseado em DRE e BP.
 * Fórmula conforme PRD: FCFF = EBIT - NCG - CAPEX
 *
 * Usa decimal.js para precisão financeira.
 */

import Decimal from "decimal.js";
import type {
  DRECalculated,
  BalanceSheetCalculated,
  FCFFCalculated,
  CalculationResult,
} from "../types/index.js";

/**
 * Calcula FCFF de um ano baseado em DRE e BP
 *
 * @param dreAno - DRE do ano
 * @param bpAno - BP do ano
 * @returns Resultado do cálculo com FCFF do ano
 */
export function calculateFCFF(
  dreAno: DRECalculated,
  bpAno: BalanceSheetCalculated,
): CalculationResult<FCFFCalculated> {
  try {
    // EBIT (Earnings Before Interest and Taxes)
    const ebit = new Decimal(dreAno.ebit);

    // Impostos: IR/CSLL do DRE
    const impostos = new Decimal(dreAno.irCSLL);

    // NOPAT (Net Operating Profit After Tax) = EBIT - IR/CSLL
    const nopat = ebit.minus(impostos);

    // Depreciação & Amortização do ano
    const depreciacaoAmortizacao = new Decimal(dreAno.depreciacaoAmortizacao);

    // CAPEX: já calculado no BP
    const capex = new Decimal(bpAno.capex);

    // NCG (Variação de Capital de Giro): já calculado no BP
    const ncg = new Decimal(bpAno.ncg);

    // FCFF = EBIT - NCG - CAPEX (conforme PRD seção 3.2.3)
    const fcff = ebit.minus(ncg).minus(capex);

    const fcffCalculado: FCFFCalculated = {
      year: dreAno.year,
      ebit: ebit.toNumber(),
      impostos: impostos.toNumber(),
      nopat: nopat.toNumber(),
      depreciacaoAmortizacao: depreciacaoAmortizacao.toNumber(),
      capex: capex.toNumber(),
      ncg: ncg.toNumber(),
      fcff: fcff.toNumber(),
    };

    return {
      success: true,
      data: fcffCalculado,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao calcular FCFF: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Calcula FCFF para todos os anos da projeção
 *
 * @param dreCalculado - Array de DREs calculados (incluindo ano base)
 * @param bpCalculado - Array de BPs calculados (incluindo ano base)
 * @returns Resultado do cálculo com array de FCFFs (apenas anos projetados)
 */
export function calculateAllFCFF(
  dreCalculado: DRECalculated[],
  bpCalculado: BalanceSheetCalculated[],
): CalculationResult<FCFFCalculated[]> {
  try {
    // Validar entradas
    if (dreCalculado.length !== bpCalculado.length) {
      return {
        success: false,
        errors: ["Arrays de DRE e BP devem ter o mesmo tamanho"],
      };
    }

    if (dreCalculado.length < 2) {
      return {
        success: false,
        errors: [
          "Necessário pelo menos 2 anos (base + 1 projetado) para calcular FCFF",
        ],
      };
    }

    const fcffProjetado: FCFFCalculated[] = [];

    // Calcular FCFF para cada ano projetado (começando do ano 1, pois ano 0 é base)
    for (let i = 1; i < dreCalculado.length; i++) {
      const dreAno = dreCalculado[i];
      const bpAno = bpCalculado[i];

      const resultado = calculateFCFF(dreAno, bpAno);

      if (!resultado.success || !resultado.data) {
        return {
          success: false,
          errors: resultado.errors || [
            `Erro ao calcular FCFF do ano ${dreAno.year}`,
          ],
        };
      }

      fcffProjetado.push(resultado.data);
    }

    return {
      success: true,
      data: fcffProjetado,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao calcular projeção de FCFF: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}
