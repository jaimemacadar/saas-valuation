---
type: doc
name: tooling
description: Scripts, IDE settings, automation, and developer productivity tips
category: tooling
generated: 2026-01-27
updated: 2026-02-19
status: filled
scaffoldVersion: "2.0.0"
---

## Guia de Ferramentas & Produtividade

Este projeto usa uma toolchain moderna para maximizar a produtividade do desenvolvedor e a qualidade do código. Scripts NPM cobrem as operações mais comuns, o sistema mock elimina a necessidade de Supabase para desenvolvimento diário, e as configurações de editor recomendadas detectam problemas antes do commit.

## Ferramentas Necessárias

| Ferramenta | Versão | Finalidade | Instalação |
|------------|--------|-----------|------------|
| **Node.js** | v18+ | Runtime JavaScript/TypeScript | [nodejs.org](https://nodejs.org) |
| **npm** | v9+ | Gerenciador de pacotes (incluído com Node.js) | — |
| **Git** | v2.x+ | Controle de versão | [git-scm.com](https://git-scm.com) |
| **Supabase CLI** | opcional | Emulação local de DB e Auth | `npm install -g supabase` |
| **VS Code** | recomendado | Editor com suporte a extensões do projeto | [code.visualstudio.com](https://code.visualstudio.com) |

### Ferramentas de Build/Dev (instaladas via npm)

- **Next.js 15** — Framework full-stack (App Router)
- **TypeScript** — Tipagem estática
- **Tailwind CSS** — Estilização utility-first
- **ESLint** — Análise estática de código
- **Jest + ts-jest** — Framework de testes
- **Decimal.js** — Aritmética de precisão financeira

## Scripts NPM

```bash
# Desenvolvimento
npm run dev          # Servidor dev em http://localhost:3000 (hot reload)
npm run build        # Build de produção otimizado
npm run start        # Servir build de produção localmente

# Qualidade de Código
npm run lint         # ESLint em todos os arquivos TypeScript/TSX
npm run typecheck    # Verificação de tipos sem emitir arquivos

# Testes
npm run test         # Todos os testes com Jest
npm run test:watch   # Modo watch (re-executa ao salvar)
npm run test:coverage # Relatório de cobertura de código
```

## Automação Recomendada

### Pre-commit com lint-staged

O projeto está configurado para verificar qualidade antes de cada commit. Ao fazer `git commit`, automaticamente executa lint nos arquivos staged.

### Alias de Desenvolvimento Rápido

Adicione ao seu shell (`.bashrc` / `.zshrc`):

```bash
# Navegar para o projeto
alias saas='cd /path/to/saas-valuation'

# Desenvolvimento rápido com mock
alias dev-mock='NEXT_PUBLIC_USE_MOCK_DATA=true npm run dev'

# Executar testes relacionados a um arquivo
alias test-watch='npm run test -- --watch'
```

### Modo Mock para Desenvolvimento Offline

O modo mock elimina a necessidade de conexão com Supabase durante o desenvolvimento:

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
```

**Usuários mock disponíveis:**
- `admin@example.com` / qualquer senha — acesso completo
- `user@example.com` / qualquer senha — acesso básico

## Configuração de IDE / Editor

### VS Code (Recomendado)

**Extensões essenciais:**

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",        // Tailwind IntelliSense
    "dbaeumer.vscode-eslint",           // ESLint integrado
    "esbenp.prettier-vscode",           // Prettier formatter
    "ms-vscode.vscode-typescript-next", // TypeScript melhorado
    "Prisma.prisma",                    // Suporte a schema Supabase
    "formulahendry.auto-rename-tag"     // Renomear tags JSX
  ]
}
```

**Settings recomendadas:**

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Dicas de Produtividade

### Atalhos de Navegação no Código

- `Ctrl+P` (VS Code) — Abrir arquivo por nome rapidamente
- `Ctrl+Shift+F` — Busca global no projeto
- `F12` — Ir para definição de tipo/função
- `Alt+F12` — Peek de definição sem sair do arquivo atual

### Anatomia de uma Feature Nova

```
1. src/core/types/index.ts       ← Adicionar tipos necessários
2. src/core/calculations/        ← Implementar cálculos/lógica
3. src/lib/actions/              ← Server Actions para persistência
4. src/components/               ← Componentes de UI
5. src/app/(dashboard)/          ← Página/rota correspondente
6. __tests__/                    ← Testes para cada camada
```

### Verificação Rápida de Saúde do Projeto

```bash
# Tudo de uma vez
npm run lint && npm run typecheck && npm run test && npm run build
```

---

Veja também: [Fluxo de Desenvolvimento](./development-workflow.md)
