---
status: filled
generated: 2026-02-20
agents:
  - type: "frontend-specialist"
    role: "Implementar ThemeProvider, ThemeToggle e corrigir componentes"
  - type: "feature-developer"
    role: "Desenvolver a funcionalidade completa de dark/light mode"
phases:
  - id: "phase-1"
    name: "Setup ThemeProvider & Toggle"
    prevc: "E"
    agent: "frontend-specialist"
  - id: "phase-2"
    name: "Corrigir componentes com cores hardcoded"
    prevc: "E"
    agent: "feature-developer"
  - id: "phase-3"
    name: "Validação visual"
    prevc: "V"
    agent: "frontend-specialist"
---

# Dark Mode / Light Mode Toggle Plan

> Implementar funcionalidade de dark mode e light mode para toda a aplicacao, com botao de toggle no cabecalho superior a direita.

## Task Snapshot
- **Primary goal:** Permitir ao usuario alternar entre dark mode e light mode em toda a aplicacao.
- **Success signal:** O botao de toggle no header alterna corretamente os temas, e todos os componentes respondem as variaveis CSS de tema.
- **Key references:**
  - [Design System](../docs/design-system.md) — tokens oklch ja definidos para light e dark

## Analise do Estado Atual

### O que ja existe
1. **`next-themes` v0.4.6** ja esta instalado no projeto
2. **CSS Variables completas** em `src/app/globals.css` — 60+ tokens oklch com variantes `:root` (light) e `.dark` (dark)
3. **shadcn/ui** configurado com CSS variables habilitadas
4. **Todas as escalas de cor** (primary, neutral, alternative) ja possuem versoes dark

### O que falta
1. **ThemeProvider** nao esta wrapping o root layout (`src/app/layout.tsx`)
2. **Componente ThemeToggle** nao existe — precisa ser criado
3. **Header** (`src/components/layout/Header.tsx`) usa cores hardcoded (`bg-white dark:bg-gray-900`)
4. **UserMenu** (`src/components/layout/UserMenu.tsx`) referencia `text-secondary-900` que nao existe nos tokens

## Working Phases

### Phase 1 — Setup ThemeProvider & Toggle Component
> **Primary Agent:** `frontend-specialist`

**Objetivo:** Configurar o sistema de temas e criar o componente de toggle.

| # | Task | Status | Deliverable |
|---|------|--------|-------------|
| 1.1 | Criar `src/components/theme-provider.tsx` — wrapper do `next-themes` ThemeProvider com `attribute="class"`, `defaultTheme="system"`, `enableSystem` | pending | Componente ThemeProvider |
| 1.2 | Envolver `<body>` em `src/app/layout.tsx` com `<ThemeProvider>` e adicionar `suppressHydrationWarning` no `<html>` | pending | Layout atualizado |
| 1.3 | Criar `src/components/theme-toggle.tsx` — botao com icones Sun/Moon/Monitor do lucide-react, usando `useTheme()` do next-themes. Ciclo: light -> dark -> system | pending | Componente ThemeToggle |
| 1.4 | Adicionar `<ThemeToggle />` no `Header.tsx` a direita, antes do `<UserMenu />` | pending | Header atualizado |

### Phase 2 — Corrigir Componentes com Cores Hardcoded
> **Primary Agent:** `feature-developer`

**Objetivo:** Garantir que todos os componentes usem design tokens em vez de cores hardcoded.

| # | Task | Status | Deliverable |
|---|------|--------|-------------|
| 2.1 | `Header.tsx`: substituir `bg-white dark:bg-gray-900` por `bg-background` e `border-gray-200 dark:border-gray-800` por `border-border` | pending | Header corrigido |
| 2.2 | `UserMenu.tsx`: substituir `text-secondary-900` por `text-foreground` | pending | UserMenu corrigido |
| 2.3 | Auditar e corrigir `src/components/layout/Sidebar.tsx` (legacy) para cores hardcoded | pending | Sidebar legacy corrigido |
| 2.4 | Verificar que `suppressHydrationWarning` esta no `<html>` tag (necessario para next-themes) | pending | Sem flash de tema |

### Phase 3 — Validacao Visual
> **Primary Agent:** `frontend-specialist`

**Objetivo:** Verificar que a aplicacao funciona corretamente em ambos os temas.

| # | Task | Status | Deliverable |
|---|------|--------|-------------|
| 3.1 | Testar toggle light -> dark -> system no header | pending | Funcional |
| 3.2 | Verificar persistencia do tema (localStorage) apos reload | pending | Tema persiste |
| 3.3 | Verificar que nao ha flash de tema incorreto no carregamento | pending | Sem FOUC |
| 3.4 | Build de producao sem erros | pending | Build OK |

## Arquivos a Modificar/Criar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/components/theme-provider.tsx` | **CRIAR** | Wrapper next-themes ThemeProvider |
| `src/components/theme-toggle.tsx` | **CRIAR** | Botao toggle Sun/Moon/Monitor |
| `src/app/layout.tsx` | EDITAR | Adicionar ThemeProvider + suppressHydrationWarning |
| `src/components/layout/Header.tsx` | EDITAR | Adicionar ThemeToggle + corrigir cores |
| `src/components/layout/UserMenu.tsx` | EDITAR | Corrigir referencia a secondary-900 |

## Decisoes Tecnicas

1. **Ciclo de temas:** light -> dark -> system (3 estados) com icones Sun, Moon, Monitor
2. **Persistencia:** next-themes usa localStorage automaticamente
3. **Estrategia de classe:** `attribute="class"` para compatibilidade com Tailwind `.dark`
4. **Default:** `system` — respeitar preferencia do SO
5. **Estilo do botao:** Ghost button com tooltip, alinhado ao design system existente

## Rollback Plan
- **Trigger:** Qualquer componente quebrado visualmente apos as mudancas
- **Procedimento:** Reverter os commits desta feature branch
- **Impacto:** Nenhum impacto em dados — mudancas sao puramente visuais/frontend
