---
status: filled
progress: 0
generated: 2026-02-15
agents:
  - type: "frontend-specialist"
    role: "Implementar componentes de input inline, navegação e UX"
  - type: "architect-specialist"
    role: "Definir fluxo de dados entre Server/Client e estratégia de persistência"
  - type: "test-writer"
    role: "Escrever testes para inputs editáveis e interações"
  - type: "code-reviewer"
    role: "Revisar qualidade, acessibilidade e padrões"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "development-workflow.md"
  - "testing-strategy.md"
phases:
  - id: "phase-1"
    name: "Refatoração da DRETable e Props"
    prevc: "P"
  - id: "phase-2"
    name: "Inputs Inline e Persistência"
    prevc: "E"
  - id: "phase-3"
    name: "UX Avançado e Validação"
    prevc: "V"
lastUpdated: "2026-02-15"
---

# Premissas de Projeção Inline na DRETable

> Implementar linhas de premissas editáveis inline dentro da tabela DRE, com inputs percentuais, copiar para direita, tendência, tooltips e navegação Tab/Enter — conforme item 2.1 do fase-3.md (PRD Item B).

## Task Snapshot

- **Primary goal:** Permitir que o usuário edite as premissas de projeção (taxas %) diretamente na tabela DRE, posicionadas na linha imediatamente abaixo de cada conta projetada, eliminando a necessidade de uma página separada de premissas.
- **Success signal:** Inputs inline renderizam corretamente abaixo de cada conta editável, valores são persistidos via `saveDREProjection()` com recálculo automático, UX com copiar/tendência/tooltips/Tab funcional.
- **Key references:**
  - [Fase 3 Plan](./fase-3.md) — Item 2.1, Tabelas Financeiras com premissas inline
  - [Core Types](../../src/core/types/index.ts) — `DREProjectionInputs`, `DRECalculated`
  - [Server Actions](../../src/lib/actions/models.ts) — `saveDREProjection()`
  - [DRETable atual](../../src/components/tables/DRETable.tsx) — Componente a ser refatorado

## Codebase Context

- **DRETable** (`src/components/tables/DRETable.tsx`): Client Component usando `@tanstack/react-table`. Renderiza `DRECalculated[]` como tabela read-only com 14 linhas (6 editáveis + 8 calculadas).
- **DREProjectionInputs** (`src/core/types/index.ts`): Interface com 6 campos de premissas — `receitaBrutaGrowth`, `impostosEDevolucoesRate`, `cmvRate`, `despesasOperacionaisRate`, `irCSLLRate`, `dividendosRate`.
- **saveDREProjection()** (`src/lib/actions/models.ts`): Server Action que salva `DREProjectionInputs[]` no `model_data` e dispara `recalculateModel()` automaticamente.
- **Página DRE** (`src/app/(dashboard)/model/[id]/view/dre/page.tsx`): Server Component que carrega modelo via `getModelById()` e passa apenas `dreData: DRECalculated[]` ao `DRETable`. Não passa premissas nem modelId.

## Mapeamento Premissa → Conta

| Linha da DRE (existente) | Campo de Premissa | Tipo | Tooltip |
| --- | --- | --- | --- |
| Receita Bruta | `receitaBrutaGrowth` | % crescimento | "% crescimento sobre receita bruta do ano anterior" |
| (-) Impostos sobre Vendas | `impostosEDevolucoesRate` | % taxa | "% sobre Receita Bruta" |
| (-) CMV | `cmvRate` | % taxa | "% sobre Receita Líquida" |
| (-) Despesas Operacionais | `despesasOperacionaisRate` | % taxa | "% sobre Receita Líquida" |
| (-) IR/CSLL | `irCSLLRate` | % taxa | "% sobre LAIR" |
| (-) Dividendos | `dividendosRate` | % taxa | "% sobre Lucro Líquido" |

**Linhas sem premissa** (calculadas): Receita Líquida, Lucro Bruto, EBIT, EBITDA, LAIR, Lucro Líquido, Depreciação, Despesas Financeiras.

## Agent Lineup

| Agent | Role | Foco |
| --- | --- | --- |
| Architect Specialist | Fluxo de dados Server→Client, estratégia de persistência otimista | Desenhar como premissas fluem da page ao componente e voltam ao server |
| Frontend Specialist | Implementar inputs inline, UX e interações | Construir células editáveis, copiar/tendência, navegação Tab |
| Test Writer | Testes de componente e integração | Testar renderização de inputs, edição e callbacks |
| Code Reviewer | Revisão de código | Garantir acessibilidade, performance e padrões |

## Risk Assessment

| Risk | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Lag ao recalcular no servidor a cada edição | Alta | Médio | Debounce de 800ms no save, feedback otimista local |
| Complexidade de navegação Tab entre inputs de N anos | Média | Baixo | Usar refs com mapa de posição [row][col] |
| Revalidação do Server Component desfaz estado local | Alta | Alto | Usar `useOptimistic` ou state local que só sincroniza após confirmação do server |
| Tabela muito larga com premissas + valores | Média | Médio | Premissas em fonte menor, fundo diferenciado, scroll horizontal |

### Dependencies

- **Interna:** Motor de cálculo da Fase 2 (`recalculateModel`) — completo e funcional
- **Interna:** Server Action `saveDREProjection()` — já implementada
- **Técnica:** `@tanstack/react-table` já instalado e em uso no DRETable

### Assumptions

- A estrutura `model_data` no Supabase já suporta `dreProjection: DREProjectionInputs[]`
- O Ano Base (year 0) nunca é editável — premissas começam no Ano 1
- Premissas default para novo modelo: todas em 0%
- Se premissas não existem no model_data, exibir inputs vazios (0%)

---

## Working Phases

### Phase 1 — Refatoração da DRETable e Props

**Objetivo:** Preparar a estrutura de dados e props para suportar linhas de premissas intercaladas.

**Steps:**

1. **Atualizar tipo `DRERowData`** — Adicionar `type: 'premise'` ao union type existente. Adicionar campos opcionais: `premiseField` (keyof `DREProjectionInputs`), `premiseTooltip` (string)

2. **Expandir props de `DRETable`** — Novas props:
   - `projectionInputs?: DREProjectionInputs[]` — premissas atuais
   - `modelId?: string` — para persistência
   - `onProjectionChange?: (data: DREProjectionInputs[]) => void` — callback

3. **Intercalar linhas de premissa no array `rows`** — Após cada linha editável (Receita Bruta, Impostos, CMV, Desp. Op., IR/CSLL, Dividendos), inserir uma linha com:
   ```
   {
     label: '↳ Taxa de crescimento',
     type: 'premise',
     field: 'receitaBrutaGrowth',
     premiseField: 'receitaBrutaGrowth',
     premiseTooltip: '% crescimento sobre receita bruta do ano anterior',
     values: { 1: 5.0, 2: 5.0, ... }  // extraído de projectionInputs
   }
   ```

4. **Atualizar a página DRE** (`src/app/(dashboard)/model/[id]/view/dre/page.tsx`):
   - Extrair `dreProjection` do `model_data` além do `dre`
   - Passar `projectionInputs={dreProjection}` e `modelId={id}` ao `DRETable`

5. **Estilizar linhas de premissa** — Fundo `bg-blue-50/50 dark:bg-blue-950/20`, fonte `text-xs text-muted-foreground`, label com prefixo `↳`

**Commit Checkpoint:** `feat(dre): refactor DRETable to accept projection inputs and interleave premise rows`

---

### Phase 2 — Inputs Inline e Persistência

**Objetivo:** Tornar as linhas de premissa editáveis com inputs reais e persistir mudanças automaticamente.

**Steps:**

1. **Criar componente `PremiseInput`** (`src/components/tables/PremiseInput.tsx`):
   - Input numérico com sufixo visual `%`
   - Formatação automática ao blur (ex: "5" → "5,00%")
   - Validação: aceitar apenas números, range 0–100
   - Props: `value`, `onChange`, `onBlur`, `disabled`, `tabIndex`
   - Tamanho compacto: `w-20 h-7 text-xs text-right`
   - Border sutil, focus ring azul

2. **Renderizar `PremiseInput` nas colunas de anos** — Na definição de colunas do `@tanstack/react-table`, para linhas `type: 'premise'`:
   - Ano Base (year 0): mostra "—" (não editável)
   - Anos 1+: renderiza `<PremiseInput>` com valor do campo correspondente

3. **State local de premissas** — `useState<DREProjectionInputs[]>` inicializado com prop `projectionInputs`. Cada edição atualiza imediatamente o state local (UX responsiva sem esperar servidor)

4. **Hook `useDREProjectionPersist`** (`src/hooks/useDREProjectionPersist.ts`):
   - Recebe `modelId` e `projectionData`
   - Debounce de 800ms após última edição
   - Chama `saveDREProjection()` (Server Action) via `startTransition`
   - Retorna `{ isSaving, lastSavedAt, error }`
   - Indicador visual no header da tabela: spinner "Salvando..." / check "Salvo"
   - Em caso de erro: toast com mensagem via sonner/toast

5. **Atualização pós-save** — Após save bem-sucedido, chamar `router.refresh()` para que o Server Component revalide e os valores calculados (DRECalculated) sejam atualizados na tabela

**Commit Checkpoint:** `feat(dre): implement editable inline premise inputs with auto-save and recalculation`

---

### Phase 3 — UX Avançado e Validação

**Objetivo:** Adicionar funcionalidades avançadas de UX e cobertura de testes.

**Steps:**

1. **Copiar para direita** — Botão ícone (`ChevronsRight` do lucide-react) exibido ao lado do input do Ano 1. Ao clicar, replica o valor do Ano 1 para todos os anos seguintes da mesma premissa

2. **Aplicar tendência** — Popover com dois inputs: "Valor inicial (%)" e "Valor final (%)". Ao confirmar, calcula interpolação linear e preenche os anos intermediários:
   ```
   valor[i] = valorInicial + (valorFinal - valorInicial) * (i / (n - 1))
   ```

3. **Navegação Tab/Enter** — Lógica de foco com `useRef` e mapa bidimensional `inputRefs[rowIdx][colIdx]`:
   - `Tab`: avança para próxima célula na mesma linha (próximo ano)
   - `Shift+Tab`: retrocede
   - `Enter`: avança para mesma coluna na próxima linha de premissa
   - `Escape`: remove foco do input

4. **Tooltips** — Ícone `Info` (lucide-react) no label de cada linha de premissa. Hover/click exibe tooltip via componente `Tooltip` do shadcn/ui com texto explicativo da base de cálculo

5. **Testes unitários** (`src/components/tables/__tests__/`):
   - `PremiseInput.test.tsx`: renderização, formatação %, edição, validação min/max
   - `DRETable.test.tsx` (expandir existente): linhas de premissa intercaladas, callback `onProjectionChange`
   - `useDREProjectionPersist.test.ts`: debounce, chamada ao save, tratamento de erro

6. **Testes de integração**:
   - Copiar para direita: verifica que anos 2–N recebem valor do Ano 1
   - Tendência: verifica interpolação linear correta
   - Navegação: verifica foco correto com Tab/Enter

**Commit Checkpoint:** `feat(dre): add copy-right, trend, tab-navigation, tooltips and comprehensive tests`

---

## Entregáveis

- [ ] `DRETable` refatorada com linhas de premissa intercaladas (`type: 'premise'`)
- [ ] Componente `PremiseInput` reutilizável
- [ ] Hook `useDREProjectionPersist` com debounce e feedback visual
- [ ] Página DRE atualizada passando `projectionInputs` e `modelId`
- [ ] Copiar para direita
- [ ] Aplicar tendência (interpolação linear)
- [ ] Navegação Tab/Enter entre inputs
- [ ] Tooltips explicativos em cada premissa
- [ ] Testes unitários e de integração

## Critérios de Aceite

- 6 linhas de premissa editáveis renderizam abaixo das respectivas contas
- Ano Base não é editável (mostra "—")
- Edições são salvas automaticamente com debounce de 800ms
- Indicador visual de "Salvando..." / "Salvo" presente
- Recálculo automático reflete nos valores calculados da DRE
- Copiar para direita replica valor para todos os anos
- Tendência preenche interpolação linear entre valor inicial e final
- Tab navega horizontalmente, Enter verticalmente entre premissas
- Tooltips explicam a base de cálculo de cada premissa
- Build sem erros TypeScript
- Testes passando

## Rollback Plan

### Triggers
- Bug que quebra visualização existente da DRE
- Performance degradada (tabela com lag > 500ms)
- Erros de cálculo após save de premissas

### Procedimentos
- **Phase 1:** Reverter props adicionais — DRETable volta a ser read-only, sem impacto em dados
- **Phase 2:** Remover PremiseInput e hook — dados já salvos permanecem intactos no model_data
- **Phase 3:** Remover UX extras — funcionalidade base de edição inline mantida

### Post-Rollback
1. Documentar causa raiz
2. Corrigir e re-implementar fase afetada

## Arquivos Afetados

| Arquivo | Ação | Fase |
| --- | --- | --- |
| `src/components/tables/DRETable.tsx` | Modificar | 1, 2, 3 |
| `src/components/tables/PremiseInput.tsx` | Criar | 2 |
| `src/hooks/useDREProjectionPersist.ts` | Criar | 2 |
| `src/app/(dashboard)/model/[id]/view/dre/page.tsx` | Modificar | 1 |
| `src/components/tables/__tests__/PremiseInput.test.tsx` | Criar | 3 |
| `src/components/tables/__tests__/DRETable.test.tsx` | Modificar | 3 |
| `src/hooks/__tests__/useDREProjectionPersist.test.ts` | Criar | 3 |
