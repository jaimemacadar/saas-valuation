---
status: filled
generated: 2026-02-14
agents:
  - type: "feature-developer"
    role: "Implementar o novo layout dos cards"
  - type: "frontend-specialist"
    role: "Design e UX dos botões de ação e interação do card"
phases:
  - id: "phase-1"
    name: "Refatorar ModelCard - Remover DropdownMenu e Adicionar Botões"
    prevc: "E"
  - id: "phase-2"
    name: "Tornar Card Clicável para Abrir Modelo"
    prevc: "E"
  - id: "phase-3"
    name: "Validação Visual e Funcional"
    prevc: "V"
---

# Card Valuations - Melhorar Layout dos Cards na Página Meus Modelos

> Redesign dos cards na página "Meus Modelos": substituir o menu de três pontos verticais (DropdownMenu) por botões de ação visíveis no card (Editar, Duplicar, Excluir), e tornar o card inteiro clicável para navegar ao modelo.

## Task Snapshot
- **Primary goal:** Melhorar a UX dos cards de modelo, tornando as ações principais visíveis e acessíveis sem necessidade de abrir um menu dropdown.
- **Success signal:** Os cards exibem botões de Editar, Duplicar e Excluir no canto inferior direito; clicar em qualquer área do card (exceto nos botões de ação) navega para o modelo; os dialogs de edição, confirmação de exclusão e duplicação continuam funcionando corretamente.

## Codebase Context

### Arquivos Envolvidos
| Arquivo | Papel | Tipo de Alteração |
| --- | --- | --- |
| `src/app/(dashboard)/dashboard/models/model-card.tsx` | Componente principal do card | **Modificação principal** |
| `src/app/(dashboard)/dashboard/models/page.tsx` | Página que renderiza o grid de cards | Sem alteração |
| `src/components/ui/card.tsx` | Componente base Card (shadcn) | Sem alteração |
| `src/components/ui/button.tsx` | Componente Button (shadcn) | Sem alteração |
| `src/components/ui/tooltip.tsx` | Tooltip para os botões de ação | Verificar existência |

### Estado Atual do ModelCard
- **Menu DropdownMenu** com trigger `MoreVertical` (3 pontos) no `CardHeader`
- **4 ações:** Abrir (Eye → Link), Editar (Edit → Dialog), Duplicar (Copy → Server Action), Excluir (Trash2 → Confirmation Dialog)
- **States:** `showDeleteDialog`, `showEditDialog`, `isDeleting`, `isDuplicating`, `isUpdating`
- **Navegação Abrir:** `/model/{id}/view/dre`

### Layout Alvo
```
┌──────────────────────────────────────────┐
│  CardHeader                              │  ← Clicável (abre modelo)
│  ┌──────────────────────────────────────┐│
│  │ Company Name                         ││
│  │ Ticker Symbol                        ││
│  └──────────────────────────────────────┘│
│  CardContent                             │  ← Clicável (abre modelo)
│  ┌──────────────────────────────────────┐│
│  │ Descrição (line-clamp-2)             ││
│  └──────────────────────────────────────┘│
│  CardFooter                              │
│  ┌──────────────────────────────────────┐│
│  │ Atualizado em...    [✏️] [📋] [🗑️]  ││
│  │                      Edit Copy Trash ││
│  └──────────────────────────────────────┘│
└──────────────────────────────────────────┘
```

## Working Phases

### Phase 1 — Refatorar ModelCard: Remover DropdownMenu e Adicionar Botões

**Objetivo:** Substituir o `DropdownMenu` por botões de ação icon-only no `CardFooter`.

**Steps**
1. **Remover o DropdownMenu** do `CardHeader`
   - Remover imports: `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuTrigger`, `MoreVertical`, `Eye`
   - Limpar o JSX do dropdown no header

2. **Adicionar botões de ação no CardFooter**
   - Reorganizar o `CardFooter` para usar `flex justify-between items-center`
   - Lado esquerdo: manter "Atualizado em {data}"
   - Lado direito: grupo de 3 botões icon-only com `gap-1`
   - Botões com variante `ghost`, tamanho `icon` (`h-8 w-8`):
     - **Editar** (`Edit` icon) → abre `showEditDialog`
     - **Duplicar** (`Copy` icon) → executa `handleDuplicate()`, mostra `Loader2` se `isDuplicating`
     - **Excluir** (`Trash2` icon) → abre `showDeleteDialog`, classe `text-destructive hover:text-destructive`
   - Adicionar `Tooltip` em cada botão para acessibilidade (ex: "Editar modelo", "Duplicar modelo", "Excluir modelo")
   - Cada botão deve incluir `e.stopPropagation()` e `e.preventDefault()` para evitar que o clique propague para o card

3. **Manter os Dialogs existentes** (Edit e Delete) sem alteração funcional

**Verificações:**
- [ ] Botões renderizam corretamente no footer
- [ ] `stopPropagation` impede navegação ao clicar nos botões
- [ ] Dialogs de Editar e Excluir abrem normalmente
- [ ] Duplicar executa a server action e mostra loading

### Phase 2 — Tornar o Card Inteiro Clicável

**Objetivo:** Permitir que clicar em qualquer parte do card (exceto botões de ação) navegue para o modelo.

**Steps**
1. **Envolver o Card com navegação**
   - Usar `useRouter` do Next.js para navegação programática
   - Adicionar `onClick` no elemento `Card` que chama `router.push(\`/model/${model.id}/view/dre\`)`
   - Adicionar `cursor-pointer` e efeitos hover (`hover:shadow-md transition-shadow`) ao card
   - Garantir que o card tenha `role="link"` e `tabIndex={0}` para acessibilidade
   - Tratar `onKeyDown` para `Enter` e `Space` para navegação via teclado

2. **Isolar os botões de ação**
   - Nos handlers `onClick` dos botões Editar, Duplicar e Excluir, chamar `e.stopPropagation()` para impedir a navegação
   - Testar que cliques nos botões não acionam a navegação do card

**Verificações:**
- [ ] Clicar no header, conteúdo ou espaço vazio do card navega para o modelo
- [ ] Clicar em Editar, Duplicar ou Excluir NÃO navega — executa a ação esperada
- [ ] Hover no card mostra feedback visual (shadow/elevação)
- [ ] Navegação via teclado funciona (Enter/Space)

### Phase 3 — Validação Visual e Funcional

**Objetivo:** Garantir que todas as funcionalidades existentes continuam operando e que o layout é responsivo.

**Steps**
1. **Teste visual em diferentes breakpoints**
   - Mobile (1 coluna): verificar que botões não quebram o layout
   - Tablet (2 colunas): verificar alinhamento
   - Desktop (3 colunas): verificar espaçamento

2. **Teste funcional das ações**
   - Editar: abrir dialog, alterar dados, salvar → toast de sucesso
   - Duplicar: clicar → loading spinner → modelo duplicado → redirecionamento
   - Excluir: clicar → confirmation dialog → confirmar → toast + redirecionamento
   - Abrir: clicar no card → navegar para `/model/{id}/view/dre`

3. **Testes de acessibilidade**
   - Tooltips aparecem no hover dos botões
   - Navegação por tab funciona (card → botões)
   - Screen readers anunciam as ações corretamente (`aria-label`)

**Commit Checkpoint**
- `git commit -m "feat(models): replace dropdown menu with inline action buttons on model cards"`

## Decisões Técnicas

| Decisão | Escolha | Justificativa |
| --- | --- | --- |
| Navegação do card | `router.push()` via `onClick` | Permite `stopPropagation` nos botões; mais controle que `<Link>` wrapper |
| Estilo dos botões | `ghost` + `icon` size | Consistente com o design system existente; não compete visualmente com o conteúdo do card |
| Posição dos botões | CardFooter, lado direito | Padrão UX comum; não interfere no conteúdo principal do card |
| Tooltip nos botões | Sim, com `Tooltip` do shadcn | Necessário pois botões icon-only precisam de label textual |

## Rollback Plan
- **Reversão simples:** como a alteração é limitada ao arquivo `model-card.tsx`, um `git revert` do commit é suficiente para restaurar o comportamento anterior com o DropdownMenu.
