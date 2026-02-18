/**
 * Cálculos de DRE (Demonstração do Resultado do Exercício)
 *
 * Implementa projeções de DRE baseadas em premissas conforme PRD.
 * Usa decimal.js para precisão financeira.
 */

import type {
  DREBaseInputs,
  DRECalculated,
  DREProjectionInputs,
  CalculationResult,
} from "../types/index.js";
import Decimal from "decimal.js";

/**
 * Calcula DRE do ano base a partir dos inputs
 *
 * @param dreBase - Dados de entrada do ano base
 * @param depreciacaoAmortizacao - Depreciação & Amortização do BP (padrão 0)
 * @param despesasFinanceiras - Despesas Financeiras do BP (padrão 0)
 * @returns DRE calculado do ano base (year 0)
 */
export function calculateDREBase(
  dreBase: DREBaseInputs,
  depreciacaoAmortizacao = 0,
  despesasFinanceiras = 0,
): CalculationResult<DRECalculated> {
  try {
    const receitaBruta = new Decimal(dreBase.receitaBruta);
    const impostosEDevolucoes = new Decimal(dreBase.impostosEDevolucoes);
    const cmv = new Decimal(dreBase.cmv);
    const despesasOperacionais = new Decimal(dreBase.despesasOperacionais);
    const irCSLL = new Decimal(dreBase.irCSLL);
    const dividendos = new Decimal(dreBase.dividendos);
    const da = new Decimal(depreciacaoAmortizacao);
    const despFin = new Decimal(despesasFinanceiras);

    // Cálculos conforme PRD (seção 3.2.1)
    const receitaLiquida = receitaBruta.minus(impostosEDevolucoes);
    const lucroBruto = receitaLiquida.minus(cmv);
    const ebit = lucroBruto.minus(despesasOperacionais);
    const ebitda = ebit.plus(da);
    const lucroAntesIR = ebit.minus(despFin);
    const lucroLiquido = lucroAntesIR.minus(irCSLL);

    return {
      success: true,
      data: {
        year: 0,
        receitaBruta: receitaBruta.toNumber(),
        impostosEDevolucoes: impostosEDevolucoes.toNumber(),
        receitaLiquida: receitaLiquida.toNumber(),
        cmv: cmv.toNumber(),
        lucroBruto: lucroBruto.toNumber(),
        despesasOperacionais: despesasOperacionais.toNumber(),
        ebit: ebit.toNumber(),
        depreciacaoAmortizacao: da.toNumber(),
        ebitda: ebitda.toNumber(),
        despesasFinanceiras: despFin.toNumber(),
        lucroAntesIR: lucroAntesIR.toNumber(),
        irCSLL: irCSLL.toNumber(),
        lucroLiquido: lucroLiquido.toNumber(),
        dividendos: dividendos.toNumber(),
      },
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao calcular DRE base: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Calcula DRE projetado de um ano baseado no ano anterior
 *
 * @param dreAnterior - DRE do ano anterior
 * @param premissas - Premissas de projeção do ano atual
 * @param depreciacaoAmortizacao - D&A do BP do ano (padrão 0)
 * @param despesasFinanceiras - Despesas Financeiras do BP (padrão 0)
 * @returns DRE calculado do ano projetado
 */
export function calculateDREProjetado(
  dreAnterior: DRECalculated,
  premissas: DREProjectionInputs,
  depreciacaoAmortizacao = 0,
  despesasFinanceiras = 0,
): CalculationResult<DRECalculated> {
  try {
    // Validar year
    if (premissas.year <= dreAnterior.year) {
      return {
        success: false,
        errors: [
          `Ano de projeção ${premissas.year} deve ser maior que ano anterior ${dreAnterior.year}`,
        ],
      };
    }

    // Crescimento da receita bruta (em % sobre ano anterior)
    const crescimento = new Decimal(premissas.receitaBrutaGrowth).div(100);
    const receitaBruta = new Decimal(dreAnterior.receitaBruta).times(
      new Decimal(1).plus(crescimento),
    );

    // Taxas sobre Receita Bruta e Receita Líquida (em %)
    const taxaImpostosEDevolucoes = new Decimal(
      premissas.impostosEDevolucoesRate,
    ).div(100);
    const taxaCMV = new Decimal(premissas.cmvRate).div(100);
    const taxaDespOp = new Decimal(premissas.despesasOperacionaisRate).div(100);
    const taxaIrCSLL = new Decimal(premissas.irCSLLRate).div(100);
    const taxaDividendos = new Decimal(premissas.dividendosRate).div(100);

    const impostosEDevolucoes = receitaBruta.times(taxaImpostosEDevolucoes);
    const receitaLiquida = receitaBruta.minus(impostosEDevolucoes);
    const cmv = receitaLiquida.times(taxaCMV);
    const lucroBruto = receitaLiquida.minus(cmv);
    const despesasOperacionais = receitaLiquida.times(taxaDespOp);
    const ebit = lucroBruto.minus(despesasOperacionais);

    const da = new Decimal(depreciacaoAmortizacao);
    const ebitda = ebit.plus(da);

    const despFin = new Decimal(despesasFinanceiras);
    const lucroAntesIR = ebit.minus(despFin);
    const irCSLL = lucroAntesIR.times(taxaIrCSLL);
    const lucroLiquido = lucroAntesIR.minus(irCSLL);
    const dividendos = lucroLiquido.times(taxaDividendos);

    return {
      success: true,
      data: {
        year: premissas.year,
        receitaBruta: receitaBruta.toNumber(),
        impostosEDevolucoes: impostosEDevolucoes.toNumber(),
        receitaLiquida: receitaLiquida.toNumber(),
        cmv: cmv.toNumber(),
        lucroBruto: lucroBruto.toNumber(),
        despesasOperacionais: despesasOperacionais.toNumber(),
        ebit: ebit.toNumber(),
        depreciacaoAmortizacao: da.toNumber(),
        ebitda: ebitda.toNumber(),
        despesasFinanceiras: despFin.toNumber(),
        lucroAntesIR: lucroAntesIR.toNumber(),
        irCSLL: irCSLL.toNumber(),
        lucroLiquido: lucroLiquido.toNumber(),
        dividendos: dividendos.toNumber(),
      },
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao calcular DRE projetado: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Dados do BP por ano para integração DRE↔BP
 */
export interface BPDataForDRE {
  year: number;
  despesasFinanceiras: number;
  depreciacaoAnual: number;
}

/**
 * Calcula projeção completa de DRE (ano base + anos projetados)
 *
 * @param dreBase - Dados de entrada do ano base
 * @param premissasProjecao - Array de premissas por ano (1, 2, 3...)
 * @param bpData - Opcional: dados do BP por ano (despesasFinanceiras, depreciacaoAnual)
 *                 Quando fornecido, integra corretamente DRE↔BP eliminando os 0 hardcoded
 * @returns Array com DRE do ano base + DREs projetados
 */
export function calculateAllDRE(
  dreBase: DREBaseInputs,
  premissasProjecao: DREProjectionInputs[],
  bpData?: BPDataForDRE[],
): CalculationResult<DRECalculated[]> {
  try {
    // Validar entradas
    if (premissasProjecao.length === 0) {
      return {
        success: false,
        errors: ["Array de premissas de projeção não pode ser vazio"],
      };
    }

    // Calcular ano base (year 0) — D&A e despesas financeiras do ano base vêm do input direto
    const resultadoBase = calculateDREBase(dreBase, 0, 0);
    if (!resultadoBase.success || !resultadoBase.data) {
      return {
        success: false,
        errors: resultadoBase.errors || ["Erro ao calcular DRE base"],
      };
    }

    const dreProjetado: DRECalculated[] = [resultadoBase.data];

    // Calcular cada ano projetado
    for (const premissas of premissasProjecao) {
      const dreAnterior = dreProjetado[dreProjetado.length - 1];

      // Buscar D&A e despesas financeiras do BP para este ano (se disponível)
      const bpAno = bpData?.find((b) => b.year === premissas.year);
      const depreciacaoAmortizacao = bpAno?.depreciacaoAnual ?? 0;
      const despesasFinanceiras = bpAno?.despesasFinanceiras ?? 0;

      const resultado = calculateDREProjetado(
        dreAnterior,
        premissas,
        depreciacaoAmortizacao,
        despesasFinanceiras,
      );

      if (!resultado.success || !resultado.data) {
        return {
          success: false,
          errors: resultado.errors || [
            `Erro ao calcular ano ${premissas.year}`,
          ],
        };
      }

      dreProjetado.push(resultado.data);
    }

    return {
      success: true,
      data: dreProjetado,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao calcular projeção completa de DRE: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}
