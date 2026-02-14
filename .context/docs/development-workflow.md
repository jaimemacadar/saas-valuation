---
type: doc
name: development-workflow
description: Day-to-day engineering processes, branching, and contribution guidelines
category: workflow
generated: 2026-01-27
status: unfilled
scaffoldVersion: "2.0.0"
---

## Fluxo de Desenvolvimento

O repositório SaaS Valuation segue um fluxo de trabalho moderno e colaborativo para garantir qualidade de código e iteração rápida. Desenvolvedores trabalham em feature branches, submetem pull requests para revisão e dependem de testes automatizados para manter a estabilidade. Todas as contribuições devem seguir as convenções e boas práticas documentadas.

## Branching & Releases

- **Modelo de Branching**: Desenvolvimento baseado em trunk na branch `main` com feature branches de curta duração.
- **Cadência de Releases**: Releases são cortados da `main` conforme necessário; sem cronograma fixo.
- **Tagging**: Tags de versionamento semântico (ex: `v1.2.0`) são usadas para releases.

## Desenvolvimento Local

- Instalar dependências: `npm install`
- Executar servidor de desenvolvimento: `npm run dev`
- Build para produção: `npm run build`
- Executar testes: `npm run test`

## Expectativas de Code Review

Todas as mudanças de código devem ser submetidas via pull request e revisadas por pelo menos um outro contribuidor. Revisores verificam qualidade de código, aderência a convenções, cobertura de testes e considerações de segurança. Veja [AGENTS.md](../../AGENTS.md) para dicas de colaboração e revisão com agentes.

## Tarefas de Onboarding

Novos contribuidores devem começar lendo a [Visão Geral do Projeto](./project-overview.md) e [Notas de Arquitetura](./architecture.md). Procure por issues rotuladas como "good first issue" ou consulte a equipe para orientação de onboarding.

---

Veja também: [Estratégia de Testes](./testing-strategy.md), [Ferramentas](./tooling.md)
