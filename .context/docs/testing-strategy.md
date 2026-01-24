---
type: doc
name: testing-strategy
description: Test frameworks, patterns, coverage requirements, and quality gates
category: testing
generated: 2026-01-24
status: unfilled
scaffoldVersion: "2.0.0"
---

## Testing Strategy

A qualidade é mantida através de testes automatizados, linting e revisões de código. Este documento descreve os frameworks, convenções e expectativas de cobertura.

## Test Types

- **Unit Tests**: Jest/Vitest, arquivos nomeados `*.test.ts` ou `*.spec.ts`
- **Integration Tests**: Testes de integração entre módulos core e lib
- **E2E Tests**: Playwright ou Cypress (a ser implementado)

## Running Tests

- Todos os testes: `npm run test`
- Watch mode: `npm run test -- --watch`
- Coverage: `npm run test -- --coverage`
- Lint: `npm run lint`

## Quality Gates

- **Cobertura mínima**: 70% para novas funcionalidades
- **Linting**: Todos os erros de ESLint devem ser resolvidos
- **Type Safety**: Sem erros TypeScript
- **Build**: Build de produção deve passar sem erros
- **Code Review**: Aprovação obrigatória antes do merge

## Troubleshooting

- Testes flaky devem ser isolados e corrigidos antes do merge
- Problemas de ambiente devem ser documentados em issues
- Testes de longa duração devem ser otimizados ou marcados como slow

---

Veja também: [Development Workflow](./development-workflow.md)
