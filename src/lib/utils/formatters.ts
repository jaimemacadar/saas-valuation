/**
 * Formatadores de números para visualizações financeiras
 * Seguem padrão brasileiro (pt-BR)
 */

/**
 * Formata valor monetário em Reais (R$)
 * @param value - Valor numérico
 * @param options - Opções de formatação
 * @returns String formatada com R$ e separadores pt-BR
 *
 * @example
 * formatCurrency(1234567.89) // "R$ 1.234.567,89"
 * formatCurrency(-500) // "-R$ 500,00"
 */
export function formatCurrency(
  value: number | null | undefined,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  } = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return options.showSymbol === false ? '0,00' : 'R$ 0,00';
  }

  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
  } = options;

  const formatted = new Intl.NumberFormat('pt-BR', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'BRL',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);

  return formatted;
}

/**
 * Formata percentual
 * @param value - Valor decimal (ex: 0.15 para 15%)
 * @param options - Opções de formatação
 * @returns String formatada com % e separadores pt-BR
 *
 * @example
 * formatPercentage(0.1534) // "15,34%"
 * formatPercentage(0.05, { decimals: 1 }) // "5,0%"
 * formatPercentage(1.5) // "150,00%"
 */
export function formatPercentage(
  value: number | null | undefined,
  options: {
    decimals?: number;
    multiply?: boolean;
  } = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,00%';
  }

  const { decimals = 2, multiply = true } = options;
  const finalValue = multiply ? value * 100 : value;

  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(multiply ? value : value / 100);
}

/**
 * Formata números grandes de forma compacta
 * @param value - Valor numérico
 * @param options - Opções de formatação
 * @returns String formatada (ex: 10M, 1,5B, 300K)
 *
 * @example
 * formatCompactNumber(1500000) // "1,5 mi"
 * formatCompactNumber(1500000000) // "1,5 bi"
 * formatCompactNumber(1500) // "1,5 mil"
 * formatCompactNumber(150) // "150"
 */
export function formatCompactNumber(
  value: number | null | undefined,
  options: {
    decimals?: number;
    notation?: 'compact' | 'standard';
  } = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const { decimals = 1, notation = 'compact' } = options;

  if (notation === 'standard' || Math.abs(value) < 1000) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  // Intl.NumberFormat com notation: 'compact' não é bem suportado em pt-BR
  // Implementação manual para garantir padrão brasileiro
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    })} bi`;
  } else if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    })} mi`;
  } else if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    })} mil`;
  }

  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formata número com separadores de milhar
 * @param value - Valor numérico
 * @param decimals - Casas decimais
 * @returns String formatada com separadores pt-BR
 *
 * @example
 * formatNumber(1234567.89) // "1.234.567,89"
 * formatNumber(1234567.89, 0) // "1.234.568"
 */
export function formatNumber(
  value: number | null | undefined,
  decimals = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formata múltiplo (ex: 15x, 3,5x)
 * Usado para métricas de valuation (EV/EBITDA, P/L, etc.)
 *
 * @example
 * formatMultiple(15.234) // "15,23x"
 * formatMultiple(3.5) // "3,50x"
 */
export function formatMultiple(
  value: number | null | undefined,
  decimals = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,00x';
  }

  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}x`;
}

/**
 * Helper para formatar células de tabela com cores condicionais
 * @param value - Valor numérico
 * @param formatter - Função de formatação a aplicar
 * @returns Objeto com valor formatado e classe CSS
 */
export function formatCellWithColor(
  value: number | null | undefined,
  formatter: (val: number) => string = formatNumber
): {
  formatted: string;
  className: string;
} {
  if (value === null || value === undefined || isNaN(value)) {
    return {
      formatted: '-',
      className: 'text-muted-foreground',
    };
  }

  return {
    formatted: formatter(value),
    className: value >= 0 ? 'text-green-600' : 'text-red-600',
  };
}
