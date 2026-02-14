---
type: skill
name: Commit Message
description: Generate commit messages following conventional commits with scope detection
skillSlug: commit-message
phases: [E, C]
generated: 2026-01-24
status: filled
scaffoldVersion: "2.0.0"
---

# Commit Message Guidelines

## Formato Padrão

Este projeto segue o **Conventional Commits** com scopes específicos:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types Utilizados

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Alterações em documentação
- **refactor**: Refatoração de código sem alterar funcionalidade
- **test**: Adição ou modificação de testes
- **chore**: Tarefas de manutenção (build, configs, etc.)
- **perf**: Melhorias de performance
- **style**: Formatação, semicolons, etc (não afeta lógica)

### Scopes Comuns

Baseado no histórico do projeto:

- **models**: Funcionalidades de modelos de valuation
- **mock**: Sistema de dados mock
- **plans**: Planos e planejamento
- **auth**: Autenticação e autorização
- **dashboard**: Dashboard e visualizações
- **api**: APIs e endpoints
- **db**: Banco de dados e migrations
- **ui**: Componentes UI
- **calculations**: Cálculos financeiros (DRE, FCFF, Balance Sheet, WACC)
- **forms**: Formulários e inputs
- **tables**: Tabelas de dados
- **charts**: Gráficos e visualizações

## Exemplos do Projeto

### Bons Exemplos (do histórico real)

```
feat(plans): reorganize sidebar menu and implement data entry plan with tabs
```
✅ Claro, específico, descreve o que foi feito

```
feat(mock): implement automatic model data calculation on load
```
✅ Indica nova funcionalidade com scope claro

```
docs(mock): identify and document model data calculation issue
```
✅ Documentação com contexto

```
feat(models): implement models management page with CRUD operations
```
✅ Feature completa descrita

```
docs(plan): finalize fase-3-2-ajustes plan with mock system implementation
```
✅ Documentação de planejamento

### Guidelines

1. **Description em português**: Mensagens devem ser em português
2. **Imperative mood**: Use imperativo ("implement", "add", "fix" não "implemented", "added", "fixed")
3. **Seja específico**: Indique qual componente/área foi afetada
4. **Limite de caracteres**: Primeira linha até 72 caracteres
5. **Body opcional**: Use para contexto adicional quando necessário

### Scopes Específicos por Área

#### Cálculos Financeiros
- `calculations/dre`: DRE (Demonstração de Resultados)
- `calculations/fcff`: Free Cash Flow to Firm
- `calculations/balance-sheet`: Balanço Patrimonial
- `calculations/wacc`: WACC e custo de capital
- `calculations/valuation`: Valuation e preço por ação

#### Componentes
- `components/tables`: FCFFTable, DRETable, BalanceSheetTable
- `components/forms`: Formulários de entrada
- `components/charts`: Gráficos (CostCompositionChart, etc)
- `components/ui`: Componentes UI base (shadcn)

#### Actions e Lib
- `actions/models`: CRUD de modelos
- `actions/auth`: Ações de autenticação
- `lib/mock`: Sistema de dados mock
- `lib/supabase`: Cliente Supabase

## Template para Novos Commits

```bash
# Feature nova
feat(<scope>): <descrição clara e concisa>

# Bug fix
fix(<scope>): corrige <problema específico>

# Documentação
docs(<scope>): adiciona/atualiza documentação sobre <tópico>

# Refatoração
refactor(<scope>): refatora <componente> para <melhoria>

# Testes
test(<scope>): adiciona testes para <funcionalidade>
```

## Co-Authored-By

Commits feitos com assistência do Claude devem incluir:

```
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```
