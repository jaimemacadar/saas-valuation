---
status: ready
generated: 2026-02-13
agents:
  - type: "feature-developer"
    role: "Implementar as novas páginas e formulários de entrada de dados"
  - type: "frontend-specialist"
    role: "Design e implementação dos componentes UI com Tabs"
phases:
  - id: "phase-1"
    name: "Reestruturação do Sidebar"
    prevc: "E"
  - id: "phase-2"
    name: "Criação da Página Ano Base com Tabs"
    prevc: "E"
  - id: "phase-3"
    name: "Formulários DRE e Balanço Patrimonial"
    prevc: "E"
  - id: "phase-4"
    name: "Validação e Testes"
    prevc: "V"
---

# Plano: Reorganização do Menu Entrada de Dados

> Reorganizar o menu "Entrada de Dados" no sidebar, removendo submenus aninhados e criando páginas com tabs horizontais para DRE e Balanço Patrimonial

## Task Snapshot

- **Primary goal:** Simplificar a navegação do menu "Entrada de Dados", movendo DRE e Balanço Patrimonial para dentro das páginas como tabs horizontais
- **Success signal:** Usuário consegue acessar Ano Base e ver tabs para DRE/Balanço; formulários funcionais para entrada de dados

## Situação Atual vs. Objetivo

### Estrutura Atual do Menu (a ser modificada)
```
Entrada de Dados
├── Ano Base
│   ├── DRE                    ❌ REMOVER
│   └── Balanço Patrimonial    ❌ REMOVER
└── Premissas de Projeção
    ├── DRE                    ❌ REMOVER
    └── Balanço Patrimonial    ❌ REMOVER
```

### Estrutura Objetivo
```
Entrada de Dados
├── Ano Base                   ✅ MANTER (página com tabs)
│   └── [Tabs: DRE | Balanço Patrimonial]
└── Premissas de Projeção      ✅ MANTER (página com tabs)
    └── [Tabs: DRE | Balanço Patrimonial]
```

## Arquivos Envolvidos

### Arquivos a Modificar
| Arquivo | Modificação |
|---------|-------------|
| `src/components/model-sidebar-nav.tsx` | Simplificar menu removendo submenus aninhados |

### Arquivos a Criar
| Arquivo | Descrição |
|---------|-----------|
| `src/app/(dashboard)/model/[id]/input/base/page.tsx` | Página Ano Base com Tabs |
| `src/components/forms/DREBaseForm.tsx` | Formulário de entrada DRE Ano Base |
| `src/components/forms/BalanceSheetBaseForm.tsx` | Formulário de entrada Balanço Ano Base |

### Arquivos de Referência (padrões a seguir)
| Arquivo | Padrão a Copiar |
|---------|-----------------|
| `src/app/(dashboard)/model/[id]/view/dre/page.tsx` | Implementação de Tabs horizontal |
| `src/components/ui/tabs.tsx` | Componente Tabs (Radix UI) |
| `src/app/(dashboard)/model/new/page.tsx` | Estrutura de formulário com Card |

---

## Fases de Implementação

### Phase 1 — Reestruturação do Sidebar

**Objetivo:** Modificar o componente `model-sidebar-nav.tsx` para remover os submenus aninhados

**Arquivo:** `src/components/model-sidebar-nav.tsx`

**Mudança no código (linhas 54-85):**

**DE:**
```typescript
{
  title: 'Entrada de Dados',
  icon: Calculator,
  items: [
    {
      title: 'Ano Base',
      items: [
        { title: 'DRE', url: `/model/${modelId}/input/base/dre` },
        { title: 'Balanço Patrimonial', url: `/model/${modelId}/input/base/balance-sheet` },
      ],
    },
    {
      title: 'Premissas de Projeção',
      items: [
        { title: 'DRE', url: `/model/${modelId}/input/projections/dre` },
        { title: 'Balanço Patrimonial', url: `/model/${modelId}/input/projections/balance-sheet` },
      ],
    },
  ],
}
```

**PARA:**
```typescript
{
  title: 'Entrada de Dados',
  icon: Calculator,
  items: [
    {
      title: 'Ano Base',
      url: `/model/${modelId}/input/base`,
    },
    {
      title: 'Premissas de Projeção',
      url: `/model/${modelId}/input/projections`,
    },
  ],
}
```

**Checklist Phase 1:**
- [ ] Modificar estrutura do menu em `model-sidebar-nav.tsx`
- [ ] Remover lógica de Collapsible aninhado (se necessário)
- [ ] Testar navegação do sidebar

---

### Phase 2 — Criação da Página Ano Base com Tabs

**Objetivo:** Criar página principal de Ano Base com menu horizontal de tabs

**Arquivo a criar:** `src/app/(dashboard)/model/[id]/input/base/page.tsx`

**Estrutura da página:**
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import { DREBaseForm } from "@/components/forms/DREBaseForm"
import { BalanceSheetBaseForm } from "@/components/forms/BalanceSheetBaseForm"

export default async function AnoBasePage({ params }: { params: { id: string } }) {
  const { id } = params

  // Buscar dados do modelo
  const result = await getModelById(id)

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Meus Modelos", href: "/dashboard/models" },
          { label: result.data.company_name, href: `/model/${id}/view/dre` },
          { label: "Ano Base" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold">Entrada de Dados - Ano Base</h1>

        <Tabs defaultValue="dre" className="w-full">
          <TabsList>
            <TabsTrigger value="dre">DRE</TabsTrigger>
            <TabsTrigger value="balance-sheet">Balanço Patrimonial</TabsTrigger>
          </TabsList>

          <TabsContent value="dre" className="space-y-4">
            <DREBaseForm modelId={id} />
          </TabsContent>

          <TabsContent value="balance-sheet" className="space-y-4">
            <BalanceSheetBaseForm modelId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
```

**Checklist Phase 2:**
- [ ] Criar pasta `src/app/(dashboard)/model/[id]/input/base/`
- [ ] Criar `page.tsx` com estrutura de Tabs
- [ ] Importar componentes necessários
- [ ] Testar renderização da página

---

### Phase 3 — Formulários DRE e Balanço Patrimonial

**Objetivo:** Criar formulários funcionais para entrada de dados do Ano Base

#### 3.1 Formulário DRE Base

**Arquivo:** `src/components/forms/DREBaseForm.tsx`

**Campos do formulário (baseado em `DREBaseInputs`):**
| Campo | Label | Tipo | Descrição |
|-------|-------|------|-----------|
| `receita` | Receita Bruta | number | Receita total do ano base |
| `custoMercadoriaVendida` | CMV | number | Custo da mercadoria vendida |
| `despesasOperacionais` | Despesas Operacionais | number | Despesas administrativas e comerciais |
| `despesasFinanceiras` | Despesas Financeiras | number | Juros e encargos financeiros |
| `taxaImposto` | Taxa de Imposto (%) | number | Alíquota de IR/CSLL |

**Estrutura do componente:**
```typescript
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface DREBaseFormProps {
  modelId: string
  initialData?: DREBaseInputs
}

export function DREBaseForm({ modelId, initialData }: DREBaseFormProps) {
  // Form state e handlers
  // Submit action para salvar no model_data
}
```

#### 3.2 Formulário Balanço Patrimonial Base

**Arquivo:** `src/components/forms/BalanceSheetBaseForm.tsx`

**Campos do formulário (baseado em `BalanceSheetBaseInputs`):**

**ATIVO:**
| Campo | Label | Tipo |
|-------|-------|------|
| `caixa` | Caixa e Equivalentes | number |
| `contasReceber` | Contas a Receber | number |
| `estoques` | Estoques | number |
| `outrosAtivosCirculantes` | Outros Ativos Circulantes | number |
| `ativoImobilizado` | Ativo Imobilizado | number |
| `outrosAtivosNaoCirculantes` | Outros Ativos Não Circulantes | number |

**PASSIVO:**
| Campo | Label | Tipo |
|-------|-------|------|
| `fornecedores` | Fornecedores | number |
| `emprestimosCP` | Empréstimos CP | number |
| `outrosPassivosCirculantes` | Outros Passivos Circulantes | number |
| `emprestimosLP` | Empréstimos LP | number |
| `outrosPassivosNaoCirculantes` | Outros Passivos Não Circulantes | number |

**PATRIMÔNIO LÍQUIDO:**
| Campo | Label | Tipo |
|-------|-------|------|
| `capitalSocial` | Capital Social | number |
| `reservas` | Reservas | number |
| `lucrosAcumulados` | Lucros Acumulados | number |

**Validação:** Ativo Total = Passivo Total + Patrimônio Líquido

**Checklist Phase 3:**
- [ ] Criar pasta `src/components/forms/`
- [ ] Criar `DREBaseForm.tsx` com todos os campos
- [ ] Criar `BalanceSheetBaseForm.tsx` com todos os campos
- [ ] Implementar validação de balanço (Ativo = Passivo + PL)
- [ ] Implementar server action para salvar dados
- [ ] Adicionar formatação de moeda nos inputs
- [ ] Testar submissão dos formulários

---

### Phase 4 — Validação e Testes

**Objetivo:** Garantir que todas as funcionalidades estão operando corretamente

**Checklist:**
- [ ] Navegação do sidebar funciona corretamente
- [ ] Tabs alternam entre DRE e Balanço
- [ ] Formulários salvam dados no banco
- [ ] Dados são carregados quando página é reaberta
- [ ] Validação de balanço exibe feedback visual
- [ ] Responsividade em diferentes tamanhos de tela

---

## Dependências Técnicas

- **Componentes UI existentes:** `Tabs`, `Card`, `Input`, `Label`, `Button` (já disponíveis)
- **Server Actions:** `updateModel()` em `src/lib/actions/models.ts`
- **Types:** `DREBaseInputs`, `BalanceSheetBaseInputs` em `src/core/types/index.ts`

## Notas de Implementação

1. **Padrão de Tabs:** Seguir exatamente o padrão usado em `view/dre/page.tsx`
2. **Formulários:** Usar componentes de `@/components/ui/*` já existentes
3. **Persistência:** Salvar no campo `model_data` JSON do modelo
4. **Validação:** Implementar validação em tempo real para o balanço

---

## Rollback

Se necessário reverter:
1. Restaurar `model-sidebar-nav.tsx` para versão anterior
2. Remover arquivos criados em `input/base/` e `components/forms/`
3. Verificar se rotas antigas ainda funcionam
