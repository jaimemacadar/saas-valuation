type: doc
name: development-workflow
description: Day-to-day engineering processes, branching, and contribution guidelines
category: workflow
generated: 2026-01-24
status: unfilled
scaffoldVersion: "2.0.0"

## Development Workflow

Desenvolvedores trabalham em um monorepo TypeScript/Next.js com estrutura modular. Todas as mudanças são feitas via feature branches, com revisões de código obrigatórias antes do merge. Testes automatizados e linting são executados em cada pull request. Documentação e playbooks de agentes são atualizados junto com mudanças de código.

## Branching & Releases

- **Branching Model**: Trunk-based development (branch main)
- **Feature Branches**: `feature/<description>`
- **Release Branches**: `release/<version>` (conforme necessário)
- **Tags**: Versionamento semântico (ex: `v1.0.0`)
- **Release Cadence**: Conforme features são completadas e revisadas

## Local Development

- Install: `npm install`
- Run: `npm run dev`
- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`

## Code Review Expectations

Todo código deve ser revisado antes do merge. Revisores verificam qualidade do código, aderência a guias de estilo, cobertura de testes e atualizações de documentação. Veja [AGENTS.md](../../AGENTS.md) para dicas de colaboração e revisão com agentes. Verificações automatizadas devem passar antes da aprovação.

## Onboarding Tasks

Novos contribuidores devem começar lendo o Project Overview e Development Workflow. Procure por issues com label `good first issue` ou consulte o time para orientação de onboarding. Runbooks internos e dashboards estão disponíveis para aprofundamento.

---

See also: [Testing Strategy](./testing-strategy.md), [Tooling Guide](./tooling.md)
