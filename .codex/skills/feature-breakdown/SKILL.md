---
name: Feature Breakdown
description: Break down features into implementable tasks
phases: [P]
---

# Feature Breakdown Guidelines

## Processo de Decomposição

### 1. Compreensão do Requisito

Antes de quebrar uma feature, responda:

```markdown
## Feature Understanding

### Objetivo
O que o usuário quer alcançar?

### Contexto
Por que isso é necessário? Qual problema resolve?

### Escopo
O que está incluído? O que está FORA do escopo?

### Critérios de Aceitação
- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

### Dependências
- Depende de Feature X?
- Depende de Migration Y?
- Depende de API Z?
```

### 2. Análise de Impacto

Identifique áreas afetadas:

```
Feature: Adicionar análise de sensibilidade ao modelo

IMPACTO:
├── Frontend
│   ├── Nova página: /model/[id]/sensitivity
│   ├── Novo componente: SensitivityAnalysisChart
│   └── Atualizar: ModelSidebarNav (adicionar link)
├── Backend
│   ├── Novo cálculo: calculateSensitivity() em src/core/calculations
│   ├── Nova action: getSensitivityAnalysis()
│   └── Atualizar: FinancialModel type (adicionar campo)
├── Database
│   └── Nova coluna: sensitivity_data JSONB
└── Tests
    ├── Unit: calculateSensitivity.test.ts
    └── Component: SensitivityAnalysisChart.test.tsx
```

### 3. Decomposição em Tasks

Use hierarquia **Epic > Feature > Task**:

```markdown
## Epic: Advanced Valuation Features

### Feature: Sensitivity Analysis

#### Task 1: Core Calculation Logic
**Estimativa**: 2-3h
**Tipo**: Backend
**Prioridade**: Alta
**Dependências**: Nenhuma

Implementar função de cálculo de sensibilidade:
- [ ] Criar `calculateSensitivityUnivariate()` em src/core/calculations/sensitivity.ts
- [ ] Criar `calculateSensitivityBivariate()` para análise 2D
- [ ] Adicionar schemas Zod para validação
- [ ] Adicionar testes unitários

**Arquivos**:
- src/core/calculations/sensitivity.ts (novo)
- src/core/types/index.ts (atualizar)
- src/core/validators/index.ts (atualizar)

#### Task 2: Database Schema
**Estimativa**: 1h
**Tipo**: Database
**Prioridade**: Alta
**Dependências**: Nenhuma

Adicionar suporte no banco:
- [ ] Criar migration para adicionar coluna sensitivity_data
- [ ] Atualizar RLS policies se necessário
- [ ] Atualizar mock data em src/lib/mock/data/models.ts

**Arquivos**:
- supabase/migrations/YYYYMMDD_add_sensitivity_data.sql (novo)
- src/lib/mock/data/models.ts (atualizar)

#### Task 3: Server Actions
**Estimativa**: 2h
**Tipo**: Backend
**Prioridade**: Alta
**Dependências**: Task 1, Task 2

Criar Server Actions para CRUD:
- [ ] Implementar getSensitivityAnalysis()
- [ ] Implementar updateSensitivityAnalysis()
- [ ] Adicionar validação e auth checks
- [ ] Integrar com mock system

**Arquivos**:
- src/lib/actions/sensitivity.ts (novo)

#### Task 4: UI Components
**Estimativa**: 4h
**Tipo**: Frontend
**Prioridade**: Média
**Dependências**: Task 3

Criar componentes de visualização:
- [ ] SensitivityTable: tabela de resultados
- [ ] SensitivityChart: gráfico interativo (Recharts)
- [ ] SensitivityForm: form para inputs
- [ ] Adicionar testes de componentes

**Arquivos**:
- src/components/sensitivity/SensitivityTable.tsx (novo)
- src/components/sensitivity/SensitivityChart.tsx (novo)
- src/components/sensitivity/SensitivityForm.tsx (novo)

#### Task 5: Page Integration
**Estimativa**: 2h
**Tipo**: Frontend
**Prioridade**: Média
**Dependências**: Task 4

Integrar na aplicação:
- [ ] Criar página /model/[id]/sensitivity
- [ ] Atualizar ModelSidebarNav com novo link
- [ ] Conectar Server Actions
- [ ] Loading e error states

**Arquivos**:
- src/app/(dashboard)/model/[id]/sensitivity/page.tsx (novo)
- src/components/model-sidebar-nav.tsx (atualizar)

#### Task 6: Documentation & Polish
**Estimativa**: 1h
**Tipo**: Docs
**Prioridade**: Baixa
**Dependências**: Task 5

Documentar e refinar:
- [ ] Adicionar JSDoc nas funções principais
- [ ] Atualizar README se necessário
- [ ] Adicionar ao glossary.md
- [ ] Screenshots para documentação
```

## Técnicas de Estimativa

### Story Points vs Horas

**Horas**: Mais preciso para tasks pequenas e bem definidas
**Story Points**: Melhor para comparação relativa e velocidade de equipe

### Planning Poker

Para equipes, use Planning Poker:
- Fibonacci: 1, 2, 3, 5, 8, 13, 21
- Todos revelam estimativa simultaneamente
- Discuta divergências

### Três Estimativas

Para incerteza alta, use três valores:

```
Otimista: 2h
Realista: 4h
Pessimista: 8h

Estimativa Final = (O + 4R + P) / 6 = (2 + 16 + 8) / 6 = 4.3h
```

## Padrões de Decomposição

### Por Camada (Vertical Slice)

✅ **Recomendado**: Entrega valor end-to-end

```
Task 1: Sensitivity Analysis - Happy Path
├── Cálculo básico (univariate)
├── Server Action
├── UI básico
└── Página de exibição

Task 2: Sensitivity Analysis - Advanced
├── Cálculo bivariado
├── Charts interativos
└── Export para Excel
```

### Por Componente (Horizontal Slice)

⚠️ **Cuidado**: Não entrega valor até todas as camadas estarem prontas

```
Task 1: Todos os cálculos
Task 2: Todos os Server Actions
Task 3: Todos os componentes UI
Task 4: Todas as páginas
```

## Template de Task

```markdown
### Task: [Nome Descritivo]

**Estimativa**: [Horas ou Story Points]
**Tipo**: [Frontend/Backend/Database/Infra/Docs]
**Prioridade**: [Alta/Média/Baixa]
**Dependências**: [Task IDs ou "Nenhuma"]
**Assignee**: [Nome ou "Não atribuído"]

**Descrição**:
[2-3 frases explicando O QUE e POR QUE]

**Acceptance Criteria**:
- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

**Technical Notes**:
- [Decisões técnicas]
- [Considerações de performance]
- [Edge cases conhecidos]

**Arquivos Afetados**:
- src/path/to/file.ts (novo/atualizar/deletar)
- src/path/to/another.tsx (atualizar)

**Testing Strategy**:
- [ ] Unit tests
- [ ] Component tests
- [ ] Integration tests (se necessário)
- [ ] Manual testing checklist

**Definition of Done**:
- [ ] Code implementado
- [ ] Testes passando
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Merged to main
```

## Exemplos Reais do Projeto

### Exemplo 1: Feature Simples

```markdown
### Feature: Exportar modelo para Excel

**Complexidade**: Baixa
**Estimativa Total**: 6-8h

#### Task 1: Excel Generation Logic (3h)
- Implementar função generateExcelFromModel()
- Usar biblioteca xlsx
- Formatar colunas DRE, FCFF, Balance Sheet
- Testes unitários

#### Task 2: Server Action (1h)
- Criar exportModelToExcel()
- Gerar arquivo e retornar blob
- Auth check

#### Task 3: UI Button (2h)
- Adicionar botão "Exportar" no ModelPage
- Loading state
- Download automático
- Toast de sucesso/erro
```

### Exemplo 2: Feature Complexa

```markdown
### Feature: Multi-company Comparison

**Complexidade**: Alta
**Estimativa Total**: 30-40h

#### Phase 1: Data Model (8h)
- Migration: comparison_groups table
- Migration: comparison_items table
- RLS policies
- Mock data
- Types e schemas Zod

#### Phase 2: Backend (10h)
- Server Actions: CRUD para comparisons
- Cálculo de métricas comparativas
- Normalização de dados
- Testes

#### Phase 3: UI Components (12h)
- ComparisonTable com sort/filter
- ComparisonChart (bar chart)
- ComparisonForm (select companies)
- Testes de componentes

#### Phase 4: Integration (6h)
- Página /dashboard/comparisons
- Navegação
- Loading/error states
- Polish UX

#### Phase 5: Documentation (4h)
- User guide
- API docs
- Screenshots
- Tutorial video
```

## Checklist de Decomposição

### Antes de Começar

- [ ] Requisito bem compreendido
- [ ] Objetivos claros
- [ ] Critérios de aceitação definidos
- [ ] Stakeholders alinhados
- [ ] Escopo acordado

### Durante Decomposição

- [ ] Tasks independentes quando possível
- [ ] Cada task entrega valor ou é building block claro
- [ ] Estimativas realistas
- [ ] Dependências identificadas
- [ ] Riscos mapeados
- [ ] Definition of Done definido

### Depois da Decomposição

- [ ] Tasks priorizadas
- [ ] Sequência lógica definida
- [ ] Resources necessários identificados
- [ ] Timeline realista
- [ ] Review por outro dev (se possível)

## Critérios de Tamanho de Task

### Task Muito Pequena (<1h)
- Combinar com outras tasks relacionadas
- Pode ser overhead de context switching

### Task Ideal (1-8h)
- ✅ Completável em um dia ou menos
- ✅ Fácil de estimar
- ✅ Claro quando está "done"

### Task Muito Grande (>8h)
- ❌ Quebrar em sub-tasks
- ❌ Difícil de estimar
- ❌ Alto risco

## Comunicação de Tasks

### Para Desenvolvedores

Foque em:
- Arquivos afetados
- Padrões técnicos
- Edge cases
- Testing strategy

### Para Product Owners

Foque em:
- User value
- Business logic
- Acceptance criteria
- Demo scenario

### Para Stakeholders

Foque em:
- Timeline
- Milestones
- Dependencies
- Risks

## Tracking e Reporting

### Burndown

```
Task Status:
✅ Done: 8 tasks (40h)
🚧 In Progress: 2 tasks (12h)
⏳ Todo: 5 tasks (28h)

Progress: 50% complete
Estimated completion: 3 days
```

### Velocity

```
Sprint 1: 35h completed
Sprint 2: 42h completed
Sprint 3: 38h completed

Average Velocity: 38h/sprint
Next Sprint Capacity: 40h planned
```