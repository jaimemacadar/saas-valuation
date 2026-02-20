---
type: doc
name: testing-strategy
description: Test frameworks, patterns, coverage requirements, and quality gates
category: testing
generated: 2026-01-27
updated: 2026-02-19
status: filled
scaffoldVersion: "2.0.0"
---

## Estratégia de Testes

A qualidade é mantida através de testes automatizados, revisões de código e análise estática. Toda lógica de negócio e cálculos financeiros — especialmente em `src/core/calculations/` — são cobertos por testes unitários rigorosos. Os hooks customizados (`useDREProjectionPersist`, `useBPProjectionPersist`) e componentes críticos têm cobertura de testes de integração. Espera-se que contribuidores escrevam e mantenham testes para novas funcionalidades e correções de bugs.

## Tipos de Testes

### Unitários (Jest + TypeScript)

- **Framework**: Jest com ts-jest
- **Localização**: Arquivos `*.test.ts` / `*.test.tsx` em diretórios `__tests__/`
- **Cobertura prioritária**: `src/core/calculations/`, `src/lib/utils/`, `src/hooks/`
- **Exemplos de suítes existentes**:
  - `src/lib/utils/__tests__/formatters.test.ts` — formatadores financeiros
  - `src/hooks/__tests__/useDREProjectionPersist.test.ts` — hook de persistência
  - `src/components/__tests__/model-sidebar-nav.test.tsx` — navegação
  - `src/components/__tests__/app-sidebar.test.tsx` — sidebar
  - `src/components/tables/__tests__/` — tabelas financeiras

### Integração (Jest + React Testing Library)

- **Framework**: Jest + `@testing-library/react`
- **Escopo**: Fluxos multi-componente, Server Actions, interações de usuário
- **Mock de dependências**: Sistema mock (`src/lib/mock/`) é usado para isolar testes de infraestrutura Supabase

### E2E (Planejado)

- Não implementado atualmente — suporte futuro com Playwright planejado

## Executando Testes

```bash
# Executar todos os testes
npm run test

# Modo watch (re-executa ao salvar arquivos)
npm run test -- --watch

# Gerar relatório de cobertura
npm run test -- --coverage

# Executar testes de um arquivo específico
npm run test -- src/core/calculations/dre.test.ts

# Executar testes com filtro por nome
npm run test -- --testNamePattern="formatCurrency"
```

### Configuração

O projeto possui dois configs de teste:
- **`jest.config.js`** — Configuração principal do Jest (TypeScript, módulos, aliases)
- **`vitest.config.ts`** — Configuração Vitest (alternativa, pode coexistir)

## Quality Gates

Antes de fazer merge de qualquer PR, verificar:

- [ ] Todos os testes passando: `npm run test`
- [ ] Lint sem erros: `npm run lint`
- [ ] TypeScript sem erros de tipo: `npm run typecheck`
- [ ] Build de produção sem erros: `npm run build`
- [ ] Novos cálculos financeiros têm testes unitários verificando edge cases
- [ ] Hooks customizados têm testes de comportamento (debounce, estados, cleanup)

### Cobertura Mínima Esperada

| Módulo | Cobertura Mínima |
|--------|-----------------|
| `src/core/calculations/` | 90%+ |
| `src/lib/utils/` | 85%+ |
| `src/hooks/` | 80%+ |
| `src/components/` | 60%+ |

## Troubleshooting

### Testes falhando por módulos ESM

```bash
# Limpar cache do Jest
npm run test -- --clearCache
```

### Erros de hydration em testes de componentes

Componentes que usam `next/dynamic` com `{ ssr: false }` requerem mock no Jest:

```typescript
jest.mock('next/dynamic', () => () => {
  const MockComponent = () => <div>Mock Chart</div>
  return MockComponent
})
```

### Testes de hooks com timers (debounce)

Para testar `useDREProjectionPersist` e `useBPProjectionPersist` com debounce:

```typescript
import { jest } from '@jest/globals'

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

// Avançar timers no teste
act(() => jest.advanceTimersByTime(800))
```

---

Veja também: [Fluxo de Desenvolvimento](./development-workflow.md)
