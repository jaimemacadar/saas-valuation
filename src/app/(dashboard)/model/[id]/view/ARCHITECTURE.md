# Arquitetura de Componentes - Visualizações Financeiras

## Server vs Client Components

### Server Components (RSC)

**Pages** (`page.tsx` files):
- `dre/page.tsx` - Fetches model data via `getModelById()`
- `balance-sheet/page.tsx` - Fetches model data via `getModelById()`
- `fcff/page.tsx` - Fetches model data via `getModelById()`
- `layout.tsx` - Shared layout with model header

**Responsabilidades:**
- Data fetching do Supabase
- Autenticação/autorização (via Server Actions)
- SEO metadata
- Initial page structure

**Benefícios:**
- Reduz bundle JavaScript no client
- Melhor performance inicial (LCP)
- Server-side data fetching seguro

### Client Components

**Tabelas Interativas:**
- `DRETable.tsx` - `'use client'` - Precisa de @tanstack/react-table
- `BalanceSheetTable.tsx` - `'use client'` - Drill-down expansível
- `FCFFTable.tsx` - `'use client'` - Cores condicionais interativas

**Gráficos:**
- `RevenueChart.tsx` - `'use client'` - Recharts requer DOM
- `CostCompositionChart.tsx` - `'use client'`
- `EBITDAChart.tsx` - `'use client'`
- `FCFFChart.tsx` - `'use client'`

**Responsabilidades:**
- Interatividade (sorting, filtering, hover)
- Renderização de bibliotecas client-only (Recharts)
- Expansão/colapso de seções
- Tooltips e hover states

**Benefícios:**
- Melhor UX com interatividade instantânea
- Permite uso de hooks (useState, useEffect)
- Suporte a bibliotecas client-only

## Data Flow

```
[Server Page]
    ↓ (async getModelById)
[Server Action]
    ↓ (fetch Supabase)
[Model Data]
    ↓ (props)
[Client Table/Chart Component]
    ↓ (render with interactions)
[User sees interactive visualization]
```

## Performance Strategy

1. **Code Splitting:**
   - Recharts components importados com `next/dynamic`
   - Lazy loading de gráficos não visíveis

2. **Data Optimization:**
   - Server Actions carregam apenas dados necessários
   - Cálculos feitos no servidor (já implementado na Fase 2)

3. **Bundle Size:**
   - @tanstack/react-table (~50KB gzipped) - tree-shaking automático
   - recharts (~100KB gzipped) - dynamic import onde possível

4. **Loading States:**
   - Suspense boundaries em cada página
   - Skeleton screens enquanto carrega

## Exemplo de Implementação

```tsx
// Server Component (page.tsx)
export default async function DREPage({ params }: { params: { id: string } }) {
  const result = await getModelById(params.id);

  if (!result.success) notFound();

  // Parse model_data to get calculated DRE
  const modelData = result.data.model_data as { dre?: DRECalculated[] };

  return (
    <Suspense fallback={<DRETableSkeleton />}>
      <DRETable data={modelData.dre || []} />
    </Suspense>
  );
}

// Client Component (DRETable.tsx)
'use client';

export function DRETable({ data }: { data: DRECalculated[] }) {
  // Use @tanstack/react-table for interactivity
  const table = useReactTable({ ... });

  return <div>{/* Interactive table */}</div>;
}
```

## Security Notes

- **Nenhum segredo no client**: Todas as queries Supabase via Server Actions
- **RLS ativo**: Usuário só vê seus próprios modelos
- **Validação dupla**: Zod no servidor + TypeScript no client
