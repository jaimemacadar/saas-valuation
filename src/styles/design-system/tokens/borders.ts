// src/styles/design-system/tokens/borders.ts
export const borders = {
  // Larguras de Borda
  width: {
    none: "0",
    thin: "1px",
    medium: "2px",
    thick: "4px",
  },

  // Raios de Borda
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    "2xl": "1rem", // 16px
    "3xl": "1.5rem", // 24px
    full: "9999px", // Circular
  },

  // Presets de Componentes
  components: {
    button: "0.5rem", // 8px
    input: "0.5rem", // 8px
    card: "0.75rem", // 12px
    modal: "1rem", // 16px
    badge: "9999px", // Pill
    avatar: "9999px", // Circular
  },
} as const;

export type BorderToken = typeof borders;
