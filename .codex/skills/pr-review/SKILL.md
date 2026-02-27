---
name: Pr Review
description: Review pull requests against team standards and best practices
phases: [R, V]
---

# PR Review Checklist

## Antes do Merge

### 1. Código e Qualidade

#### TypeScript
- [ ] Código TypeScript sem erros (`npm run type-check`)
- [ ] Sem uso de `any` desnecessário
- [ ] Tipos bem definidos (usar interfaces do `src/types` ou `src/core/types`)
- [ ] Imports organizados e sem dependências circulares

#### Padrões do Projeto
- [ ] Segue estrutura de pastas estabelecida:
  - `src/lib`: Utilitários, Supabase, Mock, Actions
  - `src/components`: UI, Tables, Forms, Charts, Layout
  - `src/app`: Pages e routes (App Router)
  - `src/core`: Calculations, Types, Validators
- [ ] Server Actions em `src/lib/actions`
- [ ] Client components marcados com `'use client'`
- [ ] Validação com Zod nos inputs críticos

#### Cálculos Financeiros
- [ ] Cálculos implementados em `src/core/calculations`
- [ ] Validação de inputs com schemas Zod
- [ ] Tratamento de divisão por zero
- [ ] Valores monetários formatados corretamente
- [ ] Percentuais calculados corretamente

### 2. Testes

#### Cobertura
- [ ] Testes unitários para lógica de negócio
- [ ] Testes de componentes (React Testing Library)
- [ ] Testes passando (`npm test`)
- [ ] Cobertura mantida ou aumentada

#### Localização dos Testes
- [ ] `src/lib/utils/__tests__`: Testes de formatters e utils
- [ ] `src/components/__tests__`: Testes de componentes
- [ ] `src/components/tables/__tests__`: Testes de tabelas

#### Padrões de Teste
```typescript
// Exemplo: src/lib/utils/__tests__/formatters.test.ts
describe('formatCurrency', () => {
  it('should format BRL correctly', () => {
    expect(formatCurrency(1234.56, 'BRL')).toBe('R$ 1.234,56');
  });
});
```

### 3. Mock System

Se o PR afeta o sistema de Mock:

- [ ] Mock data em `src/lib/mock/data`
- [ ] Store atualizado em `src/lib/mock/store.ts`
- [ ] Funções de geração em `src/lib/mock/utils.ts`
- [ ] Type guards funcionando (`isMockUser`, `isMockFinancialModel`)
- [ ] Modo mock ativa/desativa corretamente

### 4. Componentes UI

#### Shadcn/UI
- [ ] Componentes base em `src/components/ui`
- [ ] Uso correto do `cn()` para className merging
- [ ] Tailwind classes seguem padrões do projeto
- [ ] Responsivo (mobile, tablet, desktop)

#### Tabelas
- [ ] FCFFTable, DRETable, BalanceSheetTable seguem padrão
- [ ] Formatação de números consistente
- [ ] Headers claros e descritivos

#### Formulários
- [ ] React Hook Form + Zod validation
- [ ] Mensagens de erro em português
- [ ] Loading states
- [ ] Success/error feedback

### 5. Autenticação e Autorização

- [ ] Middleware protegendo rotas corretas (`middleware.ts`)
- [ ] Server Actions verificando autenticação (`requireAuth`)
- [ ] Supabase RLS policies respeitadas
- [ ] Mock auth funcionando em desenvolvimento

### 6. Performance

- [ ] Imagens otimizadas (next/image)
- [ ] Server Components quando possível
- [ ] Client Components apenas quando necessário
- [ ] Cálculos pesados memoizados
- [ ] Lazy loading de componentes grandes

### 7. Segurança

- [ ] Inputs validados (server-side)
- [ ] Sem SQL injection (usar Supabase query builder)
- [ ] Sem XSS (React escapa por padrão, mas cuidado com dangerouslySetInnerHTML)
- [ ] Environment variables corretas
- [ ] Sem secrets no código

### 8. Documentação

- [ ] README atualizado se necessário
- [ ] JSDoc em funções complexas
- [ ] CLAUDE.md atualizado se padrões mudaram
- [ ] `.context/docs` atualizado para mudanças arquiteturais

### 9. Database

Se afeta banco de dados:

- [ ] Migrations em `supabase/migrations`
- [ ] RLS policies definidas
- [ ] Indexes para queries frequentes
- [ ] Backup plan para dados críticos

### 10. Commits e Mensagens

- [ ] Commits seguem Conventional Commits
- [ ] Mensagens claras e descritivas
- [ ] Escopo (scope) correto
- [ ] Co-authored-by se aplicável

## Checklist de Tipos de PR

### Feature Nova

- [ ] Plano documentado (`.context/plans` se complexo)
- [ ] Testes cobrindo happy path e edge cases
- [ ] Documentação atualizada
- [ ] Não quebra funcionalidades existentes

### Bug Fix

- [ ] Teste reproduzindo o bug
- [ ] Root cause identificado
- [ ] Fix mínimo e focado
- [ ] Regression test adicionado

### Refactoring

- [ ] Comportamento externo inalterado
- [ ] Testes existentes ainda passam
- [ ] Complexidade reduzida
- [ ] Mais legível e manutenível

## Áreas Críticas

### Cálculos Financeiros
Mudanças em `src/core/calculations` requerem:
- [ ] Revisão matemática cuidadosa
- [ ] Testes com valores conhecidos
- [ ] Verificação de edge cases (zero, negativos, infinito)
- [ ] Comparação com resultados esperados

### Autenticação
Mudanças em auth requerem:
- [ ] Teste de fluxos de login/logout
- [ ] Verificação de redirects
- [ ] Teste de rotas protegidas
- [ ] Mock auth funcionando

### Database Schema
Mudanças em schema requerem:
- [ ] Migration testada em desenvolvimento
- [ ] Rollback plan
- [ ] Data migration se necessário
- [ ] RLS policies atualizadas

## Aprovação

✅ **Aprovar** se:
- Todos os checks críticos passam
- Código está limpo e legível
- Testes adequados
- Sem débito técnico significativo

⚠️ **Solicitar mudanças** se:
- Faltam testes
- Código complexo sem documentação
- Padrões não seguidos
- Segurança comprometida

🔴 **Rejeitar** se:
- Quebra funcionalidades existentes
- Vulnerabilidades de segurança
- Performance degradada significativamente