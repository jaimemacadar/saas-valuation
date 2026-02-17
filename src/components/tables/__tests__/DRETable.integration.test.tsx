import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DRETable } from '../DRETable';
import { DRECalculated, DREProjectionInputs } from '@/core/types';

// Mock do hook de persistência
jest.mock('@/hooks/useDREProjectionPersist', () => ({
  useDREProjectionPersist: () => ({
    isSaving: false,
    lastSavedAt: null,
    error: null,
    save: jest.fn(),
  }),
}));

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
  {
    year: 2,
    receitaBruta: 1260000,
    impostosEDevolucoes: 189000,
    receitaLiquida: 1071000,
    cmv: 504000,
    lucroBruto: 567000,
    despesasOperacionais: 252000,
    ebit: 315000,
    depreciacaoAmortizacao: 63000,
    ebitda: 378000,
    despesasFinanceiras: 37800,
    lucroAntesIR: 277200,
    irCSLL: 94500,
    lucroLiquido: 182700,
    dividendos: 50400,
  },
  {
    year: 3,
    receitaBruta: 1323000,
    impostosEDevolucoes: 198450,
    receitaLiquida: 1124550,
    cmv: 529200,
    lucroBruto: 595350,
    despesasOperacionais: 264600,
    ebit: 330750,
    depreciacaoAmortizacao: 66150,
    ebitda: 396900,
    despesasFinanceiras: 39690,
    lucroAntesIR: 291060,
    irCSLL: 99225,
    lucroLiquido: 191835,
    dividendos: 52920,
  },
];

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
  {
    year: 2,
    receitaBrutaGrowth: 5,
    impostosEDevolucoesRate: 15,
    cmvRate: 40,
    despesasOperacionaisRate: 20,
    irCSLLRate: 34,
    dividendosRate: 25,
  },
  {
    year: 3,
    receitaBrutaGrowth: 5,
    impostosEDevolucoesRate: 15,
    cmvRate: 40,
    despesasOperacionaisRate: 20,
    irCSLLRate: 34,
    dividendosRate: 25,
  },
];

describe('DRETable - Testes de Integração', () => {
  describe('Copiar para direita', () => {
    it('deve copiar valor do Ano 1 para todos os anos seguintes', async () => {
      const onProjectionChange = jest.fn();

      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
          onProjectionChange={onProjectionChange}
        />
      );

      // Encontra o botão de copiar para direita na primeira linha de premissa
      const copyButtons = screen.getAllByLabelText('Copiar para todos os anos');
      const firstCopyButton = copyButtons[0];

      // Clica no botão
      fireEvent.click(firstCopyButton);

      await waitFor(() => {
        expect(onProjectionChange).toHaveBeenCalled();
        const updatedData = onProjectionChange.mock.calls[0][0] as DREProjectionInputs[];

        // Verifica que todos os anos > 1 têm o mesmo valor do Ano 1
        const year1Value = updatedData.find((p) => p.year === 1)?.receitaBrutaGrowth;
        const year2Value = updatedData.find((p) => p.year === 2)?.receitaBrutaGrowth;
        const year3Value = updatedData.find((p) => p.year === 3)?.receitaBrutaGrowth;

        expect(year2Value).toBe(year1Value);
        expect(year3Value).toBe(year1Value);
      });
    });

    it('deve copiar valores diferentes para cada premissa independentemente', async () => {
      const onProjectionChange = jest.fn();

      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
          onProjectionChange={onProjectionChange}
        />
      );

      const copyButtons = screen.getAllByLabelText('Copiar para todos os anos');
      expect(copyButtons.length).toBeGreaterThanOrEqual(2);

      // Copia primeira premissa (receitaBrutaGrowth)
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(onProjectionChange).toHaveBeenCalled();
        const firstCall = onProjectionChange.mock.calls[0][0] as DREProjectionInputs[];
        const year1 = firstCall.find((p) => p.year === 1);
        const year2 = firstCall.find((p) => p.year === 2);
        // Verifica que Year 2 tem o mesmo valor de Year 1 para receitaBrutaGrowth
        expect(year2?.receitaBrutaGrowth).toBe(year1?.receitaBrutaGrowth);
      });
    });
  });

  describe('Aplicar tendência', () => {
    it('deve aplicar interpolação linear entre valor inicial e final', async () => {
      const onProjectionChange = jest.fn();

      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
          onProjectionChange={onProjectionChange}
        />
      );

      // Abre o popover de tendência
      const trendButtons = screen.getAllByLabelText('Aplicar tendência');
      fireEvent.click(trendButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Aplicar Tendência')).toBeInTheDocument();
      });

      // Preenche valores
      const startInput = screen.getByLabelText('Valor inicial (%)');
      const endInput = screen.getByLabelText('Valor final (%)');

      fireEvent.change(startInput, { target: { value: '5' } });
      fireEvent.change(endInput, { target: { value: '15' } });

      // Aplica tendência
      const applyButton = screen.getByRole('button', { name: 'Aplicar' });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(onProjectionChange).toHaveBeenCalled();
        const updatedData = onProjectionChange.mock.calls[0][0] as DREProjectionInputs[];

        // Verifica interpolação linear
        // Com 3 anos projetados (1, 2, 3), a interpolação deve ser:
        // Ano 1: 5 + (15 - 5) * (0 / 2) = 5
        // Ano 2: 5 + (15 - 5) * (1 / 2) = 10
        // Ano 3: 5 + (15 - 5) * (2 / 2) = 15
        const year1 = updatedData.find((p) => p.year === 1);
        const year2 = updatedData.find((p) => p.year === 2);
        const year3 = updatedData.find((p) => p.year === 3);

        expect(year1?.receitaBrutaGrowth).toBe(5);
        expect(year2?.receitaBrutaGrowth).toBe(10);
        expect(year3?.receitaBrutaGrowth).toBe(15);
      });
    });

    it('deve validar valores min/max ao aplicar tendência', async () => {
      const onProjectionChange = jest.fn();

      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
          onProjectionChange={onProjectionChange}
        />
      );

      const trendButtons = screen.getAllByLabelText('Aplicar tendência');
      fireEvent.click(trendButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Aplicar Tendência')).toBeInTheDocument();
      });

      // Tenta valores fora do range 0-100
      const startInput = screen.getByLabelText('Valor inicial (%)');
      const endInput = screen.getByLabelText('Valor final (%)');

      fireEvent.change(startInput, { target: { value: '-10' } });
      fireEvent.change(endInput, { target: { value: '150' } });

      const applyButton = screen.getByRole('button', { name: 'Aplicar' });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(onProjectionChange).toHaveBeenCalled();
        const updatedData = onProjectionChange.mock.calls[0][0] as DREProjectionInputs[];

        // Valores devem estar clamped entre 0 e 100
        const year1 = updatedData.find((p) => p.year === 1);
        const year3 = updatedData.find((p) => p.year === 3);

        expect(year1?.receitaBrutaGrowth).toBeGreaterThanOrEqual(0);
        expect(year3?.receitaBrutaGrowth).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Navegação Tab/Enter', () => {
    it('deve navegar para próximo input ao pressionar Tab', async () => {
      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
        />
      );

      const inputs = screen.getAllByRole('textbox');
      const firstInput = inputs[0];

      // Foca no primeiro input
      firstInput.focus();
      expect(document.activeElement).toBe(firstInput);

      // Pressiona Tab
      fireEvent.keyDown(firstInput, { key: 'Tab', shiftKey: false });

      await waitFor(() => {
        // O próximo input deve estar focado (pode variar dependendo da ordem)
        expect(document.activeElement).not.toBe(firstInput);
      });
    });

    it('deve navegar para input anterior ao pressionar Shift+Tab', async () => {
      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
        />
      );

      const inputs = screen.getAllByRole('textbox');
      const secondInput = inputs[1];

      // Foca no segundo input
      secondInput.focus();
      expect(document.activeElement).toBe(secondInput);

      // Pressiona Shift+Tab
      fireEvent.keyDown(secondInput, { key: 'Tab', shiftKey: true });

      await waitFor(() => {
        // O input anterior deve estar focado
        expect(document.activeElement).not.toBe(secondInput);
      });
    });

    it('deve navegar para baixo ao pressionar Enter', async () => {
      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
        />
      );

      const inputs = screen.getAllByRole('textbox');
      const firstInput = inputs[0];

      // Foca no primeiro input
      firstInput.focus();
      expect(document.activeElement).toBe(firstInput);

      // Pressiona Enter
      fireEvent.keyDown(firstInput, { key: 'Enter' });

      await waitFor(() => {
        // Deve ter navegado para outro input
        expect(document.activeElement).not.toBe(firstInput);
      });
    });

    it('deve remover foco ao pressionar Escape', async () => {
      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
        />
      );

      const inputs = screen.getAllByRole('textbox');
      const firstInput = inputs[0];

      // Foca no primeiro input
      firstInput.focus();
      expect(document.activeElement).toBe(firstInput);

      // Pressiona Escape
      fireEvent.keyDown(firstInput, { key: 'Escape' });

      await waitFor(() => {
        // Deve ter perdido o foco
        expect(document.activeElement).not.toBe(firstInput);
      });
    });
  });

  describe('Fluxo completo de edição', () => {
    it('deve editar premissa, copiar para direita e aplicar tendência em sequência', async () => {
      const onProjectionChange = jest.fn();

      render(
        <DRETable
          data={mockDREData}
          projectionInputs={mockProjectionInputs}
          modelId="test-model"
          onProjectionChange={onProjectionChange}
        />
      );

      // 1. Edita o valor do Ano 1
      const inputs = screen.getAllByRole('textbox');
      const firstInput = inputs[0];

      fireEvent.focus(firstInput);
      fireEvent.change(firstInput, { target: { value: '8' } });
      fireEvent.blur(firstInput);

      await waitFor(() => {
        expect(onProjectionChange).toHaveBeenCalled();
      });

      // 2. Copia para direita
      const copyButtons = screen.getAllByLabelText('Copiar para todos os anos');
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(onProjectionChange).toHaveBeenCalledTimes(2);
      });

      // 3. Aplica tendência
      const trendButtons = screen.getAllByLabelText('Aplicar tendência');
      fireEvent.click(trendButtons[1]); // Segunda premissa

      await waitFor(() => {
        expect(screen.getByText('Aplicar Tendência')).toBeInTheDocument();
      });

      const startInput = screen.getByLabelText('Valor inicial (%)');
      const endInput = screen.getByLabelText('Valor final (%)');

      fireEvent.change(startInput, { target: { value: '10' } });
      fireEvent.change(endInput, { target: { value: '20' } });

      const applyButton = screen.getByRole('button', { name: 'Aplicar' });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(onProjectionChange).toHaveBeenCalledTimes(3);
      });
    });
  });
});
