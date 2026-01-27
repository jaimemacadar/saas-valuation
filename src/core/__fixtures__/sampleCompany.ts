/**
 * Sample Company Fixtures
 *
 * Dados realistas de exemplo para testes do motor de cálculo.
 * Baseado em uma empresa SaaS de médio porte.
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
 * Receita anual: R$ 10M
 * Crescimento esperado: 15-20% ao ano
 * Margem EBITDA: ~30%
 */

export const sampleDREBase: DREBaseInputs = {
  receita: 10_000_000, // R$ 10M
  custoMercadoriaVendida: 3_000_000, // 30% da receita (servidores, infraestrutura)
  despesasOperacionais: 5_000_000, // 50% da receita (pessoal, marketing, G&A)
  despesasFinanceiras: 200_000, // 2% da receita
  taxaImposto: 0.34, // 34% (IRPJ + CSLL)
};

export const sampleDREProjection: DREProjectionInputs = {
  taxaCrescimentoReceita: [0.2, 0.18, 0.15, 0.12, 0.1], // Desaceleração gradual
  taxaCMV: [0.28, 0.26, 0.25, 0.24, 0.23], // Melhoria de eficiência
  taxaDespesasOperacionais: [0.48, 0.46, 0.45, 0.44, 0.43], // Escala operacional
  taxaDespesasFinanceiras: [0.018, 0.016, 0.015, 0.015, 0.015], // Redução de dívida
};

export const sampleBalanceSheetBase: BalanceSheetBaseInputs = {
  caixa: 2_000_000, // 20% da receita
  contasReceber: 1_500_000, // 45 dias de receita
  estoques: 300_000, // Baixo para SaaS
  ativoCirculante: 3_800_000,
  imobilizado: 1_500_000, // Equipamentos, móveis
  ativoTotal: 5_300_000,
  contasPagar: 800_000, // 30 dias
  passivoCirculante: 1_200_000,
  passivoNaoCirculante: 1_500_000, // Novo campo
  dividasLongoPrazo: 1_500_000, // Financiamento de crescimento
  passivoTotal: 5_300_000, // Corrigido: circulante + não circulante + PL
  patrimonioLiquido: 2_600_000,
};

export const sampleBalanceSheetProjection: BalanceSheetProjectionInputs = {
  taxaCrescimentoAtivos: [0.15, 0.15, 0.12, 0.1, 0.08], // Acompanha crescimento
  taxaCrescimentoPassivos: [0.1, 0.08, 0.06, 0.05, 0.05], // Controle de dívida
  taxaDepreciacao: 0.2, // 20% ao ano (equipamentos TI)
  taxaCapex: 0.05, // 5% da receita (manutenção e crescimento)
};

export const sampleWACC: WACCCalculation = {
  custoCapitalProprio: 0.15, // 15% - Beta de tecnologia, prêmio de risco Brasil
  custoCapitalTerceiros: 0.12, // 12% - Taxa CDI + spread
  wacc: 0.12522, // Corrigido: 0.65*0.15 + 0.35*0.12*(1-0.34) = 0.12522
  pesoCapitalProprio: 0.65, // 65% equity
  pesoCapitalTerceiros: 0.35, // 35% dívida
};

export const sampleFullValuationInput: FullValuationInput = {
  dreBase: sampleDREBase,
  dreProjection: sampleDREProjection,
  balanceSheetBase: sampleBalanceSheetBase,
  balanceSheetProjection: sampleBalanceSheetProjection,
  wacc: sampleWACC,
  taxaCrescimentoPerpetuo: 0.03, // 3% - crescimento perpétuo conservador
  anosProjecao: 5,
};

/**
 * Empresa em estágio inicial (Startup)
 * Receita anual: R$ 1M
 * Crescimento agressivo: 50-100% ao ano
 * Ainda não lucrativa
 */

export const startupDREBase: DREBaseInputs = {
  receita: 1_000_000, // R$ 1M
  custoMercadoriaVendida: 400_000, // 40%
  despesasOperacionais: 800_000, // 80% - investimento pesado em crescimento
  despesasFinanceiras: 50_000, // 5%
  taxaImposto: 0.34,
};

export const startupDREProjection: DREProjectionInputs = {
  taxaCrescimentoReceita: [1.0, 0.8, 0.6, 0.4, 0.3], // Crescimento explosivo
  taxaCMV: [0.38, 0.35, 0.32, 0.3, 0.28],
  taxaDespesasOperacionais: [0.75, 0.7, 0.65, 0.6, 0.55],
  taxaDespesasFinanceiras: [0.04, 0.035, 0.03, 0.025, 0.02],
};

export const startupBalanceSheetBase: BalanceSheetBaseInputs = {
  caixa: 500_000, // Buffer de runway
  contasReceber: 120_000,
  estoques: 0,
  ativoCirculante: 620_000,
  imobilizado: 200_000,
  ativoTotal: 820_000,
  contasPagar: 150_000,
  passivoCirculante: 200_000,
  passivoNaoCirculante: 300_000,
  dividasLongoPrazo: 300_000, // Dívida de investidores
  passivoTotal: 500_000,
  patrimonioLiquido: 320_000,
};

export const startupBalanceSheetProjection: BalanceSheetProjectionInputs = {
  taxaCrescimentoAtivos: [0.8, 0.7, 0.5, 0.35, 0.25],
  taxaCrescimentoPassivos: [0.6, 0.5, 0.4, 0.3, 0.2],
  taxaDepreciacao: 0.25,
  taxaCapex: 0.08, // Investimento em infra
};

export const startupWACC: WACCCalculation = {
  custoCapitalProprio: 0.25, // 25% - alto risco
  custoCapitalTerceiros: 0.15, // 15%
  wacc: 0.22, // 22%
  pesoCapitalProprio: 0.8,
  pesoCapitalTerceiros: 0.2,
};

export const startupFullValuationInput: FullValuationInput = {
  dreBase: startupDREBase,
  dreProjection: startupDREProjection,
  balanceSheetBase: startupBalanceSheetBase,
  balanceSheetProjection: startupBalanceSheetProjection,
  wacc: startupWACC,
  taxaCrescimentoPerpetuo: 0.04,
  anosProjecao: 5,
};

/**
 * Empresa madura
 * Receita anual: R$ 100M
 * Crescimento estável: 5-8% ao ano
 * Alta lucratividade
 */

export const matureDREBase: DREBaseInputs = {
  receita: 100_000_000, // R$ 100M
  custoMercadoriaVendida: 20_000_000, // 20% - alta eficiência
  despesasOperacionais: 35_000_000, // 35% - escala
  despesasFinanceiras: 1_000_000, // 1%
  taxaImposto: 0.34,
};

export const matureDREProjection: DREProjectionInputs = {
  taxaCrescimentoReceita: [0.08, 0.07, 0.06, 0.06, 0.05],
  taxaCMV: [0.19, 0.18, 0.18, 0.17, 0.17],
  taxaDespesasOperacionais: [0.34, 0.33, 0.33, 0.32, 0.32],
  taxaDespesasFinanceiras: [0.009, 0.008, 0.008, 0.007, 0.007],
};

export const matureBalanceSheetBase: BalanceSheetBaseInputs = {
  caixa: 15_000_000,
  contasReceber: 12_000_000,
  estoques: 2_000_000,
  ativoCirculante: 29_000_000,
  imobilizado: 20_000_000,
  ativoTotal: 49_000_000,
  contasPagar: 5_000_000,
  passivoCirculante: 8_000_000,
  passivoNaoCirculante: 10_000_000,
  dividasLongoPrazo: 10_000_000,
  passivoTotal: 18_000_000,
  patrimonioLiquido: 31_000_000,
};

export const matureBalanceSheetProjection: BalanceSheetProjectionInputs = {
  taxaCrescimentoAtivos: [0.06, 0.05, 0.05, 0.04, 0.04],
  taxaCrescimentoPassivos: [0.04, 0.03, 0.03, 0.02, 0.02],
  taxaDepreciacao: 0.15,
  taxaCapex: 0.03,
};

export const matureWACC: WACCCalculation = {
  custoCapitalProprio: 0.12, // 12% - risco moderado
  custoCapitalTerceiros: 0.09, // 9%
  wacc: 0.10182, // Corrigido: 0.7*0.12 + 0.3*0.09*(1-0.34) = 0.10182
  pesoCapitalProprio: 0.7,
  pesoCapitalTerceiros: 0.3,
};

export const matureFullValuationInput: FullValuationInput = {
  dreBase: matureDREBase,
  dreProjection: matureDREProjection,
  balanceSheetBase: matureBalanceSheetBase,
  balanceSheetProjection: matureBalanceSheetProjection,
  wacc: matureWACC,
  taxaCrescimentoPerpetuo: 0.025,
  anosProjecao: 5,
};
