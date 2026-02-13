/**
 * Mock System Configuration
 *
 * Configuração e detecção de modo mock/produção
 */

/**
 * Verifica se está em modo mock baseado na variável de ambiente
 */
export function isMockMode(): boolean {
  // Verifica a variável de ambiente NEXT_PUBLIC_USE_MOCK_DATA
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA;

  // Debug log
  if (typeof window === "undefined" && process.env.NODE_ENV === "development") {
    console.log("[MOCK CONFIG] NEXT_PUBLIC_USE_MOCK_DATA:", useMock);
    console.log("[MOCK CONFIG] isMockMode:", useMock?.toLowerCase() === "true");
  }

  // Retorna true se a variável está definida como 'true' (case-insensitive)
  return useMock?.toLowerCase() === "true";
}

/**
 * Constante que indica se está em modo mock
 * Pode ser usada para verificações em tempo de compilação
 */
export const MOCK_MODE = isMockMode();

/**
 * Delay padrão para simular latência de rede (em ms)
 * Usado nas operações mock para simular comportamento mais realista
 */
export const MOCK_DELAY = {
  /** Operações rápidas (get by id) */
  FAST: 50,
  /** Operações normais (list, create, update) */
  NORMAL: 100,
  /** Operações lentas (delete, duplicate) */
  SLOW: 150,
} as const;

/**
 * Configurações do sistema mock
 */
export const MOCK_CONFIG = {
  /** Habilita logs de debug em modo mock */
  DEBUG: process.env.NODE_ENV === "development",

  /** Reseta store ao iniciar aplicação */
  AUTO_RESET: false,

  /** Simula erros ocasionais (para testes) */
  SIMULATE_ERRORS: false,

  /** Taxa de erro simulado (0-1) */
  ERROR_RATE: 0,
} as const;

/**
 * Simula delay de rede para operações mock
 */
export async function mockDelay(
  type: keyof typeof MOCK_DELAY = "NORMAL"
): Promise<void> {
  const delay = MOCK_DELAY[type];
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Log de debug para modo mock
 */
export function mockLog(...args: unknown[]): void {
  if (MOCK_CONFIG.DEBUG && MOCK_MODE) {
    console.log("[MOCK]", ...args);
  }
}

/**
 * Warning de modo mock
 */
export function warnMockMode(): void {
  if (MOCK_MODE && typeof window !== "undefined") {
    console.warn(
      "%c🚧 MODO MOCK ATIVADO",
      "background: #ff9800; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
      "\nVocê está usando dados simulados. Para usar dados reais, defina NEXT_PUBLIC_USE_MOCK_DATA=false"
    );
  }
}
