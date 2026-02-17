---
status: active
generated: 2026-02-17
agents:
  - type: "frontend-specialist"
    role: "Implementar toggle de visibilidade das premissas na DRETable"
phases:
  - id: "phase-1"
    name: "Implementação"
    prevc: "E"
    agent: "frontend-specialist"
  - id: "phase-2"
    name: "Validação"
    prevc: "V"
    agent: "frontend-specialist"
---

# Toggle de Visibilidade das Premissas de Projeção na DRE

> Permitir ocultar/exibir premissas de projeção na tabela DRE individualmente (clicando na linha da conta) e globalmente (toggle button)

## Objetivo
Melhorar a visualização do relatório DRE permitindo que o usuário oculte as linhas de premissas de projeção (tipo `premise`), tornando a tabela mais limpa para leitura. As premissas ficam ocultas por padrão e podem ser reveladas:
1. **Individualmente** — clicando na linha da conta relacionada (ex: clicar em "Receita Bruta" revela "Crescimento anual (%)")
2. **Globalmente** — via botão toggle que exibe/oculta todas as premissas de uma vez

## Escopo

### Incluído
- Estado de visibilidade das premissas no `DRETable.tsx`
- Toggle global (botão no header da tabela)
- Toggle individual (clique na linha da conta que possui premissa associada)
- Indicador visual de que uma conta tem premissa expansível (ícone chevron)
- Animação suave de expand/collapse

### Excluído
- Alterações no modelo de dados ou API
- Persistência do estado de visibilidade (será apenas local/sessão)
- Alterações no `DREProjectionForm` ou `DREProjectionTable`

## Arquivo Principal
- `src/components/tables/DRETable.tsx` — Único arquivo a ser modificado

## Plano de Implementação

### Fase 1 — Implementação (Execute)

| # | Task | Descrição | Status |
|---|------|-----------|--------|
| 1.1 | Adicionar estado de visibilidade | Criar `showAllPremises: boolean` (default: `false`) e `expandedAccounts: Set<string>` para controle individual | pending |
| 1.2 | Botão toggle global | Adicionar `Switch` ou `Button` com ícone `Eye/EyeOff` no header da tabela, ao lado do indicador de salvamento | pending |
| 1.3 | Linhas de conta clicáveis | Tornar linhas que possuem premissa associada clicáveis com `cursor-pointer` e ícone `ChevronRight/ChevronDown` | pending |
| 1.4 | Filtrar linhas de premissa | No render da tabela, filtrar linhas `type === "premise"` baseado no estado global e individual | pending |
| 1.5 | Indicadores visuais | Adicionar chevron na coluna de labels das contas que possuem premissas, com rotação animada | pending |

### Fase 2 — Validação (Verify)

| # | Task | Descrição | Status |
|---|------|-----------|--------|
| 2.1 | Testar toggle global | Verificar que todas as premissas são exibidas/ocultas corretamente | pending |
| 2.2 | Testar toggle individual | Verificar que clicar em uma conta expande apenas sua premissa | pending |
| 2.3 | Testar edição de premissas | Verificar que a edição, copy-right e trend continuam funcionando quando visíveis | pending |
| 2.4 | Testar navegação por teclado | Verificar Tab/Enter entre premissas visíveis | pending |

## Detalhes Técnicos

### Mapeamento Conta → Premissa
Usar o campo `premiseField` já existente nas rows para identificar quais contas possuem premissa. Adicionar um campo `parentField` nas rows de premissa para vincular à conta-pai:
- `receitaBruta` → `receitaBrutaGrowth` (Crescimento anual %)
- `impostosEDevolucoes` → `impostosEDevolucoesRate` (Impostos s/ vendas %)
- `cmv` → `cmvRate` (CMV %)
- `despesasOperacionais` → `despesasOperacionaisRate` (Desp. Operacionais %)
- `irCSLL` → `irCSLLRate` (IR/CSLL %)
- `dividendos` → `dividendosRate` (Dividendos %)

### Lógica de Visibilidade
```typescript
// Uma premissa é visível se:
const isPremiseVisible = (parentField: string) => {
  if (showAllPremises) return true;
  return expandedAccounts.has(parentField);
};
```

### Estado
```typescript
const [showAllPremises, setShowAllPremises] = useState(false);
const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
```

### Toggle Global
- Quando ativado: exibe todas as premissas (ignora `expandedAccounts`)
- Quando desativado: volta ao controle individual via `expandedAccounts`

### Toggle Individual
- Clicar na linha da conta adiciona/remove o `field` do `expandedAccounts` Set
- Mostrar ícone `ChevronRight` (colapsado) ou `ChevronDown` (expandido)

### Identificação de Contas com Premissa
Adicionar campo `hasPremise: boolean` e `premiseParentField: string` no tipo `DRERowData` para facilitar a filtragem e o linking.

## Critérios de Sucesso
1. Premissas ocultas por padrão — tabela mais limpa na primeira visualização
2. Clique em conta com premissa revela/oculta a linha de premissa abaixo
3. Toggle global exibe/oculta todas as premissas simultaneamente
4. Edição de premissas funciona normalmente quando visíveis
5. Navegação por teclado (Tab/Enter) funciona entre premissas visíveis
6. Indicador visual claro (chevron) nas contas que possuem premissas
