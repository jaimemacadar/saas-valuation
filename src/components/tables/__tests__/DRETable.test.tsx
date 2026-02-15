import { render, screen } from '@testing-library/react';
import { DRETable } from '../DRETable';
import { DRECalculated } from '@/core/types';

const mockDREData: DRECalculated[] = [
  {
    year: 0,
    receitaBruta: 1000000,
    impostosEDevolucoes: 150000,
    receitaLiquida: 850000,
    cmv: 400000,
    lucroBruto: 450000,
    despesasOperacionais: 200000,
    ebit: 250000,
    depreciacaoAmortizacao: 50000,
    ebitda: 300000,
    despesasFinanceiras: 30000,
    lucroAntesIR: 220000,
    irCSLL: 75000,
    lucroLiquido: 145000,
    dividendos: 40000,
  },
  {
    year: 1,
    receitaBruta: 1200000,
    impostosEDevolucoes: 180000,
    receitaLiquida: 1020000,
    cmv: 480000,
    lucroBruto: 540000,
    despesasOperacionais: 240000,
    ebit: 300000,
    depreciacaoAmortizacao: 60000,
    ebitda: 360000,
    despesasFinanceiras: 36000,
    lucroAntesIR: 264000,
    irCSLL: 90000,
    lucroLiquido: 174000,
    dividendos: 48000,
  },
];

describe('DRETable', () => {
  it('deve renderizar a tabela com dados', () => {
    render(<DRETable data={mockDREData} />);

    expect(screen.getByText('Receita Bruta')).toBeInTheDocument();
    expect(screen.getByText('Lucro Líquido')).toBeInTheDocument();
    // Verifica se os headers de ano estão presentes
    expect(screen.getByText('Ano Base')).toBeInTheDocument();
    expect(screen.getByText('Ano 1')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não há dados', () => {
    render(<DRETable data={[]} />);

    expect(screen.getByText('Nenhum dado de DRE disponível')).toBeInTheDocument();
  });

  it('deve renderizar todas as linhas da DRE', () => {
    render(<DRETable data={mockDREData} />);

    const expectedLines = [
      'Receita Bruta',
      '(-) Impostos sobre Vendas',
      'Receita Líquida',
      '(-) CMV',
      'Lucro Bruto',
      '(-) Despesas Operacionais',
      'EBIT',
      '(+) Depreciação e Amortização',
      'EBITDA',
      '(-) Despesas Financeiras',
      'LAIR',
      '(-) IR/CSLL',
      'Lucro Líquido',
      '(-) Dividendos',
    ];

    expectedLines.forEach(line => {
      expect(screen.getByText(line)).toBeInTheDocument();
    });
  });

  it('deve aplicar estilo de negrito para totais', () => {
    const { container } = render(<DRETable data={mockDREData} />);

    const receitaLiquidaCell = screen.getByText('Receita Líquida').closest('div');
    expect(receitaLiquidaCell).toHaveClass('font-bold');
  });

  it('deve renderizar valores formatados em R$', () => {
    const { container } = render(<DRETable data={mockDREData} />);

    // Verifica se os valores estão formatados (pelo menos um exemplo)
    // Deve haver múltiplos valores com R$ na tabela
    const cells = container.querySelectorAll('td');
    const hasFormattedCurrency = Array.from(cells).some(cell =>
      cell.textContent?.includes('R$')
    );
    expect(hasFormattedCurrency).toBe(true);
  });

  it('deve lidar com data undefined graciosamente', () => {
    // @ts-expect-error - testando comportamento com undefined
    render(<DRETable data={undefined} />);

    expect(screen.getByText('Nenhum dado de DRE disponível')).toBeInTheDocument();
  });
});
