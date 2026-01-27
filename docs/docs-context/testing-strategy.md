---
tipo: doc
nome: testing-strategy
descrição: Frameworks de teste, padrões, requisitos de cobertura e critérios de qualidade
categoria: testes
gerado: 2026-01-27
status: preenchido
scaffoldVersion: "2.0.0"
---

## Estratégia de Testes

A qualidade é mantida por meio de testes automatizados, code reviews e integração contínua. Toda a lógica de negócio e cálculos são cobertos por testes unitários e de integração. Contribuidores devem escrever e manter testes para novas features e correções de bugs.

## Tipos de Teste

- **Unitário**: Jest, arquivos `*.test.ts` em `src/core/calculations/` e `src/lib/actions/`
- **Integração**: Jest, cenários cobrindo endpoints de API e fluxos multi-módulo
- **E2E**: (Não implementado) — suporte futuro planejado

## Executando os Testes

- Todos os testes: `npm run test`
- Modo watch: `npm run test -- --watch`
- Cobertura: `npm run test -- --coverage`

## Critérios de Qualidade

- Cobertura mínima de 80% exigida para merges
- Todo código deve passar nos checks do ESLint e Prettier antes de ser mesclado

## Solução de Problemas

Se os testes estiverem instáveis ou falharem por ambiente, limpe caches e reinstale dependências. Para problemas persistentes, consulte o time ou revise mudanças recentes.

---

Veja também: [Fluxo de Desenvolvimento](./development-workflow.md)
