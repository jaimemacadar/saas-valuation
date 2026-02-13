/**
 * Mock Utilities
 *
 * Funções utilitárias para processamento de dados mock
 */

import type { MockFinancialModel } from "./types";

// Cache de modelos processados para evitar recálculos
const processedModelsCache = new Map<string, MockFinancialModel>();

/**
 * Gera dados DRE mock calculados baseados nos inputs
 */
function generateMockDRE(modelData: any): any[] {
  const { dreBase, dreProjection, anosProjecao = 5 } = modelData;

  if (!dreBase || !dreProjection) return [];

  const dre: any[] = [];

  for (let ano = 0; ano <= anosProjecao; ano++) {
    const isAnoBase = ano === 0;
    const taxaReceita = isAnoBase
      ? 0
      : dreProjection.taxaCrescimentoReceita[ano - 1] || 0.1;

    const receitaAnterior =
      ano === 0 ? dreBase.receita : dre[ano - 1].receitaLiquida;
    const receita = isAnoBase
      ? dreBase.receita
      : receitaAnterior * (1 + taxaReceita);

    const taxaCMV = isAnoBase
      ? dreBase.custoMercadoriaVendida / dreBase.receita
      : dreProjection.taxaCMV[ano - 1] || 0.4;

    const cmv = receita * taxaCMV;
    const lucroBruto = receita - cmv;

    const taxaDespOp = isAnoBase
      ? dreBase.despesasOperacionais / dreBase.receita
      : dreProjection.taxaDespesasOperacionais[ano - 1] || 0.2;

    const despOp = receita * taxaDespOp;
    const ebitda = lucroBruto - despOp;

    const deprec = receita * 0.05; // Mock: 5% da receita
    const ebit = ebitda - deprec;

    const taxaDespFin = isAnoBase
      ? dreBase.despesasFinanceiras / dreBase.receita
      : dreProjection.taxaDespesasFinanceiras[ano - 1] || 0.01;

    const despFin = receita * taxaDespFin;
    const lair = ebit - despFin;

    const taxaImposto = dreBase.taxaImposto;
    const impostos = lair > 0 ? lair * taxaImposto : 0;
    const lucroLiquido = lair - impostos;

    dre.push({
      ano: 2024 + ano,
      receitaLiquida: receita,
      custoMercadoriaVendida: cmv,
      lucroBruto: lucroBruto,
      despesasOperacionais: despOp,
      ebitda: ebitda,
      depreciacaoAmortizacao: deprec,
      ebit: ebit,
      despesasFinanceiras: despFin,
      lair: lair,
      impostos: impostos,
      lucroLiquido: lucroLiquido,
    });
  }

  return dre;
}

/**
 * Gera dados de Balance Sheet mock
 */
function generateMockBalanceSheet(modelData: any, dreData: any[]): any[] {
  const balanceSheet: any[] = [];

  dreData.forEach((dre) => {
    const receita = dre.receitaLiquida;

    // Mock simplificado: valores baseados em % da receita
    const caixa = receita * 0.15;
    const contasReceber = receita * 0.12;
    const estoques = receita * 0.08;
    const ativoCirculante = caixa + contasReceber + estoques;

    const imobilizado = receita * 0.4;
    const ativoNaoCirculante = imobilizado;
    const ativoTotal = ativoCirculante + ativoNaoCirculante;

    const contasPagar = receita * 0.1;
    const dividaCP = receita * 0.05;
    const passivoCirculante = contasPagar + dividaCP;

    const dividaLP = receita * 0.2;
    const passivoNaoCirculante = dividaLP;

    const patrimonio = ativoTotal - passivoCirculante - passivoNaoCirculante;

    balanceSheet.push({
      ano: dre.ano,
      caixa: caixa,
      contasReceber: contasReceber,
      estoques: estoques,
      ativoCirculante: ativoCirculante,
      imobilizado: imobilizado,
      ativoNaoCirculante: ativoNaoCirculante,
      ativoTotal: ativoTotal,
      contasPagar: contasPagar,
      dividasCP: dividaCP,
      passivoCirculante: passivoCirculante,
      dividasLP: dividaLP,
      passivoNaoCirculante: passivoNaoCirculante,
      patrimonioLiquido: patrimonio,
      capitalSocial: patrimonio * 0.5,
      lucrosAcumulados: patrimonio * 0.5,
    });
  });

  return balanceSheet;
}

/**
 * Gera dados de FCFF mock
 */
function generateMockFCFF(dreData: any[], balanceSheetData: any[]): any[] {
  const fcff: any[] = [];

  dreData.forEach((dre, index) => {
    const bs = balanceSheetData[index];
    const bsAnterior = index > 0 ? balanceSheetData[index - 1] : bs;

    const ebit = dre.ebit;
    const taxaImposto = dre.lair !== 0 ? dre.impostos / dre.lair : 0;
    const nopat = ebit * (1 - taxaImposto);

    const deprec = dre.depreciacaoAmortizacao;
    const varCapitalGiro =
      bs.ativoCirculante -
      bs.passivoCirculante -
      (bsAnterior.ativoCirculante - bsAnterior.passivoCirculante);
    const capex = bs.imobilizado - bsAnterior.imobilizado + deprec;

    const fcffValue = nopat + deprec - varCapitalGiro - capex;

    fcff.push({
      ano: dre.ano,
      ebit: ebit,
      impostosSobreEBIT: ebit * taxaImposto,
      nopat: nopat,
      depreciacaoAmortizacao: deprec,
      variacaoCapitalGiro: varCapitalGiro,
      capex: capex,
      fcff: fcffValue,
    });
  });

  return fcff;
}

/**
 * Processa model_data adicionando dados calculados mock se necessário
 */
export function processModelDataSync(
  model: MockFinancialModel
): MockFinancialModel {
  // Verifica cache primeiro
  if (processedModelsCache.has(model.id)) {
    return processedModelsCache.get(model.id)!;
  }

  const modelData = model.model_data as any;

  // Se model_data está vazio ou já tem dados calculados, retorna sem processar
  if (
    !modelData ||
    Object.keys(modelData).length === 0 ||
    (modelData.dre && modelData.balanceSheet && modelData.fcff)
  ) {
    processedModelsCache.set(model.id, model);
    return model;
  }

  // Se tem inputs mas não tem dados calculados, gera dados mock
  if (modelData.dreBase && modelData.dreProjection && !modelData.dre) {
    try {
      const dreData = generateMockDRE(modelData);
      const balanceSheetData = generateMockBalanceSheet(modelData, dreData);
      const fcffData = generateMockFCFF(dreData, balanceSheetData);

      const processedModel = {
        ...model,
        model_data: {
          ...modelData,
          dre: dreData,
          balanceSheet: balanceSheetData,
          fcff: fcffData,
        },
      };

      processedModelsCache.set(model.id, processedModel);
      return processedModel;
    } catch (error) {
      console.error("[MOCK] Erro ao processar model_data:", error);
    }
  }

  processedModelsCache.set(model.id, model);
  return model;
}
