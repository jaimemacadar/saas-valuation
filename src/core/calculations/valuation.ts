/**
 * Cálculos de Valuation por FCD (Fluxo de Caixa Descontado)
 *
 * Implementa o método DCF para valuation de empresas.
 * Usa decimal.js para precisão financeira.
 */

import Decimal from "decimal.js";
import type {
  ValuationInputs,
  ValuationCalculated,
  CalculationResult,
} from "../types/index.js";

/**
 * Calcula o valuation usando método DCF
 *
 * @param inputs - Dados necessários para valuation (FCFF, WACC, taxa perpétua)
 * @returns Resultado do cálculo com valuation completo
 */
export function calculateValuation(
  inputs: ValuationInputs,
): CalculationResult<ValuationCalculated> {
  try {
    // Validar entradas
    if (inputs.fcff.length === 0) {
      return {
        success: false,
        errors: ["Array de FCFF está vazio"],
      };
    }

    if (inputs.wacc <= 0) {
      return {
        success: false,
        errors: ["WACC deve ser positivo"],
      };
    }

    if (
      inputs.taxaCrescimentoPerpetuo < 0 ||
      inputs.taxaCrescimentoPerpetuo >= inputs.wacc
    ) {
      return {
        success: false,
        errors: [
          "Taxa de crescimento perpétuo deve ser não-negativa e menor que WACC",
        ],
      };
    }

    const wacc = new Decimal(inputs.wacc);
    const g = new Decimal(inputs.taxaCrescimentoPerpetuo);

    // Calcular valor presente de cada FCFF
    const valorPresenteFCFF: number[] = [];
    let somaVP = new Decimal(0);

    for (let i = 0; i < inputs.fcff.length; i++) {
      const fcff = new Decimal(inputs.fcff[i].fcff);
      const ano = inputs.fcff[i].ano;

      // Fator de desconto: 1 / (1 + WACC)^ano
      const fatorDesconto = new Decimal(1).div(
        new Decimal(1).plus(wacc).pow(ano),
      );

      // Valor presente: FCFF * Fator Desconto
      const vp = fcff.times(fatorDesconto);
      valorPresenteFCFF.push(vp.toNumber());
      somaVP = somaVP.plus(vp);
    }

    // Calcular valor terminal
    // VT = FCFF último ano * (1 + g) / (WACC - g)
    const fcffUltimoAno = new Decimal(inputs.fcff[inputs.fcff.length - 1].fcff);
    const anoUltimo = inputs.fcff[inputs.fcff.length - 1].ano;

    const valorTerminal = fcffUltimoAno
      .times(new Decimal(1).plus(g))
      .div(wacc.minus(g));

    // Valor presente do valor terminal
    // VPT = VT / (1 + WACC)^último ano
    const valorPresenteTerminal = valorTerminal.div(
      new Decimal(1).plus(wacc).pow(anoUltimo),
    );

    // Valor da empresa = Soma VP FCFFs + VP Valor Terminal
    const valorEmpresa = somaVP.plus(valorPresenteTerminal);

    // Valor do patrimônio líquido = Valor da Empresa (por enquanto, sem ajuste de dívida)
    // Em uma implementação completa, seria: Valor Empresa - Dívida Líquida
    const valorPatrimonioLiquido = valorEmpresa;

    const valuationCalculated: ValuationCalculated = {
      valorPresenteFCFF: valorPresenteFCFF,
      valorTerminal: valorTerminal.toNumber(),
      valorPresenteTerminal: valorPresenteTerminal.toNumber(),
      valorEmpresa: valorEmpresa.toNumber(),
      valorPatrimonioLiquido: valorPatrimonioLiquido.toNumber(),
    };

    return {
      success: true,
      data: valuationCalculated,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao calcular valuation: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Calcula o preço por ação
 *
 * @param valorPatrimonioLiquido - Valor do patrimônio líquido
 * @param numeroAcoes - Número de ações em circulação
 * @returns Preço por ação
 */
export function calculateSharePrice({
  valorEmpresa,
  dividaLiquida,
  acoesEmCirculacao,
}: {
  valorEmpresa: number;
  dividaLiquida: number;
  acoesEmCirculacao: number;
}): {
  success: boolean;
  data?: { precoPorAcao: number; valorPatrimonioLiquido: number };
  errors?: string[];
} {
  if (acoesEmCirculacao <= 0) {
    return {
      success: false,
      errors: ["Número de ações em circulação deve ser positivo"],
    };
  }

  const valorPatrimonioLiquido = valorEmpresa - dividaLiquida;
  const precoPorAcao = valorPatrimonioLiquido / acoesEmCirculacao;

  return {
    success: true,
    data: {
      precoPorAcao,
      valorPatrimonioLiquido,
    },
  };
}
