---
type: doc
name: project-overview
description: High-level overview of the project, its purpose, and key components
category: overview
generated: 2026-01-24
status: unfilled
scaffoldVersion: "2.0.0"
---

## Project Overview

SaaS Valuation é uma plataforma web moderna para análise financeira e avaliação de empresas SaaS. A aplicação oferece ferramentas para profissionais financeiros, investidores e empreendedores calcularem o valor de empresas baseadas em métricas específicas do modelo SaaS, projeções financeiras e metodologias reconhecidas de valuation.

## Codebase Reference

> **Análise Detalhada**: Para contagens completas de símbolos, camadas de arquitetura e grafos de dependência, veja [`codebase-map.json`](./codebase-map.json).

## Quick Facts

- Root: `c:\Users\jaime\Dropbox\Desenvolvimento\3-Projeto Saas Valuation\saas-valuation`
- Linguagens: TypeScript/TSX (arquivos principais)
- Entry Points: [src/app/page.tsx](../../src/app/page.tsx), [src/app/layout.tsx](../../src/app/layout.tsx)
- Análise completa: [`codebase-map.json`](./codebase-map.json)

## Entry Points

- [src/app/page.tsx](../../src/app/page.tsx) — Página inicial da aplicação
- [src/app/layout.tsx](../../src/app/layout.tsx) — Layout raiz e configurações globais
- [middleware.ts](../../middleware.ts) — Middleware Next.js para autenticação e roteamento

## Key Exports

Veja [`codebase-map.json`](./codebase-map.json) para lista completa de exports públicos.

## File Structure & Code Organization

- `src/app/` — Rotas e páginas Next.js (App Router)
- `src/components/` — Componentes React reutilizáveis
- `src/core/` — Lógica de negócio e domínios (company, financial, valuation)
- `src/lib/` — Integrações externas (Supabase) e utilitários
- `src/styles/` — Design system, tokens e estilos globais
- `src/types/` — Definições de tipos TypeScript
- `src/utils/` — Funções utilitárias
- `public/` — Assets estáticos

## Technology Stack Summary

- **Runtime**: Node.js 18+
- **Framework**: Next.js 14+ (React 18+)
- **Linguagem**: TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS + Design System customizado
- **Build**: Next.js build system
- **Linting**: ESLint
- **Formatting**: Prettier (implícito)

## Core Framework Stack

- **Frontend**: Next.js App Router com React Server Components
- **Backend**: Supabase (BaaS) para autenticação, database e storage
- **State Management**: React hooks e contextos
- **Styling**: Tailwind CSS com sistema de design tokens

## UI & Interaction Libraries

Sistema de design customizado em `src/styles/design-system/` com tokens para cores, tipografia, espaçamento, borders e shadows. Componentes UI base em `src/components/ui/`.

## Development Tools Overview

- **Package Manager**: npm
- **Dev Server**: Next.js dev server
- **Type Checking**: TypeScript compiler
- **Linting**: ESLint com configurações Next.js

Veja [Tooling Guide](./tooling.md) para configuração detalhada.

## Getting Started Checklist

1. Instale dependências com `npm install`
2. Configure variáveis de ambiente (Supabase credentials)
3. Execute o servidor de desenvolvimento com `npm run dev`
4. Acesse `http://localhost:3000`
5. Revise [Development Workflow](./development-workflow.md) para processos diários

## Next Steps

- Consulte [Architecture Notes](./architecture.md) para entender a estrutura do sistema
- Leia [Glossary](./glossary.md) para terminologia do domínio
- Veja [Testing Strategy](./testing-strategy.md) para práticas de qualidade

---

Veja também: [Architecture](./architecture.md), [Development Workflow](./development-workflow.md), [Tooling](./tooling.md)
