---
type: doc
name: tooling
description: Scripts, IDE settings, automation, and developer productivity tips
category: tooling
generated: 2026-01-27
status: unfilled
scaffoldVersion: "2.0.0"
---

## Guia de Ferramentas & Produtividade

Este projeto usa uma toolchain moderna para maximizar a produtividade do desenvolvedor e a qualidade do código. Scripts e automação são fornecidos para tarefas comuns, e configurações de editor recomendadas ajudam a detectar problemas cedo.

## Ferramentas Necessárias

- **Node.js** (v18+): Runtime JavaScript
- **npm**: Gerenciador de pacotes
- **Supabase CLI** (opcional): Para emulação local de banco de dados e auth
- **Jest**: Framework de testes
- **ESLint**: Linting
- **Prettier**: Formatação de código
- **Tailwind CSS**: Estilização

## Automação Recomendada

- Pre-commit hooks: Executam verificações de lint e formatação antes de commits
- `npm run lint`: Lint em todos os arquivos
- `npm run format`: Formata a codebase
- `npm run test -- --watch`: Executa testes em modo watch

## Configuração de IDE / Editor

- **VS Code**: Editor recomendado
- **Extensões**: ESLint, Prettier, Tailwind CSS IntelliSense, Supabase

## Dicas de Produtividade

- Use aliases de terminal para scripts comuns
- Aproveite o Supabase CLI para desenvolvimento local
- Revise scripts em `package.json` para mais automação

---

Veja também: [Fluxo de Desenvolvimento](./development-workflow.md)
