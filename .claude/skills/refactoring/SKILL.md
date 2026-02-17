---
name: Refactoring
description: Safe code refactoring with step-by-step approach
phases: [E]
---

# Refactoring Guidelines

## Princípios de Refatoração

1. **Red-Green-Refactor**: Testes devem passar antes e depois
2. **Small Steps**: Pequenas mudanças incrementais
3. **One Thing at a Time**: Um tipo de refatoração por vez
4. **Preserve Behavior**: Comportamento externo inalterado
5. **Test Coverage**: Cobertura adequada antes de refatorar

## Code Smells Comuns

### 1. Duplicação de Código

#### ❌ Problema

```typescript
// src/components/forms/CreateModelForm.tsx
export function CreateModelForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      const result = await createModel(data);
      if (!result.success) setError(result.error);
    } catch (e) {
      setError('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };
}

// src/components/forms/UpdateModelForm.tsx
export function UpdateModelForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      const result = await updateModel(data);
      if (!result.success) setError(result.error);
    } catch (e) {
      setError('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };
}
```

#### ✅ Solução: Extract Hook

```typescript
// src/hooks/useServerAction.ts
export function useServerAction<T, R>(
  action: (data: T) => Promise<ActionResult<R>>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const execute = async (data: T) => {
    setLoading(true);
    setError('');
    try {
      const result = await action(data);
      if (!result.success) {
        setError(result.error || 'Erro desconhecido');
        return null;
      }
      return result.data;
    } catch (e) {
      setError('Erro inesperado');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}

// Uso
export function CreateModelForm() {
  const { execute, loading, error } = useServerAction(createModel);

  const onSubmit = async (data: FormData) => {
    const result = await execute(data);
    if (result) {
      // Success handling
    }
  };
}
```

### 2. Funções Muito Longas

#### ❌ Problema

```typescript
export function calculateValuation(inputs: ValuationInputs) {
  // DRE calculation (30 linhas)
  const receitaLiquida = inputs.receitaBruta * (1 - inputs.impostos / 100);
  const lucroOperacional = receitaLiquida - inputs.custos;
  // ... mais 25 linhas

  // FCFF calculation (25 linhas)
  const nopat = lucroOperacional * (1 - inputs.taxRate);
  const fcff = nopat + inputs.depreciacao - inputs.capex;
  // ... mais 20 linhas

  // Discounting (20 linhas)
  const wacc = calculateWACC(inputs);
  const presentValues = fcffs.map((fcff, i) => fcff / Math.pow(1 + wacc, i + 1));
  // ... mais 15 linhas

  // Terminal value (15 linhas)
  const terminalFCFF = fcffs[fcffs.length - 1] * (1 + inputs.perpetualGrowth);
  const terminalValue = terminalFCFF / (wacc - inputs.perpetualGrowth);
  // ... mais 10 linhas

  return { /* resultado */ };
}
```

#### ✅ Solução: Extract Function

```typescript
// Quebrar em funções menores e focadas
export function calculateValuation(inputs: ValuationInputs) {
  const dreResults = calculateDRE(inputs);
  const fcffResults = calculateFCFF(dreResults, inputs);
  const wacc = calculateWACC(inputs);
  const presentValues = discountCashFlows(fcffResults, wacc);
  const terminalValue = calculateTerminalValue(fcffResults, wacc, inputs.perpetualGrowth);

  return {
    ...dreResults,
    ...fcffResults,
    presentValues,
    terminalValue,
    enterpriseValue: sum(presentValues) + terminalValue,
  };
}
```

### 3. Parâmetros Demais

#### ❌ Problema

```typescript
function formatFinancialValue(
  value: number,
  currency: string,
  decimals: number,
  includeSymbol: boolean,
  compactNotation: boolean,
  locale: string
) {
  // ...
}

// Chamada confusa
formatFinancialValue(1234.56, 'BRL', 2, true, false, 'pt-BR');
```

#### ✅ Solução: Parameter Object

```typescript
interface FormatOptions {
  currency?: string;
  decimals?: number;
  includeSymbol?: boolean;
  compactNotation?: boolean;
  locale?: string;
}

function formatFinancialValue(value: number, options: FormatOptions = {}) {
  const {
    currency = 'BRL',
    decimals = 2,
    includeSymbol = true,
    compactNotation = false,
    locale = 'pt-BR',
  } = options;

  // ...
}

// Chamada clara
formatFinancialValue(1234.56, { currency: 'BRL' });
```

### 4. Componentes Muito Grandes

#### ❌ Problema

```typescript
export function ModelPage() {
  // 20 linhas de state
  const [tab, setTab] = useState('dre');
  const [dreData, setDreData] = useState([]);
  // ... mais 15 estados

  // 50 linhas de handlers
  const handleDRESubmit = () => { /* ... */ };
  const handleFCFFSubmit = () => { /* ... */ };
  // ... mais 8 handlers

  // 100+ linhas de JSX
  return (
    <div>
      {/* DRE section - 30 linhas */}
      {/* FCFF section - 30 linhas */}
      {/* Balance Sheet section - 30 linhas */}
      {/* Charts section - 20 linhas */}
    </div>
  );
}
```

#### ✅ Solução: Extract Components

```typescript
// src/app/(dashboard)/model/[id]/view/page.tsx
export default function ModelPage() {
  const [activeTab, setActiveTab] = useState('dre');

  return (
    <div>
      <ModelTabs value={activeTab} onValueChange={setActiveTab} />
      <ModelContent tab={activeTab} />
    </div>
  );
}

// src/components/model/ModelContent.tsx
export function ModelContent({ tab }: { tab: string }) {
  switch (tab) {
    case 'dre':
      return <DRESection />;
    case 'fcff':
      return <FCFFSection />;
    case 'balance-sheet':
      return <BalanceSheetSection />;
    default:
      return null;
  }
}

// src/components/model/DRESection.tsx
export function DRESection() {
  const { data, loading } = useDREData();
  const { onSubmit, submitting } = useDRESubmit();

  return (
    <div>
      <DREForm onSubmit={onSubmit} loading={submitting} />
      <DRETable data={data} loading={loading} />
    </div>
  );
}
```

### 5. Props Drilling

#### ❌ Problema

```typescript
function ModelPage() {
  const [currency, setCurrency] = useState('BRL');

  return <ModelLayout currency={currency} />;
}

function ModelLayout({ currency }: { currency: string }) {
  return <ModelContent currency={currency} />;
}

function ModelContent({ currency }: { currency: string }) {
  return <DRETable currency={currency} />;
}

function DRETable({ currency }: { currency: string }) {
  return <TableCell>{formatCurrency(value, currency)}</TableCell>;
}
```

#### ✅ Solução: Context

```typescript
// src/contexts/ModelContext.tsx
const ModelContext = createContext<ModelContextValue | null>(null);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState('BRL');

  return (
    <ModelContext.Provider value={{ currency, setCurrency }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (!context) throw new Error('useModel must be used within ModelProvider');
  return context;
}

// Uso
function ModelPage() {
  return (
    <ModelProvider>
      <ModelLayout />
    </ModelProvider>
  );
}

function DRETable() {
  const { currency } = useModel();
  return <TableCell>{formatCurrency(value, currency)}</TableCell>;
}
```

## Padrões de Refatoração

### Extract Function

**Quando usar:**
- Função > 20 linhas
- Lógica reutilizável
- Melhorar legibilidade
- Facilitar testes

**Como:**
1. Identificar bloco de código coeso
2. Criar nova função
3. Mover código
4. Adicionar testes
5. Verificar comportamento inalterado

### Extract Component

**Quando usar:**
- Componente > 200 linhas
- Seção reutilizável
- Responsabilidade única
- Melhorar performance (memoization)

### Inline Function/Variable

**Quando usar:**
- Função usada uma vez
- Nome não adiciona clareza
- Simplificar código

### Rename

**Quando usar:**
- Nome não reflete função
- Convenções mudaram
- Melhorar clareza

### Move Function

**Quando usar:**
- Função no arquivo errado
- Melhorar coesão do módulo
- Reduzir acoplamento

## Processo de Refatoração

### 1. Preparação

```bash
# 1. Garantir que testes passam
npm test

# 2. Commit atual
git add .
git commit -m "chore: checkpoint before refactoring"

# 3. Branch de refatoração (opcional)
git checkout -b refactor/improve-calculations
```

### 2. Refatoração

```typescript
// Exemplo: Refatorar calculateDRE

// ANTES
export function calculateDRE(inputs: any) {
  const r = inputs.r * (1 - inputs.t / 100);
  const l = r - inputs.c - inputs.d;
  return { r, l };
}

// PASSO 1: Adicionar tipos
export function calculateDRE(inputs: DREBaseInputs): DRECalculated {
  const r = inputs.receitaBruta * (1 - inputs.impostosSobreVendas / 100);
  const l = r - inputs.custosMercadorias - inputs.despesasOperacionais;
  return { receitaLiquida: r, lucroLiquido: l };
}

// PASSO 2: Renomear variáveis
export function calculateDRE(inputs: DREBaseInputs): DRECalculated {
  const receitaLiquida = inputs.receitaBruta * (1 - inputs.impostosSobreVendas / 100);
  const lucroLiquido = receitaLiquida - inputs.custosMercadorias - inputs.despesasOperacionais;
  return { receitaLiquida, lucroLiquido };
}

// PASSO 3: Extrair cálculos
export function calculateDRE(inputs: DREBaseInputs): DRECalculated {
  const receitaLiquida = calculateReceitaLiquida(inputs);
  const lucroLiquido = calculateLucroLiquido(receitaLiquida, inputs);
  return { receitaLiquida, lucroLiquido };
}

// PASSO 4: Adicionar validação
export function calculateDRE(inputs: DREBaseInputs): DRECalculated {
  const validated = dreInputSchema.parse(inputs);
  const receitaLiquida = calculateReceitaLiquida(validated);
  const lucroLiquido = calculateLucroLiquido(receitaLiquida, validated);
  return { receitaLiquida, lucroLiquido };
}
```

### 3. Verificação

```bash
# 1. Testes devem passar
npm test

# 2. Type check
npm run type-check

# 3. Lint
npm run lint

# 4. Build
npm run build
```

### 4. Commit

```bash
git add .
git commit -m "refactor(calculations): improve DRE calculation readability

- Add proper types
- Rename variables for clarity
- Extract calculation functions
- Add input validation"
```

## Checklist de Refatoração

### Antes de Começar

- [ ] Testes existentes passam
- [ ] Cobertura de testes adequada (>80% na área)
- [ ] Entendo o código atual
- [ ] Tenho um objetivo claro

### Durante

- [ ] Mudanças incrementais
- [ ] Commit após cada passo seguro
- [ ] Testes passando continuamente
- [ ] Comportamento preservado

### Depois

- [ ] Todos os testes passam
- [ ] Type check passa
- [ ] Build funciona
- [ ] Performance não degradou
- [ ] Documentação atualizada se necessário

## Quando NÃO Refatorar

- ❌ Código funcionando sem testes
- ❌ Refatoração + nova feature simultâneas
- ❌ Próximo a deadline crítico
- ❌ Sem entender o código
- ❌ "Só porque sim" (sem objetivo claro)

## Ferramentas

### TypeScript Compiler

```bash
# Renomeação segura (IDE)
# F2 no VSCode

# Find all references
# Shift+F12 no VSCode
```

### ESLint

```bash
# Auto-fix
npm run lint -- --fix
```

### Prettier

```bash
# Formatação
npm run format
```

## Métricas

### Antes vs Depois

```
Arquivo: src/core/calculations/dre.ts

ANTES:
- Linhas: 250
- Complexidade ciclomática: 15
- Funções: 3
- Cobertura: 65%

DEPOIS:
- Linhas: 180
- Complexidade ciclomática: 6
- Funções: 8
- Cobertura: 95%
```