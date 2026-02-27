/**
 * Motor de Cálculo Completo (Full Valuation)
 *
 * Orquestra todos os cálculos: DRE → BP → FCFF → Valuation
 * Esta é a função principal do motor de cálculo.
 */

import type {
  FullValuationInput,
  FullValuationResult,
  CalculationResult,
} from "../types/index.js";
import {
  validateInput,
  FullValuationInputSchema,
} from "../validators/index.js";
import { calculateAllDRE } from "./dre.js";
import { calculateAllBalanceSheet } from "./balanceSheet.js";
import { calculateAllFCFF } from "./fcff.js";
import { calculateValuation } from "./valuation.js";
import { calculateAllIndicadores } from "./indicadores.js";

/**
 * Executa valuation completo da empresa
 *
 * Esta função orquestra todo o processo:
 * 1. Valida inputs
 * 2. Calcula projeção de DRE
 * 3. Calcula projeção de Balanço Patrimonial
 * 4. Calcula FCFF (Free Cash Flow to Firm)
 * 5. Calcula Valuation por DCF
 *
 * @param input - Dados completos para valuation
 * @returns Resultado com todas as projeções e valuation final
 */
export function executeFullValuation(
  input: FullValuationInput,
): CalculationResult<FullValuationResult> {
  try {
    // 1. Validar inputs
    const validationResult = validateInput(FullValuationInputSchema, input);

    if (!validationResult.success) {
      return {
        success: false,
        errors: validationResult.errors,
      };
    }

    const validatedInput = validationResult.data;

    // 2–5. Fluxo iterativo DRE → BP → DRE (integração sem circularidade)
    // Pass 1: DRE parcial (despesasFinanceiras = 0)
    const drePass1 = calculateAllDRE(
      validatedInput.dreBase,
      validatedInput.dreProjection,
    );

    if (!drePass1.success || !drePass1.data) {
      return {
        success: false,
        errors: drePass1.errors || ["Erro ao calcular DRE (pass 1)"],
      };
    }

    // Pass 2: BP com DRE parcial → extrai despesasFinanceiras e depreciacaoAnual
    const bpPass1 = calculateAllBalanceSheet(
      validatedInput.balanceSheetBase,
      drePass1.data,
      validatedInput.balanceSheetProjection,
    );

    if (!bpPass1.success || !bpPass1.data) {
      return {
        success: false,
        errors: bpPass1.errors || ["Erro ao calcular Balanço Patrimonial (pass 1)"],
      };
    }

    const bpDataForDRE = bpPass1.data
      .filter((bp) => bp.year > 0)
      .map((bp) => ({
        year: bp.year,
        despesasFinanceiras: bp.despesasFinanceiras,
        depreciacaoAnual: bp.depreciacaoAnual,
      }));

    // Pass 3: DRE final com D&A e despesasFinanceiras reais do BP
    const dreResult = calculateAllDRE(
      validatedInput.dreBase,
      validatedInput.dreProjection,
      bpDataForDRE,
    );

    if (!dreResult.success || !dreResult.data) {
      return {
        success: false,
        errors: dreResult.errors || ["Erro ao calcular DRE"],
      };
    }

    const dreProjetado = dreResult.data;

    // Pass 4: BP final com DRE corrigido → lucrosAcumulados corretos
    const bpResult = calculateAllBalanceSheet(
      validatedInput.balanceSheetBase,
      dreProjetado,
      validatedInput.balanceSheetProjection,
    );

    if (!bpResult.success || !bpResult.data) {
      return {
        success: false,
        errors: bpResult.errors || ["Erro ao calcular Balanço Patrimonial"],
      };
    }

    const bpProjetado = bpResult.data;

    // 4. Calcular FCFF (Free Cash Flow to Firm)
    const fcffResult = calculateAllFCFF(dreProjetado, bpProjetado);

    if (!fcffResult.success || !fcffResult.data) {
      return {
        success: false,
        errors: fcffResult.errors || ["Erro ao calcular FCFF"],
      };
    }

    const fcffProjetado = fcffResult.data;

    // 5. Calcular Valuation por DCF
    const valuationResult = calculateValuation({
      fcff: fcffProjetado,
      wacc: validatedInput.wacc.wacc,
      taxaCrescimentoPerpetuo: validatedInput.taxaCrescimentoPerpetuo,
      anoBase: 0,
    });

    if (!valuationResult.success || !valuationResult.data) {
      return {
        success: false,
        errors: valuationResult.errors || ["Erro ao calcular Valuation"],
      };
    }

    const valuation = valuationResult.data;

    // 6. Calcular Indicadores Financeiros
    const indicadoresResult = calculateAllIndicadores(dreProjetado, bpProjetado);

    if (!indicadoresResult.success || !indicadoresResult.data) {
      return {
        success: false,
        errors: indicadoresResult.errors || ["Erro ao calcular indicadores"],
      };
    }

    // Montar resultado completo
    const fullResult: FullValuationResult = {
      dre: dreProjetado,
      balanceSheet: bpProjetado,
      fcff: fcffProjetado,
      valuation: valuation,
      wacc: validatedInput.wacc,
      indicadores: indicadoresResult.data,
    };

    return {
      success: true,
      data: fullResult,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao executar valuation completo: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Executa valuation rápido com valores padrão
 *
 * Útil para testes e demos.
 *
 * @param receita - Receita bruta do ano base
 * @param anosProjecao - Número de anos a projetar
 * @returns Resultado do valuation
 */
export function executeQuickValuation(
  receita: number,
  anosProjecao: number = 5,
): CalculationResult<FullValuationResult> {
  // Premissas padrão simplificadas
  const dreProjection: import("../types/index.js").DREProjectionInputs[] = Array.from(
    { length: anosProjecao },
    (_, i) => ({
      year: i + 1,
      receitaBrutaGrowth: 10,
      impostosEDevolucoesRate: 8,
      cmvRate: 30,
      despesasOperacionaisRate: 40,
      irCSLLRate: 34,
      dividendosRate: 20,
    }),
  );

  const balanceSheetProjection: import("../types/index.js").BalanceSheetProjectionInputs[] = Array.from(
    { length: anosProjecao },
    (_, i) => ({
      year: i + 1,
      taxaDepreciacao: 10,
      indiceImobilizadoVendas: 0.05,
      taxaJurosAplicacoes: 8,
      prazoCaixaEquivalentes: 54,
      prazoContasReceber: 45,
      prazoEstoques: 10,
      prazoOutrosCreditos: 0,
      prazoFornecedores: 25,
      prazoImpostosAPagar: 7,
      prazoObrigacoesSociais: 11,
      prazoOutrasObrigacoes: 0,
      taxaNovosEmprestimosCP: 5,
      taxaNovosEmprestimosLP: 5,
      taxaJurosEmprestimo: 12,
    }),
  );

  const input: FullValuationInput = {
    dreBase: {
      receitaBruta: receita,
      impostosEDevolucoes: receita * 0.08,
      cmv: receita * 0.3,
      despesasOperacionais: receita * 0.4,
      irCSLL: receita * 0.05,
      dividendos: receita * 0.02,
    },
    dreProjection,
    balanceSheetBase: {
      ativoCirculante: {
        caixaEquivalentes: receita * 0.15,
        aplicacoesFinanceiras: receita * 0.05,
        contasReceber: receita * 0.125,
        estoques: receita * 0.03,
        outrosCreditos: receita * 0.025,
      },
      ativoRealizavelLP: {
        investimentos: receita * 0.02,
        ativoImobilizadoBruto: receita * 0.2,
        depreciacaoAcumulada: receita * 0.05,
        intangivel: receita * 0.03,
      },
      passivoCirculante: {
        fornecedores: receita * 0.06,
        impostosAPagar: receita * 0.02,
        obrigacoesSociaisETrabalhistas: receita * 0.03,
        emprestimosFinanciamentosCP: receita * 0.04,
        outrasObrigacoes: receita * 0.01,
      },
      passivoRealizavelLP: {
        emprestimosFinanciamentosLP: receita * 0.12,
      },
      patrimonioLiquido: {
        capitalSocial: receita * 0.2,
        lucrosAcumulados: receita * 0.08,
      },
    },
    balanceSheetProjection,
    wacc: {
      custoCapitalProprio: 15,
      custoCapitalTerceiros: 12,
      wacc: 12.5,
      pesoCapitalProprio: 0.65,
      pesoCapitalTerceiros: 0.35,
    },
    taxaCrescimentoPerpetuo: 3,
    anosProjecao,
  };

  return executeFullValuation(input);
}
