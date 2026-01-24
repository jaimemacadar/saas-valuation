// src/styles/design-system/tokens/breakpoints.ts
export const breakpoints = {
  // Valores em pixels
  values: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },

  // Media queries prontas
  up: {
    sm: "@media (min-width: 640px)",
    md: "@media (min-width: 768px)",
    lg: "@media (min-width: 1024px)",
    xl: "@media (min-width: 1280px)",
    "2xl": "@media (min-width: 1536px)",
  },

  down: {
    sm: "@media (max-width: 639px)",
    md: "@media (max-width: 767px)",
    lg: "@media (max-width: 1023px)",
    xl: "@media (max-width: 1279px)",
    "2xl": "@media (max-width: 1535px)",
  },

  // Containers
  container: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1400px",
  },
} as const;

export type BreakpointToken = typeof breakpoints;
