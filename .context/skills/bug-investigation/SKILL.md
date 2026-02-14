---
type: skill
name: Bug Investigation
description: Systematic bug investigation and root cause analysis
skillSlug: bug-investigation
phases: [E, V]
generated: 2026-01-24
status: filled
scaffoldVersion: "2.0.0"
---

# Bug Investigation Guidelines

## Processo de Investigação

### 1. Reprodução (CRITICAL)

Antes de qualquer correção, **SEMPRE** reproduza o bug.

```markdown
## Bug Report Template

### Descrição
[Descrição clara e concisa do problema]

### Passos para Reproduzir
1. Ir para página X
2. Clicar em Y
3. Preencher campo Z com valor W
4. Observar erro

### Comportamento Esperado
[O que deveria acontecer]

### Comportamento Atual
[O que realmente acontece]

### Ambiente
- Browser: Chrome 120
- OS: Windows 11
- Mock Mode: Ativado
- User: mock-user-1

### Screenshots/Logs
[Se aplicável]

### Severidade
- [ ] Critical (Sistema quebrado)
- [ ] High (Funcionalidade importante não funciona)
- [ ] Medium (Funcionalidade secundária afetada)
- [ ] Low (Cosmético, workaround disponível)
```

### 2. Isolação do Problema

#### Técnicas de Isolamento

**Binary Search**: Divida o código pela metade

```typescript
// Suspeita: Bug em calculateValuation
export function calculateValuation(inputs: ValuationInputs) {
  const dreResults = calculateDRE(inputs);
  console.log('✅ DRE calculated:', dreResults); // Checkpoint 1

  const fcffResults = calculateFCFF(dreResults, inputs);
  console.log('✅ FCFF calculated:', fcffResults); // Checkpoint 2

  const wacc = calculateWACC(inputs);
  console.log('✅ WACC calculated:', wacc); // Checkpoint 3

  // Se bug aparece aqui, problema está em discounting
  const presentValues = discountCashFlows(fcffResults, wacc);
  console.log('✅ Present values:', presentValues); // Checkpoint 4

  return /* ... */;
}
```

**Rubber Duck Debugging**: Explique o problema em voz alta

**Minimize Test Case**: Reduza ao menor código que reproduz o bug

```typescript
// Bug: formatCurrency retorna NaN para certos valores

// Caso completo (difícil debug)
const result = formatCurrency(
  calculateMargin(revenue, costs),
  'BRL'
);

// Minimizado (isola o problema)
console.log(formatCurrency(NaN, 'BRL')); // Reproduz!
// Root cause: formatCurrency não trata NaN
```

### 3. Análise de Root Cause

Pergunte **5 WHYS**:

```
Bug: Tabela DRE mostra valores errados

Why? Os valores calculados estão incorretos
Why? calculateDRE retorna valores inesperados
Why? Input está chegando com valor null
Why? Mock data não tem esse campo
Why? Mock data store não foi atualizado após mudança no schema

ROOT CAUSE: Schema do modelo mudou, mas mock data não foi atualizado
```

### 4. Correção

```typescript
// ❌ Fix sintomático (não resolve root cause)
export function calculateDRE(inputs: DREBaseInputs) {
  const receita = inputs.receitaBruta || 0; // Mascara o problema
  // ...
}

// ✅ Fix correto (resolve root cause)
// 1. Adicionar validação
export function calculateDRE(inputs: DREBaseInputs) {
  const validated = dreInputSchema.parse(inputs); // Lança erro se inválido
  // ...
}

// 2. Corrigir mock data
export const mockModels: MockFinancialModel[] = [
  {
    id: '1',
    modelData: {
      receitaBruta: 1000000, // ✅ Agora presente
      // ...
    },
  },
];
```

### 5. Teste de Regressão

```typescript
// src/core/calculations/__tests__/dre.test.ts
describe('calculateDRE - Bug Fixes', () => {
  it('should handle missing receitaBruta (regression test for #123)', () => {
    const invalidInput = {
      // receitaBruta: undefined, // Missing field
      impostosSobreVendas: 15,
    };

    // Should throw validation error, not calculate with undefined
    expect(() => {
      calculateDRE(invalidInput as any);
    }).toThrow(ZodError);
  });
});
```

## Ferramentas de Debug

### Console Debugging

```typescript
// Evite console.log simples
console.log(data); // ❌ Pouca informação

// Use console com contexto
console.log('📊 DRE Calculation Input:', {
  receitaBruta: inputs.receitaBruta,
  impostos: inputs.impostosSobreVendas,
  timestamp: new Date().toISOString(),
}); // ✅ Informativo

// Use console.table para arrays/objetos
console.table(dreResults);

// Use console.trace para call stack
console.trace('Calculating WACC');

// Use console.time para performance
console.time('DRE Calculation');
calculateDRE(inputs);
console.timeEnd('DRE Calculation');
```

### Browser DevTools

```typescript
// Breakpoint condicional (DevTools)
// Adicione condição: inputs.receitaBruta === 0
export function calculateDRE(inputs: DREBaseInputs) {
  debugger; // Para apenas quando condição é true
  // ...
}
```

### React DevTools

```typescript
// Component debugging
export function DRETable({ data }: DRETableProps) {
  // Inspecione props no React DevTools
  useEffect(() => {
    console.log('DRETable rendered with:', data);
  }, [data]);

  return /* ... */;
}
```

### Network Tab

Para bugs de API/Server Actions:

1. Abra Network tab
2. Filter por "Fetch/XHR"
3. Clique na request
4. Verifique:
   - Request payload
   - Response
   - Status code
   - Headers

## Padrões de Bugs Comuns

### 1. Cálculos Financeiros

#### Divisão por Zero

```typescript
// ❌ Bug
const margin = lucro / receita; // NaN quando receita = 0

// ✅ Fix
const margin = receita === 0 ? 0 : (lucro / receita) * 100;
```

#### Arredondamento

```typescript
// ❌ Bug: Floating point precision
const total = 0.1 + 0.2; // 0.30000000000000004

// ✅ Fix: Round to fixed decimals
const total = Math.round((0.1 + 0.2) * 100) / 100; // 0.30
```

#### Valores Negativos Inesperados

```typescript
// ❌ Bug: Permite lucro negativo em campo que deveria ser positivo
const lucroLiquido = receita - custos; // Pode ser negativo

// ✅ Fix: Validação no schema
const dreSchema = z.object({
  lucroLiquido: z.number(), // Permite negativos se faz sentido
  // OU
  patrimonio: z.number().min(0), // Força positivo quando necessário
});
```

### 2. State Management

#### State Stale

```typescript
// ❌ Bug: State não atualiza
const [count, setCount] = useState(0);

const increment = () => {
  setCount(count + 1);
  setCount(count + 1); // BUG: Ambos usam o mesmo `count`
  // Resultado: count aumenta apenas 1, não 2
};

// ✅ Fix: Usar functional update
const increment = () => {
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
  // Resultado correto: count aumenta 2
};
```

#### Closure Stale

```typescript
// ❌ Bug: useEffect captura valor antigo
const [currency, setCurrency] = useState('BRL');

useEffect(() => {
  const interval = setInterval(() => {
    console.log(currency); // SEMPRE 'BRL', mesmo após mudança
  }, 1000);
  return () => clearInterval(interval);
}, []); // Missing dependency

// ✅ Fix: Adicionar dependência
useEffect(() => {
  const interval = setInterval(() => {
    console.log(currency); // Valor atualizado
  }, 1000);
  return () => clearInterval(interval);
}, [currency]); // ✅ Dependency array correto
```

### 3. Async/Promises

#### Race Condition

```typescript
// ❌ Bug: Request antiga sobrescreve request nova
const [results, setResults] = useState([]);

const search = async (query: string) => {
  const data = await fetchResults(query);
  setResults(data); // BUG: Se user digitar rápido, results podem estar fora de ordem
};

// ✅ Fix: Cancelar requests antigas ou usar timestamp
let latestRequestId = 0;

const search = async (query: string) => {
  const requestId = ++latestRequestId;
  const data = await fetchResults(query);

  if (requestId === latestRequestId) {
    setResults(data); // Apenas aplica se é a request mais recente
  }
};
```

#### Error Handling

```typescript
// ❌ Bug: Erro não tratado
const loadModel = async () => {
  const model = await getModelById(id); // Pode lançar erro
  setModel(model);
};

// ✅ Fix: Try-catch
const loadModel = async () => {
  try {
    const result = await getModelById(id);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setModel(result.data);
  } catch (e) {
    setError('Erro ao carregar modelo');
    console.error(e);
  }
};
```

### 4. Mock System

#### Mock Mode Inconsistência

```typescript
// ❌ Bug: Comportamento diferente entre mock e prod
// Mock
export function getMockModels() {
  return mockModels; // Retorna array diretamente
}

// Prod
export async function getModels() {
  const { data, error } = await supabase.from('models').select();
  return { success: !error, data, error }; // Retorna objeto
}

// ✅ Fix: Mesma estrutura de retorno
export function getMockModels() {
  return {
    success: true,
    data: mockModels,
    error: null,
  };
}
```

## Checklist de Investigação

### Informação Inicial

- [ ] Bug reproduzido localmente
- [ ] Passos para reproduzir documentados
- [ ] Ambiente identificado (browser, OS, versão)
- [ ] Mock mode? Produção?
- [ ] Screenshots/logs coletados

### Investigação

- [ ] Código relevante identificado
- [ ] Root cause encontrado (não apenas sintoma)
- [ ] Outros lugares afetados verificados
- [ ] Testes existentes verificados (por que não pegaram?)

### Correção

- [ ] Fix implementado
- [ ] Teste de regressão adicionado
- [ ] Testes passam
- [ ] Casos relacionados verificados
- [ ] Documentação atualizada se necessário

### Validação

- [ ] Bug original corrigido
- [ ] Sem novos bugs introduzidos
- [ ] Performance não degradada
- [ ] Code review

## Logging Best Practices

### Estruturado e Contextual

```typescript
// src/lib/utils/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },

  info: (message: string, data?: any) => {
    console.info(`[INFO] ${message}`, data);
  },

  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },

  error: (message: string, error?: Error, data?: any) => {
    console.error(`[ERROR] ${message}`, {
      error: error?.message,
      stack: error?.stack,
      ...data,
    });
  },
};

// Uso
logger.error('Failed to calculate DRE', error, {
  userId: user.id,
  modelId: model.id,
  inputs: inputs,
});
```

## Quando Escalar

Escale para discussão em equipe se:

- ❌ Não consegue reproduzir após 30min
- ❌ Root cause não identificado após 1h
- ❌ Fix não óbvio ou requer mudança arquitetural
- ❌ Bug afeta múltiplos sistemas
- ❌ Risco de quebrar funcionalidades existentes

## Documentação do Bug

```markdown
## Bug #123: DRE calculation returns NaN

### Root Cause
`calculateDRE` não validava inputs, permitindo `undefined` values.

### Fix
- Adicionar validação Zod em `calculateDRE`
- Atualizar mock data para incluir todos os campos
- Adicionar teste de regressão

### Files Changed
- `src/core/calculations/dre.ts`
- `src/lib/mock/data/models.ts`
- `src/core/calculations/__tests__/dre.test.ts`

### Related Issues
- #124 (FCFF tinha problema similar)
```
