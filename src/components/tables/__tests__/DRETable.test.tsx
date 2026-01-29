import { render, screen } from '@testing-library/react';
import { DRETable } from '../DRETable';
import { DRECalculated } from '@/core/types';

const mockDREData: DRECalculated[] = [
  {
    ano: 0,
    receita: 1000000,
    cmv: 400000,
    lucrobruto: 600000,
    despesasOperacionais: 200000,
    ebit: 400000,
    despesasFinanceiras: 50000,
    lucroAntesImpostos: 350000,
    impostos: 105000,
    lucroLiquido: 245000,
  },
  {
    ano: 1,
    receita: 1200000,
    cmv: 480000,
    lucrobruto: 720000,
    despesasOperacionais: 240000,
    ebit: 480000,
    despesasFinanceiras: 60000,
    lucroAntesImpostos: 420000,
    impostos: 126000,
    lucroLiquido: 294000,
  },
];

describe('DRETable', () => {
  it('deve renderizar a tabela com dados', () => {
    render(<DRETable data={mockDREData} />);

    expect(screen.getByText('Receita Bruta')).toBeInTheDocument();
    expect(screen.getByText('Lucro Líquido')).toBeInTheDocument();
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
      '(-) Despesas Financeiras',
      'LAIR',
      '(-) IR/CSLL',
      'Lucro Líquido',
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
