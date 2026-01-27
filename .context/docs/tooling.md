---
type: doc
name: tooling
description: Scripts, IDE settings, automation, and developer productivity tips
category: tooling
generated: 2026-01-27
status: unfilled
scaffoldVersion: "2.0.0"
---

## Tooling & Productivity Guide

This project uses a modern toolchain to maximize developer productivity and code quality. Scripts and automation are provided for common tasks, and recommended editor settings help catch issues early.

## Required Tooling

- **Node.js** (v18+): JavaScript runtime
- **npm**: Package manager
- **Supabase CLI** (optional): For local database and auth emulation
- **Jest**: Testing framework
- **ESLint**: Linting
- **Prettier**: Code formatting
- **Tailwind CSS**: Styling

## Recommended Automation

- Pre-commit hooks: Run lint and format checks before commits
- `npm run lint`: Lint all files
- `npm run format`: Format codebase
- `npm run test -- --watch`: Run tests in watch mode

## IDE / Editor Setup

- VS Code: Recommended editor
- Extensions: ESLint, Prettier, Tailwind CSS IntelliSense, Supabase

## Productivity Tips

- Use terminal aliases for common scripts
- Leverage Supabase CLI for local development
- Review scripts in `package.json` for more automation

---

See also: [Development Workflow](./development-workflow.md)
