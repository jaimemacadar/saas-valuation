/**
 * Mock Data Store
 *
 * Store in-memory para gerenciar dados mock durante desenvolvimento
 */

import type {
  IMockDataStore,
  MockFinancialModel,
  CreateModelInput,
  UpdateModelInput,
} from "./types";
import { MOCK_FINANCIAL_MODELS } from "./data/models";
import { mockLog } from "./config";
import { processModelDataSync } from "./utils";

/**
 * Implementação do Mock Data Store
 * Mantém dados em memória durante a sessão
 */
class MockDataStore implements IMockDataStore {
  private models: Map<string, MockFinancialModel> = new Map();
  private isSeeded = false;

  constructor() {
    // Auto-seed na criação
    this.seed();
  }

  /**
   * Seed inicial com dados de exemplo
   */
  seed(): void {
    if (this.isSeeded) {
      mockLog("Store já foi inicializado, pulando seed");
      return;
    }

    mockLog("Inicializando store com dados de exemplo");
    MOCK_FINANCIAL_MODELS.forEach((model) => {
      // Pré-processa cada modelo ao carregar
      const processed = processModelDataSync(model);
      this.models.set(model.id, processed);
    });
    this.isSeeded = true;
    mockLog(`${this.models.size} modelos carregados e processados`);
  }

  /**
   * Reset do store (limpa todos os dados)
   */
  reset(): void {
    mockLog("Resetando store");
    this.models.clear();
    this.isSeeded = false;
  }

  /**
   * Obtém todos os modelos de um usuário
   */
  getModels(userId: string): MockFinancialModel[] {
    mockLog(`Buscando modelos para usuário ${userId}`);
    const userModels = Array.from(this.models.values())
      .filter((model) => model.user_id === userId)
      .map((model) => processModelDataSync(model)) // Processa cada modelo
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

    mockLog(`Encontrados ${userModels.length} modelos`);
    return userModels;
  }

  /**
   * Obtém um modelo específico por ID
   */
  getModelById(id: string, userId: string): MockFinancialModel | null {
    mockLog(`Buscando modelo ${id} para usuário ${userId}`);
    const model = this.models.get(id);

    if (!model) {
      mockLog(`Modelo ${id} não encontrado`);
      return null;
    }

    if (model.user_id !== userId) {
      mockLog(`Modelo ${id} não pertence ao usuário ${userId}`);
      return null;
    }

    // Processa model_data antes de retornar
    return processModelDataSync({ ...model });
  }

  /**
   * Cria um novo modelo
   */
  createModel(userId: string, data: CreateModelInput): MockFinancialModel {
    const now = new Date().toISOString();
    const id = `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newModel: MockFinancialModel = {
      id,
      user_id: userId,
      company_name: data.company_name,
      ticker_symbol: data.ticker_symbol,
      description: data.description,
      model_data: data.model_data || {},
      created_at: now,
      updated_at: now,
    };

    this.models.set(id, newModel);
    mockLog(`Modelo ${id} criado:`, newModel.company_name);

    return { ...newModel };
  }

  /**
   * Atualiza um modelo existente
   */
  updateModel(
    id: string,
    userId: string,
    data: UpdateModelInput
  ): MockFinancialModel | null {
    const model = this.models.get(id);

    if (!model) {
      mockLog(`Modelo ${id} não encontrado para atualização`);
      return null;
    }

    if (model.user_id !== userId) {
      mockLog(`Modelo ${id} não pertence ao usuário ${userId}`);
      return null;
    }

    // Atualiza apenas os campos fornecidos
    const updatedModel: MockFinancialModel = {
      ...model,
      company_name: data.company_name ?? model.company_name,
      ticker_symbol: data.ticker_symbol ?? model.ticker_symbol,
      description: data.description ?? model.description,
      model_data: data.model_data ?? model.model_data,
      updated_at: new Date().toISOString(),
    };

    this.models.set(id, updatedModel);
    mockLog(`Modelo ${id} atualizado:`, updatedModel.company_name);

    return { ...updatedModel };
  }

  /**
   * Deleta um modelo
   */
  deleteModel(id: string, userId: string): boolean {
    const model = this.models.get(id);

    if (!model) {
      mockLog(`Modelo ${id} não encontrado para exclusão`);
      return false;
    }

    if (model.user_id !== userId) {
      mockLog(`Modelo ${id} não pertence ao usuário ${userId}`);
      return false;
    }

    this.models.delete(id);
    mockLog(`Modelo ${id} deletado`);
    return true;
  }

  /**
   * Duplica um modelo existente
   */
  duplicateModel(id: string, userId: string): MockFinancialModel | null {
    const model = this.models.get(id);

    if (!model) {
      mockLog(`Modelo ${id} não encontrado para duplicação`);
      return null;
    }

    if (model.user_id !== userId) {
      mockLog(`Modelo ${id} não pertence ao usuário ${userId}`);
      return null;
    }

    const now = new Date().toISOString();
    const newId = `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const duplicatedModel: MockFinancialModel = {
      ...model,
      id: newId,
      company_name: `${model.company_name} (Cópia)`,
      created_at: now,
      updated_at: now,
    };

    this.models.set(newId, duplicatedModel);
    mockLog(`Modelo ${id} duplicado para ${newId}`);

    return { ...duplicatedModel };
  }

  /**
   * Obtém estatísticas do store (útil para debugging)
   */
  getStats() {
    return {
      totalModels: this.models.size,
      isSeeded: this.isSeeded,
      modelsByUser: Array.from(
        new Set(Array.from(this.models.values()).map((m) => m.user_id))
      ).map((userId) => ({
        userId,
        count: Array.from(this.models.values()).filter(
          (m) => m.user_id === userId
        ).length,
      })),
    };
  }
}

/**
 * Instância singleton do store
 * Mantém os dados durante toda a sessão
 */
let storeInstance: MockDataStore | null = null;

/**
 * Obtém a instância do store (cria se não existir)
 */
export function getMockStore(): MockDataStore {
  if (!storeInstance) {
    mockLog("Criando nova instância do MockDataStore");
    storeInstance = new MockDataStore();
  }
  return storeInstance;
}

/**
 * Reseta a instância do store (útil para testes)
 */
export function resetMockStore(): void {
  mockLog("Resetando instância do MockDataStore");
  storeInstance = null;
}

/**
 * Export da instância para uso direto
 */
export const mockStore = getMockStore();
