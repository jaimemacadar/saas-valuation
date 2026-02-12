/**
 * Types for Mock Data System
 *
 * Interfaces e tipos para o sistema de mock de dados
 * usado em desenvolvimento.
 */

import type { FullValuationInput } from "@/core/types";

// Re-export do tipo principal de modelo
export type { FinancialModelBasic } from "@/lib/actions/models";

/**
 * Usuário mock para desenvolvimento
 */
export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin";
  subscription: "free" | "pro" | "enterprise";
  created_at: string;
}

/**
 * Modelo financeiro mock completo
 */
export interface MockFinancialModel {
  id: string;
  user_id: string;
  company_name: string;
  ticker_symbol?: string;
  description?: string;
  model_data: Partial<FullValuationInput> | Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Dados de criação de modelo
 */
export interface CreateModelInput {
  company_name: string;
  ticker_symbol?: string;
  description?: string;
  model_data?: Partial<FullValuationInput> | Record<string, unknown>;
}

/**
 * Dados de atualização de modelo
 */
export interface UpdateModelInput {
  company_name?: string;
  ticker_symbol?: string;
  description?: string;
  model_data?: Partial<FullValuationInput> | Record<string, unknown>;
}

/**
 * Resultado de operação do mock store
 */
export interface MockActionResult<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Interface do Mock Data Store
 */
export interface IMockDataStore {
  // Models
  getModels(userId: string): MockFinancialModel[];
  getModelById(id: string, userId: string): MockFinancialModel | null;
  createModel(userId: string, data: CreateModelInput): MockFinancialModel;
  updateModel(
    id: string,
    userId: string,
    data: UpdateModelInput
  ): MockFinancialModel | null;
  deleteModel(id: string, userId: string): boolean;
  duplicateModel(id: string, userId: string): MockFinancialModel | null;

  // Utils
  reset(): void;
  seed(): void;
}

/**
 * Type guard para verificar se é um MockUser válido
 */
export function isMockUser(obj: unknown): obj is MockUser {
  if (typeof obj !== "object" || obj === null) return false;
  const user = obj as Record<string, unknown>;
  return (
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.name === "string" &&
    (user.role === "user" || user.role === "admin")
  );
}

/**
 * Type guard para verificar se é um MockFinancialModel válido
 */
export function isMockFinancialModel(obj: unknown): obj is MockFinancialModel {
  if (typeof obj !== "object" || obj === null) return false;
  const model = obj as Record<string, unknown>;
  return (
    typeof model.id === "string" &&
    typeof model.user_id === "string" &&
    typeof model.company_name === "string" &&
    typeof model.created_at === "string" &&
    typeof model.updated_at === "string"
  );
}
