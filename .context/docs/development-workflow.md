---
type: doc
name: development-workflow
description: Day-to-day engineering processes, branching, and contribution guidelines
category: workflow
generated: 2026-01-27
updated: 2026-02-25
status: filled
scaffoldVersion: "2.0.0"
---

## Fluxo de Desenvolvimento

O repositório SaaS Valuation segue um fluxo de trabalho moderno e colaborativo para garantir qualidade de código e iteração rápida. Desenvolvedores trabalham em feature branches curtas, submetem pull requests para revisão e dependem de testes automatizados para manter a estabilidade. Todas as contribuições devem seguir as convenções e boas práticas documentadas. O projeto usa uma metodologia estruturada PREVC (Plan → Review → Execute → Verify → Complete) para features não triviais.

## Branching & Releases

- **Modelo de Branching**: Trunk-based development na branch `main` com feature branches de curta duração.
- **Convenção de branches**: `feat/nome-da-feature`, `fix/nome-do-bug`, `docs/atualizacao`, `refactor/modulo`
- **Cadência de Releases**: Releases são cortados da `main` conforme necessário; sem cronograma fixo.
- **Tagging**: Tags de versionamento semântico (ex: `v1.2.0`) são usadas para releases.
- **Proteção da main**: Nunca faça push direto para `main`. Sempre use pull requests.

## Desenvolvimento Local

### Setup Inicial

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env.local

# 3. Configurar Supabase (produção) ou ativar modo mock (desenvolvimento)
# Para modo mock, adicione ao .env.local:
NEXT_PUBLIC_USE_MOCK_DATA=true

# 4. Executar servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev        # Servidor de desenvolvimento (http://localhost:3000)
npm run build      # Build de produção
npm run start      # Iniciar servidor de produção
npm run lint       # Lint com ESLint
npm run test       # Executar todos os testes
npm run test:watch # Testes em modo watch
npm run typecheck  # Verificação de tipos TypeScript
```

### Modo Mock (Desenvolvimento Offline)

Para desenvolver sem conexão com Supabase, ative o modo mock:

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
```

O sistema mock fornece:
- Autenticação simulada com usuários pré-configurados
- Store in-memory com CRUD completo
- Dados financeiros de exemplo
- Cálculos automáticos de campos derivados

Veja [MOCK_MODE.md](../../MOCK_MODE.md) para detalhes completos.

## Criando Novos Componentes

Antes de implementar qualquer componente visual, consulte o **Design System** para garantir consistencia com os tokens, padroes e convencoes estabelecidos:

| Recurso | Onde encontrar |
|---------|---------------|
| **Styleguide interativo** (tokens, cores, radius ao vivo) | `/styleguide` |
| **Grafico Combinado** (Bar + Line, props, tokens por contexto) | `/styleguide/components/grafico-combinado` |
| **Tabelas Financeiras** (RowTypes, tokens de bg, premissas) | `/styleguide/components/tabelas` |
| **Especificacao escrita completa** | `.context/docs/design-system.md` |

### Checklist ao criar um novo componente

- [ ] Consultar `/styleguide` para verificar tokens de cor, tipografia e radius aplicaveis
- [ ] Usar `var(--token)` para cores — nunca valores literais (hex, hsl, oklch inline)
- [ ] Seguir os padroes de RowType e tokens de background ao criar tabelas financeiras
- [ ] Usar tokens semanticos de graficos por contexto (ver secao "Usar Cores em Graficos")
- [ ] Documentar o novo componente no styleguide (`src/app/styleguide/components/<nome>/page.tsx`) e atualizar `navigation.ts`
- [ ] Atualizar `design-system.md` com a secao do componente apos finalizar

## Expectativas de Code Review

Todas as mudanças de código devem ser submetidas via pull request e revisadas por pelo menos um outro contribuidor antes do merge. O revisor verifica:

- **Correção**: A lógica implementa corretamente os requisitos?
- **Qualidade**: O código é legível, manutenível e segue os padrões do projeto?
- **Testes**: Há cobertura adequada para novas funcionalidades?
- **Segurança**: Há riscos de XSS, injection ou vazamento de dados?
- **Performance**: Há re-renders desnecessários ou chamadas redundantes ao banco?
- **Tipos**: TypeScript está sendo usado corretamente sem `any` escapados?

Veja [AGENTS.md](../../AGENTS.md) para dicas de colaboração e revisão assistida por agentes de IA.

### Checklist de PR

- [ ] Testes passando (`npm run test`)
- [ ] Lint limpo (`npm run lint`)
- [ ] TypeScript sem erros (`npm run typecheck`)
- [ ] Descrição clara do que mudou e por quê
- [ ] Screenshots para mudanças visuais

## Tarefas de Onboarding

Novos contribuidores devem seguir esta sequência:

1. Leia a [Visão Geral do Projeto](./project-overview.md) para entender o produto
2. Leia as [Notas de Arquitetura](./architecture.md) para entender a estrutura
3. Leia o [Design System](./design-system.md) e navegue pelo styleguide em `/styleguide`
4. Configure o ambiente local com modo mock (`NEXT_PUBLIC_USE_MOCK_DATA=true`)
5. Execute `npm run test` para verificar que o ambiente está funcionando
6. Explore os componentes principais em `src/components/` e `src/core/calculations/`
7. Procure por issues rotuladas como `good first issue` para começar

---

Veja também: [Estratégia de Testes](./testing-strategy.md), [Ferramentas](./tooling.md)
