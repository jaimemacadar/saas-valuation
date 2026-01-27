---
type: doc
name: project-overview
description: High-level overview of the project, its purpose, and key components
category: overview
generated: 2026-01-27
status: unfilled
scaffoldVersion: "2.0.0"
---

## Project Overview

SaaS Valuation is a web application that empowers founders, investors, and analysts to model, analyze, and value SaaS businesses. By combining financial statements, projections, and industry assumptions, it delivers robust valuation outputs and scenario analysis.

## Codebase Reference

> **Detailed Analysis**: For complete symbol counts, architecture layers, and dependency graphs, see [`codebase-map.json`](./codebase-map.json).

## Quick Facts

- Root: `/c/Dev/3-Projeto Saas Valuation/saas-valuation`
- Languages: TypeScript (majority), JavaScript, CSS
- Entry: [src/app/layout.tsx](../../src/app/layout.tsx)
- Full analysis: [`codebase-map.json`](./codebase-map.json)

## Entry Points

- [middleware.ts](../../middleware.ts)
- [src/app/layout.tsx](../../src/app/layout.tsx)
- [src/app/(auth)/login/page.tsx](<../../src/app/(auth)/login/page.tsx>)
- [src/app/(dashboard)/model/[id]/](<../../src/app/(dashboard)/model/[id]/>)

## Key Exports

See [`codebase-map.json`](./codebase-map.json) for the complete list of exports, types, and functions.

## File Structure & Code Organization

- `src/app/` — UI, routing, and pages
- `src/components/` — UI components and layout
- `src/core/` — Domain logic and calculations
- `src/lib/` — Utilities and integrations
- `src/types/` — Shared type definitions
- `src/styles/` — Design system and global styles

## Technology Stack Summary

The project is built with Next.js (React) and TypeScript, using Supabase for backend services (auth, database, storage). Tooling includes Jest for testing, ESLint for linting, and Tailwind CSS for styling.

## Getting Started Checklist

1. Install dependencies with `npm install`.
2. Run the development server with `npm run dev`.
3. Build for production with `npm run build`.
4. Run tests with `npm run test`.
5. Review [Development Workflow](./development-workflow.md) for day-to-day tasks.

---

See also: [Architecture Notes](./architecture.md), [Development Workflow](./development-workflow.md), [Tooling](./tooling.md), [`codebase-map.json`](./codebase-map.json)
