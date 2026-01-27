---
tipo: doc
nome: tooling
descrição: Scripts, configurações de IDE, automação e dicas de produtividade para desenvolvedores
categoria: ferramentas
gerado: 2026-01-27
status: preenchido
scaffoldVersion: "2.0.0"
---

## Guia de Ferramentas & Produtividade

Este projeto utiliza uma cadeia de ferramentas moderna para maximizar a produtividade e a qualidade do código. Scripts e automações são fornecidos para tarefas comuns, e configurações recomendadas de editor ajudam a identificar problemas cedo.

## Ferramentas Necessárias

- **Node.js** (v18+): Runtime JavaScript
- **npm**: Gerenciador de pacotes
- **Supabase CLI** (opcional): Para emulação local de banco e auth
- **Jest**: Framework de testes
- **ESLint**: Linter
- **Prettier**: Formatação de código
- **Tailwind CSS**: Estilização

## Automação Recomendada

- Hooks de pre-commit: Executam lint e format antes dos commits
- `npm run lint`: Lint em todos os arquivos
- `npm run format`: Formata o código
- `npm run test -- --watch`: Testes em modo watch

## Configuração de IDE / Editor

- VS Code: Editor recomendado
- Extensões: ESLint, Prettier, Tailwind CSS IntelliSense, Supabase

## Dicas de Produtividade

- Use aliases de terminal para scripts comuns
- Aproveite o Supabase CLI para desenvolvimento local
