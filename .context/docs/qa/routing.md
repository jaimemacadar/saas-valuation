---
slug: routing
category: architecture
generatedAt: 2026-01-27T02:46:34.046Z
updatedAt: 2026-02-14
---

# How does routing work?

## Visão Geral

O projeto usa **Next.js 15 App Router** com roteamento baseado em arquivos e route groups para organização lógica.

## Estrutura de Rotas

### Layout de Pastas

```
src/app/
├── (auth)/                  # Route group para autenticação
│   ├── login/
│   │   └── page.tsx        → /login
│   ├── signup/
│   │   └── page.tsx        → /signup
│   ├── forgot-password/
│   │   └── page.tsx        → /forgot-password
│   └── reset-password/
│       └── page.tsx        → /reset-password
│
├── (dashboard)/            # Route group protegido
│   ├── layout.tsx          # Layout com sidebar
│   ├── dashboard/
│   │   ├── page.tsx        → /dashboard
│   │   └── models/
│   │       └── page.tsx    → /dashboard/models
│   └── model/
│       ├── new/
│       │   └── page.tsx    → /model/new
│       └── [id]/           # Dynamic route
│           ├── view/
│           │   ├── dre/
│           │   │   └── page.tsx      → /model/:id/view/dre
│           │   ├── balance-sheet/
│           │   │   └── page.tsx      → /model/:id/view/balance-sheet
│           │   └── fcff/
│           │       └── page.tsx      → /model/:id/view/fcff
│           └── input/
│               ├── base/
│               │   └── page.tsx      → /model/:id/input/base
│               └── projections/
│                   └── page.tsx      → /model/:id/input/projections
│
├── layout.tsx              # Root layout
└── page.tsx                → / (landing page)
```

## Route Groups

### `(auth)` - Rotas de Autenticação

**Propósito:** Agrupar páginas de autenticação sem afetar URL

**Características:**
- ❌ Não protegido por autenticação
- ✅ Layout minimalista (sem sidebar)
- ✅ Redirecionam para `/dashboard` se já autenticado

**Rotas:**
- `/login` - Login
- `/signup` - Cadastro
- `/forgot-password` - Solicitar reset de senha
- `/reset-password` - Resetar senha com token

### `(dashboard)` - Rotas Protegidas

**Propósito:** Agrupar páginas do dashboard

**Características:**
- ✅ Protegido por middleware (requer autenticação)
- ✅ Layout com `AppSidebar`
- ✅ Breadcrumbs e navegação

**Rotas principais:**
- `/dashboard` - Dashboard principal
- `/dashboard/models` - Lista de modelos (obsoleto, usar `/dashboard`)
- `/model/new` - Criar novo modelo
- `/model/:id/view/*` - Visualizar demonstrativos
- `/model/:id/input/*` - Entrada de dados

## Dynamic Routes

### Parâmetros de Rota

```typescript
// src/app/(dashboard)/model/[id]/view/dre/page.tsx
interface PageProps {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function DREPage({ params }: PageProps) {
  const modelId = params.id
  // Buscar modelo com o ID
}
```

### Parallel Routes (Futuro)

Não implementado ainda, mas poderia usar:
```
model/[id]/
├── @view/
│   └── dre/page.tsx
└── @input/
    └── base/page.tsx
```

## Navegação

### Link Components

```typescript
import Link from 'next/link'

<Link href="/dashboard">Dashboard</Link>
<Link href={`/model/${modelId}/view/dre`}>Ver DRE</Link>
```

### Navegação Programática

```typescript
import { useRouter } from 'next/navigation'

const router = useRouter()

// Navegar
router.push('/dashboard')

// Voltar
router.back()

// Refresh (re-fetch server data)
router.refresh()

// Substituir (sem adicionar ao histórico)
router.replace('/login')
```

### Server-side Redirects

```typescript
import { redirect } from 'next/navigation'

export default async function Page() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // ...
}
```

## Layouts Aninhados

### Root Layout (`layout.tsx`)

- Aplica a todas as páginas
- Define `<html>` e `<body>`
- Inclui providers globais

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </body>
    </html>
  )
}
```

### Dashboard Layout (`(dashboard)/layout.tsx`)

- Aplica apenas a rotas em `(dashboard)/`
- Inclui `AppSidebar`
- Valida autenticação

```typescript
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) redirect('/login')

  return (
    <>
      <AppSidebar />
      <main className="flex-1">
        {children}
      </main>
    </>
  )
}
```

## Metadata e SEO

```typescript
// src/app/(dashboard)/dashboard/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | SaaS Valuation',
  description: 'Gerencie seus modelos de valuation'
}
```

### Dynamic Metadata

```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const model = await getModelById(params.id)

  return {
    title: `${model.company_name} | SaaS Valuation`,
    description: `Modelo de valuation para ${model.company_name}`
  }
}
```

## Loading States

```typescript
// src/app/(dashboard)/dashboard/loading.tsx
export default function Loading() {
  return <div>Carregando...</div>
}
```

## Error Handling

```typescript
// src/app/(dashboard)/model/[id]/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Algo deu errado!</h2>
      <button onClick={reset}>Tentar novamente</button>
    </div>
  )
}
```

## Middleware Protection

O `middleware.ts` na raiz protege rotas:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Comportamento:**
- Redireciona não autenticados de `/dashboard` para `/login`
- Redireciona autenticados de `/login` para `/dashboard`
- Renova tokens JWT automaticamente

## Server Components vs Client Components

### Server Components (padrão)

```typescript
// Sem 'use client'
export default async function Page() {
  const data = await fetchData() // Pode fazer fetch direto
  return <div>{data}</div>
}
```

**Vantagens:**
- ✅ Acesso direto ao banco
- ✅ Sem JavaScript no cliente
- ✅ SEO friendly

### Client Components

```typescript
'use client' // Necessário!

export default function Interactive() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

**Quando usar:**
- Hooks (`useState`, `useEffect`, etc.)
- Event handlers
- Browser APIs

## Rotas Públicas vs Protegidas

### Públicas (sem auth)
- `/` - Landing
- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`

### Protegidas (requer auth)
- `/dashboard`
- `/model/*`

## Best Practices

✅ **Co-locate** components próximos às páginas que os usam
✅ **Use Server Components** por padrão
✅ **Prefetch automático** com `<Link>` (otimização)
✅ **Loading states** para melhor UX
✅ **Error boundaries** para tratamento de erros
✅ **Metadata** em cada página para SEO
