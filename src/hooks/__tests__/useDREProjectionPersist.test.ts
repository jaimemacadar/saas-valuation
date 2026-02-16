import { renderHook, act, waitFor } from '@testing-library/react';
import { useDREProjectionPersist } from '../useDREProjectionPersist';
import { saveDREProjection } from '@/lib/actions/models';
import { toast } from 'sonner';
import { DREProjectionInputs } from '@/core/types';

// Mock das dependências
jest.mock('@/lib/actions/models');
jest.mock('sonner');

const mockSaveDREProjection = saveDREProjection as jest.MockedFunction<typeof saveDREProjection>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('useDREProjectionPersist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const mockData: DREProjectionInputs[] = [
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

  it('deve inicializar com estado correto', () => {
    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: 'test-model' })
    );

    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSavedAt).toBe(null);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.save).toBe('function');
  });

  it('deve aplicar debounce de 800ms por padrão', async () => {
    mockSaveDREProjection.mockResolvedValue({ success: true, data: null });

    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: 'test-model' })
    );

    act(() => {
      result.current.save(mockData);
    });

    // Não deve chamar imediatamente
    expect(mockSaveDREProjection).not.toHaveBeenCalled();

    // Avança 800ms
    act(() => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(mockSaveDREProjection).toHaveBeenCalledWith('test-model', mockData);
    });
  });

  it('deve usar debounce personalizado', async () => {
    mockSaveDREProjection.mockResolvedValue({ success: true, data: null });

    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: 'test-model', debounceMs: 500 })
    );

    act(() => {
      result.current.save(mockData);
    });

    // Avança 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockSaveDREProjection).toHaveBeenCalledWith('test-model', mockData);
    });
  });

  it('deve cancelar save anterior ao chamar save novamente', async () => {
    mockSaveDREProjection.mockResolvedValue({ success: true, data: null });

    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: 'test-model', debounceMs: 800 })
    );

    const firstData = [...mockData];
    const secondData = [
      {
        ...mockData[0],
        receitaBrutaGrowth: 10,
      },
    ];

    act(() => {
      result.current.save(firstData);
    });

    // Avança 400ms (metade do debounce)
    act(() => {
      jest.advanceTimersByTime(400);
    });

    // Chama save novamente antes de completar o primeiro debounce
    act(() => {
      result.current.save(secondData);
    });

    // Avança mais 800ms para completar o segundo debounce
    act(() => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      // Deve ter sido chamado apenas uma vez com os dados mais recentes
      expect(mockSaveDREProjection).toHaveBeenCalledTimes(1);
      expect(mockSaveDREProjection).toHaveBeenCalledWith('test-model', secondData);
    });
  });

  it('deve atualizar isSaving durante o save', async () => {
    mockSaveDREProjection.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, data: null }), 100)
        )
    );

    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: 'test-model', debounceMs: 100 })
    );

    act(() => {
      result.current.save(mockData);
    });

    // Avança o debounce
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(true);
    });

    // Avança o tempo do save
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(false);
    });
  });

  it('deve atualizar lastSavedAt após save bem-sucedido', async () => {
    mockSaveDREProjection.mockResolvedValue({ success: true, data: null });

    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: 'test-model', debounceMs: 100 })
    );

    act(() => {
      result.current.save(mockData);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.lastSavedAt).toBeInstanceOf(Date);
    });
  });

  it('deve definir error e mostrar toast ao falhar', async () => {
    const errorMsg = 'Erro ao salvar premissas';
    mockSaveDREProjection.mockResolvedValue({ success: false, error: errorMsg });

    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: 'test-model', debounceMs: 100 })
    );

    act(() => {
      result.current.save(mockData);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMsg);
      expect(mockToast.error).toHaveBeenCalledWith(errorMsg);
    });
  });

  it('deve limpar error ao salvar novamente com sucesso', async () => {
    // Primeiro save falha
    mockSaveDREProjection.mockResolvedValueOnce({ success: false, error: 'Erro' });

    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: 'test-model', debounceMs: 100 })
    );

    act(() => {
      result.current.save(mockData);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Erro');
    });

    // Segundo save tem sucesso
    mockSaveDREProjection.mockResolvedValueOnce({ success: true, data: null });

    act(() => {
      result.current.save(mockData);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(null);
    });
  });

  it('não deve salvar se modelId não for fornecido', async () => {
    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: '', debounceMs: 100 })
    );

    act(() => {
      result.current.save(mockData);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockSaveDREProjection).not.toHaveBeenCalled();
  });

  it('deve limpar timer ao desmontar', () => {
    const { unmount } = renderHook(() =>
      useDREProjectionPersist({ modelId: 'test-model' })
    );

    // Força unmount
    unmount();

    // Deve ter limpado todos os timers
    expect(jest.getTimerCount()).toBe(0);
  });
});
