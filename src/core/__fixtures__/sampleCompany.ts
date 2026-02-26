/**
 * Sample Company Fixtures
 *
 * Dados realistas de exemplo para testes do motor de cálculo.
 * Baseado em uma empresa SaaS de médio porte conforme PRD.
 */

import type {
  DREBaseInputs,
  DREProjectionInputs,
  BalanceSheetBaseInputs,
  BalanceSheetProjectionInputs,
  WACCCalculation,
  FullValuationInput,
} from "../types/index.js";

/**
 * Empresa SaaS de médio porte
 * Receita Bruta: R$ 10M
 * Crescimento esperado: 15-20% ao ano
 * Margem EBITDA: ~30%
 */

export const sampleDREBase: DREBaseInputs = {
  receitaBruta: 10_000_000, // R$ 10M
  impostosEDevolucoes: 800_000, // 8% da receita bruta
  cmv: 2_760_000, // 30% da receita líquida (R$ 9.2M)
  despesasOperacionais: 4_600_000, // 50% da receita líquida
  irCSLL: 591_600, // 34% do LAIR
  dividendos: 200_000, // ~20% do lucro líquido
};

export const sampleDREProjection: DREProjectionInputs[] = [
  {
    year: 1,
    receitaBrutaGrowth: 20, // 20% crescimento
    impostosEDevolucoesRate: 8, // 8% sobre receita bruta
    cmvRate: 28, // 28% sobre receita líquida
    despesasOperacionaisRate: 48, // 48% sobre receita líquida
    irCSLLRate: 34, // 34% sobre LAIR
    dividendosRate: 20, // 20% sobre lucro líquido
  },
  {
    year: 2,
    receitaBrutaGrowth: 18,
    impostosEDevolucoesRate: 8,
    cmvRate: 26,
    despesasOperacionaisRate: 46,
    irCSLLRate: 34,
    dividendosRate: 20,
  },
  {
    year: 3,
    receitaBrutaGrowth: 15,
    impostosEDevolucoesRate: 8,
    cmvRate: 25,
    despesasOperacionaisRate: 45,
    irCSLLRate: 34,
    dividendosRate: 20,
  },
  {
    year: 4,
    receitaBrutaGrowth: 12,
    impostosEDevolucoesRate: 8,
    cmvRate: 24,
    despesasOperacionaisRate: 44,
    irCSLLRate: 34,
    dividendosRate: 20,
  },
  {
    year: 5,
    receitaBrutaGrowth: 10,
    impostosEDevolucoesRate: 8,
    cmvRate: 23,
    despesasOperacionaisRate: 43,
    irCSLLRate: 34,
    dividendosRate: 20,
  },
];

export const sampleBalanceSheetBase: BalanceSheetBaseInputs = {
  ativoCirculante: {
    caixaEquivalentes: 1_500_000, // 15% da receita bruta
    aplicacoesFinanceiras: 500_000, // 5%
    contasReceber: 1_250_000, // 45 dias de receita bruta
    estoques: 300_000, // Baixo para SaaS
    ativosBiologicos: 0,
    outrosCreditos: 250_000,
  },
  ativoRealizavelLP: {
    investimentos: 200_000,
    ativoImobilizadoBruto: 2_000_000,
    depreciacaoAcumulada: 500_000,
    intangivel: 300_000,
  },
  passivoCirculante: {
    fornecedores: 600_000, // 22 dias
    impostosAPagar: 200_000, // 7 dias
    obrigacoesSociaisETrabalhistas: 300_000, // 11 dias
    emprestimosFinanciamentosCP: 400_000,
    outrasObrigacoes: 100_000,
  },
  passivoRealizavelLP: {
    emprestimosFinanciamentosLP: 1_200_000,
  },
  patrimonioLiquido: {
    capitalSocial: 2_000_000,
    lucrosAcumulados: 1_000_000, // corrigido para equilibrar: Ativo 5.8M = Passivo 2.8M + PL 3.0M
  },
};

export const sampleBalanceSheetProjection: BalanceSheetProjectionInputs[] = [
  {
    year: 1,
    taxaDepreciacao: 20, // 20% sobre imobilizado bruto
    indiceImobilizadoVendas: 0.05, // 5% da receita bruta
    taxaJurosAplicacoes: 8, // 8% a.a.
    prazoCaixaEquivalentes: 54, // dias
    prazoContasReceber: 45, // dias
    prazoEstoques: 11, // dias
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 22, // dias
    prazoImpostosAPagar: 7,
    prazoObrigacoesSociais: 11,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 10,
    taxaNovosEmprestimosLP: 10,
    taxaJurosEmprestimo: 12,
  },
  {
    year: 2,
    taxaDepreciacao: 20,
    indiceImobilizadoVendas: 0.05,
    taxaJurosAplicacoes: 8,
    prazoCaixaEquivalentes: 54,
    prazoContasReceber: 43, // Melhoria de cobrança
    prazoEstoques: 10,
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 24,
    prazoImpostosAPagar: 7,
    prazoObrigacoesSociais: 11,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 8,
    taxaNovosEmprestimosLP: 8,
    taxaJurosEmprestimo: 12,
  },
  {
    year: 3,
    taxaDepreciacao: 20,
    indiceImobilizadoVendas: 0.05,
    taxaJurosAplicacoes: 8,
    prazoCaixaEquivalentes: 54,
    prazoContasReceber: 40,
    prazoEstoques: 9,
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 26,
    prazoImpostosAPagar: 7,
    prazoObrigacoesSociais: 11,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 6,
    taxaNovosEmprestimosLP: 6,
    taxaJurosEmprestimo: 12,
  },
  {
    year: 4,
    taxaDepreciacao: 20,
    indiceImobilizadoVendas: 0.05,
    taxaJurosAplicacoes: 8,
    prazoCaixaEquivalentes: 54,
    prazoContasReceber: 38,
    prazoEstoques: 8,
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 28,
    prazoImpostosAPagar: 7,
    prazoObrigacoesSociais: 11,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 5,
    taxaNovosEmprestimosLP: 5,
    taxaJurosEmprestimo: 12,
  },
  {
    year: 5,
    taxaDepreciacao: 20,
    indiceImobilizadoVendas: 0.05,
    taxaJurosAplicacoes: 8,
    prazoCaixaEquivalentes: 54,
    prazoContasReceber: 36,
    prazoEstoques: 7,
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 30,
    prazoImpostosAPagar: 7,
    prazoObrigacoesSociais: 11,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 5,
    taxaNovosEmprestimosLP: 5,
    taxaJurosEmprestimo: 12,
  },
];

export const sampleWACC: WACCCalculation = {
  custoCapitalProprio: 15, // 15% - Beta de tecnologia, prêmio de risco Brasil
  custoCapitalTerceiros: 12, // 12% - Taxa CDI + spread
  wacc: 12.522, // 0.65*15 + 0.35*12*(1-0.34) = 12.522
  pesoCapitalProprio: 0.65, // 65% equity
  pesoCapitalTerceiros: 0.35, // 35% dívida
};

export const sampleFullValuationInput: FullValuationInput = {
  dreBase: sampleDREBase,
  dreProjection: sampleDREProjection,
  balanceSheetBase: sampleBalanceSheetBase,
  balanceSheetProjection: sampleBalanceSheetProjection,
  wacc: sampleWACC,
  taxaCrescimentoPerpetuo: 3, // 3% - crescimento perpétuo conservador
  anosProjecao: 5,
};

/**
 * Empresa em estágio inicial (Startup)
 * Receita Bruta: R$ 1M
 * Crescimento agressivo: 50-100% ao ano
 * Ainda não lucrativa
 */

export const startupDREBase: DREBaseInputs = {
  receitaBruta: 1_000_000, // R$ 1M
  impostosEDevolucoes: 80_000, // 8%
  cmv: 368_000, // 40% da receita líquida
  despesasOperacionais: 690_000, // 75% da receita líquida
  irCSLL: -47_600, // Prejuízo fiscal (pode ser negativo)
  dividendos: 0, // Sem dividendos (prejuízo)
};

export const startupDREProjection: DREProjectionInputs[] = [
  {
    year: 1,
    receitaBrutaGrowth: 100, // 100% crescimento
    impostosEDevolucoesRate: 8,
    cmvRate: 38,
    despesasOperacionaisRate: 75,
    irCSLLRate: 34,
    dividendosRate: 0,
  },
  {
    year: 2,
    receitaBrutaGrowth: 80,
    impostosEDevolucoesRate: 8,
    cmvRate: 35,
    despesasOperacionaisRate: 70,
    irCSLLRate: 34,
    dividendosRate: 0,
  },
  {
    year: 3,
    receitaBrutaGrowth: 60,
    impostosEDevolucoesRate: 8,
    cmvRate: 32,
    despesasOperacionaisRate: 65,
    irCSLLRate: 34,
    dividendosRate: 10,
  },
  {
    year: 4,
    receitaBrutaGrowth: 40,
    impostosEDevolucoesRate: 8,
    cmvRate: 30,
    despesasOperacionaisRate: 60,
    irCSLLRate: 34,
    dividendosRate: 15,
  },
  {
    year: 5,
    receitaBrutaGrowth: 30,
    impostosEDevolucoesRate: 8,
    cmvRate: 28,
    despesasOperacionaisRate: 55,
    irCSLLRate: 34,
    dividendosRate: 20,
  },
];

export const startupBalanceSheetBase: BalanceSheetBaseInputs = {
  ativoCirculante: {
    caixaEquivalentes: 300_000,
    aplicacoesFinanceiras: 100_000,
    contasReceber: 125_000, // 45 dias
    estoques: 50_000,
    ativosBiologicos: 0,
    outrosCreditos: 25_000,
  },
  ativoRealizavelLP: {
    investimentos: 50_000,
    ativoImobilizadoBruto: 400_000,
    depreciacaoAcumulada: 80_000,
    intangivel: 100_000,
  },
  passivoCirculante: {
    fornecedores: 80_000,
    impostosAPagar: 25_000,
    obrigacoesSociaisETrabalhistas: 40_000,
    emprestimosFinanciamentosCP: 150_000,
    outrasObrigacoes: 30_000,
  },
  passivoRealizavelLP: {
    emprestimosFinanciamentosLP: 500_000,
  },
  patrimonioLiquido: {
    capitalSocial: 500_000,
    lucrosAcumulados: -139_000, // Prejuízos acumulados
  },
};

export const startupBalanceSheetProjection: BalanceSheetProjectionInputs[] = [
  {
    year: 1,
    taxaDepreciacao: 25, // Depreciação mais rápida
    indiceImobilizadoVendas: 0.08, // Investimento agressivo
    taxaJurosAplicacoes: 10, // 10% a.a. (startup paga mais)
    prazoCaixaEquivalentes: 108, // dias
    prazoContasReceber: 45,
    prazoEstoques: 18,
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 29,
    prazoImpostosAPagar: 9,
    prazoObrigacoesSociais: 14,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 50,
    taxaNovosEmprestimosLP: 50,
    taxaJurosEmprestimo: 18, // Taxa alta para startup
  },
  {
    year: 2,
    taxaDepreciacao: 25,
    indiceImobilizadoVendas: 0.07,
    taxaJurosAplicacoes: 10, // 10% a.a. (startup paga mais)
    prazoCaixaEquivalentes: 108, // dias
    prazoContasReceber: 42,
    prazoEstoques: 16,
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 32,
    prazoImpostosAPagar: 9,
    prazoObrigacoesSociais: 14,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 30,
    taxaNovosEmprestimosLP: 30,
    taxaJurosEmprestimo: 18,
  },
  {
    year: 3,
    taxaDepreciacao: 25,
    indiceImobilizadoVendas: 0.06,
    taxaJurosAplicacoes: 10, // 10% a.a. (startup paga mais)
    prazoCaixaEquivalentes: 108, // dias
    prazoContasReceber: 40,
    prazoEstoques: 14,
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 34,
    prazoImpostosAPagar: 9,
    prazoObrigacoesSociais: 14,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 20,
    taxaNovosEmprestimosLP: 20,
    taxaJurosEmprestimo: 18,
  },
  {
    year: 4,
    taxaDepreciacao: 25,
    indiceImobilizadoVendas: 0.05,
    taxaJurosAplicacoes: 10, // 10% a.a. (startup paga mais)
    prazoCaixaEquivalentes: 108, // dias
    prazoContasReceber: 38,
    prazoEstoques: 12,
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 36,
    prazoImpostosAPagar: 9,
    prazoObrigacoesSociais: 14,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 15,
    taxaNovosEmprestimosLP: 15,
    taxaJurosEmprestimo: 18,
  },
  {
    year: 5,
    taxaDepreciacao: 25,
    indiceImobilizadoVendas: 0.05,
    taxaJurosAplicacoes: 10, // 10% a.a. (startup paga mais)
    prazoCaixaEquivalentes: 108, // dias
    prazoContasReceber: 36,
    prazoEstoques: 10,
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 38,
    prazoImpostosAPagar: 9,
    prazoObrigacoesSociais: 14,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 10,
    taxaNovosEmprestimosLP: 10,
    taxaJurosEmprestimo: 18,
  },
];

export const startupWACC: WACCCalculation = {
  custoCapitalProprio: 25, // 25% - Alto risco de startup
  custoCapitalTerceiros: 18, // 18% - Taxa alta para empresas em estágio inicial
  wacc: 19.041, // 0.5*25 + 0.5*18*(1-0.34) = 19.041
  pesoCapitalProprio: 0.5,
  pesoCapitalTerceiros: 0.5,
};

export const startupFullValuationInput: FullValuationInput = {
  dreBase: startupDREBase,
  dreProjection: startupDREProjection,
  balanceSheetBase: startupBalanceSheetBase,
  balanceSheetProjection: startupBalanceSheetProjection,
  wacc: startupWACC,
  taxaCrescimentoPerpetuo: 5, // 5% - ainda em crescimento
  anosProjecao: 5,
};

/**
 * Empresa madura e consolidada
 * Receita Bruta: R$ 50M
 * Crescimento estável: 5-8% ao ano
 * Alta rentabilidade e geração de caixa
 */

export const matureDREBase: DREBaseInputs = {
  receitaBruta: 50_000_000, // R$ 50M
  impostosEDevolucoes: 4_000_000, // 8%
  cmv: 11_040_000, // 24% da receita líquida (R$ 46M)
  despesasOperacionais: 16_560_000, // 36% da receita líquida
  irCSLL: 6_256_800, // 34% do LAIR
  dividendos: 5_500_000, // ~50% do lucro líquido
};

export const matureDREProjection: DREProjectionInputs[] = [
  {
    year: 1,
    receitaBrutaGrowth: 8, // 8% crescimento
    impostosEDevolucoesRate: 8,
    cmvRate: 23,
    despesasOperacionaisRate: 35,
    irCSLLRate: 34,
    dividendosRate: 50,
  },
  {
    year: 2,
    receitaBrutaGrowth: 7,
    impostosEDevolucoesRate: 8,
    cmvRate: 23,
    despesasOperacionaisRate: 34,
    irCSLLRate: 34,
    dividendosRate: 50,
  },
  {
    year: 3,
    receitaBrutaGrowth: 6,
    impostosEDevolucoesRate: 8,
    cmvRate: 22,
    despesasOperacionaisRate: 33,
    irCSLLRate: 34,
    dividendosRate: 50,
  },
  {
    year: 4,
    receitaBrutaGrowth: 5,
    impostosEDevolucoesRate: 8,
    cmvRate: 22,
    despesasOperacionaisRate: 33,
    irCSLLRate: 34,
    dividendosRate: 50,
  },
  {
    year: 5,
    receitaBrutaGrowth: 5,
    impostosEDevolucoesRate: 8,
    cmvRate: 22,
    despesasOperacionaisRate: 32,
    irCSLLRate: 34,
    dividendosRate: 50,
  },
];

export const matureBalanceSheetBase: BalanceSheetBaseInputs = {
  ativoCirculante: {
    caixaEquivalentes: 7_500_000, // 15%
    aplicacoesFinanceiras: 2_500_000, // 5%
    contasReceber: 6_250_000, // 45 dias
    estoques: 1_500_000,
    ativosBiologicos: 0,
    outrosCreditos: 1_250_000,
  },
  ativoRealizavelLP: {
    investimentos: 2_000_000,
    ativoImobilizadoBruto: 10_000_000,
    depreciacaoAcumulada: 4_000_000,
    intangivel: 1_500_000,
  },
  passivoCirculante: {
    fornecedores: 3_000_000,
    impostosAPagar: 1_000_000,
    obrigacoesSociaisETrabalhistas: 1_500_000,
    emprestimosFinanciamentosCP: 2_000_000,
    outrasObrigacoes: 500_000,
  },
  passivoRealizavelLP: {
    emprestimosFinanciamentosLP: 5_000_000,
  },
  patrimonioLiquido: {
    capitalSocial: 10_000_000,
    lucrosAcumulados: 8_000_000,
  },
};

export const matureBalanceSheetProjection: BalanceSheetProjectionInputs[] = [
  {
    year: 1,
    taxaDepreciacao: 15, // Depreciação mais lenta (ativos mais antigos)
    indiceImobilizadoVendas: 0.03, // Investimento moderado
    taxaJurosAplicacoes: 8,
    prazoCaixaEquivalentes: 54,
    prazoContasReceber: 45,
    prazoEstoques: 11,
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 22,
    prazoImpostosAPagar: 7,
    prazoObrigacoesSociais: 11,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 3,
    taxaNovosEmprestimosLP: 3,
    taxaJurosEmprestimo: 10, // Taxa baixa para empresa madura
  },
  {
    year: 2,
    taxaDepreciacao: 15,
    indiceImobilizadoVendas: 0.03,
    taxaJurosAplicacoes: 8,
    prazoCaixaEquivalentes: 54,
    prazoContasReceber: 43,
    prazoEstoques: 10,
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 24,
    prazoImpostosAPagar: 7,
    prazoObrigacoesSociais: 11,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 2,
    taxaNovosEmprestimosLP: 2,
    taxaJurosEmprestimo: 10,
  },
  {
    year: 3,
    taxaDepreciacao: 15,
    indiceImobilizadoVendas: 0.03,
    taxaJurosAplicacoes: 8,
    prazoCaixaEquivalentes: 54,
    prazoContasReceber: 40,
    prazoEstoques: 9,
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 26,
    prazoImpostosAPagar: 7,
    prazoObrigacoesSociais: 11,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 2,
    taxaNovosEmprestimosLP: 2,
    taxaJurosEmprestimo: 10,
  },
  {
    year: 4,
    taxaDepreciacao: 15,
    indiceImobilizadoVendas: 0.03,
    taxaJurosAplicacoes: 8,
    prazoCaixaEquivalentes: 54,
    prazoContasReceber: 38,
    prazoEstoques: 8,
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 28,
    prazoImpostosAPagar: 7,
    prazoObrigacoesSociais: 11,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 2,
    taxaNovosEmprestimosLP: 2,
    taxaJurosEmprestimo: 10,
  },
  {
    year: 5,
    taxaDepreciacao: 15,
    indiceImobilizadoVendas: 0.03,
    taxaJurosAplicacoes: 8,
    prazoCaixaEquivalentes: 54,
    prazoContasReceber: 36,
    prazoEstoques: 7,
    prazoAtivosBiologicos: 0,
      prazoOutrosCreditos: 0,
    prazoFornecedores: 30,
    prazoImpostosAPagar: 7,
    prazoObrigacoesSociais: 11,
      prazoOutrasObrigacoes: 0,
    taxaNovosEmprestimosCP: 2,
    taxaNovosEmprestimosLP: 2,
    taxaJurosEmprestimo: 10,
  },
];

export const matureWACC: WACCCalculation = {
  custoCapitalProprio: 12, // 12% - Menor risco (empresa consolidada)
  custoCapitalTerceiros: 10, // 10% - Taxas baixas por bom rating
  wacc: 9.51, // 0.7*12 + 0.3*10*(1-0.34) = 9.51
  pesoCapitalProprio: 0.7, // 70% equity
  pesoCapitalTerceiros: 0.3, // 30% dívida
};

export const matureFullValuationInput: FullValuationInput = {
  dreBase: matureDREBase,
  dreProjection: matureDREProjection,
  balanceSheetBase: matureBalanceSheetBase,
  balanceSheetProjection: matureBalanceSheetProjection,
  wacc: matureWACC,
  taxaCrescimentoPerpetuo: 2.5, // 2.5% - crescimento perpétuo conservador
  anosProjecao: 5,
};
