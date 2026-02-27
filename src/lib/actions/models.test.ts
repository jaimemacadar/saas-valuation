jest.mock("next/navigation", () => ({ redirect: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const mockIsMockMode = jest.fn(() => true);
const mockGetMockUser = jest.fn(async () => ({ id: "user-1", email: "user@test.com" }));
const mockDelay = jest.fn(async () => undefined);

const mockStore = {
  getModelById: jest.fn(),
  updateModel: jest.fn(),
};

const mockRecalculateModel = jest.fn();

jest.mock("@/lib/mock/config", () => ({
  isMockMode: () => mockIsMockMode(),
  mockDelay: (...args: unknown[]) => mockDelay(...args),
}));

jest.mock("@/lib/mock/auth", () => ({
  getMockUser: () => mockGetMockUser(),
}));

jest.mock("@/lib/mock/store", () => ({
  mockStore,
}));

jest.mock("@/lib/actions/calculate", () => ({
  recalculateModel: (...args: unknown[]) => mockRecalculateModel(...args),
}));

import { saveBalanceSheetBase } from "@/lib/actions/models";

const balanceSheetBaseInput = {
  ativoCirculante: {
    caixaEquivalentes: 60,
    aplicacoesFinanceiras: 10,
    contasReceber: 10,
    estoques: 10,
    outrosCreditos: 10,
  },
  ativoRealizavelLP: {
    investimentos: 50,
    ativoImobilizadoBruto: 60,
    depreciacaoAcumulada: 10,
    intangivel: 0,
  },
  passivoCirculante: {
    fornecedores: 10,
    impostosAPagar: 10,
    obrigacoesSociaisETrabalhistas: 10,
    emprestimosFinanciamentosCP: 10,
    outrasObrigacoes: 10,
  },
  passivoRealizavelLP: {
    emprestimosFinanciamentosLP: 50,
  },
  patrimonioLiquido: {
    capitalSocial: 60,
    lucrosAcumulados: 40,
  },
};

describe("saveBalanceSheetBase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.getModelById.mockReturnValue({
      id: "model-1",
      user_id: "user-1",
      company_name: "Empresa Teste",
      model_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    mockStore.updateModel.mockReturnValue(true);
  });

  it("deve retornar erro quando o recálculo falhar", async () => {
    mockRecalculateModel.mockResolvedValue({
      success: false,
      error: "Erro ao calcular indicadores financeiros",
    });

    const result = await saveBalanceSheetBase("model-1", balanceSheetBaseInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Erro ao calcular indicadores financeiros");
    expect(mockStore.updateModel).toHaveBeenCalledTimes(1);
    expect(mockRecalculateModel).toHaveBeenCalledWith("model-1");
  });

  it("deve retornar sucesso quando salvar e recalcular corretamente", async () => {
    mockRecalculateModel.mockResolvedValue({
      success: true,
      data: {
        balanceSheet: [{ year: 0, ativoCirculante: { caixaEquivalentes: 60 } }],
      },
    });

    const result = await saveBalanceSheetBase("model-1", balanceSheetBaseInput);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(mockStore.updateModel).toHaveBeenCalledTimes(1);
    expect(mockRecalculateModel).toHaveBeenCalledWith("model-1");
  });

  it("deve retornar erro quando recálculo não gerar BP do ano base", async () => {
    mockRecalculateModel.mockResolvedValue({
      success: true,
      data: {},
    });

    const result = await saveBalanceSheetBase("model-1", balanceSheetBaseInput);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/não gerou Balanço Patrimonial/i);
    expect(mockRecalculateModel).toHaveBeenCalledWith("model-1");
  });
});
