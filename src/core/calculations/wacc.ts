/**
 * Cálculos de WACC (Weighted Average Cost of Capital)
 *
 * Calcula o custo médio ponderado de capital.
 * Fórmula: WACC = (E/(E+D)) * Ke + (D/(E+D)) * Kd * (1-T)
 *
 * Usa decimal.js para precisão financeira.
 */

import Decimal from "decimal.js";
import type { WACCCalculation, CalculationResult } from "../types/index.js";

export interface WACCInputs {
  custoCapitalProprio: number; // Ke (custo do equity)
  custoCapitalTerceiros: number; // Kd (custo da dívida)
  valorPatrimonioLiquido: number; // E (Equity)
  valorDivida: number; // D (Debt)
  taxaImposto: number; // T (Tax rate)
}

/**
 * Calcula WACC (Weighted Average Cost of Capital)
 *
 * @param inputs - Dados necessários para cálculo do WACC
 * @returns Resultado do cálculo com WACC e componentes
 */
export function calculateWACC(
  inputs: WACCInputs,
): CalculationResult<WACCCalculation> {
  try {
    // Validar entradas
    if (inputs.valorPatrimonioLiquido < 0 || inputs.valorDivida < 0) {
      return {
        success: false,
        errors: [
          "Valores de patrimônio líquido e dívida devem ser não-negativos",
        ],
      };
    }

    if (inputs.taxaImposto < 0 || inputs.taxaImposto > 1) {
      return {
        success: false,
        errors: ["Taxa de imposto deve estar entre 0 e 1"],
      };
    }

    if (inputs.custoCapitalProprio < 0 || inputs.custoCapitalTerceiros < 0) {
      return {
        success: false,
        errors: ["Custos de capital não podem ser negativos"],
      };
    }

    const ke = new Decimal(inputs.custoCapitalProprio);
    const kd = new Decimal(inputs.custoCapitalTerceiros);
    const equity = new Decimal(inputs.valorPatrimonioLiquido);
    const debt = new Decimal(inputs.valorDivida);
    const taxRate = new Decimal(inputs.taxaImposto);

    // Valor total da empresa: E + D
    const totalValue = equity.plus(debt);

    if (totalValue.isZero()) {
      return {
        success: false,
        errors: ["Valor total da empresa (E + D) não pode ser zero"],
      };
    }

    // Peso do capital próprio: E / (E + D)
    const pesoCapitalProprio = equity.div(totalValue);

    // Peso do capital de terceiros: D / (E + D)
    const pesoCapitalTerceiros = debt.div(totalValue);

    // Componente do equity: (E/(E+D)) * Ke
    const componenteEquity = pesoCapitalProprio.times(ke);

    // Componente da dívida: (D/(E+D)) * Kd * (1-T)
    const componenteDivida = pesoCapitalTerceiros
      .times(kd)
      .times(new Decimal(1).minus(taxRate));

    // WACC = Componente Equity + Componente Dívida
    const wacc = componenteEquity.plus(componenteDivida);

    const waccCalculation: WACCCalculation = {
      custoCapitalProprio: ke.toNumber(),
      custoCapitalTerceiros: kd.toNumber(),
      wacc: wacc.toNumber(),
      pesoCapitalProprio: pesoCapitalProprio.toNumber(),
      pesoCapitalTerceiros: pesoCapitalTerceiros.toNumber(),
    };

    return {
      success: true,
      data: waccCalculation,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao calcular WACC: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Calcula o custo do capital próprio usando CAPM (Capital Asset Pricing Model)
 *
 * Fórmula: Ke = Rf + β * (Rm - Rf)
 *
 * @param taxaLivreRisco - Rf (risk-free rate)
 * @param beta - β (beta do ativo)
 * @param premioRiscoMercado - (Rm - Rf) (market risk premium)
 * @returns Custo do capital próprio
 */
export function calculateCAPM(
  taxaLivreRisco: number,
  beta: number,
  premioRiscoMercado: number,
): number {
  if (taxaLivreRisco < 0) {
    return NaN;
  }
  const rf = new Decimal(taxaLivreRisco);
  const b = new Decimal(beta);
  const mrp = new Decimal(premioRiscoMercado);

  // Ke = Rf + β * (Rm - Rf)
  const ke = rf.plus(b.times(mrp));

  return ke.toNumber();
}
