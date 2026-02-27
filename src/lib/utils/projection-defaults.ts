// src/lib/utils/projection-defaults.ts

import type {
  DREBaseInputs,
  DREProjectionInputs,
  BalanceSheetBaseInputs,
  BalanceSheetProjectionInputs,
} from "@/core/types";

/**
 * Gera premissas padrão de projeção da DRE baseadas no ano base.
 *
 * Calcula margens automaticamente a partir dos dados do ano base:
 * - Crescimento de receita: 5% padrão
 * - Margens: calculadas a partir dos valores do ano base
 */
export function generateDREProjectionDefaults(
  dreBase: DREBaseInputs,
  numberOfYears: number = 5
): DREProjectionInputs[] {
  // Calcular margens do ano base
  const receitaLiquida = dreBase.receitaBruta - dreBase.impostosEDevolucoes;
  const lair = receitaLiquida - dreBase.cmv - dreBase.despesasOperacionais;
  const lucroLiquido = lair - dreBase.irCSLL;

  // Evitar divisão por zero - usar valores padrão se necessário
  const impostosEDevolucoesRate = dreBase.receitaBruta > 0
    ? (dreBase.impostosEDevolucoes / dreBase.receitaBruta) * 100
    : 15; // 15% padrão

  const cmvRate = receitaLiquida > 0
    ? (dreBase.cmv / receitaLiquida) * 100
    : 40; // 40% padrão

  const despesasOperacionaisRate = receitaLiquida > 0
    ? (dreBase.despesasOperacionais / receitaLiquida) * 100
    : 25; // 25% padrão

  const irCSLLRate = lair > 0
    ? (dreBase.irCSLL / lair) * 100
    : 34; // 34% padrão (IR + CSLL)

  const dividendosRate = lucroLiquido > 0
    ? (dreBase.dividendos / lucroLiquido) * 100
    : 25; // 25% padrão

  // Gerar premissas para cada ano
  const projections: DREProjectionInputs[] = [];
  for (let year = 1; year <= numberOfYears; year++) {
    projections.push({
      year,
      receitaBrutaGrowth: 5, // 5% de crescimento padrão
      impostosEDevolucoesRate: parseFloat(impostosEDevolucoesRate.toFixed(2)),
      cmvRate: parseFloat(cmvRate.toFixed(2)),
      despesasOperacionaisRate: parseFloat(despesasOperacionaisRate.toFixed(2)),
      irCSLLRate: parseFloat(irCSLLRate.toFixed(2)),
      dividendosRate: parseFloat(dividendosRate.toFixed(2)),
    });
  }

  return projections;
}

/**
 * Gera premissas padrão de projeção do Balanço Patrimonial baseadas no ano base.
 *
 * Calcula prazos médios automaticamente:
 * - Prazo = (Saldo / Receita Bruta) × 360 dias
 * - Taxas e índices: valores padrão conservadores
 */
export function generateBalanceSheetProjectionDefaults(
  balanceBase: BalanceSheetBaseInputs,
  dreBase: DREBaseInputs,
  numberOfYears: number = 5
): BalanceSheetProjectionInputs[] {
  const receitaBruta = dreBase.receitaBruta;
  const cmv = dreBase.cmv;
  const impostosEDevolucoes = dreBase.impostosEDevolucoes;
  const despesasOperacionais = dreBase.despesasOperacionais;

  // Helpers: prazo = (saldo / base) × 360
  const calcDays = (value: number, base: number): number => {
    if (base === 0) return 0;
    return parseFloat(((value / base) * 360).toFixed(0));
  };

  // Prazos médios - Ativo (base: Receita Bruta, exceto Estoques → CMV)
  const prazoCaixaEquivalentes = calcDays(balanceBase.ativoCirculante.caixaEquivalentes, receitaBruta) || 54;
  const prazoContasReceber = calcDays(balanceBase.ativoCirculante.contasReceber, receitaBruta) || 45;
  const prazoEstoques = calcDays(balanceBase.ativoCirculante.estoques, cmv) || 11;
  const prazoOutrosCreditos = calcDays(balanceBase.ativoCirculante.outrosCreditos, receitaBruta) || 0;

  // Prazos médios - Passivo (bases específicas por conta)
  const prazoFornecedores = calcDays(balanceBase.passivoCirculante.fornecedores, cmv) || 22;
  const prazoImpostosAPagar = calcDays(balanceBase.passivoCirculante.impostosAPagar, impostosEDevolucoes) || 7;
  const prazoObrigacoesSociais = calcDays(balanceBase.passivoCirculante.obrigacoesSociaisETrabalhistas, despesasOperacionais) || 11;
  const prazoOutrasObrigacoes = calcDays(balanceBase.passivoCirculante.outrasObrigacoes, receitaBruta) || 0;

  // Gerar premissas para cada ano
  const projections: BalanceSheetProjectionInputs[] = [];
  for (let year = 1; year <= numberOfYears; year++) {
    projections.push({
      year,
      taxaDepreciacao: 20, // 20% ao ano (5 anos de vida útil)
      indiceImobilizadoVendas: 0.05, // CAPEX = 5% da receita bruta
      taxaJurosAplicacoes: 8, // 8% a.a. sobre saldo de Aplicações Financeiras
      prazoCaixaEquivalentes,
      prazoContasReceber,
      prazoEstoques,
      prazoOutrosCreditos,
      prazoFornecedores,
      prazoImpostosAPagar,
      prazoObrigacoesSociais,
      prazoOutrasObrigacoes,
      taxaNovosEmprestimosCP: 5,  // 5% de crescimento da dívida CP
      taxaNovosEmprestimosLP: 5,  // 5% de crescimento da dívida LP
      taxaJurosEmprestimo: 12,    // 12% a.a. sobre dívida total (CDI + spread típico)
    });
  }

  return projections;
}

/**
 * Gera premissas padrão completas (DRE + BP) a partir do ano base.
 *
 * Útil para auto-preencher quando o usuário cria um novo modelo ou
 * preenche os dados do ano base pela primeira vez.
 */
export function generateDefaultProjections(
  dreBase: DREBaseInputs,
  balanceBase: BalanceSheetBaseInputs,
  numberOfYears: number = 5
): {
  dreProjection: DREProjectionInputs[];
  balanceSheetProjection: BalanceSheetProjectionInputs[];
} {
  return {
    dreProjection: generateDREProjectionDefaults(dreBase, numberOfYears),
    balanceSheetProjection: generateBalanceSheetProjectionDefaults(
      balanceBase,
      dreBase,
      numberOfYears
    ),
  };
}
