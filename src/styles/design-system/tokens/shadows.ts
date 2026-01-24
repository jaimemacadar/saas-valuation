// src/styles/design-system/tokens/shadows.ts
export const shadows = {
  none: "none",

  // Sombras Elevação
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",

  // Sombras Internas
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  innerMd: "inset 0 4px 6px 0 rgb(0 0 0 / 0.1)",

  // Sombras de Foco
  focus: "0 0 0 3px rgb(59 130 246 / 0.5)",
  focusError: "0 0 0 3px rgb(239 68 68 / 0.5)",
  focusSuccess: "0 0 0 3px rgb(34 197 94 / 0.5)",

  // Sombras para Cards
  card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  cardHover:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  cardActive:
    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",

  // Sombras para Dropdown/Modal
  dropdown:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  modal: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
} as const;

export type ShadowToken = typeof shadows;
