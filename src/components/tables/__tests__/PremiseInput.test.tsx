import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PremiseInput } from '../PremiseInput';

describe('PremiseInput', () => {
  it('deve renderizar com valor formatado', () => {
    const onChange = jest.fn();
    render(<PremiseInput value={5.5} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('5.50');
  });

  it('deve renderizar com 0.00 quando value é null', () => {
    const onChange = jest.fn();
    render(<PremiseInput value={null} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('0.00');
  });

  it('deve formatar valor ao blur', async () => {
    const onChange = jest.fn();
    const { container } = render(<PremiseInput value={5} onChange={onChange} />);

    const input = screen.getByRole('textbox');

    // Foca no input
    fireEvent.focus(input);

    // Limpa e digita novo valor
    fireEvent.change(input, { target: { value: '10' } });

    // Blur para formatar
    fireEvent.blur(input);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(10);
    });
  });

  it('deve validar valor mínimo (0)', async () => {
    const onChange = jest.fn();
    render(<PremiseInput value={5} onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '-5' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(0);
    });
  });

  it('deve validar valor máximo (100)', async () => {
    const onChange = jest.fn();
    render(<PremiseInput value={5} onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '150' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(100);
    });
  });

  it('deve aceitar vírgula como separador decimal', async () => {
    const onChange = jest.fn();
    render(<PremiseInput value={5} onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '7,5' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(7.5);
    });
  });

  it('deve restaurar valor original ao pressionar Escape', async () => {
    const onChange = jest.fn();
    render(<PremiseInput value={5} onChange={onChange} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(input.value).toBe('5.00');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('deve fazer blur ao pressionar Enter', async () => {
    const onChange = jest.fn();
    render(<PremiseInput value={5} onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(10);
    });
  });

  it('deve renderizar botão de copiar para direita quando showCopyRight', () => {
    const onCopyRight = jest.fn();
    render(
      <PremiseInput
        value={5}
        onChange={jest.fn()}
        showCopyRight
        onCopyRight={onCopyRight}
      />
    );

    const button = screen.getByLabelText('Copiar para todos os anos');
    expect(button).toBeInTheDocument();
  });

  it('deve chamar onCopyRight ao clicar no botão', async () => {
    const onCopyRight = jest.fn();
    render(
      <PremiseInput
        value={5}
        onChange={jest.fn()}
        showCopyRight
        onCopyRight={onCopyRight}
      />
    );

    const button = screen.getByLabelText('Copiar para todos os anos');
    fireEvent.click(button);

    expect(onCopyRight).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar botão de tendência quando showTrend', () => {
    const onApplyTrend = jest.fn();
    render(
      <PremiseInput
        value={5}
        onChange={jest.fn()}
        showTrend
        onApplyTrend={onApplyTrend}
      />
    );

    const button = screen.getByLabelText('Aplicar tendência');
    expect(button).toBeInTheDocument();
  });

  it('deve abrir popover ao clicar em aplicar tendência', async () => {
    const onApplyTrend = jest.fn();
    render(
      <PremiseInput
        value={5}
        onChange={jest.fn()}
        showTrend
        onApplyTrend={onApplyTrend}
      />
    );

    const button = screen.getByLabelText('Aplicar tendência');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Aplicar Tendência')).toBeInTheDocument();
    });
  });

  it('deve aplicar tendência com valores inicial e final', async () => {
    const onApplyTrend = jest.fn();
    render(
      <PremiseInput
        value={5}
        onChange={jest.fn()}
        showTrend
        onApplyTrend={onApplyTrend}
      />
    );

    // Abre o popover
    const button = screen.getByLabelText('Aplicar tendência');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Aplicar Tendência')).toBeInTheDocument();
    });

    // Preenche valores
    const startInput = screen.getByLabelText('Valor inicial (%)');
    const endInput = screen.getByLabelText('Valor final (%)');

    fireEvent.change(startInput, { target: { value: '5' } });
    fireEvent.change(endInput, { target: { value: '15' } });

    // Clica em aplicar
    const applyButton = screen.getByRole('button', { name: 'Aplicar' });
    fireEvent.click(applyButton);

    expect(onApplyTrend).toHaveBeenCalledWith(5, 15);
  });

  it('deve estar desabilitado quando disabled é true', () => {
    const onChange = jest.fn();
    render(<PremiseInput value={5} onChange={onChange} disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('deve chamar onNavigateNext ao pressionar Tab', () => {
    const onNavigateNext = jest.fn();
    render(
      <PremiseInput
        value={5}
        onChange={jest.fn()}
        onNavigateNext={onNavigateNext}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Tab', shiftKey: false });

    expect(onNavigateNext).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onNavigatePrevious ao pressionar Shift+Tab', () => {
    const onNavigatePrevious = jest.fn();
    render(
      <PremiseInput
        value={5}
        onChange={jest.fn()}
        onNavigatePrevious={onNavigatePrevious}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });

    expect(onNavigatePrevious).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onNavigateDown ao pressionar Enter', () => {
    const onNavigateDown = jest.fn();
    const onChange = jest.fn();
    render(
      <PremiseInput
        value={5}
        onChange={onChange}
        onNavigateDown={onNavigateDown}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onNavigateDown).toHaveBeenCalledTimes(1);
  });
});
