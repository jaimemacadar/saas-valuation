# Motor de Calculo da Aplicacao

Este documento descreve o motor de calculo financeiro da aplicacao de Valuation SaaS, responsavel por todas as projecoes e calculos de valuation por Fluxo de Caixa Descontado (FCD/DCF).

---

## Visao Geral

O motor de calculo e implementado como um modulo isolado em `src/core/`, seguindo principios de:

- **Funcoes puras** sem side effects
- **Zero dependencias de UI** (React, Next.js, DOM proibidos)
- **Execucao 100% server-side** (Server Components + API Routes)
- **Precisao financeira** via `decimal.js`
- **Padrao Result** com `CalculationResult<T>` para tipagem forte e tratamento de erros
- **Serializacao JSON garantida** para compatibilidade com API REST e Server Actions

### Estrutura de Arquivos

```
src/core/
├── index.ts                        # API publica do modulo
├── types/
│   └── index.ts                    # Todas as interfaces TypeScript
├── validators/
│   └── index.ts                    # Schemas Zod para validacao de inputs
├── calculations/
│   ├── dre.ts                      # Calculo da DRE
│   ├── balanceSheet.ts             # Calculo do Balanco Patrimonial
│   ├── fcff.ts                     # Calculo do Fluxo de Caixa Livre da Firma
│   ├── wacc.ts                     # Calculo do WACC (CAPM)
│   ├── valuation.ts                # Calculo de Valuation por DCF
│   ├── sensitivity.ts              # Analise de Sensibilidade
│   ├── indicadores.ts              # Indicadores Financeiros
│   └── fullValuation.ts            # Orquestrador principal
└── __fixtures__/
    └── sampleCompany.ts            # Dados de exemplo para testes
```

---

## Fluxo de Calculo (Pipeline)

O motor segue um pipeline encadeado com resolucao de circularidade DRE-BP:

```
Input (Base + Premissas)
    │
    ▼
┌─────────────────────────────────────────────────┐
│  Pass 1: DRE parcial (despesasFinanceiras = 0)  │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│  Pass 2: BP com DRE parcial                     │
│  → extrai despesasFinanceiras e depreciacaoAnual │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│  Pass 3: DRE final com D&A e despesas           │
│  financeiras reais do BP                        │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│  Pass 4: BP final com DRE corrigido             │
│  → lucrosAcumulados corretos                    │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│  FCFF = EBIT - NCG - CAPEX                      │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│  Valuation por DCF                               │
│  (VP dos FCLs + Valor Terminal)                  │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│  Indicadores Financeiros                         │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
               FullValuationResult
```

O pipeline de 4 passes resolve a **dependencia circular** entre DRE e Balanco Patrimonial: a DRE precisa de depreciacao e despesas financeiras (que vem do BP), e o BP precisa de lucro liquido e dividendos (que vem da DRE).

---

## Modulos de Calculo

### 1. DRE (Demonstracao de Resultado)

**Arquivo:** `src/core/calculations/dre.ts`

**Funcoes exportadas:**
- `calculateDREBase()` — Calcula contas derivadas do ano base
- `calculateDREProjetado()` — Calcula um ano projetado
- `calculateAllDRE()` — Calcula todos os anos projetados

**Formulas principais:**

| Conta | Formula |
|-------|---------|
| Receita Bruta(i+1) | Receita Bruta(i) × (1 + Taxa Crescimento) |
| Impostos e Devolucoes | Receita Bruta × Taxa Impostos |
| Receita Liquida | Receita Bruta - Impostos e Devolucoes |
| CMV | Receita Liquida × Taxa CMV |
| Lucro Bruto | Receita Liquida - CMV |
| Despesas Operacionais | Receita Liquida × Taxa Despesas |
| EBIT | Lucro Bruto - Despesas Operacionais |
| EBITDA | EBIT + Depreciacao + Amortizacao |
| Lucro Antes IR | EBIT - Despesas Financeiras |
| IR/CSLL | Lucro Antes IR × Taxa IR/CSLL |
| Lucro Liquido | Lucro Antes IR - IR/CSLL |
| Dividendos | Lucro Liquido × Taxa Dividendos |

**Inputs:** `DREBaseInputs` (valores absolutos ano base) + `DREProjectionInputs[]` (taxas % por ano)

### 2. Balanco Patrimonial

**Arquivo:** `src/core/calculations/balanceSheet.ts`

**Funcoes exportadas:**
- `calculateBPBase()` — Calcula totais do ano base
- `calculateBPProjetado()` — Calcula um ano projetado
- `calculateAllBalanceSheet()` — Calcula todos os anos

**Formulas principais:**

| Conta | Formula |
|-------|---------|
| Depreciacao Anual | Imobilizado Bruto(i) × Taxa Depreciacao |
| Depreciacao Acumulada | Depreciacao Acumulada(i) + Depreciacao Anual |
| CAPEX | Indice Imobilizado/Vendas × Receita Bruta |
| Imobilizado Bruto | Imobilizado Bruto(i) + CAPEX |
| Ativo Circulante (contas) | (Prazo Medio / 360) × Base de Calculo |
| Passivo Circulante (contas) | (Prazo Medio / 360) × Base de Calculo |
| Capital de Giro | Ativo Circulante - Passivo Circulante + Emprestimos CP |
| NCG (variacao) | Capital de Giro(i+1) - Capital de Giro(i) |

**Bases de calculo por conta de prazo medio:**

| Conta | Base |
|-------|------|
| Caixa e Equivalentes | Receita Liquida |
| Aplicacoes Financeiras | Receita Liquida |
| Contas a Receber | Receita Bruta |
| Estoques | CMV |
| Ativos Biologicos | Receita Liquida |
| Fornecedores | CMV |
| Impostos a Pagar | Impostos e Devolucoes |
| Obrigacoes Sociais | Despesas Operacionais |

### 3. Fluxo de Caixa Livre da Firma (FCFF)

**Arquivo:** `src/core/calculations/fcff.ts`

**Funcoes exportadas:**
- `calculateFCFF()` — Calcula FCFF de um ano
- `calculateAllFCFF()` — Calcula FCFF para todos os anos projetados

**Formula:**

```
FCFF = EBIT - NCG - CAPEX
```

Onde:
- **EBIT** vem da DRE projetada
- **NCG** (Necessidade de Capital de Giro) vem do Balanco Patrimonial
- **CAPEX** vem do Balanco Patrimonial

### 4. WACC (Custo Medio Ponderado de Capital)

**Arquivo:** `src/core/calculations/wacc.ts`

**Funcoes exportadas:**
- `calculateWACC()` — Calcula WACC a partir de componentes
- `calculateCAPM()` — Calcula custo do capital proprio via CAPM

**Formulas:**

```
Ke = Rf + Beta × ERP              (CAPM)
Kd = Rf + Spread                   (Custo da Divida)
WACC = (E/(E+D)) × Ke + (D/(E+D)) × Kd × (1-T)
```

Onde:
- **Rf** = Taxa livre de risco
- **Beta** = Beta do ativo
- **ERP** = Premio de risco de mercado
- **E** = Patrimonio Liquido
- **D** = Divida total (Emprestimos CP + LP)
- **T** = Taxa de imposto

### 5. Valuation (DCF)

**Arquivo:** `src/core/calculations/valuation.ts`

**Funcoes exportadas:**
- `calculateValuation()` — Calcula Enterprise Value e Equity Value
- `calculateSharePrice()` — Calcula preco por acao

**Etapas do calculo DCF:**

1. **Valor Presente dos FCLs:** Desconta cada FCFF pelo WACC acumulado
   ```
   VP(FCL_i) = FCL_i / Produto(1 + WACC_j) para j=1..i
   ```

2. **Valor Terminal (Gordon Growth Model):**
   ```
   VT = FCL_ultimo × (1 + g) / (WACC - g)
   ```
   Onde `g` = taxa de crescimento perpetuo

3. **VP do Valor Terminal:** Desconta o VT pelo WACC acumulado do ultimo ano

4. **Enterprise Value:**
   ```
   EV = Soma(VP dos FCLs) + VP do Valor Terminal
   ```

5. **Equity Value:**
   ```
   Equity Value = EV - Divida Liquida
   Divida Liquida = (Emprestimos CP + LP) - (Caixa + Aplicacoes Financeiras)
   ```

6. **Preco por Acao:**
   ```
   Preco = Equity Value / Numero de Acoes
   ```

### 6. Analise de Sensibilidade

**Arquivo:** `src/core/calculations/sensitivity.ts`

**Funcoes exportadas:**
- `calculateSensitivityUnivariate()` — Varia uma unica premissa e recalcula valuation
- `calculateSensitivityBivariate()` — Varia duas premissas simultaneamente (tabela cruzada)

Opera reutilizando `executeFullValuation()` com clones modificados do modelo.

### 7. Indicadores Financeiros

**Arquivo:** `src/core/calculations/indicadores.ts`

**Funcoes exportadas:**
- `calculateIndicadores()` — Calcula indicadores de um ano
- `calculateAllIndicadores()` — Calcula indicadores para todos os anos

---

## Entry Point Principal

**Arquivo:** `src/core/calculations/fullValuation.ts`

### `executeFullValuation(input: FullValuationInput)`

Funcao orquestradora que executa o pipeline completo. Recebe todos os dados de entrada e retorna `CalculationResult<FullValuationResult>` contendo:

- `dre` — Array de DRE projetada (ano base + anos projetados)
- `balanceSheet` — Array de BP projetado
- `fcff` — Array de FCFF projetado
- `valuation` — Enterprise Value, Equity Value, VP dos FCLs, Valor Terminal
- `wacc` — Parametros de WACC utilizados
- `indicadores` — Indicadores financeiros por ano

### `executeQuickValuation(receita, anosProjecao?)`

Funcao de conveniencia que usa premissas padrao simplificadas a partir de um unico valor de receita. Util para testes e demos.

---

## Padrao Result

Todas as funcoes de calculo retornam `CalculationResult<T>`:

```typescript
interface CalculationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}
```

Isso garante:
- Tratamento explicito de erros sem exceptions
- Tipagem forte no resultado
- Serializacao JSON segura para transmissao via API/Server Actions

---

## Integracao com a Aplicacao

### Server Actions

As Server Actions em `src/lib/actions/valuation.ts` servem como ponte entre o frontend e o motor de calculo:

1. Verificam autenticacao (Supabase Auth)
2. Chamam `executeFullValuation()` no servidor
3. Persistem resultados no banco de dados
4. Retornam `FullValuationResult` para o cliente

### API Routes

O endpoint `POST /api/valuation` expoe o motor de calculo como API REST para:
- Agentes de IA
- Integracoes externas
- Acesso programatico

### Validacao de Inputs

Schemas Zod em `src/core/validators/` validam todos os inputs antes do calculo:
- `DREBaseInputsSchema`
- `DREProjectionInputsSchema`
- `BalanceSheetBaseInputsSchema`
- `BalanceSheetProjectionInputsSchema`
- `WACCCalculationSchema`
- `FullValuationInputSchema`

---

## Testes

Testes unitarios cobrem todos os modulos em arquivos `*.test.ts` colocados junto ao modulo correspondente:

- `dre.test.ts`
- `balanceSheet.test.ts`
- `fcff.test.ts`
- `wacc.test.ts`
- `valuation.test.ts`
- `sensitivity.test.ts`
- `fullValuation.test.ts`

Meta de cobertura: **>80%** em `src/core/`.

Dados de teste em `src/core/__fixtures__/sampleCompany.ts`.

---

## Regras Criticas

1. **`src/core/` nunca importa React, Next.js ou APIs de browser**
2. **Todas as funcoes sao puras** — mesmo input sempre produz mesmo output
3. **Usar `decimal.js`** para operacoes financeiras quando precisao e critica
4. **Resultado sempre serializavel** — sem funcoes, classes complexas ou referencias circulares
5. **Validacao antes de calculo** — inputs sao validados com Zod antes de qualquer processamento
