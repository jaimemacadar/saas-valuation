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

  // Calcular prazos médios do ano base (em dias)
  const calculateDays = (value: number): number => {
    if (receitaBruta === 0) return 0;
    return parseFloat(((value / receitaBruta) * 360).toFixed(0));
  };

  // Prazos médios - Ativo
  const prazoCaixaEquivalentes = calculateDays(balanceBase.ativoCirculante.caixaEquivalentes) || 54;
  const prazoAplicacoesFinanceiras = calculateDays(balanceBase.ativoCirculante.aplicacoesFinanceiras) || 18;
  const prazoContasReceber = calculateDays(balanceBase.ativoCirculante.contasReceber) || 45;
  const prazoEstoques = calculateDays(balanceBase.ativoCirculante.estoques) || 11;
  const prazoAtivosBiologicos = calculateDays(balanceBase.ativoCirculante.ativosBiologicos) || 0;

  // Prazos médios - Passivo
  const prazoFornecedores = calculateDays(balanceBase.passivoCirculante.fornecedores) || 22;
  const prazoImpostosAPagar = calculateDays(balanceBase.passivoCirculante.impostosAPagar) || 7;
  const prazoObrigacoesSociais = calculateDays(balanceBase.passivoCirculante.obrigacoesSociaisETrabalhistas) || 11;

  // Gerar premissas para cada ano
  const projections: BalanceSheetProjectionInputs[] = [];
  for (let year = 1; year <= numberOfYears; year++) {
    projections.push({
      year,
      taxaDepreciacao: 20, // 20% ao ano (5 anos de vida útil)
      indiceImobilizadoVendas: 0.05, // CAPEX = 5% da receita bruta
      prazoCaixaEquivalentes,
      prazoAplicacoesFinanceiras,
      prazoContasReceber,
      prazoEstoques,
      prazoAtivosBiologicos,
      prazoFornecedores,
      prazoImpostosAPagar,
      prazoObrigacoesSociais,
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
