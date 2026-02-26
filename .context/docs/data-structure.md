# Estrutura de Dados da Aplicacao

Este documento descreve todas as interfaces TypeScript, schemas de validacao e tabelas de banco de dados que compoe a estrutura de dados da aplicacao de Valuation SaaS.

**Arquivo fonte:** `src/core/types/index.ts`
**Validadores:** `src/core/validators/index.ts`
**Schema SQL:** `supabase/schema.sql`

---

## Visao Geral

A estrutura de dados se divide em tres camadas:

1. **Inputs do Usuario** — Dados brutos inseridos nos formularios (ano base + premissas de projecao)
2. **Dados Calculados** — Resultados produzidos pelo motor de calculo (projecoes, FCFF, valuation)
3. **Persistencia** — Armazenamento no Supabase (PostgreSQL com JSONB)

### Diagrama de Relacionamento

```
FullValuationInput (entrada do usuario)
├── DREBaseInputs              → valores absolutos do ano base
├── DREProjectionInputs[]      → taxas % por ano projetado
├── BalanceSheetBaseInputs     → valores absolutos do ano base (nested)
├── BalanceSheetProjectionInputs[] → prazos/taxas por ano projetado
├── WACCCalculation            → parametros de custo de capital
└── taxaCrescimentoPerpetuo    → taxa g para valor terminal

         │ executeFullValuation()
         ▼

FullValuationResult (saida do motor)
├── DRECalculated[]            → DRE completa por ano
├── BalanceSheetCalculated[]   → BP completo por ano (nested)
├── FCFFCalculated[]           → Fluxo de caixa livre por ano
├── ValuationCalculated        → Enterprise Value, Equity Value
├── WACCCalculation            → WACC utilizado
└── IndicadoresCalculated[]    → Indicadores financeiros por ano
```

---

## Interfaces de Input

### DREBaseInputs

Valores absolutos do ano base da DRE. Inseridos pelo usuario em R$.

```typescript
interface DREBaseInputs {
  receitaBruta: number;
  impostosEDevolucoes: number;
  cmv: number;
  despesasOperacionais: number;
  irCSLL: number;          // pode ser negativo (credito fiscal)
  dividendos: number;
}
```

### DREProjectionInputs

Premissas de projecao da DRE para cada ano. Taxas em % (ex: 5 = 5%).

```typescript
interface DREProjectionInputs {
  year: number;
  receitaBrutaGrowth: number;       // % crescimento sobre receita bruta anterior
  impostosEDevolucoesRate: number;  // % sobre Receita Bruta
  cmvRate: number;                   // % sobre Receita Liquida
  despesasOperacionaisRate: number;  // % sobre Receita Liquida
  irCSLLRate: number;               // % sobre LAIR
  dividendosRate: number;           // % sobre Lucro Liquido
}
```

### BalanceSheetBaseInputs

Valores absolutos do ano base do Balanco Patrimonial. Estrutura nested por secao contabil.

```typescript
interface BalanceSheetBaseInputs {
  ativoCirculante: {
    caixaEquivalentes: number;
    aplicacoesFinanceiras: number;
    contasReceber: number;
    estoques: number;
    ativosBiologicos: number;
    outrosCreditos: number;
  };
  ativoRealizavelLP: {
    investimentos: number;
    ativoImobilizadoBruto: number;
    depreciacaoAcumulada: number;
    intangivel: number;
  };
  passivoCirculante: {
    fornecedores: number;
    impostosAPagar: number;
    obrigacoesSociaisETrabalhistas: number;
    emprestimosFinanciamentosCP: number;
    outrasObrigacoes: number;
  };
  passivoRealizavelLP: {
    emprestimosFinanciamentosLP: number;
  };
  patrimonioLiquido: {
    capitalSocial: number;
    lucrosAcumulados: number;    // pode ser negativo (prejuizos acumulados)
  };
}
```

### BalanceSheetProjectionInputs

Premissas de projecao do BP para cada ano. Prazos em dias, taxas em %.

```typescript
interface BalanceSheetProjectionInputs {
  year: number;
  taxaDepreciacao: number;           // % sobre Imobilizado Bruto
  indiceImobilizadoVendas: number;   // decimal (0.15 = 15% da receita bruta)

  // Prazos medios - Ativo Circulante (dias)
  prazoCaixaEquivalentes: number;
  prazoAplicacoesFinanceiras: number;
  prazoContasReceber: number;
  prazoEstoques: number;
  prazoAtivosBiologicos: number;

  // Prazos medios - Passivo Circulante (dias)
  prazoFornecedores: number;
  prazoImpostosAPagar: number;
  prazoObrigacoesSociais: number;

  // Emprestimos
  taxaNovosEmprestimosCP: number;    // % crescimento divida CP
  taxaNovosEmprestimosLP: number;    // % crescimento divida LP
  taxaJurosEmprestimo: number;       // % a.a. sobre divida total
}
```

### WACCCalculation

Parametros do Custo Medio Ponderado de Capital.

```typescript
interface WACCCalculation {
  custoCapitalProprio: number;     // Ke (%)
  custoCapitalTerceiros: number;   // Kd (%)
  wacc: number;                     // WACC calculado (%)
  pesoCapitalProprio: number;      // E/(E+D) — decimal entre 0 e 1
  pesoCapitalTerceiros: number;    // D/(E+D) — decimal entre 0 e 1
}
```

---

## Interface de Entrada Completa

### FullValuationInput

Agrupa todos os inputs necessarios para executar o valuation completo.

```typescript
interface FullValuationInput {
  dreBase: DREBaseInputs;
  dreProjection: DREProjectionInputs[];
  balanceSheetBase: BalanceSheetBaseInputs;
  balanceSheetProjection: BalanceSheetProjectionInputs[];
  wacc: WACCCalculation;
  taxaCrescimentoPerpetuo: number;   // taxa g para valor terminal (%)
  anosProjecao: number;              // 1 a 20 anos
}
```

---

## Interfaces de Dados Calculados

### DRECalculated

DRE calculada para um ano (base ou projetado). Todos os valores em R$.

```typescript
interface DRECalculated {
  year: number;
  receitaBruta: number;
  impostosEDevolucoes: number;
  receitaLiquida: number;            // Receita Bruta - Impostos
  cmv: number;
  lucroBruto: number;                // Receita Liquida - CMV
  despesasOperacionais: number;
  ebit: number;                      // Lucro Bruto - Despesas Operacionais
  depreciacaoAmortizacao: number;    // vem do Balanco Patrimonial
  ebitda: number;                    // EBIT + D&A
  despesasFinanceiras: number;       // calculado via BP (juros sobre divida)
  lucroAntesIR: number;             // EBIT - Despesas Financeiras
  irCSLL: number;
  lucroLiquido: number;             // LAIR - IR/CSLL
  dividendos: number;
}
```

### BalanceSheetCalculated

Balanco Patrimonial calculado para um ano. Estrutura nested com totais por secao.

```typescript
interface BalanceSheetCalculated {
  year: number;

  ativoCirculante: {
    caixaEquivalentes: number;
    aplicacoesFinanceiras: number;
    contasReceber: number;
    estoques: number;
    ativosBiologicos: number;
    outrosCreditos: number;
    total: number;
  };

  ativoRealizavelLP: {
    investimentos: number;
    imobilizadoBruto: number;
    depreciacaoAcumulada: number;
    imobilizado: number;         // Imobilizado Bruto - Depreciacao Acumulada
    intangivel: number;
    total: number;
  };

  passivoCirculante: {
    fornecedores: number;
    impostosAPagar: number;
    obrigacoesSociaisETrabalhistas: number;
    emprestimosFinanciamentosCP: number;
    outrasObrigacoes: number;
    total: number;
  };

  passivoRealizavelLP: {
    emprestimosFinanciamentosLP: number;
    total: number;
  };

  patrimonioLiquido: {
    capitalSocial: number;
    lucrosAcumulados: number;
    total: number;
  };

  // Contas auxiliares calculadas
  depreciacaoAnual: number;
  capex: number;
  novosEmprestimosFinanciamentosCP: number;
  novosEmprestimosFinanciamentosLP: number;
  despesasFinanceirasCP: number;   // emprestimos CP x taxa juros
  despesasFinanceirasLP: number;   // emprestimos LP x taxa juros
  despesasFinanceiras: number;     // CP + LP
  capitalGiro: number;
  ncg: number;                     // Necessidade de Capital de Giro (variacao)

  // Totais gerais
  ativoTotal: number;
  passivoTotal: number;            // Passivo + PL
}
```

### FCFFCalculated

Fluxo de Caixa Livre da Firma para um ano.

```typescript
interface FCFFCalculated {
  year: number;
  ebit: number;
  impostos: number;
  nopat: number;                   // EBIT - Impostos
  depreciacaoAmortizacao: number;
  capex: number;
  ncg: number;                     // Variacao do Capital de Giro
  fcff: number;                    // EBIT - NCG - CAPEX
}
```

### ValuationCalculated

Resultado final do calculo de Valuation por DCF.

```typescript
interface ValuationCalculated {
  valorPresenteFCFF: number[];     // VP de cada FCFF projetado
  valorTerminal: number;           // Valor Terminal (Gordon Growth)
  valorPresenteTerminal: number;   // VP do Valor Terminal
  valorEmpresa: number;            // Enterprise Value = Soma VP FCFFs + VP Terminal
  valorPatrimonioLiquido: number;  // Equity Value = EV - Divida Liquida
}
```

### IndicadoresCalculated

Indicadores financeiros calculados por ano.

```typescript
interface IndicadorCalculated {
  year: number;
  id: string;                      // identificador unico do indicador
  label: string;                   // nome de exibicao
  value: number;
  format: "multiple" | "percentage" | "currency" | "number";
  numerator: number;
  denominator: number;
}

interface IndicadoresCalculated {
  year: number;
  indicadores: IndicadorCalculated[];
}
```

---

## Interface de Resultado Completo

### FullValuationResult

Agrupa todos os resultados do motor de calculo.

```typescript
interface FullValuationResult {
  dre: DRECalculated[];
  balanceSheet: BalanceSheetCalculated[];
  fcff: FCFFCalculated[];
  valuation: ValuationCalculated;
  wacc: WACCCalculation;
  indicadores?: IndicadoresCalculated[];
}
```

---

## Padrao Result

Todas as funcoes do motor retornam `CalculationResult<T>`:

```typescript
interface CalculationResult<T> {
  success: boolean;
  data?: T;       // presente quando success = true
  errors?: string[];  // presente quando success = false
}
```

---

## Validacao (Schemas Zod)

Cada interface de input possui um schema Zod correspondente em `src/core/validators/index.ts`:

| Interface | Schema Zod | Regras Principais |
|-----------|-----------|-------------------|
| `DREBaseInputs` | `DREBaseInputsSchema` | receitaBruta > 0; demais >= 0 (exceto irCSLL que pode ser negativo) |
| `DREProjectionInputs` | `DREProjectionInputsSchema` | year inteiro > 0; taxas entre 0-100% (crescimento min -100%) |
| `BalanceSheetBaseInputs` | `BalanceSheetBaseInputsSchema` | Todos >= 0 (exceto lucrosAcumulados que pode ser negativo) |
| `BalanceSheetProjectionInputs` | `BalanceSheetProjectionInputsSchema` | Prazos entre 0-360 dias; taxas entre -100% e 100%; indice entre 0 e 1 |
| `WACCCalculation` | `WACCCalculationSchema` | Todos >= 0; pesos entre 0 e 1 |
| `FullValuationInput` | `FullValuationInputSchema` | Composicao dos schemas acima; taxaCrescimentoPerpetuo 0-50%; anosProjecao 1-20 |

Funcao utilitaria:

```typescript
function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: string[] }
```

---

## Banco de Dados (Supabase)

### Tabela: `user_profiles`

Informacoes adicionais dos usuarios. Criada automaticamente via trigger apos signup.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | UUID (PK, FK → auth.users) | ID do usuario |
| `name` | TEXT | Nome do usuario |
| `avatar_url` | TEXT | URL do avatar |
| `created_at` | TIMESTAMPTZ | Data de criacao |
| `updated_at` | TIMESTAMPTZ | Ultima atualizacao (trigger automatico) |

### Tabela: `financial_models`

Modelos de valuation criados pelos usuarios.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | UUID (PK, auto-generated) | ID do modelo |
| `user_id` | UUID (FK → auth.users, NOT NULL) | Proprietario do modelo |
| `company_name` | TEXT (NOT NULL) | Nome da empresa |
| `ticker_symbol` | TEXT | Ticker da acao (ex: PETR4) |
| `description` | TEXT | Descricao do modelo |
| `model_data` | JSONB | Dados completos do modelo (inputs + resultados) |
| `created_at` | TIMESTAMPTZ | Data de criacao |
| `updated_at` | TIMESTAMPTZ | Ultima atualizacao (trigger automatico) |

**Indices:**
- `idx_financial_models_user_id` — Busca por usuario
- `idx_financial_models_updated_at` — Ordenacao por data (DESC)
- `idx_financial_models_company_name` — Busca por nome da empresa

### Coluna `model_data` (JSONB)

A coluna `model_data` armazena o `FullValuationInput` (inputs do usuario) junto com o `FullValuationResult` (resultados calculados) como JSON:

```json
{
  "dreBase": { ... },
  "dreProjection": [ ... ],
  "balanceSheetBase": { ... },
  "balanceSheetProjection": [ ... ],
  "wacc": { ... },
  "taxaCrescimentoPerpetuo": 3,
  "anosProjecao": 5,
  "results": {
    "dre": [ ... ],
    "balanceSheet": [ ... ],
    "fcff": [ ... ],
    "valuation": { ... },
    "wacc": { ... },
    "indicadores": [ ... ]
  }
}
```

### Row Level Security (RLS)

Ambas as tabelas possuem RLS habilitado. Cada usuario so pode acessar (SELECT, INSERT, UPDATE, DELETE) seus proprios registros, validado via `auth.uid() = user_id`.

---

## Interfaces Legado

As seguintes interfaces existem em `src/core/types/index.ts` marcadas como `@deprecated`. Sao mantidas para compatibilidade mas nao devem ser usadas em codigo novo:

- `FinancialModel` → usar `FullValuationInput` + `FullValuationResult`
- `IncomeStatement` → usar `DRECalculated`
- `BalanceSheet` → usar `BalanceSheetCalculated`
- `CashFlowStatement` → usar `FCFFCalculated`
- `Assumptions` → usar `WACCCalculation`
- `ValuationResults` → usar `ValuationCalculated`

Interfaces auxiliares legado tambem existentes: `APIRequest`, `APIResponse<T>`.

---

## Convencoes

- **Valores monetarios:** Sempre em R$ (number). Formatacao apenas na camada de UI.
- **Taxas percentuais:** Em % (ex: 5 = 5%), nao em decimal. Conversao para decimal feita no motor de calculo.
- **Excecao — `indiceImobilizadoVendas`:** Unico campo que usa decimal diretamente (0.15 = 15%).
- **Prazos medios:** Em dias (0 a 360).
- **Anos:** `year = 0` e o ano base, `year = 1..N` sao projecoes.
- **Estrutura nested:** O BP usa objetos aninhados por secao contabil para manter a hierarquia do plano de contas.
- **Nomes em portugues:** Todos os campos usam nomes em portugues para alinhar com a terminologia contabil brasileira.
