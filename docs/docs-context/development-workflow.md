---
tipo: doc
nome: development-workflow
descrição: Processos de engenharia do dia a dia, branching e diretrizes de contribuição
categoria: workflow
gerado: 2026-01-27
status: preenchido
scaffoldVersion: "2.0.0"
---

## Fluxo de Desenvolvimento

O repositório SaaS Valuation segue um fluxo moderno e colaborativo para garantir qualidade de código e rápida iteração. Desenvolvedores trabalham em branches de feature, submetem pull requests para revisão e contam com testes automatizados para manter a estabilidade. Todas as contribuições devem seguir as convenções e boas práticas documentadas.

## Branching & Releases

- **Modelo de Branching**: Desenvolvimento baseado em trunk na `main` com branches de feature de curta duração.
- **Frequência de Releases**: Releases são criados a partir da `main` conforme necessário; sem cronograma fixo.
- **Tagging**: Tags de versionamento semântico (ex: `v1.2.0`) são usadas para releases.

## Desenvolvimento Local

- Instalar dependências: `npm install`
- Rodar servidor de desenvolvimento: `npm run dev`
- Build para produção: `npm run build`
- Rodar testes: `npm run test`

## Expectativas de Code Review

Todas as mudanças devem ser submetidas via pull request e revisadas por pelo menos um outro colaborador. Revisores checam qualidade, aderência às convenções, cobertura de testes e segurança. Veja [AGENTS.md](../../AGENTS.md) para dicas de colaboração e revisão entre agentes.

## Tarefas de Onboarding

Novos colaboradores devem começar lendo a [Visão Geral do Projeto](./project-overview.md) e as [Notas de Arquitetura](./architecture.md). Procure issues marcadas como "good first issue" ou consulte o time para orientação de onboarding.

---

Veja também: [Estratégia de Testes](./testing-strategy.md), [Ferramentas](./tooling.md)
