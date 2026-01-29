---
status: filled
generated: 2026-01-29
agents:
  - type: "architect-specialist"
    role: "Reestruturar rotas e layout do dashboard"
  - type: "frontend-specialist"
    role: "Implementar nova sidebar e ajustar layout"
  - type: "code-reviewer"
    role: "Revisar consistência e padrões"
docs:
  - "architecture.md"
  - "project-overview.md"
phases:
  - id: "phase-1"
    name: "Planejamento e Análise"
    prevc: "P"
  - id: "phase-2"
    name: "Implementação dos Ajustes"
    prevc: "E"
  - id: "phase-3"
    name: "Validação"
    prevc: "V"
---

# Fase 3.1 — Ajustes e Revisões

> Otimizar estrutura de pastas, reestruturar sidebar com menus úteis para valuation e corrigir sobreposição de layout.

## Task Snapshot

- **Primary goal:** Corrigir problemas estruturais e de UX identificados na Fase 3: inconsistência de rotas, sidebar com menus genéricos, e sobreposição de layout.
- **Success signal:** Estrutura de pastas consistente (sem duplicação model/models), sidebar com menus funcionais para valuation, nenhuma sobreposição entre sidebar e conteúdo.
- **Key references:**
  - [Fase 3 - Plano Original](./fase-3.md)
  - [Layout Dashboard](../../src/app/(dashboard)/layout.tsx)
  - [App Sidebar](../../src/components/app-sidebar.tsx)
  - [Model Sidebar Nav](../../src/components/model-sidebar-nav.tsx)

## Problemas Identificados

### 1. Estrutura de Pastas Inconsistente

**Problema:** Duplicação e inconsistência entre `(dashboard)/dashboard/` e rotas `model/` vs `models/`.

```
ATUAL (problemático):
src/app/(dashboard)/
├── dashboard/page.tsx      ← redundância: route group + pasta "dashboard"
├── model/[id]/view/...     ← singular
├── models/new/page.tsx     ← plural (inconsistente com "model")
└── profile/                ← vazio
```

**Solução:** Unificar sob convenção singular e eliminar redundância.

```
PROPOSTO:
src/app/(dashboard)/
├── dashboard/page.tsx      ← manter (URL /dashboard)
├── model/
│   ├── new/page.tsx        ← mover de models/new (URL /model/new)
│   └── [id]/
│       ├── view/...        ← visualizações existentes
│       ├── input/...       ← entrada de dados (futuro)
│       └── sensitivity/    ← análise sensibilidade (futuro)
└── settings/               ← substituir profile/ vazio (futuro)
```

### 2. Sidebar com Menus Genéricos

**Problema:** A sidebar padrão (`app-sidebar.tsx`) exibe menus de exemplo do shadcn/ui (Playground, Genesis, Explorer, Documentation) que não têm relação com valuation.

**Solução:** Substituir por menus funcionais organizados por fluxo de trabalho:

```
SIDEBAR PROPOSTA (fora de /model/[id]):
─────────────────────────
📊 Valuation
├── Meus Modelos          → /dashboard (lista modelos)
└── Novo Modelo           → /model/new
─────────────────────────
⚙️ Configuração
├── Premissas Padrão      → (futuro, desabilitado)
└── Perfil                → (futuro, desabilitado)
─────────────────────────
📤 Exportação
├── Exportar PDF          → (futuro, desabilitado)
└── Exportar Excel        → (futuro, desabilitado)
```

**Sidebar dentro de /model/[id] (já existente em model-sidebar-nav.tsx, manter):**
```
Dashboard
─────────────────────────
Entrada de Dados
├── Ano Base (DRE, BP)
└── Premissas de Projeção
─────────────────────────
Visualizações
├── DRE Projetado
├── Balanço Projetado
├── Fluxo de Caixa Livre
└── Valuation
─────────────────────────
Análise de Sensibilidade
```

### 3. View Layout Duplicando Header

**Problema:** O `model/[id]/view/layout.tsx` renderiza um `<h1>` com nome da empresa + descrição, mas as páginas filhas já têm breadcrumbs com o nome da empresa no header. Isso cria duplicação visual e consome espaço vertical.

**Solução:** Simplificar o `view/layout.tsx` — remover o header `<h1>` duplicado, manter apenas a validação do modelo (`notFound`) e renderizar `{children}` diretamente.

### 4. Sidebar Sobrepondo Conteúdo

**Problema:** Relatos de sobreposição da sidebar com o conteúdo da página e header superior.

**Status atual:**
- `SidebarProvider` + `SidebarInset` estão no `(dashboard)/layout.tsx` — ✅ correto
- `SidebarTrigger` presente em `dashboard/page.tsx` — ✅
- `SidebarTrigger` presente em `view/dre/page.tsx`, `view/fcff/page.tsx`, `view/balance-sheet/page.tsx` — ✅

**Solução:** Verificar e garantir que:
- O `view/layout.tsx` não adiciona wrappers extras que quebram o fluxo do `SidebarInset`
- Responsividade mobile: sidebar deve funcionar como overlay em telas < 768px
- Nenhum `position: fixed` ou `absolute` conflitante

---

## Working Phases

### Phase 1 — Planejamento e Análise

**Steps:**
1. Mapear todas as referências a `/models/new` em componentes, actions e redirects
2. Identificar impacto de renomear para `/model/new`
3. Verificar layout de sobreposição em todas as páginas

### Phase 2 — Implementação dos Ajustes

#### 2.1 — Unificar Estrutura de Rotas
1. Mover `src/app/(dashboard)/models/new/page.tsx` → `src/app/(dashboard)/model/new/page.tsx`
2. Remover pasta `models/` vazia
3. Atualizar referências em:
   - `src/app/(dashboard)/dashboard/page.tsx` — link "Criar Primeiro Modelo"
   - `src/app/(dashboard)/models/new/page.tsx` — breadcrumbs internos
   - `src/components/app-sidebar.tsx` — se houver link
4. Remover pasta `profile/` vazia

#### 2.2 — Reestruturar Sidebar Principal
1. Substituir `data` de exemplo em `app-sidebar.tsx` por menus de valuation:
   - **Valuation:** Meus Modelos (`/dashboard`), Novo Modelo (`/model/new`)
   - **Configuração:** itens futuros (desabilitados)
   - **Exportação:** itens futuros (desabilitados)
2. Remover imports não utilizados (`AudioWaveform`, `Bot`, `Command`, `Frame`, `Map`, `PieChart`, etc.)
3. Manter lógica condicional: rota `/model/[id]` → `ModelSidebarNav`, demais → sidebar principal
4. Usar ícones relevantes: `BarChart3`, `Plus`, `Settings`, `FileDown`, `LayoutDashboard`

#### 2.3 — Simplificar View Layout
1. Remover header `<h1>` + descrição de `model/[id]/view/layout.tsx`
2. Manter apenas: validação `notFound()` e `{children}` direto

#### 2.4 — Garantir Layout Sem Sobreposição
1. Verificar que todas as páginas dentro de `(dashboard)` usam header com `SidebarTrigger`
2. Testar collapse/expand da sidebar em `/dashboard`, `/model/new`, `/model/[id]/view/*`
3. Verificar responsividade mobile

**Commit Checkpoint:** `git commit -m "fix(layout): restructure routes, sidebar menus and fix layout overlap"`

### Phase 3 — Validação

**Steps:**
1. Verificar navegação completa: Dashboard → Novo Modelo → View DRE/BP/FCFF → Voltar
2. Verificar que sidebar não sobrepõe conteúdo em nenhuma rota
3. Verificar que `SidebarTrigger` minimiza/expande corretamente
4. Rodar testes existentes (46 testes devem continuar passando)
5. Build sem erros TypeScript: `npm run build`

---

## Arquivos Impactados

| Arquivo | Ação |
|---------|------|
| `src/app/(dashboard)/models/new/page.tsx` | Mover → `model/new/page.tsx` |
| `src/app/(dashboard)/dashboard/page.tsx` | Atualizar link `/models/new` → `/model/new` |
| `src/components/app-sidebar.tsx` | Reescrever menus com itens de valuation |
| `src/components/model-sidebar-nav.tsx` | Manter (sem alteração) |
| `src/app/(dashboard)/model/[id]/view/layout.tsx` | Remover header duplicado |
| `src/app/(dashboard)/profile/` | Remover pasta vazia |
| `src/lib/actions/models.ts` | Verificar redirects (se houver) |

## Critérios de Aceite

- [ ] Rota `/models/new` renomeada para `/model/new` com todos os links atualizados
- [ ] Sidebar principal exibe menus de Valuation, Configuração e Exportação
- [ ] Sidebar não sobrepõe conteúdo em nenhuma página
- [ ] Header com `SidebarTrigger` presente e funcional em todas as páginas
- [ ] View layout não duplica header com nome da empresa
- [ ] Todos os 46 testes existentes passando
- [ ] Build sem erros TypeScript

## Rollback Plan

- **Trigger:** Navegação quebrada ou testes falhando
- **Ação:** `git revert` dos commits — sem impacto em dados
- **Impacto:** Nenhum — mudanças são apenas de estrutura de UI/rotas
