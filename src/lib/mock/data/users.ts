/**
 * Mock Users Data
 *
 * Usuários de exemplo para desenvolvimento e testes
 */

import type { MockUser } from "../types";

/**
 * Usuário demo padrão (usado para login automático em mock mode)
 */
export const DEMO_USER: MockUser = {
  id: "demo-user-001",
  email: "demo@saasvaluation.com",
  name: "Usuário Demo",
  avatar: undefined,
  role: "user",
  subscription: "pro",
  created_at: "2024-01-15T10:00:00.000Z",
};

/**
 * Usuário admin
 */
export const ADMIN_USER: MockUser = {
  id: "admin-user-001",
  email: "admin@saasvaluation.com",
  name: "Administrador",
  avatar: undefined,
  role: "admin",
  subscription: "enterprise",
  created_at: "2024-01-01T10:00:00.000Z",
};

/**
 * Usuário comum (plano free)
 */
export const FREE_USER: MockUser = {
  id: "free-user-001",
  email: "usuario@exemplo.com",
  name: "João Silva",
  avatar: undefined,
  role: "user",
  subscription: "free",
  created_at: "2024-02-10T10:00:00.000Z",
};

/**
 * Lista de todos os usuários mock
 */
export const MOCK_USERS: MockUser[] = [DEMO_USER, ADMIN_USER, FREE_USER];

/**
 * Usuário padrão usado em mock mode
 */
export const DEFAULT_MOCK_USER = DEMO_USER;
