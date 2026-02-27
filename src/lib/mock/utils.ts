/**
 * Mock Utilities
 *
 * Funções utilitárias para processamento de dados mock
 */

import type { MockFinancialModel } from "./types";
import type {
  DREProjectionInputs,
  BalanceSheetProjectionInputs,
} from "@/core/types";

// Cache de modelos processados para evitar recálculos
const processedModelsCache = new Map<string, MockFinancialModel>();

/**
 * Gera dados DRE mock calculados baseados nos inputs
 */
function generateMockDRE(modelData: any): any[] {
  const { dreBase, dreProjection, anosProjecao = 5 } = modelData;

  if (!dreBase || !dreProjection || !Array.isArray(dreProjection)) return [];

  const dre: any[] = [];

  // Ano base (ano 0)
  const receitaBrutaBase = dreBase.receitaBruta || 0;
  const impostosEDevolucoesBase = dreBase.impostosEDevolucoes || 0;
  const receitaLiquidaBase = receitaBrutaBase - impostosEDevolucoesBase;
  const cmvBase = dreBase.cmv || 0;
  const lucroBrutoBase = receitaLiquidaBase - cmvBase;
  const despOpBase = dreBase.despesasOperacionais || 0;
  const ebitBase = lucroBrutoBase - despOpBase;
  const deprecBase = 0; // Ano base sem depreciação
  const ebitdaBase = ebitBase + deprecBase;
  const despFinBase = 0;
  const lairBase = ebitBase - despFinBase;
  const impostosBase = dreBase.irCSLL || 0;
  const lucroLiquidoBase = lairBase - impostosBase;

  dre.push({
    year: 0,
    ano: 2024,
    receitaBruta: receitaBrutaBase,
    impostosEDevolucoes: impostosEDevolucoesBase,
    receitaLiquida: receitaLiquidaBase,
    cmv: cmvBase,
    lucroBruto: lucroBrutoBase,
    despesasOperacionais: despOpBase,
    ebit: ebitBase,
    depreciacaoAmortizacao: deprecBase,
    ebitda: ebitdaBase,
    despesasFinanceiras: despFinBase,
    lucroAntesIR: lairBase,
    irCSLL: impostosBase,
    lucroLiquido: lucroLiquidoBase,
    dividendos: dreBase.dividendos || 0,
  });

  // Anos projetados
  for (let i = 0; i < Math.min(dreProjection.length, anosProjecao); i++) {
    const premissas = dreProjection[i] as DREProjectionInputs;
    const dreAnterior = dre[dre.length - 1];

    const crescimento = premissas.receitaBrutaGrowth / 100;
    const receitaBruta = dreAnterior.receitaBruta * (1 + crescimento);

    const taxaImpostos = premissas.impostosEDevolucoesRate / 100;
    const impostosEDevolucoes = receitaBruta * taxaImpostos;
    const receitaLiquida = receitaBruta - impostosEDevolucoes;

    const taxaCMV = premissas.cmvRate / 100;
    const cmv = receitaLiquida * taxaCMV;
    const lucroBruto = receitaLiquida - cmv;

    const taxaDespOp = premissas.despesasOperacionaisRate / 100;
    const despOp = receitaLiquida * taxaDespOp;
    const ebit = lucroBruto - despOp;

    const deprec = receitaBruta * 0.05; // Mock: 5% da receita bruta
    const ebitda = ebit + deprec;

    const despFin = receitaBruta * 0.01; // Mock: 1% da receita bruta
    const lair = ebit - despFin;

    const taxaIrCSLL = premissas.irCSLLRate / 100;
    const impostos = lair > 0 ? lair * taxaIrCSLL : 0;
    const lucroLiquido = lair - impostos;

    const taxaDividendos = premissas.dividendosRate / 100;
    const dividendos = lucroLiquido > 0 ? lucroLiquido * taxaDividendos : 0;

    dre.push({
      year: premissas.year,
      ano: 2024 + premissas.year,
      receitaBruta,
      impostosEDevolucoes,
      receitaLiquida,
      cmv,
      lucroBruto,
      despesasOperacionais: despOp,
      ebit,
      depreciacaoAmortizacao: deprec,
      ebitda,
      despesasFinanceiras: despFin,
      lucroAntesIR: lair,
      irCSLL: impostos,
      lucroLiquido,
      dividendos,
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
    const receita = dre.receitaBruta;

    // Mock simplificado: valores baseados em % da receita bruta
    const caixa = receita * 0.15;
    const aplicacoes = receita * 0.05;
    const contasReceber = receita * 0.12;
    const estoques = receita * 0.03;
    const ativoCirculante = caixa + aplicacoes + contasReceber + estoques;

    const imobilizado = receita * 0.15;
    const ativoNaoCirculante = imobilizado;
    const ativoTotal = ativoCirculante + ativoNaoCirculante;

    const fornecedores = receita * 0.06;
    const impostosAPagar = receita * 0.02;
    const obrigacoesSociais = receita * 0.03;
    const dividaCP = receita * 0.04;
    const passivoCirculante =
      fornecedores + impostosAPagar + obrigacoesSociais + dividaCP;

    const dividaLP = receita * 0.12;
    const passivoNaoCirculante = dividaLP;

    const patrimonio = ativoTotal - passivoCirculante - passivoNaoCirculante;

    balanceSheet.push({
      year: dre.year,
      ano: dre.ano,
      ativoCirculante: {
        caixaEquivalentes: caixa,
        aplicacoesFinanceiras: aplicacoes,
        contasReceber: contasReceber,
        estoques: estoques,
        outrosCreditos: 0,
        total: ativoCirculante,
      },
      ativoRealizavelLP: {
        investimentos: 0,
        imobilizadoBruto: imobilizado * 1.5,
        depreciacaoAcumulada: imobilizado * 0.5,
        imobilizado: imobilizado,
        intangivel: 0,
        total: imobilizado,
      },
      passivoCirculante: {
        fornecedores: fornecedores,
        impostosAPagar: impostosAPagar,
        obrigacoesSociaisETrabalhistas: obrigacoesSociais,
        emprestimosFinanciamentosCP: dividaCP,
        outrasObrigacoes: 0,
        total: passivoCirculante,
      },
      passivoRealizavelLP: {
        emprestimosFinanciamentosLP: dividaLP,
        total: passivoNaoCirculante,
      },
      patrimonioLiquido: {
        capitalSocial: patrimonio * 0.6,
        lucrosAcumulados: patrimonio * 0.4,
        total: patrimonio,
      },
      depreciacaoAnual: dre.depreciacaoAmortizacao || 0,
      capex: receita * 0.05,
      novosEmprestimosFinanciamentosCP: 0,
      novosEmprestimosFinanciamentosLP: 0,
      capitalGiro: ativoCirculante - passivoCirculante,
      ncg: 0,
      ativoTotal: ativoTotal,
      passivoTotal: passivoCirculante + passivoNaoCirculante + patrimonio,
    });
  });

  return balanceSheet;
}

/**
 * Gera dados de FCFF mock
 */
function generateMockFCFF(dreData: any[], balanceSheetData: any[]): any[] {
  const fcff: any[] = [];

  // Pular ano 0 (base) pois FCFF é calculado apenas para anos projetados
  for (let index = 1; index < dreData.length; index++) {
    const dre = dreData[index];
    const bs = balanceSheetData[index];

    const ebit = dre.ebit;
    const impostos = dre.irCSLL;
    const nopat = ebit - impostos;

    const deprec = dre.depreciacaoAmortizacao || 0;
    const capex = bs.capex || 0;
    const ncg = bs.ncg || 0;

    const fcffValue = ebit - ncg - capex;

    fcff.push({
      year: dre.year,
      ano: dre.ano,
      ebit: ebit,
      impostos: impostos,
      nopat: nopat,
      depreciacaoAmortizacao: deprec,
      capex: capex,
      ncg: ncg,
      fcff: fcffValue,
    });
  }

  return fcff;
}

/**
 * Processa model_data adicionando dados calculados mock se necessário
 */
export function processModelDataSync(
  model: MockFinancialModel
): MockFinancialModel {
  // Reusa cache apenas quando o modelo não mudou
  const cachedModel = processedModelsCache.get(model.id);
  if (cachedModel && cachedModel.updated_at === model.updated_at) {
    return cachedModel;
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
