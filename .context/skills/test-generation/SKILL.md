---
type: skill
name: Test Generation
description: Generate comprehensive test cases for code
skillSlug: test-generation
phases: [E, V]
generated: 2026-01-24
status: filled
scaffoldVersion: "2.0.0"
---

# Test Generation Guidelines

## Framework e Setup

### Stack de Testes

- **Unit Tests**: Jest + TypeScript
- **Component Tests**: React Testing Library
- **E2E Tests**: (Planejado - Playwright/Cypress)

### Configuração

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

## Estrutura de Testes

### Localização

```
src/
├── lib/
│   └── utils/
│       └── __tests__/
│           └── formatters.test.ts
├── components/
│   ├── __tests__/
│   │   ├── model-sidebar-nav.test.tsx
│   │   └── app-sidebar.test.tsx
│   └── tables/
│       └── __tests__/
│           ├── FCFFTable.test.tsx
│           └── DRETable.test.tsx
└── hooks/
    └── __tests__/
        └── use-mobile.test.tsx
```

**Regra**: Testes ficam em `__tests__/` no mesmo nível ou dentro do diretório do código testado.

## Testes Unitários

### Formatters (Utils)

```typescript
// src/lib/utils/__tests__/formatters.test.ts
import { formatCurrency, formatPercentage, formatCompactNumber } from '../formatters';

describe('formatCurrency', () => {
  it('should format BRL correctly', () => {
    expect(formatCurrency(1234.56, 'BRL')).toBe('R$ 1.234,56');
  });

  it('should format USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$ 1,234.56');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0, 'BRL')).toBe('R$ 0,00');
  });

  it('should handle negative values', () => {
    expect(formatCurrency(-1234.56, 'BRL')).toBe('-R$ 1.234,56');
  });

  it('should handle very large numbers', () => {
    expect(formatCurrency(1234567890, 'BRL')).toBe('R$ 1.234.567.890,00');
  });
});

describe('formatPercentage', () => {
  it('should format decimal to percentage', () => {
    expect(formatPercentage(0.1523)).toBe('15,23%');
  });

  it('should handle zero', () => {
    expect(formatPercentage(0)).toBe('0,00%');
  });

  it('should handle negative percentages', () => {
    expect(formatPercentage(-0.05)).toBe('-5,00%');
  });

  it('should respect decimal places', () => {
    expect(formatPercentage(0.123456, 3)).toBe('12,346%');
  });
});
```

### Cálculos Financeiros

```typescript
// src/core/calculations/__tests__/dre.test.ts
import { calculateDRE } from '../dre';
import type { DREBaseInputs } from '@/core/types';

describe('calculateDRE', () => {
  const baseInputs: DREBaseInputs = {
    receitaBruta: 100000,
    impostosSobreVendas: 15,
    custosMercadorias: 40000,
    despesasOperacionais: 20000,
  };

  it('should calculate receita líquida correctly', () => {
    const result = calculateDRE(baseInputs);
    expect(result.receitaLiquida).toBe(85000); // 100000 * (1 - 0.15)
  });

  it('should calculate lucro operacional correctly', () => {
    const result = calculateDRE(baseInputs);
    const expected = 85000 - 40000 - 20000; // 25000
    expect(result.lucroOperacional).toBe(expected);
  });

  it('should handle zero revenue', () => {
    const result = calculateDRE({ ...baseInputs, receitaBruta: 0 });
    expect(result.receitaLiquida).toBe(0);
    expect(result.margemLiquida).toBe(0); // Evitar NaN
  });

  it('should throw on negative revenue', () => {
    expect(() => {
      calculateDRE({ ...baseInputs, receitaBruta: -1000 });
    }).toThrow();
  });

  it('should throw on invalid tax rate', () => {
    expect(() => {
      calculateDRE({ ...baseInputs, impostosSobreVendas: 150 }); // > 100%
    }).toThrow();
  });

  it('should calculate margins as percentages', () => {
    const result = calculateDRE(baseInputs);
    expect(result.margemLiquida).toBeCloseTo(29.41, 2); // (25000/85000)*100
  });
});
```

## Testes de Componentes

### React Testing Library

```typescript
// src/components/tables/__tests__/DRETable.test.tsx
import { render, screen } from '@testing-library/react';
import { DRETable } from '../DRETable';
import type { DRECalculated } from '@/core/types';

describe('DRETable', () => {
  const mockData: DRECalculated[] = [
    {
      receitaBruta: 100000,
      receitaLiquida: 85000,
      lucroOperacional: 25000,
      margemLiquida: 29.41,
    },
    {
      receitaBruta: 120000,
      receitaLiquida: 102000,
      lucroOperacional: 30000,
      margemLiquida: 29.41,
    },
  ];

  it('should render table headers', () => {
    render(<DRETable data={mockData} />);

    expect(screen.getByText('Receita Bruta')).toBeInTheDocument();
    expect(screen.getByText('Receita Líquida')).toBeInTheDocument();
    expect(screen.getByText('Lucro Operacional')).toBeInTheDocument();
  });

  it('should display formatted currency values', () => {
    render(<DRETable data={mockData} currency="BRL" />);

    expect(screen.getByText('R$ 100.000,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 85.000,00')).toBeInTheDocument();
  });

  it('should render correct number of columns', () => {
    render(<DRETable data={mockData} />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3); // Label + 2 anos
  });

  it('should handle empty data gracefully', () => {
    render(<DRETable data={[]} />);

    expect(screen.getByText('Nenhum dado disponível')).toBeInTheDocument();
  });
});
```

### Componentes com Interação

```typescript
// src/components/forms/__tests__/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';
import * as authActions from '@/lib/actions/auth';

jest.mock('@/lib/actions/auth');

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render email and password fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/email é obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/senha é obrigatória/i)).toBeInTheDocument();
  });

  it('should call signIn on valid submission', async () => {
    const mockSignIn = jest.spyOn(authActions, 'signIn').mockResolvedValue({
      success: true,
    });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/senha/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should display error message on failed login', async () => {
    jest.spyOn(authActions, 'signIn').mockResolvedValue({
      success: false,
      error: 'Credenciais inválidas',
    });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/senha/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/credenciais inválidas/i)).toBeInTheDocument();
  });
});
```

## Testes de Hooks

```typescript
// src/hooks/__tests__/use-mobile.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useMobile } from '../use-mobile';

describe('useMobile', () => {
  it('should return true for mobile viewport', () => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 768px)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });

    const { result } = renderHook(() => useMobile());
    expect(result.current).toBe(true);
  });

  it('should return false for desktop viewport', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });

    const { result } = renderHook(() => useMobile());
    expect(result.current).toBe(false);
  });
});
```

## Mock Data e Helpers

### Mock de Server Actions

```typescript
// src/lib/actions/__tests__/models.test.ts
import { createModel, getModels } from '../models';
import * as supabase from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

describe('Model Actions', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  };

  beforeEach(() => {
    (supabase.createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it('should create model successfully', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    mockSupabase.single.mockResolvedValue({
      data: { id: 'model-123', name: 'Test Model' },
      error: null,
    });

    const result = await createModel({
      name: 'Test Model',
      description: 'Test',
    });

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('model-123');
  });
});
```

## Cobertura de Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Com cobertura
npm test -- --coverage

# Modo watch
npm test -- --watch

# Arquivo específico
npm test formatters.test.ts
```

### Metas de Cobertura

- **Cálculos financeiros**: 100% (crítico)
- **Utils e formatters**: 90%+
- **Componentes**: 80%+
- **Actions**: 80%+

## Checklist para Novos Testes

### Testes Unitários (Utils/Calculations)

- [ ] Happy path (caso normal)
- [ ] Edge cases (zero, null, undefined)
- [ ] Boundary values (min, max)
- [ ] Error cases (inputs inválidos)
- [ ] Type validation (se aplicável)

### Testes de Componentes

- [ ] Renderização básica
- [ ] Props diferentes
- [ ] Eventos de usuário
- [ ] Conditional rendering
- [ ] Loading states
- [ ] Error states

### Testes de Formulários

- [ ] Validação de campos
- [ ] Submit com dados válidos
- [ ] Submit com dados inválidos
- [ ] Mensagens de erro
- [ ] Loading state durante submit
- [ ] Success/error feedback

## Exemplos de Casos de Teste

### Cálculos com Múltiplos Anos

```typescript
it('should calculate projections for multiple years', () => {
  const inputs = {
    baseYear: { receitaBruta: 100000 },
    projection: { crescimentoReceita: 10 }, // 10% ao ano
    periods: 5,
  };

  const result = calculateProjections(inputs);

  expect(result).toHaveLength(5);
  expect(result[0].receitaBruta).toBeCloseTo(110000, 2); // Ano 1
  expect(result[4].receitaBruta).toBeCloseTo(146410, 2); // Ano 5
});
```

### Validação com Zod

```typescript
it('should validate inputs with Zod schema', () => {
  const invalidInput = {
    receitaBruta: -1000, // Negativo
    impostosSobreVendas: 150, // > 100%
  };

  expect(() => {
    dreInputSchema.parse(invalidInput);
  }).toThrow(ZodError);
});
```

## Boas Práticas

1. **AAA Pattern**: Arrange, Act, Assert
2. **Descriptive names**: Testes devem ser auto-explicativos
3. **Isolation**: Cada teste independente
4. **Fast**: Testes rápidos incentivam execução frequente
5. **Deterministic**: Mesma entrada = mesma saída
6. **Cleanup**: Limpar mocks e estado após cada teste
