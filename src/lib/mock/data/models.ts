/**
 * Mock Financial Models Data
 *
 * Modelos financeiros de exemplo usando fixtures existentes
 */

import type { MockFinancialModel } from "../types";
import {
  sampleFullValuationInput,
  startupFullValuationInput,
  matureFullValuationInput,
} from "@/core/__fixtures__/sampleCompany";
import { DEMO_USER } from "./users";

/**
 * Modelo 1: SaaS de médio porte (baseado em sampleCompany)
 */
export const SAAS_MEDIUM_MODEL: MockFinancialModel = {
  id: "model-001-saas-medium",
  user_id: DEMO_USER.id,
  company_name: "TechSaaS Solutions",
  ticker_symbol: "TECH",
  description:
    "Empresa SaaS de médio porte com receita anual de R$ 10M e crescimento de 15-20% ao ano. Margem EBITDA de ~30%.",
  model_data: sampleFullValuationInput,
  created_at: "2024-01-20T10:00:00.000Z",
  updated_at: "2024-02-10T14:30:00.000Z",
};

/**
 * Modelo 2: Startup em crescimento acelerado
 */
export const STARTUP_MODEL: MockFinancialModel = {
  id: "model-002-startup",
  user_id: DEMO_USER.id,
  company_name: "GrowthTech Startup",
  ticker_symbol: "GROW",
  description:
    "Startup em estágio inicial com receita de R$ 1M, crescimento agressivo de 50-100% ao ano. Ainda não lucrativa, investindo em expansão.",
  model_data: startupFullValuationInput,
  created_at: "2024-01-25T10:00:00.000Z",
  updated_at: "2024-02-08T16:20:00.000Z",
};

/**
 * Modelo 3: Empresa madura e consolidada
 */
export const MATURE_MODEL: MockFinancialModel = {
  id: "model-003-mature",
  user_id: DEMO_USER.id,
  company_name: "Enterprise Solutions Corp",
  ticker_symbol: "ESOL",
  description:
    "Empresa madura com receita de R$ 100M, crescimento estável de 5-8% ao ano e alta lucratividade. Líder de mercado consolidada.",
  model_data: matureFullValuationInput,
  created_at: "2024-02-01T10:00:00.000Z",
  updated_at: "2024-02-12T09:15:00.000Z",
};

/**
 * Modelo 4: E-commerce em expansão
 */
export const ECOMMERCE_MODEL: MockFinancialModel = {
  id: "model-004-ecommerce",
  user_id: DEMO_USER.id,
  company_name: "ShopFast E-commerce",
  ticker_symbol: "SHOP",
  description:
    "Plataforma de e-commerce com forte crescimento em mobile. Receita de R$ 25M com margens em melhoria.",
  model_data: {
    ...sampleFullValuationInput,
    dreBase: {
      receita: 25_000_000,
      custoMercadoriaVendida: 15_000_000, // 60% (típico de e-commerce)
      despesasOperacionais: 7_000_000, // 28%
      despesasFinanceiras: 300_000,
      taxaImposto: 0.34,
    },
    dreProjection: {
      taxaCrescimentoReceita: [0.25, 0.22, 0.18, 0.15, 0.12],
      taxaCMV: [0.58, 0.56, 0.54, 0.52, 0.5], // Melhoria de eficiência logística
      taxaDespesasOperacionais: [0.27, 0.26, 0.25, 0.24, 0.23],
      taxaDespesasFinanceiras: [0.012, 0.011, 0.01, 0.01, 0.009],
    },
  },
  created_at: "2024-02-05T10:00:00.000Z",
  updated_at: "2024-02-11T11:45:00.000Z",
};

/**
 * Modelo 5: Fintech em rápida expansão
 */
export const FINTECH_MODEL: MockFinancialModel = {
  id: "model-005-fintech",
  user_id: DEMO_USER.id,
  company_name: "PayTech Financial",
  ticker_symbol: "PAYF",
  description:
    "Fintech focada em pagamentos digitais. Alto crescimento com margens operacionais crescentes devido a escala.",
  model_data: {
    ...sampleFullValuationInput,
    dreBase: {
      receita: 15_000_000,
      custoMercadoriaVendida: 2_000_000, // 13% (baixo CMV, negócio digital)
      despesasOperacionais: 9_000_000, // 60% (alto investimento em tech e compliance)
      despesasFinanceiras: 250_000,
      taxaImposto: 0.34,
    },
    dreProjection: {
      taxaCrescimentoReceita: [0.35, 0.3, 0.25, 0.2, 0.15],
      taxaCMV: [0.12, 0.11, 0.1, 0.09, 0.08],
      taxaDespesasOperacionais: [0.55, 0.52, 0.48, 0.45, 0.42],
      taxaDespesasFinanceiras: [0.015, 0.013, 0.012, 0.011, 0.01],
    },
  },
  created_at: "2024-02-07T10:00:00.000Z",
  updated_at: "2024-02-12T08:30:00.000Z",
};

/**
 * Modelo 6: Modelo vazio (recém criado, sem dados de valuation)
 */
export const EMPTY_MODEL: MockFinancialModel = {
  id: "model-006-empty",
  user_id: DEMO_USER.id,
  company_name: "Nova Empresa",
  ticker_symbol: undefined,
  description: "Modelo recém criado aguardando preenchimento de dados",
  model_data: {},
  created_at: "2024-02-12T10:00:00.000Z",
  updated_at: "2024-02-12T10:00:00.000Z",
};

/**
 * Modelo 7: SaaS B2B Enterprise
 */
export const B2B_ENTERPRISE_MODEL: MockFinancialModel = {
  id: "model-007-b2b-enterprise",
  user_id: DEMO_USER.id,
  company_name: "CloudOps Enterprise",
  ticker_symbol: "COPS",
  description:
    "Plataforma SaaS B2B para gestão de operações em nuvem. Forte ARR e alta retenção de clientes enterprise.",
  model_data: {
    ...sampleFullValuationInput,
    dreBase: {
      receita: 18_000_000,
      custoMercadoriaVendida: 4_000_000, // 22% (infraestrutura cloud)
      despesasOperacionais: 10_000_000, // 56% (vendas enterprise, suporte premium)
      despesasFinanceiras: 180_000,
      taxaImposto: 0.34,
    },
    dreProjection: {
      taxaCrescimentoReceita: [0.28, 0.24, 0.2, 0.17, 0.14],
      taxaCMV: [0.21, 0.2, 0.19, 0.18, 0.17],
      taxaDespesasOperacionais: [0.54, 0.52, 0.5, 0.48, 0.46],
      taxaDespesasFinanceiras: [0.01, 0.009, 0.008, 0.008, 0.007],
    },
  },
  created_at: "2024-02-09T10:00:00.000Z",
  updated_at: "2024-02-12T15:20:00.000Z",
};

/**
 * Modelo 8: Marketplace Digital
 */
export const MARKETPLACE_MODEL: MockFinancialModel = {
  id: "model-008-marketplace",
  user_id: DEMO_USER.id,
  company_name: "ConnectMarket",
  ticker_symbol: "CNCT",
  description:
    "Marketplace digital conectando prestadores de serviço e clientes. Modelo de receita baseado em comissões.",
  model_data: {
    ...sampleFullValuationInput,
    dreBase: {
      receita: 8_000_000,
      custoMercadoriaVendida: 1_500_000, // 19% (plataforma digital, baixo custo)
      despesasOperacionais: 5_500_000, // 69% (marketing de aquisição, suporte)
      despesasFinanceiras: 150_000,
      taxaImposto: 0.34,
    },
    dreProjection: {
      taxaCrescimentoReceita: [0.45, 0.38, 0.3, 0.25, 0.2],
      taxaCMV: [0.18, 0.17, 0.16, 0.15, 0.14],
      taxaDespesasOperacionais: [0.65, 0.62, 0.58, 0.54, 0.5],
      taxaDespesasFinanceiras: [0.018, 0.016, 0.014, 0.012, 0.01],
    },
  },
  created_at: "2024-02-10T10:00:00.000Z",
  updated_at: "2024-02-12T13:10:00.000Z",
};

/**
 * Lista de todos os modelos mock
 * Ordenados por data de atualização (mais recente primeiro)
 */
export const MOCK_FINANCIAL_MODELS: MockFinancialModel[] = [
  B2B_ENTERPRISE_MODEL,
  MARKETPLACE_MODEL,
  MATURE_MODEL,
  ECOMMERCE_MODEL,
  FINTECH_MODEL,
  STARTUP_MODEL,
  EMPTY_MODEL,
  SAAS_MEDIUM_MODEL,
].sort(
  (a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
);

/**
 * Obter modelo por ID
 */
export function getMockModelById(id: string): MockFinancialModel | undefined {
  return MOCK_FINANCIAL_MODELS.find((m) => m.id === id);
}

/**
 * Obter modelos por usuário
 */
export function getMockModelsByUser(userId: string): MockFinancialModel[] {
  return MOCK_FINANCIAL_MODELS.filter((m) => m.user_id === userId);
}
