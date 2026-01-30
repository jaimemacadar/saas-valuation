import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

describe('useIsMobile', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('deve retornar false para telas maiores que 768px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('deve retornar true para telas menores que 768px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('deve retornar false para tela exatamente 768px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('deve atualizar quando a largura da janela mudar', () => {
    const listeners: Array<() => void> = [];
    const mockMatchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((event: string, handler: () => void) => {
        if (event === 'change') {
          listeners.push(handler);
        }
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useIsMobile());

    // Estado inicial - desktop
    expect(result.current).toBe(false);

    // Simular mudança para mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      listeners.forEach((listener) => listener());
    });

    expect(result.current).toBe(true);
  });

  it('deve limpar o event listener ao desmontar', () => {
    const removeEventListener = jest.fn();
    const mockMatchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener,
      dispatchEvent: jest.fn(),
    }));

    window.matchMedia = mockMatchMedia;

    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
