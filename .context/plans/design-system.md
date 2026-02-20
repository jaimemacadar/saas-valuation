---
status: active
generated: 2026-02-20
agents:
  - type: "architect-specialist"
    role: "Definir a arquitetura do Design System, tokens e estrutura de pastas"
  - type: "frontend-specialist"
    role: "Implementar globals.css, styleguide layout, páginas e componentes demo"
  - type: "feature-developer"
    role: "Instalar e configurar shadcn/ui, componentes e fonte"
  - type: "code-reviewer"
    role: "Revisar qualidade dos tokens, acessibilidade e consistência"
  - type: "documentation-writer"
    role: "Atualizar documentação do projeto com o Design System"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "development-workflow.md"
  - "tooling.md"
phases:
  - id: "phase-1"
    name: "Discovery & Análise de Design"
    prevc: "P"
    agent: "architect-specialist"
  - id: "phase-2"
    name: "Configuração & Tokens"
    prevc: "E"
    agent: "feature-developer"
  - id: "phase-3"
    name: "Implementação do Styleguide"
    prevc: "E"
    agent: "frontend-specialist"
  - id: "phase-4"
    name: "Revisão & Documentação"
    prevc: "V"
    agent: "code-reviewer"
---

# Design System Foundation - Setup Completo com shadcn/ui

> Criar um Design System completo para a aplicação SaaS Valuation, extraindo design tokens do frontend existente, reconfigurando globals.css com escalas de cor completas, e criando um styleguide navegável em `/app/styleguide`.

## Task Snapshot
- **Primary goal:** Estabelecer um Design System consistente com shadcn/ui, design tokens extraídos da aplicação, e um styleguide visual navegável.
- **Success signal:** Página `/styleguide` funcionando com paleta de cores, tipografia, espaçamento, sombras, e componentes demo renderizados corretamente em modo light e dark.
- **Key references:**
  - [1-design-system-foundation.md](../../1-design-system-foundation.md) — Especificação completa
  - [Documentation Index](../docs/README.md)
  - [Architecture Notes](../docs/architecture.md)

## Codebase Context

### Stack Atual
- **Framework:** Next.js 16.1.4 (App Router, RSC)
- **UI Library:** shadcn/ui (style: new-york, base: neutral, CSS variables: yes)
- **Styling:** Tailwind CSS v4 + tailwindcss-animate + tw-animate-css
- **Fonte:** Inter (Google Fonts, via `next/font`)
- **Tema:** next-themes (dark mode via class)
- **Charts:** Recharts 3.7
- **Icons:** Lucide React

### Estado Atual do Design
- **globals.css:** Já possui tokens shadcn padrão em oklch (neutral) com light/dark mode
- **tailwind.config.ts:** Configuração legada com `hsl(var(--...))` — conflita com oklch do globals.css
- **Componentes UI existentes (23):** button, input, label, card, tabs, sonner, skeleton, separator, sheet, tooltip, breadcrumb, collapsible, dropdown-menu, avatar, alert, badge, textarea, dialog, form, sidebar, financial-input, popover, table
- **Componentes personalizados:** charts (Revenue, EBITDA, FCFF, Cost, Investment, WorkingCapital, Loans), forms, tables, layout

### Problema Identificado
O `tailwind.config.ts` usa `hsl(var(--...))` mas o `globals.css` já usa `oklch`. Isso precisa ser resolvido — o tailwind.config.ts está redundante com o sistema de CSS variables do Tailwind v4.

## Agent Lineup

| Agent | Role | Playbook | Foco |
| --- | --- | --- | --- |
| Architect Specialist | Definir estrutura de tokens e escalas de cor | [Playbook](../agents/architect-specialist.md) | Fase 1: Análise e decisões de arquitetura |
| Feature Developer | Instalar dependências e configurar shadcn | [Playbook](../agents/feature-developer.md) | Fase 2: Setup técnico e tokens |
| Frontend Specialist | Criar styleguide layout e páginas | [Playbook](../agents/frontend-specialist.md) | Fase 3: Implementação visual |
| Code Reviewer | Revisar acessibilidade e consistência | [Playbook](../agents/code-reviewer.md) | Fase 4: Quality gate |
| Documentation Writer | Documentar Design System | [Playbook](../agents/documentation-writer.md) | Fase 4: Docs update |

## Risk Assessment

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Conflito tailwind.config.ts hsl vs globals.css oklch | Alta | Médio | Remover mapeamento de cores do tailwind.config.ts, usar apenas CSS variables do TW v4 | `architect-specialist` |
| Componentes existentes quebram com novos tokens | Média | Alto | Testar todos os 23 componentes UI após mudança de tokens | `code-reviewer` |
| Cores sem contraste suficiente (WCAG) | Baixa | Médio | Validar ratio 4.5:1 para texto, 3:1 para elementos grandes | `frontend-specialist` |

### Dependencies
- **Internal:** Nenhuma — o Design System é autocontido
- **External:** shadcn/ui CLI para instalar componentes demo (radio-group)
- **Technical:** Tailwind CSS v4 já instalado; shadcn já inicializado

### Assumptions
- O tema neutral oklch atual é a base desejada (será enriquecido com escalas completas e cores semânticas)
- A fonte Inter permanece como fonte principal
- O styleguide é uma rota separada (`/styleguide`) e não impacta a aplicação principal

---

## Working Phases

### Phase 1 — Discovery & Análise de Design
> **Primary Agent:** `architect-specialist` - [Playbook](../agents/architect-specialist.md)

**Objective:** Analisar o frontend existente, extrair design tokens, e definir a arquitetura do Design System.

**Tasks**

| # | Task | Agent | Status | Deliverable |
|---|------|-------|--------|-------------|
| 1.1 | Analisar globals.css atual e mapear todos os tokens oklch existentes | `architect-specialist` | pending | Mapa de tokens atual |
| 1.2 | Analisar componentes UI existentes para identificar cores, espaçamentos e padrões visuais usados | `architect-specialist` | pending | Lista de padrões visuais |
| 1.3 | Definir escala completa de cores primary (50-900) baseada na cor primária atual | `architect-specialist` | pending | Escala de cores primary |
| 1.4 | Definir escala completa de cores neutral/grey (50-900) baseada nos tokens existentes | `architect-specialist` | pending | Escala de cores neutral |
| 1.5 | Definir cores semânticas (success, warning, info) harmonizadas com a paleta | `architect-specialist` | pending | Tokens semânticos |
| 1.6 | Decidir se tailwind.config.ts deve ser simplificado (remover mapeamento hsl redundante) | `architect-specialist` | pending | ADR documentada |

**Commit Checkpoint**
- `git commit -m "chore(design-system): complete phase 1 - design analysis and token mapping"`

---

### Phase 2 — Configuração & Tokens
> **Primary Agent:** `feature-developer` - [Playbook](../agents/feature-developer.md)

**Objective:** Configurar shadcn/ui, atualizar globals.css com tokens completos, instalar componentes demo, e resolver conflito tailwind.config.ts.

**Tasks**

| # | Task | Agent | Status | Deliverable |
|---|------|-------|--------|-------------|
| 2.1 | Atualizar globals.css `:root` com escalas completas de primary (50-900) | `feature-developer` | pending | globals.css atualizado |
| 2.2 | Atualizar globals.css `:root` com escalas completas de neutral (50-900) | `feature-developer` | pending | globals.css atualizado |
| 2.3 | Adicionar tokens semânticos (success, warning, info + foreground) ao `:root` e `.dark` | `feature-developer` | pending | globals.css com semânticos |
| 2.4 | Atualizar bloco `@theme inline` para incluir novos tokens (success, warning, info, escalas) | `feature-developer` | pending | @theme inline completo |
| 2.5 | Atualizar `.dark` com versões dark mode de todos os novos tokens | `feature-developer` | pending | Dark mode completo |
| 2.6 | Limpar tailwind.config.ts — remover mapeamento de cores hsl redundante | `feature-developer` | pending | tailwind.config.ts limpo |
| 2.7 | Instalar componente radio-group via shadcn CLI (`npx shadcn@latest add radio-group`) | `feature-developer` | pending | Componente instalado |
| 2.8 | Verificar que layout.tsx mantém Inter como fonte e adicionar `--font-sans` se necessário | `feature-developer` | pending | layout.tsx verificado |

**Commit Checkpoint**
- `git commit -m "feat(design-system): add complete design tokens and color scales"`

---

### Phase 3 — Implementação do Styleguide
> **Primary Agent:** `frontend-specialist` - [Playbook](../agents/frontend-specialist.md)

**Objective:** Criar o styleguide navegável com sidebar, demonstrando todos os design tokens e componentes.

**Tasks**

| # | Task | Agent | Status | Deliverable |
|---|------|-------|--------|-------------|
| 3.1 | Criar `/src/app/styleguide/navigation.ts` com config de navegação | `frontend-specialist` | pending | navigation.ts |
| 3.2 | Criar `/src/app/styleguide/layout.tsx` com sidebar fixa e navegação | `frontend-specialist` | pending | layout.tsx |
| 3.3 | Criar `/src/app/styleguide/page.tsx` com seções de tokens: | `frontend-specialist` | pending | page.tsx |
|     | — Paleta de cores (swatches com nomes CSS) | | | |
|     | — Escala Primary (50-900) | | | |
|     | — Escala Neutral/Grey (50-900) | | | |
|     | — Cores semânticas (success, warning, error, info) | | | |
|     | — Tipografia (headings, body text, mono) | | | |
|     | — Border radius (exemplos visuais) | | | |
|     | — Sombras (exemplos visuais) | | | |
|     | — Componentes demo (Button, Card, Badge, Alert, RadioGroup) | | | |
|     | — Dark mode toggle (preview ambos temas) | | | |
| 3.4 | Garantir que o styleguide não interfere com o layout do dashboard (rota separada) | `frontend-specialist` | pending | Rota isolada |

**Commit Checkpoint**
- `git commit -m "feat(design-system): create styleguide with navigable sidebar"`

---

### Phase 4 — Revisão & Documentação
> **Primary Agent:** `code-reviewer` + `documentation-writer`

**Objective:** Validar qualidade, acessibilidade, e documentar o Design System.

**Tasks**

| # | Task | Agent | Status | Deliverable |
|---|------|-------|--------|-------------|
| 4.1 | Revisar contraste de cores (WCAG AA: 4.5:1 para texto) | `code-reviewer` | pending | Relatório de acessibilidade |
| 4.2 | Verificar que todos os 23 componentes UI existentes renderizam corretamente com novos tokens | `code-reviewer` | pending | Checklist de componentes |
| 4.3 | Testar dark mode toggle no styleguide | `code-reviewer` | pending | Validação dark mode |
| 4.4 | Verificar build (`next build`) sem erros | `code-reviewer` | pending | Build limpo |
| 4.5 | Atualizar documentação do projeto via ai-context documentation-writer | `documentation-writer` | pending | Docs atualizados |
| 4.6 | Criar resumo do Design System (cor, fonte, estilo, radius, overall feel) | `documentation-writer` | pending | Design Summary |

**Commit Checkpoint**
- `git commit -m "docs(design-system): complete validation and documentation"`

---

## Design Summary (a ser preenchido na Phase 4)

- **Primary color:** `oklch(0.205 0 0)` — Neutral/Black (a ser enriquecido com brand color)
- **Font:** Inter (Google Fonts)
- **Style:** Modern minimal, clean, profissional
- **Border radius:** 0.625rem (10px) — Rounded
- **Overall feel:** Aplicação financeira profissional com estética limpa e dados densos

## Rollback Plan

### Rollback Triggers
- Componentes existentes quebrados após mudança de tokens
- Build falha após atualização de globals.css
- Conflitos visuais no dashboard

### Rollback Procedures
#### Phase 2 Rollback
- Action: `git revert` dos commits de tokens; restaurar globals.css e tailwind.config.ts originais
- Data Impact: Nenhum (apenas CSS/frontend)
- Estimated Time: < 30 minutos

#### Phase 3 Rollback
- Action: Deletar pasta `/src/app/styleguide/`
- Data Impact: Nenhum
- Estimated Time: < 15 minutos

## Evidence & Follow-up

### Artifacts to Collect
- Screenshot do styleguide (light + dark mode)
- Resultado do `next build`
- Lista de componentes validados

### Success Metrics
- Styleguide acessível em `/styleguide` com todas as seções
- Build passa sem erros
- Todos os 23 componentes UI existentes funcionam sem regressão
- Contraste WCAG AA em todos os tokens de texto

### Follow-up Actions
| Action | Owner (Agent) | Due |
|--------|---------------|-----|
| Criar páginas individuais de componentes (Prompt 2) | `frontend-specialist` | Próximo sprint |
| Migrar páginas existentes para usar tokens do Design System | `refactoring-specialist` | Próximo sprint |
