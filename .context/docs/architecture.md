---
type: doc
name: architecture
description: System architecture, layers, patterns, and design decisions
category: architecture
generated: 2026-01-27
updated: 2026-02-14
status: filled
scaffoldVersion: "2.0.0"
---

## Architecture Notes

The SaaS Valuation system is designed as a modular web application using Next.js, with a clear separation between UI components, domain logic, and infrastructure integrations. The architecture emphasizes maintainability, testability, and scalability, leveraging TypeScript for type safety and Supabase for backend services.

## System Architecture Overview

The application follows a modular monolith approach, where all core modules reside in a single codebase but are organized by domain and responsibility. User requests flow from the frontend (React/Next.js) through domain logic in `src/core/` and interact with Supabase for authentication, data persistence, and file storage. All business logic is isolated from infrastructure concerns.

## Architectural Layers

- **App Layer**: User interface and routing (`src/app/`, `src/components/`)
- **Core Layer**: Domain logic, calculations, and business rules (`src/core/`)
- **Lib Layer**: Utilities, integrations, and shared helpers (`src/lib/`)
  - **Mock Layer**: Development mock system (`src/lib/mock/`) - provides in-memory data for development without backend
- **Types Layer**: Shared type definitions (`src/types/`, `src/core/types/`)
- **Styles Layer**: Design system and global styles (`src/styles/`)

> See [`codebase-map.json`](./codebase-map.json) for complete symbol counts and dependency graphs.

## Detected Design Patterns

| Pattern        | Confidence | Locations                                  | Description                                     |
| -------------- | ---------- | ------------------------------------------ | ----------------------------------------------- |
| Modularization | High       | `src/core/`, `src/lib/`, `src/components/` | Separation of concerns by domain/responsibility |
| Adapter        | Medium     | `src/lib/supabase/`, `src/lib/actions/`    | Abstracts external service integration          |
| Factory        | Medium     | `src/lib/supabase/client.ts`, `server.ts`  | Creates configured Supabase clients             |
| Validation     | High       | `src/core/validators/`                     | Centralized input validation logic              |
| Mock Object    | High       | `src/lib/mock/`                            | In-memory mock system for development           |
| Repository     | Medium     | `src/lib/mock/store.ts`                    | Centralized data access with CRUD operations    |
| Composition    | High       | `src/components/ui/`                       | Composable UI components with Radix UI          |

## Entry Points

- [middleware.ts](../../middleware.ts)
- [src/app/layout.tsx](../../src/app/layout.tsx)
- [src/app/(auth)/login/page.tsx](<../../src/app/(auth)/login/page.tsx>)
- [src/app/(dashboard)/model/[id]/](<../../src/app/(dashboard)/model/[id]/>)

## Public API

| Symbol             | Type      | Location                                                                           |
| ------------------ | --------- | ---------------------------------------------------------------------------------- |
| ApiError           | type      | [src/types/index.ts](../../src/types/index.ts#L21)                                 |
| APIRequest         | type      | [src/core/types/index.ts](../../src/core/types/index.ts#L71)                       |
| ApiResponse        | type      | [src/types/index.ts](../../src/types/index.ts#L14)                                 |
| APIResponse        | type      | [src/core/types/index.ts](../../src/core/types/index.ts#L76)                       |
| AppSidebar         | component | [src/components/app-sidebar.tsx](../../src/components/app-sidebar.tsx#L159)        |
| Assumptions        | type      | [src/core/types/index.ts](../../src/core/types/index.ts#L49)                       |
| AuthSession        | type      | [src/types/user.ts](../../src/types/user.ts#L39)                                   |
| BalanceSheet       | type      | [src/types/financial.ts](../../src/types/financial.ts#L23)                         |
| BalanceSheet       | type      | [src/core/types/index.ts](../../src/core/types/index.ts#L27)                       |
| calculateValuation | function  | [src/core/calculations/valuation.ts](../../src/core/calculations/valuation.ts#L21) |
| calculateWACC      | function  | [src/core/calculations/wacc.ts](../../src/core/calculations/wacc.ts#L27)           |
| createClient       | function  | [src/lib/supabase/server.ts](../../src/lib/supabase/server.ts#L5)                  |
| createModel        | function  | [src/lib/actions/models.ts](../../src/lib/actions/models.ts#L122)                  |
| duplicateModel     | function  | [src/lib/actions/models.ts](../../src/lib/actions/models.ts#L275)                  |

## Internal System Boundaries

Domain logic in `src/core/` is decoupled from infrastructure and UI. Integrations with Supabase are abstracted in `src/lib/supabase/`. Shared types enforce contracts between layers.

## Mock Data System (Development Mode)

O sistema inclui um **modo mock completo** para desenvolvimento sem conexão com Supabase. Ativado via `NEXT_PUBLIC_USE_MOCK_DATA=true`, o mock:

- **Store In-Memory**: Armazena dados em memória com CRUD completo (`src/lib/mock/store.ts`)
- **Auth Mock**: Sistema de autenticação simulada com usuários pré-configurados (`src/lib/mock/auth.ts`)
- **Data Generators**: Gera automaticamente dados de modelos financeiros (`src/lib/mock/data/`)
- **DevModeIndicator**: Badge visual indicando modo mock ativo
- **Auto-calculation**: Calcula automaticamente campos dependentes (Lucro Bruto, EBITDA, etc.)

Arquivos principais:
- `src/lib/mock/index.ts` - API principal do sistema mock
- `src/lib/mock/store.ts` - Armazenamento in-memory com simulação de latência
- `src/lib/mock/auth.ts` - Autenticação mock com sessões
- `src/lib/mock/data/models.ts` - Dados de modelos financeiros
- `src/lib/mock/utils.ts` - Cálculos automáticos de campos

**Documentação completa**: [MOCK_MODE.md](../../MOCK_MODE.md)

## External Service Dependencies

- **Supabase**: Auth, database, and file storage. Uses JWT for authentication and SDK for API calls.
- **Mock System**: Optional in-memory replacement for Supabase during development (zero external dependencies)

## Key Decisions & Trade-offs

- Chose modular monolith for simplicity and maintainability.
- TypeScript for type safety and developer tooling.
- Supabase for rapid backend provisioning and managed auth.

## Diagrams

### Arquitetura Principal

```mermaid
flowchart TD
	UI[UI Layer<br/>Components + Pages]
	CORE[Core Logic<br/>Calculations + Validators]
	LIB[Lib/Integrations<br/>Actions + Utils]
	MOCK[Mock System<br/>In-Memory Store]
	SUPA[Supabase<br/>Auth + DB + Storage]

	UI --> CORE
	CORE --> LIB

	LIB --> |Production| SUPA
	LIB --> |Development| MOCK

	SUPA --> LIB
	MOCK --> LIB
	LIB --> CORE
	CORE --> UI
```

### Sistema de Mock (Modo Desenvolvimento)

```mermaid
flowchart LR
	ENV[ENV: NEXT_PUBLIC_USE_MOCK_DATA=true]
	AUTH[Mock Auth<br/>Usuários Pré-configurados]
	STORE[Mock Store<br/>In-Memory CRUD]
	DATA[Mock Data<br/>Modelos + Users]
	CALC[Auto-Calculation<br/>Campos Dependentes]

	ENV --> AUTH
	ENV --> STORE
	STORE --> DATA
	DATA --> CALC
	CALC --> STORE
```

## Risks & Constraints

- Scaling is limited by Supabase plan and Next.js serverless model.
- All operations are synchronous; no event-driven or queue-based processing.

## UI Component System

O projeto utiliza **Radix UI** e **shadcn/ui** para componentes acessíveis e composáveis:

**Componentes Base** (`src/components/ui/`):
- `button`, `card`, `dialog`, `form`, `input`, `label`, `tabs`
- `sheet`, `sidebar`, `tooltip`, `badge`, `separator`
- Todos seguem padrões de acessibilidade WAI-ARIA

**Componentes de Layout**:
- `PageHeader` - Header reutilizável com breadcrumbs
- `AppSidebar` - Navegação lateral colapsável
- `DevModeIndicator` - Indicador visual de modo mock

**Componentes de Domínio** (`src/app/(dashboard)/`):
- `ModelCard` - Card de modelo com ações CRUD
- Forms de entrada de dados (DRE, Balanço)

## Top Directories Snapshot

- `src/app/` — UI, routing, and pages
  - `(auth)/` — Páginas de autenticação
  - `(dashboard)/` — Páginas protegidas do dashboard
- `src/components/` — UI components and layout
  - `ui/` — Componentes base (Radix UI)
  - `dev/` — Componentes de desenvolvimento
- `src/core/` — Domain logic and calculations
  - `calculations/` — Cálculos de valuation, WACC, etc.
  - `types/` — Tipos de domínio
- `src/lib/` — Utilities and integrations
  - `supabase/` — Cliente e auth Supabase
  - `mock/` — Sistema de mock para desenvolvimento
  - `actions/` — Server actions (Next.js)
- `src/types/` — Shared type definitions
- `src/styles/` — Design system and global styles

## Related Resources

- [Project Overview](./project-overview.md)
- [Data Flow](./data-flow.md)
- [codebase-map.json](./codebase-map.json)
