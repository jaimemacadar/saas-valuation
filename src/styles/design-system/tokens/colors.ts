// src/styles/design-system/tokens/colors.ts
export const colors = {
  // Cores Primárias - Azul Profissional
  primary: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6", // Principal
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
    950: "#172554",
  },

  // Cores Secundárias - Slate (Cinza Neutro)
  secondary: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B", // Principal
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
    950: "#020617",
  },

  // Cores de Sucesso - Verde
  success: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E", // Principal
    600: "#16A34A",
    700: "#15803D",
    800: "#166534",
    900: "#14532D",
  },

  // Cores de Alerta - Amarelo
  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B", // Principal
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },

  // Cores de Erro - Vermelho
  error: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444", // Principal
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
  },

  // Cores Financeiras (específicas para valuation)
  financial: {
    positive: "#10B981", // Verde para valores positivos
    negative: "#EF4444", // Vermelho para valores negativos
    neutral: "#6B7280", // Cinza para valores neutros
    highlight: "#8B5CF6", // Roxo para destaques
    projection: "#06B6D4", // Ciano para projeções
  },

  // Cores de Background
  background: {
    primary: "#FFFFFF",
    secondary: "#F8FAFC",
    tertiary: "#F1F5F9",
    inverse: "#0F172A",
  },

  // Cores de Texto
  text: {
    primary: "#0F172A",
    secondary: "#475569",
    tertiary: "#94A3B8",
    inverse: "#FFFFFF",
    disabled: "#CBD5E1",
  },

  // Cores de Borda
  border: {
    default: "#E2E8F0",
    strong: "#CBD5E1",
    focus: "#3B82F6",
  },
} as const;

export type ColorToken = typeof colors;
