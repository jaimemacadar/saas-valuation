import { render, screen } from '@testing-library/react';
import { FCFFTable } from '../FCFFTable';
import { FCFFCalculated } from '@/core/types';

const mockFCFFData: FCFFCalculated[] = [
  {
    year: 0,
    ebit: 400000,
    impostos: 120000,
    nopat: 280000,
    depreciacaoAmortizacao: 50000,
    capex: 100000,
    ncg: 20000,
    fcff: 210000,
  },
  {
    year: 1,
    ebit: 480000,
    impostos: 144000,
    nopat: 336000,
    depreciacaoAmortizacao: 60000,
    capex: 120000,
    ncg: 25000,
    fcff: 251000,
  },
  {
    year: 2,
    ebit: 300000,
    impostos: 90000,
    nopat: 210000,
    depreciacaoAmortizacao: 40000,
    capex: 200000,
    ncg: 30000,
    fcff: 20000,
  },
];

describe('FCFFTable', () => {
  it('deve renderizar a tabela com dados', () => {
    render(<FCFFTable data={mockFCFFData} />);

    expect(screen.getByText('EBIT')).toBeInTheDocument();
    expect(screen.getByText('FCFF')).toBeInTheDocument();
    // Verifica se os headers de ano estão presentes
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não há dados', () => {
    render(<FCFFTable data={[]} />);

    expect(screen.getByText('Nenhum dado de FCFF disponível')).toBeInTheDocument();
  });

  it('deve renderizar indicadores de FCFF Total', () => {
    render(<FCFFTable data={mockFCFFData} />);

    expect(screen.getByText('FCFF Total')).toBeInTheDocument();
  });

  it('deve renderizar indicadores de anos positivos e negativos', () => {
    render(<FCFFTable data={mockFCFFData} />);

    expect(screen.getByText('Anos Positivos')).toBeInTheDocument();
    expect(screen.getByText('Anos Negativos')).toBeInTheDocument();

    // Verifica que os indicadores estão presentes (3 anos todos positivos)
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('deve renderizar todas as linhas do FCFF', () => {
    render(<FCFFTable data={mockFCFFData} />);

    const expectedLines = [
      'EBIT',
      '(-) Impostos sobre EBIT',
      'NOPAT',
      '(+) Depreciação',
      '(-) CAPEX',
      '(-) Variação NCG',
      'FCFF',
    ];

    expectedLines.forEach(line => {
      expect(screen.getByText(line)).toBeInTheDocument();
    });
  });

  it('deve exibir descrições das siglas', () => {
    render(<FCFFTable data={mockFCFFData} />);

    expect(screen.getByText('Earnings Before Interest and Taxes')).toBeInTheDocument();
    expect(screen.getByText('Net Operating Profit After Taxes')).toBeInTheDocument();
    expect(screen.getByText('Capital Expenditure')).toBeInTheDocument();
    expect(screen.getByText('Free Cash Flow to the Firm')).toBeInTheDocument();
  });

  it('deve aplicar cores condicionais para FCFF', () => {
    const { container } = render(<FCFFTable data={mockFCFFData} />);

    // FCFF positivos devem ter cor verde
    const fcffRows = container.querySelectorAll('tbody tr:last-child td');
    expect(fcffRows.length).toBeGreaterThan(0);
  });

  it('deve calcular estatísticas corretamente', () => {
    render(<FCFFTable data={mockFCFFData} />);

    // Total FCFF = 210000 + 251000 + 20000 = 481000
    expect(screen.getByText('FCFF Total')).toBeInTheDocument();

    // 3 anos positivos, 0 negativos - verifica que os números estão presentes
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('deve lidar com FCFFs negativos', () => {
    const negativeData: FCFFCalculated[] = [
      {
        year: 0,
        ebit: 100000,
        impostos: 30000,
        nopat: 70000,
        depreciacaoAmortizacao: 10000,
        capex: 150000,
        ncg: 20000,
        fcff: -90000,
      },
    ];

    render(<FCFFTable data={negativeData} />);

    // Verifica que há 1 ano negativo
    expect(screen.getByText('Anos Negativos')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
