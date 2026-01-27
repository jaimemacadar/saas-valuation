/**
 * Cálculos de Balanço Patrimonial
 *
 * Implementa projeções de Balanço Patrimonial integradas com DRE.
 * Usa decimal.js para precisão financeira.
 */

import Decimal from "decimal.js";
import type {
  BalanceSheetBaseInputs,
  BalanceSheetProjectionInputs,
  BalanceSheetCalculated,
  DRECalculated,
  CalculationResult,
} from "../types/index.js";

/**
 * Calcula Balanço Patrimonial de um ano baseado no ano anterior, DRE e premissas
 *
 * @param bpAnterior - BP do ano anterior
 * @param dreAno - DRE do ano atual
 * @param premissas - Premissas de projeção
 * @param anoIndex - Índice do ano na projeção
 * @returns Resultado do cálculo com BP do ano atual
 */
export function calculateBalanceSheet(
  bpAnterior: BalanceSheetCalculated,
  dreAno: DRECalculated,
  premissas: BalanceSheetProjectionInputs,
  anoIndex: number,
): CalculationResult<BalanceSheetCalculated> {
  try {
    // Validar índice
    if (anoIndex < 0 || anoIndex >= premissas.taxaCrescimentoAtivos.length) {
      return {
        success: false,
        errors: [`Índice de ano inválido: ${anoIndex}`],
      };
    }

    // Taxas de crescimento
    const taxaCrescAtivos = new Decimal(
      premissas.taxaCrescimentoAtivos[anoIndex],
    );
    const taxaCrescPassivos = new Decimal(
      premissas.taxaCrescimentoPassivos[anoIndex],
    );
    const taxaDepreciacao = new Decimal(premissas.taxaDepreciacao);

    // Ativos
    const caixa = new Decimal(bpAnterior.caixa).times(
      new Decimal(1).plus(taxaCrescAtivos),
    );
    const contasReceber = new Decimal(bpAnterior.contasReceber).times(
      new Decimal(1).plus(taxaCrescAtivos),
    );
    const estoques = new Decimal(bpAnterior.estoques).times(
      new Decimal(1).plus(taxaCrescAtivos),
    );
    const ativoCirculante = caixa.plus(contasReceber).plus(estoques);

    // Calcular depreciação: Imobilizado Anterior * Taxa Depreciação
    const depreciacao = new Decimal(bpAnterior.imobilizado).times(
      taxaDepreciacao,
    );

    // CAPEX: receita do DRE * taxaCapex
    const capexFinal = new Decimal(dreAno.receita).times(premissas.taxaCapex);

    // Imobilizado: Imobilizado Anterior + CAPEX - Depreciação
    const imobilizado = new Decimal(bpAnterior.imobilizado)
      .plus(capexFinal)
      .minus(depreciacao);

    const ativoTotal = ativoCirculante.plus(imobilizado);

    // Passivos
    const contasPagar = new Decimal(bpAnterior.contasPagar).times(
      new Decimal(1).plus(taxaCrescPassivos),
    );
    const passivoCirculante = contasPagar;

    // Passivo Não Circulante: dívidas de longo prazo (pode ser expandido futuramente)
    const passivoNaoCirculante = new Decimal(
      bpAnterior.dividasLongoPrazo,
    ).times(new Decimal(1).plus(taxaCrescPassivos));
    const dividasLongoPrazo = passivoNaoCirculante; // Para manter compatibilidade
    // Patrimônio Líquido: PL Anterior + Lucro Líquido do Ano
    const patrimonioLiquido = new Decimal(bpAnterior.patrimonioLiquido).plus(
      new Decimal(dreAno.lucroLiquido),
    );
    // Passivo Total: circulante + não circulante + PL (usar valor atualizado)
    const passivoTotal = passivoCirculante
      .plus(passivoNaoCirculante)
      .plus(patrimonioLiquido);

    // capitalDeGiro: ativoCirculante - passivoCirculante
    const capitalDeGiro = ativoCirculante.minus(passivoCirculante);
    const bpCalculado: BalanceSheetCalculated = {
      ano: dreAno.ano,
      caixa: caixa.toNumber(),
      contasReceber: contasReceber.toNumber(),
      estoques: estoques.toNumber(),
      ativoCirculante: ativoCirculante.toNumber(),
      imobilizado: imobilizado.toNumber(),
      ativoTotal: ativoTotal.toNumber(),
      contasPagar: contasPagar.toNumber(),
      passivoCirculante: passivoCirculante.toNumber(),
      passivoNaoCirculante: passivoNaoCirculante.toNumber(),
      dividasLongoPrazo: dividasLongoPrazo.toNumber(),
      passivoTotal: passivoTotal.toNumber(),
      patrimonioLiquido: patrimonioLiquido.toNumber(),
      depreciacao: depreciacao.toNumber(),
      capex: capexFinal.toNumber(),
      capitalDeGiro: capitalDeGiro.toNumber(),
    };

    return {
      success: true,
      data: bpCalculado,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao calcular BP: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Calcula projeção completa de Balanço Patrimonial integrado com DRE
 *
 * @param bpBase - BP do ano base
 * @param dreProjetado - Array de DREs projetados
 * @param premissas - Premissas de projeção
 * @returns Resultado do cálculo com array de BPs projetados
 */
export function calculateAllBalanceSheet(
  bpBase: BalanceSheetBaseInputs,
  dreProjetado: DRECalculated[],
  premissas: BalanceSheetProjectionInputs,
): CalculationResult<BalanceSheetCalculated[]> {
  try {
    // Validar entradas
    if (dreProjetado.length === 0) {
      return {
        success: false,
        errors: ["Array de DRE projetado está vazio"],
      };
    }

    // Criar BP do ano base (ano 0)
    const bpAnoBase: BalanceSheetCalculated = {
      ano: 0,
      caixa: bpBase.caixa,
      contasReceber: bpBase.contasReceber,
      estoques: bpBase.estoques,
      ativoCirculante: bpBase.ativoCirculante,
      imobilizado: bpBase.imobilizado,
      ativoTotal: bpBase.ativoTotal,
      contasPagar: bpBase.contasPagar,
      passivoCirculante: bpBase.passivoCirculante,
      passivoNaoCirculante: bpBase.dividasLongoPrazo, // Inicialmente igual a dívidas de longo prazo
      dividasLongoPrazo: bpBase.dividasLongoPrazo,
      passivoTotal:
        bpBase.passivoCirculante +
        bpBase.dividasLongoPrazo +
        bpBase.patrimonioLiquido,
      patrimonioLiquido: bpBase.patrimonioLiquido,
      depreciacao: 0, // Primeiro ano não tem depreciação
      capex: 0,
      capitalDeGiro:
        (bpBase.ativoCirculante ?? 0) - (bpBase.passivoCirculante ?? 0),
    };

    const bpProjetado: BalanceSheetCalculated[] = [bpAnoBase];

    // Calcular BP para cada ano (começando do ano 1, pois ano 0 é base)
    for (let i = 1; i < dreProjetado.length; i++) {
      const bpAnterior = bpProjetado[bpProjetado.length - 1];
      const dreAno = dreProjetado[i];
      const resultado = calculateBalanceSheet(
        bpAnterior,
        dreAno,
        premissas,
        i - 1,
      );

      if (!resultado.success || !resultado.data) {
        return {
          success: false,
          errors: resultado.errors || ["Erro ao calcular BP do ano " + i],
        };
      }

      bpProjetado.push(resultado.data);
    }

    return {
      success: true,
      data: bpProjetado,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao calcular projeção de BP: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}
