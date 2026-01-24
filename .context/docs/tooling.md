---
type: doc
name: tooling
description: Scripts, IDE settings, automation, and developer productivity tips
category: tooling
generated: 2026-01-24
status: unfilled
scaffoldVersion: "2.0.0"
---

## Tooling & Productivity Guide

Este documento reúne scripts, automações e configurações de editor que mantêm os contribuidores eficientes.

## Required Tooling

- **Node.js**: v18+ (recomendado v20 LTS)
  - Instalação: [nodejs.org](https://nodejs.org)
- **npm**: Incluído com Node.js
- **Git**: Para controle de versão
- **VS Code**: Editor recomendado (opcional mas preferido)

## Recommended Automation

- **Pre-commit Hooks**: Considerar Husky para lint e format automáticos
- **Linting**: `npm run lint` antes de commits
- **Formatting**: ESLint com auto-fix `npm run lint -- --fix`
- **Type Checking**: `npx tsc --noEmit` para verificação rápida
- **Watch Mode**: `npm run dev` para desenvolvimento com hot reload

## IDE / Editor Setup

### VS Code Extensions Recomendadas:

- **ESLint**: dbaeumer.vscode-eslint
- **TypeScript**: Incluído nativamente
- **Tailwind CSS IntelliSense**: bradlc.vscode-tailwindcss
- **Prettier**: esbenp.prettier-vscode (opcional)
- **GitLens**: eamodio.gitlens (opcional)

### Configurações do Workspace:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Productivity Tips

- Use `npm run dev` para desenvolvimento local com hot reload
- Utilize TypeScript IntelliSense para autocompletar
- Configure snippets personalizados para componentes React
- Use `git stash` para trocar rapidamente entre branches

---

Veja também: [Development Workflow](./development-workflow.md)
