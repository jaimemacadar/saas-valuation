---
status: filled
generated: 2026-01-30
agents:
  - type: "feature-developer"
    role: "Implementar página de gerenciamento e ajustar sidebar"
  - type: "test-writer"
    role: "Escrever testes para os novos componentes"
phases:
  - id: "phase-1"
    name: "Discovery & Alignment"
    prevc: "P"
  - id: "phase-2"
    name: "Implementation & Iteration"
    prevc: "E"
  - id: "phase-3"
    name: "Validation & Handoff"
    prevc: "V"
---

# Página de Gerenciamento de Modelos (Meus Modelos)

> Transformar o menu "Meus Modelos" em uma página de gerenciamento CRUD de modelos de valuation, remover o menu "Novo Modelo" do sidebar, e padronizar o cabeçalho de todas as páginas via componente reutilizável.

## Task Snapshot
- **Primary goal:** Criar uma página de listagem/gerenciamento de modelos acessível via "Meus Modelos" no sidebar, com operações CRUD completas (criar, visualizar, editar, duplicar, excluir), remover o item "Novo Modelo" do sidebar, e extrair o cabeçalho padrão em um componente reutilizável.
- **Success signal:** O menu "Meus Modelos" leva a uma página com lista de modelos onde o usuário pode criar, editar, duplicar e excluir modelos. O menu "Novo Modelo" não existe mais no sidebar. Todas as páginas usam o mesmo componente de cabeçalho.

## Escopo

### Arquivos a criar
1. **`src/components/page-header.tsx`** — Componente reutilizável de cabeçalho com:
   - `SidebarTrigger` + `Separator` + `Breadcrumb`
   - Props para configurar os itens do breadcrumb (array de `{ label, href? }`)
   - Modelo baseado no cabeçalho atual do dashboard (`src/app/(dashboard)/dashboard/page.tsx:47-61`)

2. **`src/app/(dashboard)/dashboard/models/page.tsx`** — Nova página de gerenciamento de modelos com:
   - Lista de modelos em cards ou tabela
   - Botão "Novo Modelo" dentro da página
   - Ações por modelo: abrir, editar metadados, duplicar, excluir
   - Estado vazio quando não há modelos
   - Diálogo de confirmação para exclusão
   - Diálogo/modal para edição de metadados (nome, ticker, descrição)

### Arquivos a modificar
3. **`src/components/app-sidebar.tsx`** — Remover item "Novo Modelo", manter "Meus Modelos" apontando para `/dashboard/models`

4. **`src/app/(dashboard)/dashboard/page.tsx`** — Redirecionar `/dashboard` para `/dashboard/models`

5. **Substituir cabeçalho duplicado pelo componente `PageHeader`** em todas as páginas que possuem o padrão `<header>` inline:
   - `src/app/(dashboard)/model/new/page.tsx`
   - `src/app/(dashboard)/model/[id]/view/dre/page.tsx`
   - `src/app/(dashboard)/model/[id]/view/balance-sheet/page.tsx`
   - `src/app/(dashboard)/model/[id]/view/fcff/page.tsx`

### Recursos existentes já disponíveis
- `getModels()` — lista modelos do usuário (`src/lib/actions/models.ts:44`)
- `createModel()` — cria modelo (`src/lib/actions/models.ts:122`)
- `updateModel()` — atualiza modelo (`src/lib/actions/models.ts:172`)
- `deleteModel()` — exclui modelo (`src/lib/actions/models.ts:243`)
- `duplicateModel()` — duplica modelo (`src/lib/actions/models.ts:275`)

## Working Phases

### Phase 1 — Discovery & Alignment (P)
**Steps**
1. Revisar componentes UI existentes (shadcn/ui) disponíveis no projeto para cards, tabelas, diálogos e botões.
2. Confirmar que as server actions existentes (`deleteModel`, `duplicateModel`, `updateModel`) funcionam corretamente.
3. Mapear todos os cabeçalhos existentes para garantir compatibilidade com o novo componente.

### Phase 2 — Implementation (E)
**Steps**
1. **Criar componente `src/components/page-header.tsx`:**
   - Extrair o padrão de cabeçalho comum: `SidebarTrigger` + `Separator` + `Breadcrumb`
   - Props: `breadcrumbs: Array<{ label: string; href?: string }>` onde o último item é a página atual (sem link)
   - Manter as mesmas classes CSS do cabeçalho atual do dashboard

2. **Substituir cabeçalhos inline pelo componente `PageHeader`** em:
   - `src/app/(dashboard)/dashboard/page.tsx`
   - `src/app/(dashboard)/model/new/page.tsx`
   - `src/app/(dashboard)/model/[id]/view/dre/page.tsx`
   - `src/app/(dashboard)/model/[id]/view/balance-sheet/page.tsx`
   - `src/app/(dashboard)/model/[id]/view/fcff/page.tsx`

3. **Criar página `/dashboard/models/page.tsx`:**
   - Usa o componente `PageHeader` com breadcrumb: `Dashboard > Meus Modelos`
   - Componente server que usa `getModels()` para buscar dados
   - Renderizar lista de modelos em cards com: nome da empresa, ticker, descrição, data de atualização
   - Botão "Novo Modelo" no topo da página (link para `/model/new`)
   - Menu de ações por card: Abrir (`/model/[id]/view/dre`), Editar, Duplicar, Excluir
   - Dialog de confirmação para exclusão usando `deleteModel()`
   - Dialog de edição de metadados usando `updateModel()`
   - Chamada a `duplicateModel()` para duplicação
   - Estado vazio com CTA para criar primeiro modelo

4. **Atualizar `src/components/app-sidebar.tsx`:**
   - Alterar URL de "Meus Modelos" de `/dashboard` para `/dashboard/models`
   - Remover item "Novo Modelo" (`{ title: "Novo Modelo", url: "/model/new" }`)

5. **Ajustar `src/app/(dashboard)/dashboard/page.tsx`:**
   - Redirecionar `/dashboard` para `/dashboard/models`

### Phase 3 — Validation (V)
**Steps**
1. Verificar que o sidebar exibe apenas "Meus Modelos" sem "Novo Modelo"
2. Verificar que `/dashboard/models` lista todos os modelos do usuário
3. Testar criação, edição, duplicação e exclusão de modelos
4. Verificar que todas as páginas usam o componente `PageHeader` corretamente
5. Verificar que a navegação entre modelo e lista funciona corretamente
6. Executar testes existentes para garantir que nada quebrou

## Evidence & Follow-up
- Componente `PageHeader` reutilizável criado e usado em todas as páginas
- Página de modelos funcional com CRUD completo
- Sidebar atualizado sem "Novo Modelo"
- Testes passando
