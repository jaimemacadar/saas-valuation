---
status: unfilled
generated: 2026-01-25
agents:
  - type: "code-reviewer"
    role: "Review code changes for quality, style, and best practices"
  - type: "bug-fixer"
    role: "Analyze bug reports and error messages"
  - type: "feature-developer"
    role: "Implement new features according to specifications"
  - type: "refactoring-specialist"
    role: "Identify code smells and improvement opportunities"
  - type: "test-writer"
    role: "Write comprehensive unit and integration tests"
  - type: "documentation-writer"
    role: "Create clear, comprehensive documentation"
  - type: "performance-optimizer"
    role: "Identify performance bottlenecks"
  - type: "security-auditor"
    role: "Identify security vulnerabilities"
  - type: "frontend-specialist"
    role: "Design and implement user interfaces"
  - type: "architect-specialist"
    role: "Design overall system architecture and patterns"
  - type: "devops-specialist"
    role: "Design and maintain CI/CD pipelines"
docs:
  - "project-overview.md"
  - "architecture.md"
  - "development-workflow.md"
  - "testing-strategy.md"
  - "glossary.md"
  - "security.md"
  - "tooling.md"
phases:
  - id: "phase-1"
    name: "Discovery & Alignment"
    prevc: "P"
  - id: "phase-2"
    name: "Implementation & Iteration"
    prevc: "E"
  - id: "phase-3"
    name: "Validation & Handoff"
    prevc: "V"
---

# Fase 2: Motor de Cálculo no Servidor

> Implementar motor de cálculo financeiro server-side isolado, com API REST e Server Actions para valuation de empresas usando FCD. Garantir precisão, cobertura de testes e zero dependências de React/DOM no core/.

## Task Snapshot

- **Primary goal:** Criar motor de cálculo financeiro server-side isolado, com API REST e Server Actions para valuation de empresas usando FCD.
- **Scope:** Inclui implementação de funções puras de cálculo (DRE, BP, FCFF, WACC, Valuation), API REST, Server Actions, formulários com validação, testes unitários (>90% cobertura), documentação técnica e auditoria de segurança. Exclui integrações externas não relacionadas ao valuation.
- **Success signal:**
  - Todos os cálculos executam no servidor com precisão decimal.js
  - API REST funcional para integrações externas
  - Formulários funcionais com validação em tempo real
  - Zero dependências de React/DOM no módulo core/
  - Testes unitários com >90% cobertura
  - Auditoria de segurança sem issues críticos
- **Key references:**
  - [Plano MVP - Seção Motor de Cálculo](../saas-valuation-mvp.md#motor-de-calculo)
  - [Fórmulas de DRE, BP, FCFF, WACC](../saas-valuation-mvp.md#formulas-do-dre-conforme-regras-de-negocio)
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)

## Codebase Context

- **Arquitetura:**
  - Utils: src/lib, src/lib/supabase, src/lib/actions
  - Models: src/lib/actions
  - Components: src/components/layout, src/components, src/app, src/components/ui, src/components/forms
  - Controllers: src/app/auth/callback
- **Principais Interfaces:**
  - FinancialModel, DREBaseInputs, DREProjectionInputs, DRECalculated, BalanceSheetCalculated, FCFFCalculated, ValuationResults, CalculationResult<T>
- **Stack:** Next.js 14+, TypeScript, decimal.js, Supabase, Zod, React Hook Form, Vitest/Jest

## Agent Lineup

| Agent                | Role in this plan                                                                  | Playbook                                                  | First responsibility focus                                                           |
| -------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Architect Specialist | Design module boundaries, define calculation flow patterns, ensure core isolation  | [Architect Specialist](../agents/architect-specialist.md) | Criar blueprint arquitetural do core/ com funções puras e zero dependências externas |
| Backend Specialist   | Implement Server Actions and API Routes with proper auth and error handling        | [Backend Specialist](../agents/backend-specialist.md)     | Construir Server Actions que conectam UI ao core com validação                       |
| Feature Developer    | Implement all core calculation functions using decimal.js following business rules | [Feature Developer](../agents/feature-developer.md)       | Implementar DRE, BP, FCFF, WACC, Valuation com funções puras                         |
| Test Writer          | Write comprehensive unit tests for all calculation functions                       | [Test Writer](../agents/test-writer.md)                   | Criar suite de testes com >90% cobertura para core/                                  |
| Frontend Specialist  | Create React Hook Form input forms with Zod validation                             | [Frontend Specialist](../agents/frontend-specialist.md)   | Construir formulários de entrada com validação e integração com Server Actions       |
| Code Reviewer        | Ensure core/ has zero React/Next dependencies and follows pure function patterns   | [Code Reviewer](../agents/code-reviewer.md)               | Revisar código para compliance arquitetural e precisão dos cálculos                  |
| Documentation Writer | Document calculation engine API, usage examples, and formulas                      | [Documentation Writer](../agents/documentation-writer.md) | Documentar API do core/ e guias de integração                                        |
| Security Auditor     | Audit API authentication, input validation, and data access patterns               | [Security Auditor](../agents/security-auditor.md)         | Revisar segurança das APIs e integração com Supabase RLS                             |

## Documentation Touchpoints

| Guide                       | File                                               | Primary Inputs                                            |
| --------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| Architecture Notes          | [architecture.md](../docs/architecture.md)         | Design do core, fluxo de cálculo, padrões server-first    |
| Project Overview            | [project-overview.md](../docs/project-overview.md) | Status da Fase 2, capacidades do motor de cálculo         |
| Testing Strategy            | [testing-strategy.md](../docs/testing-strategy.md) | Abordagem de testes para funções puras, meta de cobertura |
| Glossary & Domain Concepts  | [glossary.md](../docs/glossary.md)                 | Termos financeiros, regras de negócio                     |
| Data Flow & Integrations    | [data-flow.md](../docs/data-flow.md)               | Diagramas de fluxo, endpoints, Server Actions             |
| Security & Compliance Notes | [security.md](../docs/security.md)                 | Autenticação, Supabase RLS, validação de dados            |

## Risk Assessment

| Risk                                                   | Probability | Impact   | Mitigation Strategy                                                           | Owner                             |
| ------------------------------------------------------ | ----------- | -------- | ----------------------------------------------------------------------------- | --------------------------------- |
| Fórmulas de cálculo incorretas                         | Medium      | Critical | Validar contra casos de teste conhecidos, revisão por especialista financeiro | Feature Developer + Code Reviewer |
| Perda de precisão numérica                             | Low         | High     | Usar decimal.js para todos os cálculos financeiros, criar testes de precisão  | Feature Developer                 |
| Core module acidentalmente importa React               | Medium      | Medium   | Lint customizado, code review rigoroso, testes de dependência                 | Architect Specialist              |
| API sem autenticação adequada                          | Low         | Critical | Implementar auth desde início, security audit antes de merge                  | Security Auditor                  |
| Performance de cálculos para modelos grandes (10 anos) | Low         | Medium   | Benchmark com dados reais, otimizar se necessário                             | Backend Specialist                |

### Dependencies

- **Internal:** Fase 1.5 completa (autenticação funcional), Supabase com RLS, tipos TypeScript básicos
- **External:** decimal.js
- **Technical:** Next.js 14+, TypeScript 5+, Node.js 18+

### Assumptions

- Fórmulas do MVP estão corretas e validadas
- decimal.js fornece precisão suficiente
- Usuários não precisarão de modelos >10 anos no MVP
- Mudanças nas fórmulas afetam apenas core/

## Resource Estimation

| Phase                             | Estimated Effort      | Calendar Time   | Team Size                               |
| --------------------------------- | --------------------- | --------------- | --------------------------------------- |
| Phase 1 - Core Architecture Setup | 2-3 pessoa-dias       | 1 semana        | 1-2 pessoas (Architect + Backend)       |
| Phase 2 - Calculation Engine      | 5-7 pessoa-dias       | 1.5 semanas     | 2-3 pessoas (Feature Dev + Test Writer) |
| Phase 3 - API Layer & Forms       | 3-5 pessoa-dias       | 1 semana        | 2 pessoas (Backend + Frontend)          |
| Phase 4 - Testing & Documentation | 2-3 pessoa-dias       | 3-5 dias        | 2 pessoas (Test Writer + Doc Writer)    |
| **Total**                         | **12-18 pessoa-dias** | **3-4 semanas** | **-**                                   |

### Required Skills

- TypeScript avançado, finanças, Next.js Server Actions, API REST, testes unitários

### Resource Availability

- **Available:** Dev principal dedicado
- **Blocked:** Nenhum bloqueio esperado
- **Escalation:** Consultar especialista financeiro se dúvidas nas fórmulas

## Working Phases

### Phase 1 — Core Module Architecture & Setup (P)

**Steps:**

1. Definir estrutura de pastas core/
2. Instalar decimal.js, vitest, @types/decimal.js
3. Configurar eslint custom rules
4. Criar interfaces TypeScript base
5. Criar validators Zod
   **Commit Checkpoint:**
   `git commit -m "feat(core): setup core module architecture and types"`

### Phase 2 — Calculation Engine Implementation (E)

**Steps:**

1. Implementar src/core/calculations/dre.ts
2. Implementar src/core/calculations/balance-sheet.ts
3. Implementar src/core/calculations/fcff.ts
4. Implementar src/core/calculations/wacc.ts
5. Implementar src/core/calculations/valuation.ts
6. Implementar src/core/calculations/sensitivity.ts
7. Criar src/core/calculations/full-valuation.ts
8. Atualizar src/core/index.ts
9. Criar testes unitários
10. Criar fixtures de dados de teste
    **Commit Checkpoint:**
    `git commit -m "feat(core): implement complete calculation engine"`

### Phase 3 — API Layer & Forms (E)

**Steps:**

1. Criar Server Action src/lib/actions/valuation.ts
2. Criar API Route src/app/api/valuation/route.ts
3. Criar API Route src/app/api/sensitivity/route.ts
4. Documentar APIs
5. Criar src/components/forms/DREBaseForm.tsx
6. Criar src/components/forms/BalanceSheetBaseForm.tsx
7. Criar src/components/forms/AssumptionsForm.tsx
8. Criar src/components/forms/ProjectionInputsForm.tsx
   **Commit Checkpoint:**
   `git commit -m "feat(api): add Server Actions and API Routes for valuation"`

### Phase 4 — Testing & Documentation (V)

**Steps:**

1. Testes de integração
2. Testes E2E (opcional)
3. Performance testing
4. Atualizar docs/architecture.md
5. Criar docs/calculation-engine.md
6. Atualizar docs/api-reference.md
7. Criar README.md em src/core/
8. Security audit
   **Commit Checkpoint:**
   `git commit -m "docs: complete Fase 2 documentation and testing"`

## Rollback Plan

### Rollback Triggers

- Bugs críticos nos cálculos
- Performance inaceitável
- Falhas de segurança
- Erros de validação bloqueando uso

### Rollback Procedures

- Remover pasta src/core/ e reverter package.json
- Reverter commits do core mantendo estrutura
- Desabilitar API Routes e Server Actions
- Reverter documentação

### Post-Rollback Actions

- Documentar razão do rollback
- Notificar stakeholders
- Criar issue detalhando o problema
- Agendar post-mortem
- Atualizar plano com aprendizados

## Evidence & Follow-up

- Código: PR de merge, cobertura de testes, benchmark de performance
- Documentação: calculation-engine.md, api-reference.md, README.md do core
- Testes: suite completa em src/core/\*_/_.test.ts, relatório de security audit
- Validação: exemplo de valuation executado, teste de API via curl/Postman
- Follow-up: validar fórmulas, guia de troubleshooting, rate limiting, cache, health check
- Métricas de sucesso: cobertura >90%, performance <2s, zero dependências proibidas, API funcional, documentação revisada
