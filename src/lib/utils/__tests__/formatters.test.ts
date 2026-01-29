import {
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
  formatNumber,
  formatMultiple,
  formatCellWithColor,
} from '../formatters';

describe('formatCurrency', () => {
  it('deve formatar valores positivos em reais', () => {
    expect(formatCurrency(1234567.89)).toMatch(/R\$\s*1\.234\.567,89/);
    expect(formatCurrency(100)).toMatch(/R\$\s*100,00/);
    expect(formatCurrency(0.99)).toMatch(/R\$\s*0,99/);
  });

  it('deve formatar valores negativos em reais', () => {
    expect(formatCurrency(-500)).toMatch(/-R\$\s*500,00/);
    expect(formatCurrency(-1234.56)).toMatch(/-R\$\s*1\.234,56/);
  });

  it('deve lidar com valores null/undefined', () => {
    expect(formatCurrency(null)).toMatch(/R\$\s*0,00/);
    expect(formatCurrency(undefined)).toMatch(/R\$\s*0,00/);
    expect(formatCurrency(NaN)).toMatch(/R\$\s*0,00/);
  });

  it('deve respeitar opções de casas decimais', () => {
    const result = formatCurrency(1234.567, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    expect(result).toMatch(/R\$\s*1\.23[45]/); // Aceita 1.234 ou 1.235 devido a arredondamento
  });

  it('deve ocultar símbolo quando solicitado', () => {
    expect(formatCurrency(1234.56, { showSymbol: false })).toBe('1.234,56');
  });

  it('deve formatar zero corretamente', () => {
    expect(formatCurrency(0)).toMatch(/R\$\s*0,00/);
  });
});

describe('formatPercentage', () => {
  it('deve formatar percentuais multiplicando por 100', () => {
    expect(formatPercentage(0.1534)).toBe('15,34%');
    expect(formatPercentage(0.05)).toBe('5,00%');
    expect(formatPercentage(1.5)).toBe('150,00%');
  });

  it('deve respeitar casas decimais', () => {
    expect(formatPercentage(0.1534, { decimals: 1 })).toBe('15,3%');
    expect(formatPercentage(0.1534, { decimals: 0 })).toBe('15%');
  });

  it('deve permitir não multiplicar por 100', () => {
    expect(formatPercentage(15.34, { multiply: false })).toBe('15,34%');
  });

  it('deve lidar com valores null/undefined', () => {
    expect(formatPercentage(null)).toBe('0,00%');
    expect(formatPercentage(undefined)).toBe('0,00%');
    expect(formatPercentage(NaN)).toBe('0,00%');
  });

  it('deve formatar valores negativos', () => {
    expect(formatPercentage(-0.05)).toBe('-5,00%');
  });
});

describe('formatCompactNumber', () => {
  it('deve formatar bilhões', () => {
    expect(formatCompactNumber(1500000000)).toBe('1,5 bi');
    expect(formatCompactNumber(2000000000)).toBe('2 bi');
  });

  it('deve formatar milhões', () => {
    expect(formatCompactNumber(1500000)).toBe('1,5 mi');
    expect(formatCompactNumber(10000000)).toBe('10 mi');
  });

  it('deve formatar milhares', () => {
    expect(formatCompactNumber(1500)).toBe('1,5 mil');
    expect(formatCompactNumber(50000)).toBe('50 mil');
  });

  it('deve manter números pequenos sem compactação', () => {
    expect(formatCompactNumber(150)).toBe('150');
    expect(formatCompactNumber(999)).toBe('999');
  });

  it('deve lidar com valores negativos', () => {
    expect(formatCompactNumber(-1500000)).toBe('-1,5 mi');
    expect(formatCompactNumber(-2000000000)).toBe('-2 bi');
  });

  it('deve respeitar casas decimais', () => {
    expect(formatCompactNumber(1234567, { decimals: 2 })).toBe('1,23 mi');
    expect(formatCompactNumber(1234567, { decimals: 0 })).toBe('1 mi');
  });

  it('deve usar notação standard quando solicitado', () => {
    expect(formatCompactNumber(1500000, { notation: 'standard' })).toBe('1.500.000');
  });

  it('deve lidar com valores null/undefined', () => {
    expect(formatCompactNumber(null)).toBe('0');
    expect(formatCompactNumber(undefined)).toBe('0');
    expect(formatCompactNumber(NaN)).toBe('0');
  });
});

describe('formatNumber', () => {
  it('deve formatar números com separadores pt-BR', () => {
    expect(formatNumber(1234567.89)).toBe('1.234.567,89');
    expect(formatNumber(1000)).toBe('1.000,00');
  });

  it('deve respeitar casas decimais', () => {
    expect(formatNumber(1234567.89, 0)).toBe('1.234.568');
    expect(formatNumber(1234.5678, 3)).toBe('1.234,568');
  });

  it('deve lidar com valores null/undefined', () => {
    expect(formatNumber(null)).toBe('0');
    expect(formatNumber(undefined)).toBe('0');
    expect(formatNumber(NaN)).toBe('0');
  });
});

describe('formatMultiple', () => {
  it('deve formatar múltiplos com sufixo x', () => {
    expect(formatMultiple(15.234)).toBe('15,23x');
    expect(formatMultiple(3.5)).toBe('3,50x');
  });

  it('deve respeitar casas decimais', () => {
    expect(formatMultiple(15.234, 1)).toBe('15,2x');
    expect(formatMultiple(15.234, 0)).toBe('15x');
  });

  it('deve lidar com valores null/undefined', () => {
    expect(formatMultiple(null)).toBe('0,00x');
    expect(formatMultiple(undefined)).toBe('0,00x');
    expect(formatMultiple(NaN)).toBe('0,00x');
  });
});

describe('formatCellWithColor', () => {
  it('deve retornar classe verde para valores positivos', () => {
    const result = formatCellWithColor(100);
    expect(result.className).toBe('text-green-600');
  });

  it('deve retornar classe vermelha para valores negativos', () => {
    const result = formatCellWithColor(-100);
    expect(result.className).toBe('text-red-600');
  });

  it('deve retornar classe muted para valores null/undefined', () => {
    expect(formatCellWithColor(null).className).toBe('text-muted-foreground');
    expect(formatCellWithColor(undefined).className).toBe('text-muted-foreground');
    expect(formatCellWithColor(NaN).className).toBe('text-muted-foreground');
  });

  it('deve aplicar formatter customizado', () => {
    const result = formatCellWithColor(1234.56, formatCurrency);
    expect(result.formatted).toMatch(/R\$\s*1\.234,56/);
  });

  it('deve retornar traço para valores inválidos', () => {
    expect(formatCellWithColor(null).formatted).toBe('-');
  });

  it('deve classificar zero como positivo', () => {
    const result = formatCellWithColor(0);
    expect(result.className).toBe('text-green-600');
  });
});
