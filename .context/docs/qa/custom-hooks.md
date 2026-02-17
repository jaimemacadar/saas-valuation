---
slug: custom-hooks
category: development
generatedAt: 2026-02-16
relevantFiles:
  - ../../../src/hooks/useDREProjectionPersist.ts
  - ../../../src/components/tables/DRETable.tsx
---

# Custom Hooks

Documentação dos hooks customizados da aplicação SaaS Valuation.

---

## 📦 useDREProjectionPersist

**Arquivo:** `src/hooks/useDREProjectionPersist.ts`

### Descrição

Hook customizado para persistência automática de premissas de projeção do DRE com **debounce**. Fornece API imperativa para salvar dados com feedback visual de estado.

### Características

- ✅ **API imperativa** - Método `save()` chamado explicitamente
- ✅ **Debounce configurável** - Padrão de 800ms
- ✅ **Estados observáveis** - `isSaving`, `lastSavedAt`
- ✅ **Cancelamento automático** - Cancela timeout anterior ao editar novamente
- ✅ **Error handling** - Trata erros de persistência
- ✅ **Type-safe** - Totalmente tipado com TypeScript

### Assinatura

```typescript
function useDREProjectionPersist(options: {
  modelId: string;       // ID do modelo a ser atualizado
  debounceMs?: number;   // Delay em ms antes de salvar (padrão: 800)
}): {
  isSaving: boolean;                              // True durante persistência
  lastSavedAt: Date | null;                       // Timestamp do último save
  save: (data: DREProjectionInputs[]) => void;    // Método imperativo de save
}
```

### Tipos

```typescript
type DREProjectionInputs = {
  year: number;
  revenueGrowth: number;           // % crescimento de receita
  grossMargin: number;             // % margem bruta
  opexAsRevenue: number;           // % despesas operacionais / receita
  salesMarketingAsRevenue: number; // % comercial / receita
  gaAsRevenue: number;             // % administrativo / receita
};
```

### Implementação

```typescript
export function useDREProjectionPersist({
  modelId,
  debounceMs = 800,
}: {
  modelId: string;
  debounceMs?: number;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const save = useCallback(
    async (data: DREProjectionInputs[]) => {
      // Cancela timeout anterior se houver
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Agenda novo save com debounce
      timeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          // Persistência via server action
          await updateDREProjections(modelId, data);
          setLastSavedAt(new Date());
        } catch (error) {
          console.error('Erro ao salvar premissas do DRE:', error);
          // TODO: Adicionar toast de erro
        } finally {
          setIsSaving(false);
        }
      }, debounceMs);
    },
    [modelId, debounceMs]
  );

  // Cleanup: cancela timeout pendente ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isSaving, lastSavedAt, save };
}
```

### Exemplo de Uso

#### Uso Básico

```typescript
import { useDREProjectionPersist } from '@/hooks/useDREProjectionPersist';

function DRETable({ modelId, projectionInputs }) {
  const [localProjections, setLocalProjections] = useState(projectionInputs);
  const { isSaving, lastSavedAt, save } = useDREProjectionPersist({ modelId });

  const handleChange = (year: number, field: string, value: number) => {
    // Atualização imediata no estado local (UX responsiva)
    const updated = localProjections.map(p =>
      p.year === year ? { ...p, [field]: value } : p
    );
    setLocalProjections(updated);

    // Dispara save com debounce
    save(updated);
  };

  return (
    <div>
      {/* Indicador visual */}
      {isSaving && <Loader2 className="animate-spin" />}
      {!isSaving && lastSavedAt && (
        <Check className="text-green-600" />
      )}

      {/* Inputs que disparam handleChange */}
      {/* ... */}
    </div>
  );
}
```

#### Uso com Debounce Customizado

```typescript
// Para salvar mais rapidamente (ex: 300ms)
const { save } = useDREProjectionPersist({
  modelId: '123',
  debounceMs: 300,
});

// Para salvar mais lentamente (ex: 2 segundos)
const { save } = useDREProjectionPersist({
  modelId: '123',
  debounceMs: 2000,
});
```

#### Integração com Indicadores Visuais

```typescript
function SaveIndicator({ isSaving, lastSavedAt }) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Salvando...</span>
      </div>
    );
  }

  if (lastSavedAt) {
    const timeAgo = formatDistanceToNow(lastSavedAt, { locale: ptBR, addSuffix: true });
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="h-3 w-3 text-green-600" />
        <span>Salvo {timeAgo}</span>
      </div>
    );
  }

  return null;
}

function DRETable({ modelId }) {
  const { isSaving, lastSavedAt, save } = useDREProjectionPersist({ modelId });

  return (
    <div>
      <SaveIndicator isSaving={isSaving} lastSavedAt={lastSavedAt} />
      {/* ... */}
    </div>
  );
}
```

### Fluxo de Execução

```
Usuário edita input
       ↓
handleChange() atualiza estado local (imediato)
       ↓
save() é chamado
       ↓
Timeout anterior é cancelado (se existir)
       ↓
Novo timeout é agendado (800ms)
       ↓
[usuário continua editando? → cancela e reagenda]
       ↓
Timeout expira (usuário parou de editar)
       ↓
setIsSaving(true)
       ↓
await updateDREProjections(modelId, data)
       ↓
setLastSavedAt(new Date())
       ↓
setIsSaving(false)
```

### Benefícios do Debounce

**Sem debounce**:
```
Usuário digita "15.5" (4 caracteres)
→ 4 chamadas à API (1, 15, 15., 15.5)
→ Overhead de rede e processamento
→ Possíveis conflitos de concorrência
```

**Com debounce de 800ms**:
```
Usuário digita "15.5" rapidamente
→ Aguarda 800ms após última tecla
→ 1 chamada à API (15.5)
→ Eficiente e sem conflitos
```

### Comparação: API Imperativa vs Observável

#### API Imperativa (usada neste hook)

```typescript
const { save } = useDREProjectionPersist({ modelId });

const handleChange = (data) => {
  setLocalState(data);
  save(data);  // ← Chamada explícita
};
```

**Vantagens**:
- ✅ Controle explícito sobre quando salvar
- ✅ Fácil de testar (mock do método `save`)
- ✅ Não depende de `useEffect` com dependências

#### API Observável (alternativa)

```typescript
const { isSaving } = useDREProjectionPersist({ modelId, data });
//                                                        ↑
//                                    Hook observa mudanças em `data`

const handleChange = (newData) => {
  setData(newData);  // ← Hook salva automaticamente
};
```

**Desvantagens**:
- ❌ `useEffect` com dependência em `data` (pode causar loops)
- ❌ Menos previsível (salva automaticamente)
- ❌ Dificulta testes (acoplamento maior)

### Testes

```typescript
// useDREProjectionPersist.test.ts
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDREProjectionPersist } from './useDREProjectionPersist';
import * as actions from '@/lib/actions/dre';

jest.mock('@/lib/actions/dre');

describe('useDREProjectionPersist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('inicia com estados padrão', () => {
    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: '123' })
    );

    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSavedAt).toBeNull();
    expect(typeof result.current.save).toBe('function');
  });

  it('salva com debounce de 800ms', async () => {
    const mockUpdate = jest.spyOn(actions, 'updateDREProjections').mockResolvedValue();
    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: '123' })
    );

    const data = [{ year: 1, revenueGrowth: 10 }];

    act(() => {
      result.current.save(data);
    });

    // Não deve salvar imediatamente
    expect(mockUpdate).not.toHaveBeenCalled();

    // Avança 800ms
    jest.advanceTimersByTime(800);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('123', data);
    });
  });

  it('cancela timeout anterior ao editar novamente', async () => {
    const mockUpdate = jest.spyOn(actions, 'updateDREProjections').mockResolvedValue();
    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: '123' })
    );

    // Primeira edição
    act(() => {
      result.current.save([{ year: 1, revenueGrowth: 10 }]);
    });
    jest.advanceTimersByTime(400);

    // Segunda edição antes do timeout expirar
    act(() => {
      result.current.save([{ year: 1, revenueGrowth: 15 }]);
    });
    jest.advanceTimersByTime(800);

    await waitFor(() => {
      // Deve salvar apenas o último valor
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith('123', [
        { year: 1, revenueGrowth: 15 }
      ]);
    });
  });

  it('atualiza isSaving durante persistência', async () => {
    const mockUpdate = jest.spyOn(actions, 'updateDREProjections').mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: '123' })
    );

    act(() => {
      result.current.save([{ year: 1, revenueGrowth: 10 }]);
    });

    jest.advanceTimersByTime(800);

    await waitFor(() => {
      expect(result.current.isSaving).toBe(true);
    });

    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(result.current.isSaving).toBe(false);
    });
  });

  it('atualiza lastSavedAt após sucesso', async () => {
    const mockUpdate = jest.spyOn(actions, 'updateDREProjections').mockResolvedValue();
    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: '123' })
    );

    const beforeSave = new Date();

    act(() => {
      result.current.save([{ year: 1, revenueGrowth: 10 }]);
    });

    jest.advanceTimersByTime(800);

    await waitFor(() => {
      expect(result.current.lastSavedAt).toBeInstanceOf(Date);
      expect(result.current.lastSavedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeSave.getTime()
      );
    });
  });

  it('trata erro de persistência', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockUpdate = jest.spyOn(actions, 'updateDREProjections').mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() =>
      useDREProjectionPersist({ modelId: '123' })
    );

    act(() => {
      result.current.save([{ year: 1, revenueGrowth: 10 }]);
    });

    jest.advanceTimersByTime(800);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erro ao salvar premissas do DRE:',
        expect.any(Error)
      );
      expect(result.current.isSaving).toBe(false);
    });

    consoleSpy.mockRestore();
  });

  it('cancela timeout pendente ao desmontar', () => {
    const { result, unmount } = renderHook(() =>
      useDREProjectionPersist({ modelId: '123' })
    );

    act(() => {
      result.current.save([{ year: 1, revenueGrowth: 10 }]);
    });

    unmount();

    jest.advanceTimersByTime(800);

    // Não deve salvar após desmontar
    expect(actions.updateDREProjections).not.toHaveBeenCalled();
  });
});
```

### Integração com Backend

O hook utiliza a server action `updateDREProjections`:

```typescript
// lib/actions/dre.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { DREProjectionInputs } from '@/core/types';

export async function updateDREProjections(
  modelId: string,
  projections: DREProjectionInputs[]
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('models')
    .update({
      model_data: {
        ...existingData,
        dreProjections: projections,
      },
    })
    .eq('id', modelId);

  if (error) {
    throw new Error('Falha ao atualizar premissas do DRE');
  }
}
```

### Melhorias Futuras

- [ ] **Retry logic** - Tentar novamente em caso de falha de rede
- [ ] **Optimistic updates** - Atualizar UI antes de confirmar save
- [ ] **Conflict resolution** - Detectar e resolver conflitos de edição simultânea
- [ ] **Toast notifications** - Feedback visual de sucesso/erro
- [ ] **Undo/Redo** - Histórico de mudanças com ctrl+z
- [ ] **Offline support** - Armazenar mudanças localmente se offline

### Padrões Relacionados

- **Debounce** - Atrasa execução até inatividade
- **Throttle** - Limita frequência de execução (não usado aqui)
- **API Imperativa** - Métodos explícitos vs observação reativa
- **Optimistic UI** - Atualiza UI antes de confirmar (não implementado)

---

## 📚 Ver Também

- [Architecture Overview](../architecture.md#sistema-de-navegação-e-input-de-dados)
- [DRETable Component](./components-ui.md#-dretable)
- [PremiseInput Component](./components-ui.md#-premiseinput)
- [Testing Strategy](../testing-strategy.md)
