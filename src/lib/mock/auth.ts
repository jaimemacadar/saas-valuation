/**
 * Mock Authentication Provider
 *
 * Simula autenticação em modo de desenvolvimento
 */

import type { MockUser } from "./types";
import { DEFAULT_MOCK_USER, MOCK_USERS } from "./data/users";
import { mockDelay, mockLog } from "./config";

/**
 * Usuário mock atualmente "autenticado"
 * Em modo mock, sempre retorna o usuário demo
 */
let currentMockUser: MockUser | null = null;

/**
 * Obtém o usuário mock atual
 * Simula delay de rede para realismo
 */
export async function getMockUser(): Promise<MockUser | null> {
  await mockDelay("FAST");

  if (!currentMockUser) {
    // Auto-login com usuário demo na primeira chamada
    currentMockUser = DEFAULT_MOCK_USER;
    mockLog("Auto-login com usuário demo:", currentMockUser.email);
  }

  return currentMockUser;
}

/**
 * Simula login com email/senha
 * Em modo mock, sempre aceita qualquer combinação
 */
export async function mockSignIn(
  email: string,
  password: string
): Promise<{ user: MockUser; error?: string }> {
  await mockDelay("NORMAL");

  // Encontra usuário por email
  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (user) {
    currentMockUser = user;
    mockLog("Login bem-sucedido:", user.email);
    return { user };
  }

  // Se não encontrar, usa usuário demo
  currentMockUser = DEFAULT_MOCK_USER;
  mockLog("Email não encontrado, usando usuário demo:", email);
  return { user: DEFAULT_MOCK_USER };
}

/**
 * Simula logout
 */
export async function mockSignOut(): Promise<void> {
  await mockDelay("FAST");
  mockLog("Logout realizado");
  currentMockUser = null;
}

/**
 * Simula cadastro de novo usuário
 * Em modo mock, sempre retorna sucesso
 */
export async function mockSignUp(
  email: string,
  password: string,
  name?: string
): Promise<{ user: MockUser; error?: string }> {
  await mockDelay("NORMAL");

  const newUser: MockUser = {
    id: `mock-user-${Date.now()}`,
    email,
    name: name || email.split("@")[0],
    role: "user",
    subscription: "free",
    created_at: new Date().toISOString(),
  };

  currentMockUser = newUser;
  mockLog("Cadastro bem-sucedido:", newUser.email);

  return { user: newUser };
}

/**
 * Simula recuperação de senha
 * Em modo mock, sempre retorna sucesso
 */
export async function mockResetPassword(
  email: string
): Promise<{ success: boolean; error?: string }> {
  await mockDelay("NORMAL");
  mockLog("Email de recuperação enviado para:", email);
  return { success: true };
}

/**
 * Simula atualização de senha
 * Em modo mock, sempre retorna sucesso
 */
export async function mockUpdatePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  await mockDelay("NORMAL");

  if (!currentMockUser) {
    return { success: false, error: "Usuário não autenticado" };
  }

  mockLog("Senha atualizada para usuário:", currentMockUser.email);
  return { success: true };
}

/**
 * Simula OAuth login (Google, etc)
 * Em modo mock, sempre retorna usuário demo
 */
export async function mockSignInWithOAuth(
  provider: "google" | "github"
): Promise<{ user: MockUser; error?: string }> {
  await mockDelay("SLOW");

  const oauthUser: MockUser = {
    ...DEFAULT_MOCK_USER,
    name: `Usuário ${provider}`,
    email: `${provider}@saasvaluation.com`,
  };

  currentMockUser = oauthUser;
  mockLog(`Login OAuth (${provider}) bem-sucedido:`, oauthUser.email);

  return { user: oauthUser };
}

/**
 * Verifica se está autenticado
 */
export async function isMockAuthenticated(): Promise<boolean> {
  const user = await getMockUser();
  return user !== null;
}

/**
 * Obtém informações do usuário atual (síncrono)
 * Útil quando já sabemos que o usuário está autenticado
 */
export function getCurrentMockUser(): MockUser | null {
  return currentMockUser;
}

/**
 * Define o usuário mock atual (útil para testes)
 */
export function setCurrentMockUser(user: MockUser | null): void {
  currentMockUser = user;
  mockLog("Usuário mock alterado:", user?.email || "null");
}
