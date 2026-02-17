---
name: Documentation
description: Generate and update technical documentation
phases: [P, C]
---

# Documentation Guidelines

## Estrutura de Documentação

Este projeto mantém documentação em múltiplos locais:

```
.context/
├── docs/                    # Documentação do projeto
│   ├── README.md           # Index de documentação
│   ├── project-overview.md
│   ├── architecture.md
│   ├── development-workflow.md
│   ├── glossary.md
│   └── qa/                 # Perguntas e respostas
│       ├── getting-started.md
│       ├── authentication.md
│       ├── database.md
│       └── ...
├── agents/                 # Agentes especializados
└── skills/                 # Skills (este arquivo)

README.md                   # README principal do projeto
CLAUDE.md                   # Regras e guidelines para Claude Code
```

## JSDoc/TSDoc

### Funções e Tipos Complexos

```typescript
/**
 * Calcula o DRE (Demonstração de Resultados do Exercício) baseado nos inputs fornecidos.
 *
 * @param inputs - Inputs base para cálculo do DRE
 * @returns Objeto com valores calculados do DRE
 * @throws {ZodError} Se os inputs não passarem na validação
 *
 * @example
 * ```typescript
 * const result = calculateDRE({
 *   receitaBruta: 100000,
 *   impostosSobreVendas: 15,
 *   custosMercadorias: 40000,
 * });
 * console.log(result.receitaLiquida); // 85000
 * ```
 */
export function calculateDRE(inputs: DREBaseInputs): DRECalculated {
  // ...
}
```

### Interfaces e Types

```typescript
/**
 * Representa um modelo financeiro de valuation.
 *
 * @property id - Identificador único do modelo
 * @property user_id - ID do usuário proprietário
 * @property name - Nome descritivo do modelo
 * @property company_name - Nome da empresa sendo avaliada
 * @property model_type - Tipo de modelo (DCF, Multiples, etc.)
 * @property created_at - Data de criação
 * @property updated_at - Data da última atualização
 */
export interface FinancialModel {
  id: string;
  user_id: string;
  name: string;
  company_name?: string;
  model_type: 'DCF' | 'Multiples' | 'DDM';
  created_at: string;
  updated_at: string;
}
```

### Componentes React

```typescript
/**
 * Tabela para exibir dados de DRE projetados.
 *
 * Renderiza uma tabela formatada com múltiplas colunas representando
 * anos de projeção. Valores monetários são formatados de acordo com
 * a moeda especificada.
 *
 * @param props - Propriedades do componente
 * @param props.data - Array de objetos DRE calculados
 * @param props.currency - Moeda para formatação (padrão: BRL)
 * @param props.startYear - Ano inicial para labels (padrão: ano atual)
 *
 * @example
 * ```tsx
 * <DRETable
 *   data={dreCalculations}
 *   currency="BRL"
 *   startYear={2024}
 * />
 * ```
 */
export function DRETable({ data, currency = 'BRL', startYear }: DRETableProps) {
  // ...
}
```

## README Files

### README.md Principal

Deve conter:

1. **Título e Descrição**: O que é o projeto
2. **Features**: Principais funcionalidades
3. **Tech Stack**: Tecnologias utilizadas
4. **Getting Started**: Como rodar o projeto
5. **Estrutura**: Organização de pastas
6. **Scripts**: Comandos npm disponíveis
7. **Testes**: Como executar testes
8. **Deploy**: Instruções de deploy
9. **Contribuindo**: Guidelines para contribuir
10. **Licença**: Informações de licença

### README em Subpastas

Para módulos complexos (e.g., `src/core/calculations/README.md`):

```markdown
# Financial Calculations

Módulo responsável pelos cálculos financeiros do sistema.

## Estrutura

- `dre.ts`: Cálculos de DRE
- `fcff.ts`: Cálculos de FCFF
- `balanceSheet.ts`: Balanço Patrimonial
- `wacc.ts`: WACC e custo de capital
- `valuation.ts`: Valuation final

## Uso

\`\`\`typescript
import { calculateDRE } from '@/core/calculations/dre';

const result = calculateDRE(inputs);
\`\`\`

## Validação

Todos os cálculos validam inputs usando Zod schemas definidos em `@/core/validators`.

## Testes

Testes localizados em `__tests__/`. Executar com `npm test`.
```

## Comentários no Código

### ✅ Bons Comentários

```typescript
// Calculate WACC using the formula: WACC = (E/V * Re) + (D/V * Rd * (1 - Tc))
const wacc = (equity / totalValue * costOfEquity) +
             (debt / totalValue * costOfDebt * (1 - taxRate));

// Handle edge case: quando não há receita, evitar divisão por zero
if (receitaLiquida === 0) {
  return { margemLiquida: 0, margemOperacional: 0 };
}

// TODO: Implementar cálculo de sensibilidade bivariada
// Issue: #123
```

### ❌ Comentários Ruins

```typescript
// Calcula o WACC
const wacc = calculateWACC(inputs);

// Loop pelos dados
for (const item of data) {
  // ...
}

// Retorna o resultado
return result;
```

## API Documentation

### Server Actions

Documente Server Actions com JSDoc completo:

```typescript
/**
 * Cria um novo modelo de valuation.
 *
 * Esta Server Action:
 * 1. Valida autenticação do usuário
 * 2. Valida inputs com Zod
 * 3. Insere modelo no banco de dados
 * 4. Revalida cache do dashboard
 *
 * @param data - Dados do modelo a ser criado
 * @returns Promise com resultado da operação
 *
 * @throws {Error} Se usuário não estiver autenticado
 *
 * @example
 * ```typescript
 * const result = await createModel({
 *   name: 'Valuation XYZ Corp',
 *   description: 'Modelo DCF para XYZ',
 *   company_name: 'XYZ Corp',
 *   model_type: 'DCF',
 * });
 * ```
 */
export async function createModel(data: CreateModelInput) {
  // ...
}
```

## Glossário e Domain Concepts

Mantenha `.context/docs/glossary.md` atualizado:

```markdown
# Glossário

## Termos Financeiros

### DRE (Demonstração de Resultados do Exercício)
Também conhecido como Income Statement. Demonstrativo que apresenta
os resultados da empresa em determinado período.

**Componentes principais:**
- Receita Bruta
- Impostos sobre Vendas
- Receita Líquida
- CPV/CMV (Custo dos Produtos/Mercadorias Vendidas)
- Lucro Bruto
- Despesas Operacionais
- EBITDA
- Lucro Operacional

### FCFF (Free Cash Flow to Firm)
Fluxo de caixa livre para a firma. Representa o caixa disponível
para todos os provedores de capital (acionistas e credores).

**Fórmula:**
FCFF = NOPAT + Depreciação - CAPEX - Variação de Capital de Giro

### WACC (Weighted Average Cost of Capital)
Custo médio ponderado de capital. Taxa de desconto usada para
trazer fluxos de caixa futuros a valor presente.

## Termos Técnicos

### Mock Mode
Modo de desenvolvimento onde dados são gerados localmente sem
necessidade de conexão com Supabase.

Ativado via: `NEXT_PUBLIC_ENABLE_MOCK=true`

### Server Action
Função que roda no servidor (Next.js). Marcada com 'use server'.
Permite operações seguras do lado do servidor diretamente de
componentes.
```

## Architecture Decision Records (ADRs)

Para decisões arquiteturais importantes, crie ADRs em `.context/docs/adr/`:

```markdown
# ADR-001: Uso de Sistema Mock para Desenvolvimento

## Status
Aceito

## Contexto
Durante desenvolvimento, nem todos os desenvolvedores têm acesso ao
Supabase configurado. Isso dificulta desenvolvimento e testes.

## Decisão
Implementar sistema de mock que simula todas as operações do Supabase
localmente, ativado via flag `NEXT_PUBLIC_ENABLE_MOCK=true`.

## Consequências

### Positivas
- Desenvolvimento sem dependência de Supabase
- Testes mais rápidos
- Onboarding simplificado

### Negativas
- Manter mock sincronizado com produção
- Possíveis diferenças de comportamento

## Implementação
- `src/lib/mock/`: Sistema de mock
- `src/lib/mock/store.ts`: Store in-memory
- `src/lib/actions/*`: Detectam mock mode automaticamente
```

## Changelog

Mantenha `CHANGELOG.md` atualizado:

```markdown
# Changelog

## [Unreleased]

### Added
- Sistema de entrada de dados multi-aba
- Cálculos automáticos ao carregar modelo

### Fixed
- Correção no cálculo de margem líquida quando receita é zero

## [1.0.0] - 2024-01-15

### Added
- Implementação inicial do sistema de valuation
- Cálculos de DRE, Balance Sheet, FCFF
- Autenticação com Supabase
- Dashboard de modelos
```

## Inline Documentation

### Fórmulas Complexas

```typescript
export function calculateWACC(inputs: WACCInputs): WACCCalculation {
  const { equity, debt, costOfEquity, costOfDebt, taxRate } = inputs;

  // Total value (E + D)
  const totalValue = equity + debt;

  // Proporção de equity (E/V)
  const equityRatio = equity / totalValue;

  // Proporção de debt (D/V)
  const debtRatio = debt / totalValue;

  // Cost of debt after tax: Rd * (1 - Tc)
  // O benefício fiscal da dívida reduz o custo efetivo
  const afterTaxCostOfDebt = costOfDebt * (1 - taxRate);

  // WACC = (E/V × Re) + (D/V × Rd × (1 - Tc))
  const wacc = (equityRatio * costOfEquity) +
               (debtRatio * afterTaxCostOfDebt);

  return {
    wacc,
    equityRatio,
    debtRatio,
    afterTaxCostOfDebt,
  };
}
```

## Quando Documentar

### ✅ SEMPRE documentar:

- Funções públicas/exportadas
- Cálculos financeiros
- Schemas de validação complexos
- Componentes reutilizáveis
- Server Actions
- Hooks customizados
- Decisões arquiteturais
- Workarounds e edge cases

### ⚠️ Documentar quando necessário:

- Lógica de negócio complexa
- Algoritmos não óbvios
- Integrações externas
- Configurações específicas

### ❌ NÃO documentar:

- Código auto-explicativo
- Getters/setters simples
- Comentários óbvios
- Código temporário/debug

## Checklist de Documentação

### Para Nova Feature

- [ ] JSDoc nas funções principais
- [ ] README atualizado se necessário
- [ ] Glossário atualizado com novos termos
- [ ] Exemplos de uso
- [ ] ADR se decisão arquitetural
- [ ] CLAUDE.md atualizado se novos padrões
- [ ] Comentários em lógica complexa

### Para Bug Fix

- [ ] Comentário explicando o bug
- [ ] Referência ao issue (#123)
- [ ] Edge case documentado
- [ ] Teste de regressão

### Para Refactoring

- [ ] Motivo da refatoração documentado
- [ ] Mudanças de API documentadas
- [ ] Migration guide se necessário