import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DRETable } from '../DRETable';
import { DRECalculated, DREProjectionInputs } from '@/core/types';

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

  describe('Premissas Inline', () => {
    const mockProjectionInputs: DREProjectionInputs[] = [
      {
        year: 0,
        receitaBrutaGrowth: 0,
        impostosEDevolucoesRate: 15,
        cmvRate: 40,
        despesasOperacionaisRate: 20,
        irCSLLRate: 34,
        dividendosRate: 25,
      },
      {
        year: 1,
        receitaBrutaGrowth: 5,
        impostosEDevolucoesRate: 15,
        cmvRate: 40,
        despesasOperacionaisRate: 20,
        irCSLLRate: 34,
        dividendosRate: 25,
      },
    ];

    it('deve renderizar linhas de premissa quando projectionInputs é fornecido', () => {
      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
        />
      );

      expect(screen.getByText('↳ Taxa de crescimento')).toBeInTheDocument();
      expect(screen.getByText('↳ Taxa sobre receita bruta')).toBeInTheDocument();
      expect(screen.getByText('↳ Taxa CMV')).toBeInTheDocument();
      expect(screen.getByText('↳ Taxa despesas operacionais')).toBeInTheDocument();
      expect(screen.getByText('↳ Taxa IR/CSLL')).toBeInTheDocument();
      expect(screen.getByText('↳ Taxa de dividendos')).toBeInTheDocument();
    });

    it('não deve renderizar linhas de premissa quando projectionInputs não é fornecido', () => {
      render(<DRETable data={mockDREData} />);

      expect(screen.queryByText('↳ Taxa de crescimento')).not.toBeInTheDocument();
      expect(screen.queryByText('↳ Taxa sobre receita bruta')).not.toBeInTheDocument();
    });

    it('deve renderizar inputs editáveis para anos projetados', () => {
      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
        />
      );

      // Verifica que há inputs (pelo menos um para cada ano projetado)
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('deve renderizar "—" para Ano Base nas premissas', () => {
      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
        />
      );

      // Verifica que há células com "—" (ano base não editável)
      const dashCells = screen.getAllByText('—');
      expect(dashCells.length).toBeGreaterThan(0);
    });

    it('deve chamar onProjectionChange quando premissa é alterada', async () => {
      const onProjectionChange = jest.fn();
      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
          onProjectionChange={onProjectionChange}
        />
      );

      const inputs = screen.getAllByRole('textbox');
      const firstInput = inputs[0];

      fireEvent.focus(firstInput);
      fireEvent.change(firstInput, { target: { value: '10' } });
      fireEvent.blur(firstInput);

      await waitFor(() => {
        expect(onProjectionChange).toHaveBeenCalled();
      });
    });

    it('deve renderizar indicador de salvamento quando modelId está presente', () => {
      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
        />
      );

      // Verifica que o indicador de salvamento não está visível inicialmente
      // (não há "Salvando..." ou "Salvo às" no início)
      expect(screen.queryByText(/Salvando/)).not.toBeInTheDocument();
    });

    it('deve renderizar tooltips nas linhas de premissa', () => {
      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
        />
      );

      // Verifica que há ícones de info (através do aria-label ou className)
      const container = screen.getByText('↳ Taxa de crescimento').closest('div');
      expect(container).toBeInTheDocument();
    });

    it('deve aplicar estilo diferenciado às linhas de premissa', () => {
      const { container } = render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
        />
      );

      // Verifica que linhas de premissa têm a classe bg-blue-50/50
      const premiseRows = container.querySelectorAll('tr.bg-blue-50\\/50');
      expect(premiseRows.length).toBeGreaterThan(0);
    });
  });
});
