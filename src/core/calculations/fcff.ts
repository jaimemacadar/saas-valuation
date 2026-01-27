/**
 * Cálculos de FCFF (Free Cash Flow to Firm)
 *
 * Calcula o Fluxo de Caixa Livre para a Firma baseado em DRE e BP.
 * Fórmula: FCFF = NOPAT + Depreciação - CAPEX - Variação NCG
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
 * @param bpAnterior - BP do ano anterior (para calcular variação NCG)
 * @returns Resultado do cálculo com FCFF do ano
 */
export function calculateFCFF(
  dreAno: DRECalculated,
  bpAno: BalanceSheetCalculated,
  bpAnterior: BalanceSheetCalculated,
): CalculationResult<FCFFCalculated> {
  try {
    // EBIT (Earnings Before Interest and Taxes)
    const ebit = new Decimal(dreAno.ebit);

    // Impostos sobre EBIT
    const taxaImposto =
      dreAno.lucroAntesImpostos !== 0
        ? new Decimal(dreAno.impostos).div(
            new Decimal(dreAno.lucroAntesImpostos),
          )
        : new Decimal(0);
    const impostos = ebit.times(taxaImposto);

    // NOPAT (Net Operating Profit After Tax) = EBIT * (1 - Taxa Imposto)
    const nopat = ebit.minus(impostos);

    // Depreciação do ano
    const depreciacao = new Decimal(bpAno.depreciacao);

    // CAPEX: calculado como diferença no imobilizado + depreciação
    // CAPEX = Imobilizado Atual - Imobilizado Anterior + Depreciação
    const capex = new Decimal(bpAno.imobilizado)
      .minus(new Decimal(bpAnterior.imobilizado))
      .plus(depreciacao);

    // Necessidade de Capital de Giro (NCG)
    // NCG = (Contas Receber + Estoques) - Contas Pagar
    const ncgAtual = new Decimal(bpAno.contasReceber)
      .plus(new Decimal(bpAno.estoques))
      .minus(new Decimal(bpAno.contasPagar));

    const ncgAnterior = new Decimal(bpAnterior.contasReceber)
      .plus(new Decimal(bpAnterior.estoques))
      .minus(new Decimal(bpAnterior.contasPagar));

    // Variação NCG
    const variacaoNecessidadeCapitalGiro = ncgAtual.minus(ncgAnterior);

    // FCFF = NOPAT + Depreciação - CAPEX - Variação NCG
    const fcff = nopat
      .plus(depreciacao)
      .minus(capex)
      .minus(variacaoNecessidadeCapitalGiro);

    const fcffCalculado: FCFFCalculated = {
      ano: dreAno.ano,
      ebit: ebit.toNumber(),
      impostos: impostos.toNumber(),
      nopat: nopat.toNumber(),
      depreciacao: depreciacao.toNumber(),
      capex: capex.toNumber(),
      variacaoNecessidadeCapitalGiro: variacaoNecessidadeCapitalGiro.toNumber(),
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
 * @param dreProjetado - Array de DREs projetados
 * @param bpProjetado - Array de BPs projetados
 * @returns Resultado do cálculo com array de FCFFs
 */
export function calculateAllFCFF(
  dreProjetado: DRECalculated[],
  bpProjetado: BalanceSheetCalculated[],
): CalculationResult<FCFFCalculated[]> {
  try {
    // Validar entradas
    if (dreProjetado.length !== bpProjetado.length) {
      return {
        success: false,
        errors: ["Arrays de DRE e BP devem ter o mesmo tamanho"],
      };
    }

    if (dreProjetado.length < 2) {
      return {
        success: false,
        errors: ["Necessário pelo menos 2 anos de projeção para calcular FCFF"],
      };
    }

    const fcffProjetado: FCFFCalculated[] = [];

    // Calcular FCFF para cada ano (começando do ano 1, pois precisamos do ano anterior)
    for (let i = 1; i < dreProjetado.length; i++) {
      const dreAno = dreProjetado[i];
      const bpAno = bpProjetado[i];
      const bpAnterior = bpProjetado[i - 1];

      const resultado = calculateFCFF(dreAno, bpAno, bpAnterior);

      if (!resultado.success || !resultado.data) {
        return {
          success: false,
          errors: resultado.errors || ["Erro ao calcular FCFF do ano " + i],
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
