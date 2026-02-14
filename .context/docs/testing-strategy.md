---
type: doc
name: testing-strategy
description: Test frameworks, patterns, coverage requirements, and quality gates
category: testing
generated: 2026-01-27
status: unfilled
scaffoldVersion: "2.0.0"
---

## Estratégia de Testes

A qualidade é mantida através de testes automatizados, revisões de código e integração contínua. Toda lógica de negócio e cálculos são cobertos por testes unitários e de integração. Espera-se que contribuidores escrevam e mantenham testes para novas funcionalidades e correções de bugs.

## Tipos de Testes

- **Unitários**: Jest, arquivos nomeados `*.test.ts` em `src/core/calculations/` e `src/lib/actions/`
- **Integração**: Jest, cenários cobrindo endpoints de API e fluxos multi-módulo
- **E2E**: (Não implementado) — suporte futuro planejado

## Executando Testes

- Todos os testes: `npm run test`
- Modo watch: `npm run test -- --watch`
- Cobertura: `npm run test -- --coverage`

## Quality Gates

- Mínimo de 80% de cobertura de código necessário para merges
- Todo código deve passar nas verificações de ESLint e Prettier antes do merge

## Troubleshooting

Se testes falharem devido a problemas de ambiente ou forem instáveis, limpe caches e reinstale dependências. Para problemas persistentes, consulte a equipe ou revise mudanças recentes.

---

Veja também: [Fluxo de Desenvolvimento](./development-workflow.md)
