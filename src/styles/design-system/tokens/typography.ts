// src/styles/design-system/tokens/typography.ts
export const typography = {
  // Família de Fontes
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "Fira Code", "monospace"],
    display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
  },

  // Tamanhos de Fonte
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },

  // Peso da Fonte
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Altura de Linha
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },

  // Presets de Texto (combinações prontas)
  presets: {
    // Headings
    h1: {
      fontSize: "2.25rem", // 36px
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontSize: "1.875rem", // 30px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.025em",
    },
    h3: {
      fontSize: "1.5rem", // 24px
      fontWeight: 600,
      lineHeight: 1.375,
    },
    h4: {
      fontSize: "1.25rem", // 20px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.125rem", // 18px
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1rem", // 16px
      fontWeight: 600,
      lineHeight: 1.5,
    },

    // Body Text
    bodyLarge: {
      fontSize: "1.125rem", // 18px
      fontWeight: 400,
      lineHeight: 1.75,
    },
    body: {
      fontSize: "1rem", // 16px
      fontWeight: 400,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: "0.875rem", // 14px
      fontWeight: 400,
      lineHeight: 1.5,
    },

    // Labels & Captions
    label: {
      fontSize: "0.875rem", // 14px
      fontWeight: 500,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: "0.75rem", // 12px
      fontWeight: 400,
      lineHeight: 1.5,
    },

    // Números Financeiros
    financialLarge: {
      fontSize: "2rem", // 32px
      fontWeight: 700,
      lineHeight: 1.2,
      fontFamily: "mono",
    },
    financialMedium: {
      fontSize: "1.25rem", // 20px
      fontWeight: 600,
      lineHeight: 1.3,
      fontFamily: "mono",
    },
    financialSmall: {
      fontSize: "0.875rem", // 14px
      fontWeight: 500,
      lineHeight: 1.4,
      fontFamily: "mono",
    },
  },
} as const;

export type TypographyToken = typeof typography;
