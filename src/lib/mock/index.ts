/**
 * Mock System - Main Export
 *
 * Sistema de mock de dados para desenvolvimento
 */

// Config
export { isMockMode, MOCK_MODE, mockDelay, mockLog, warnMockMode } from "./config";

// Types
export type {
  MockUser,
  MockFinancialModel,
  CreateModelInput,
  UpdateModelInput,
  MockActionResult,
  IMockDataStore,
} from "./types";

export { isMockUser, isMockFinancialModel } from "./types";

// Data
export {
  DEFAULT_MOCK_USER,
  DEMO_USER,
  ADMIN_USER,
  FREE_USER,
  MOCK_USERS,
} from "./data/users";

export {
  MOCK_FINANCIAL_MODELS,
  SAAS_MEDIUM_MODEL,
  STARTUP_MODEL,
  MATURE_MODEL,
  ECOMMERCE_MODEL,
  FINTECH_MODEL,
  B2B_ENTERPRISE_MODEL,
  MARKETPLACE_MODEL,
  EMPTY_MODEL,
  getMockModelById,
  getMockModelsByUser,
} from "./data/models";

// Store
export { getMockStore, resetMockStore, mockStore } from "./store";

// Auth
export {
  getMockUser,
  mockSignIn,
  mockSignOut,
  mockSignUp,
  mockResetPassword,
  mockUpdatePassword,
  mockSignInWithOAuth,
  isMockAuthenticated,
  getCurrentMockUser,
  setCurrentMockUser,
} from "./auth";
