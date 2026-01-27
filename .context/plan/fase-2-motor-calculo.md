---
status: active
generated: 2026-01-25
timeline: 3-4 semanas
effort: 3-4 pessoa-semanas
agents:
  - type: "architect-specialist"
    role: "Design core module architecture and calculation engine patterns"
  - type: "backend-specialist"
    role: "Implement Server Actions and API Routes for calculations"
  - type: "feature-developer"
    role: "Implement core calculation functions (DRE, BP, FCFF, WACC, Valuation)"
  - type: "test-writer"
    role: "Write comprehensive unit tests for all calculation functions"
  - type: "frontend-specialist"
    role: "Create input forms with React Hook Form and Zod validation"
  - type: "code-reviewer"
    role: "Review code for pure function patterns and zero React dependencies in core/"
  - type: "documentation-writer"
    role: "Document calculation engine API and usage examples"
  - type: "security-auditor"
    role: "Audit API authentication and data validation"
docs:
  - "architecture.md"
  - "project-overview.md"
  - "testing-strategy.md"
  - "glossary.md"
  - "data-flow.md"
  - "security.md"
phases:
  - id: "phase-1"
    name: "Core Module Architecture & Setup"
    prevc: "P"
  - id: "phase-2"
    name: "Calculation Engine Implementation"
    prevc: "E"
  - id: "phase-3"
    name: "API Layer & Forms"
    prevc: "E"
  - id: "phase-4"
    name: "Testing & Documentation"
    prevc: "V"
---

# Fase 2: Motor de Cálculo no Servidor

> Implementar motor de cálculo em src/core/ (100% servidor), expor cálculos via Server Actions e API Routes, criar formulários de entrada com validação. Garantir que core/ não importa nada de React/Next/DOM.

## Task Snapshot

- **Primary goal:** Criar motor de cálculo financeiro server-side isolado, com API REST e Server Actions para valuation de empresas usando FCD
- **Success signal:**
  - Todos os cálculos executam no servidor com precisão decimal.js
  - API REST funcional para integrações externas (agentes IA)
  - Formulários funcionais com validação em tempo real
  - Zero dependências de React/DOM no módulo core/
  - Testes unitários com >90% cobertura
- **Key references:**
  - [Plano MVP - Seção Motor de Cálculo](./saas-valuation-mvp.md#motor-de-calculo)
  - [Fórmulas de DRE, BP, FCFF, WACC](./saas-valuation-mvp.md#formulas-do-dre-conforme-regras-de-negocio)
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)

## Codebase Context

### Stack Tecnológica

- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Cálculos:** decimal.js para precisão financeira
- **Backend:** Supabase (PostgreSQL + RLS)
- **Validação:** Zod (compartilhada client/server)
- **Forms:** React Hook Form + Zod
- **Testes:** Vitest/Jest para core module

### Estrutura Atual

```
src/
├── core/                    # ⚠️ Zero dependências de React/Next/DOM
│   ├── calculations/        # Funções puras de cálculo
│   ├── types/              # TypeScript interfaces
│   ├── validators/         # Validação com Zod
│   └── index.ts            # API pública
├── lib/
│   ├── actions/            # Server Actions
│   │   ├── auth.ts        # ✅ Já implementado
│   │   ├── models.ts      # ✅ Já implementado
│   │   └── valuation.ts   # 🔲 A implementar
│   └── supabase/          # ✅ Já configurado
├── app/
│   ├── api/               # API Routes REST
│   │   ├── valuation/     # 🔲 A implementar
│   │   └── sensitivity/   # 🔲 A implementar
│   └── (dashboard)/       # Páginas autenticadas
└── components/
    └── forms/             # Formulários de entrada
```

### Principais Interfaces (a implementar)

- `FinancialModel` — Modelo completo de valuation
- `DREBaseInputs` — Dados DRE ano base
- `DREProjectionInputs` — Premissas de projeção DRE
- `DRECalculated` — Resultado calculado da DRE
- `BalanceSheetCalculated` — Balanço projetado
- `FCFFCalculated` — Fluxo de Caixa Livre
- `ValuationResults` — Resultado final do valuation
- `CalculationResult<T>` — Padrão Result para erros

### Fórmulas Financeiras (Referência Completa no MVP)

Todas as fórmulas de DRE, Balanço Patrimonial, FCFF e WACC estão documentadas em detalhes na seção [Motor de Cálculo do Plano MVP](./saas-valuation-mvp.md#motor-de-calculo).

## Agent Lineup

| Agent                | Role in this plan                                                                  | Playbook                                                  | First responsibility focus                                                                         |
| -------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Architect Specialist | Design module boundaries, define calculation flow patterns, ensure core isolation  | [Architect Specialist](../agents/architect-specialist.md) | Create architectural blueprint for core/ module with pure functions and zero external dependencies |
| Backend Specialist   | Implement Server Actions and API Routes with proper auth and error handling        | [Backend Specialist](../agents/backend-specialist.md)     | Build Server Actions that bridge UI to core calculations with validation                           |
| Feature Developer    | Implement all core calculation functions using decimal.js following business rules | [Feature Developer](../agents/feature-developer.md)       | Implement DRE, BP, FCFF, WACC, Valuation calculation modules with pure functions                   |
| Test Writer          | Write comprehensive unit tests for all calculation functions                       | [Test Writer](../agents/test-writer.md)                   | Create test suite with >90% coverage for core calculations                                         |
| Frontend Specialist  | Create React Hook Form input forms with Zod validation                             | [Frontend Specialist](../agents/frontend-specialist.md)   | Build DRE/BP input forms with real-time validation and Server Action integration                   |
| Code Reviewer        | Ensure core/ has zero React/Next dependencies and follows pure function patterns   | [Code Reviewer](../agents/code-reviewer.md)               | Review all code for architectural compliance and calculation accuracy                              |
| Documentation Writer | Document calculation engine API, usage examples, and formulas                      | [Documentation Writer](../agents/documentation-writer.md) | Create API documentation for core module and integration guides                                    |
| Security Auditor     | Audit API authentication, input validation, and data access patterns               | [Security Auditor](../agents/security-auditor.md)         | Review API Routes security and ensure proper Supabase RLS integration                              |

## Documentation Touchpoints

| Guide                       | File                                               | Primary Inputs                                                          |
| --------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------- |
| Architecture Notes          | [architecture.md](../docs/architecture.md)         | Core module design, calculation flow, server-first patterns             |
| Project Overview            | [project-overview.md](../docs/project-overview.md) | Fase 2 completion status, calculation engine capabilities               |
| Testing Strategy            | [testing-strategy.md](../docs/testing-strategy.md) | Unit test approach for pure functions, test coverage goals              |
| Glossary & Domain Concepts  | [glossary.md](../docs/glossary.md)                 | Financial terms (DRE, BP, FCFF, WACC, FCD), business logic explanations |
| Data Flow & Integrations    | [data-flow.md](../docs/data-flow.md)               | Calculation flow diagrams, API endpoints, Server Actions data flow      |
| Security & Compliance Notes | [security.md](../docs/security.md)                 | API authentication methods, Supabase RLS rules for model data           |

## Risk Assessment

### Identified Risks

| Risk                                                   | Probability | Impact   | Mitigation Strategy                                                           | Owner                             |
| ------------------------------------------------------ | ----------- | -------- | ----------------------------------------------------------------------------- | --------------------------------- |
| Fórmulas de cálculo incorretas                         | Medium      | Critical | Validar contra casos de teste conhecidos, revisão por especialista financeiro | Feature Developer + Code Reviewer |
| Perda de precisão numérica                             | Low         | High     | Usar decimal.js para todos os cálculos financeiros, criar testes de precisão  | Feature Developer                 |
| Core module acidentalmente importa React               | Medium      | Medium   | Lint rules customizadas, code review rigoroso, testes de dependência          | Architect Specialist              |
| API sem autenticação adequada                          | Low         | Critical | Implementar auth desde início, security audit antes de merge                  | Security Auditor                  |
| Performance de cálculos para modelos grandes (10 anos) | Low         | Medium   | Benchmark com dados reais, otimizar se necessário                             | Backend Specialist                |

### Dependencies

- **Internal:**
  - Fase 1.5 completa (autenticação funcional)
  - Supabase configurado com RLS
  - Estrutura de tipos TypeScript básica
- **External:**
  - Nenhuma dependência externa crítica
  - decimal.js (biblioteca estável)
- **Technical:**
  - Next.js 14+ com App Router
  - TypeScript 5+
  - Node.js 18+

### Assumptions

- Fórmulas de cálculo documentadas no MVP estão corretas e validadas
- Decimal.js fornece precisão suficiente para cálculos financeiros
- Usuários não precisarão de suporte a modelos com >10 anos de projeção no MVP
- Se fórmulas mudarem, apenas core/ precisará ser atualizado (sem impacto na UI)

## Resource Estimation

### Time Allocation

| Phase                             | Estimated Effort      | Calendar Time   | Team Size                               |
| --------------------------------- | --------------------- | --------------- | --------------------------------------- |
| Phase 1 - Core Architecture Setup | 2-3 pessoa-dias       | 1 semana        | 1-2 pessoas (Architect + Backend)       |
| Phase 2 - Calculation Engine      | 5-7 pessoa-dias       | 1.5 semanas     | 2-3 pessoas (Feature Dev + Test Writer) |
| Phase 3 - API Layer & Forms       | 3-5 pessoa-dias       | 1 semana        | 2 pessoas (Backend + Frontend)          |
| Phase 4 - Testing & Documentation | 2-3 pessoa-dias       | 3-5 dias        | 2 pessoas (Test Writer + Doc Writer)    |
| **Total**                         | **12-18 pessoa-dias** | **3-4 semanas** | **-**                                   |

### Required Skills

- **TypeScript avançado:** Tipos complexos, generics, inference
- **Conhecimento de finanças:** DRE, Balanço, Fluxo de Caixa, Valuation por FCD
- **Next.js Server Actions:** Padrões de uso, error handling
- **API REST design:** Autenticação, rate limiting, documentação
- **Testes unitários:** Vitest/Jest, cobertura, mocking

### Resource Availability

- **Available:** Time dedicado do dev principal (você)
- **Blocked:** Nenhum bloqueio esperado
- **Escalation:** Consultar especialista financeiro se fórmulas gerarem dúvidas

## Working Phases

### Phase 1 — Core Module Architecture & Setup (1 semana)

**PREVC Phase:** P (Plan)

**Owner:** Architect Specialist + Backend Specialist

**Steps:**

1. **Definir estrutura de pastas core/**
   - Criar `src/core/types/index.ts` com todas as interfaces TypeScript
   - Criar `src/core/calculations/` para funções de cálculo
   - Criar `src/core/validators/` para schemas Zod
   - Criar `src/core/index.ts` como entry point público

2. **Instalar dependências**

   ```bash
   npm install decimal.js
   npm install -D @types/decimal.js
   npm install -D vitest  # Para testes do core
   ```

3. **Configurar eslint custom rules**
   - Proibir imports de 'react', 'next', 'window', 'document' em `src/core/**`
   - Adicionar lint script ao package.json

4. **Criar interfaces TypeScript base**
   - `FinancialModel`, `DREBaseInputs`, `DREProjectionInputs`, `DRECalculated`
   - `BalanceSheetBaseInputs`, `BalanceSheetProjectionInputs`, `BalanceSheetCalculated`
   - `FCFFCalculated`, `WACCCalculation`, `ValuationResults`
   - `CalculationResult<T>` (padrão Result com `success: boolean` e `data | errors`)

5. **Criar validators Zod**
   - Schema para validar DREBaseInputs
   - Schema para validar BalanceSheetBaseInputs
   - Schema para validar Assumptions (WACC)
   - Exportar tipos inferred do Zod para garantir sync client/server

**Deliverables:**

- [x] Estrutura de pastas core/ criada
- [x] package.json atualizado com decimal.js e vitest
- [x] eslint configurado para proibir deps externas em core/
- [x] Interfaces TypeScript completas em `src/core/types/index.ts`
- [x] Validators Zod em `src/core/validators/index.ts`

**Commit Checkpoint:**

```bash
git add src/core/
git commit -m "feat(core): setup core module architecture and types

- Create isolated core/ module structure
- Add TypeScript interfaces for financial calculations
- Configure Zod validators for input validation
- Add eslint rules to prevent React/DOM imports
- Install decimal.js for financial precision"
```

**Success Criteria:**

- `npm run lint` passa sem erros
- `npm run build` compila sem erros TypeScript
- Nenhum import de React/Next em `src/core/`

---

### Phase 2 — Calculation Engine Implementation (1.5 semanas)

**PREVC Phase:** E (Execute)

**Owner:** Feature Developer + Test Writer

**Steps:**

1. **Implementar `src/core/calculations/dre.ts`**
   - `calculateDRE()`: calcula DRE de um ano baseado no anterior
   - `calculateAllDRE()`: calcula projeção completa de N anos
   - Usar decimal.js para precisão
   - Seguir fórmulas do plano MVP seção "Fórmulas do DRE"
   - Retornar `CalculationResult<DRECalculated>` ou `CalculationResult<DRECalculated[]>`

2. **Implementar `src/core/calculations/balanceSheet.ts`**
   - `calculateBalanceSheet()`: calcula BP de um ano
   - `calculateAllBalanceSheet()`: projeção completa
   - Seguir fórmulas do MVP seção "Fórmulas do Balanço Patrimonial"
   - Integrar com DRE calculado (depreciação, lucros retidos)

3. **Implementar `src/core/calculations/fcff.ts`**
   - `calculateFCFF()`: calcula Fluxo de Caixa Livre para Firma
   - Fórmula: FCFF = EBIT - NCG - CAPEX
   - Depende de DRE e BP calculados

4. **Implementar `src/core/calculations/wacc.ts`**
   - `calculateWACC()`: calcula custo médio ponderado de capital
   - Fórmula: WACC = (E/(E+D)) _ Ke + (D/(E+D)) _ Kd \* (1-T)

5. **Implementar `src/core/calculations/valuation.ts`**
   - `calculateValuation()`: valuation por FCD
   - Descontar FCFF projetados pelo WACC
   - Calcular valor terminal
   - Retornar `ValuationResults`

6. **Implementar `src/core/calculations/sensitivity.ts`**
   - `calculateSensitivityUnivariate()`: análise de uma variável
   - `calculateSensitivityBivariate()`: análise de duas variáveis (grid)

7. **Criar `src/core/calculations/fullValuation.ts`**
   - `executeFullValuation()`: função principal que orquestra tudo
   - Valida inputs → Calcula DRE → BP → FCFF → Valuation
   - Retorna resultado completo ou erros

8. **Atualizar `src/core/index.ts`**
   - Exportar apenas funções públicas
   - Exportar tipos necessários
   - Documentar JSDoc para cada função exportada

**Parallel Task: Test Writer**

9. **Criar testes unitários**
   - `src/core/calculations/dre.test.ts`: casos de teste para DRE
   - `src/core/calculations/balanceSheet.test.ts`: casos para BP
   - `src/core/calculations/fcff.test.ts`: casos para FCFF
   - `src/core/calculations/valuation.test.ts`: casos completos de valuation
   - Incluir casos edge: valores negativos, zeros, números muito grandes
   - Validar precisão decimal
   - Meta: >90% cobertura

10. **Criar dados de teste fixtures**
    - `src/core/__fixtures__/sampleCompany.ts`: empresa exemplo
    - Dados baseados em caso real ou fictício
    - Usar para validar cálculos manualmente

**Deliverables:**

- [x] Todos os módulos de cálculo implementados
- [x] `executeFullValuation()` funcional e testado
- [x] Suite de testes com >90% cobertura
- [x] Fixtures de dados de teste
- [x] JSDoc completo nas funções públicas

**Commit Checkpoint:**

```bash
git add src/core/calculations/ src/core/__fixtures__/
git commit -m "feat(core): implement complete calculation engine

- Implement DRE projection calculations
- Implement Balance Sheet projection calculations
- Implement FCFF (Free Cash Flow to Firm) calculations
- Implement WACC (Weighted Average Cost of Capital)
- Implement DCF valuation with terminal value
- Implement sensitivity analysis (univariate and bivariate)
- Add comprehensive unit tests (>90% coverage)
- Add sample company fixtures for testing"
```

**Success Criteria:**

- `npm run test` passa 100%
- Cobertura de testes >90%
- Executar valuation de empresa exemplo retorna resultados esperados
- Nenhum erro de precisão decimal detectado

---

### Phase 3 — API Layer & Forms (1 semana)

**PREVC Phase:** E (Execute)

**Owner:** Backend Specialist + Frontend Specialist

**Backend Tasks:**

1. **Criar Server Action `src/lib/actions/valuation.ts`**
   - `calculateValuationAction(modelId, input)`: chama executeFullValuation()
   - Verifica autenticação via Supabase
   - Salva resultado no modelo (opcional)
   - Retorna FullValuationResult

2. **Criar API Route `src/app/api/valuation/route.ts`**
   - `POST /api/valuation`: aceita FinancialModelInput no body
   - Verifica autenticação (session ou API Key)
   - Chama executeFullValuation() e retorna JSON
   - `GET /api/valuation?modelId=xxx`: retorna último resultado salvo

3. **Criar API Route `src/app/api/sensitivity/route.ts`**
   - `POST /api/sensitivity`: análise de sensibilidade
   - Suporta tipo 'univariate' e 'bivariate'
   - Retorna matriz de resultados

4. **Documentar APIs**
   - Criar `docs/api-reference.md`
   - Exemplos de requests/responses
   - Códigos de erro

**Frontend Tasks:**

5. **Criar `src/components/forms/DREBaseForm.tsx`**
   - Form com React Hook Form
   - Validação via Zod schema (importado de core/validators)
   - Inputs numéricos formatados (R$)
   - Submit chama calculateValuationAction()
   - Loading state durante cálculo

6. **Criar `src/components/forms/BalanceSheetBaseForm.tsx`**
   - Similar ao DRE
   - Dividido em seções: Ativo Circulante, Ativo Não Circulante, Passivo, PL

7. **Criar `src/components/forms/AssumptionsForm.tsx`**
   - Form para premissas do WACC
   - Taxa livre de risco, beta, prêmio de risco, etc.

8. **Criar `src/components/forms/ProjectionInputsForm.tsx`**
   - Tabela editável inline com anos nas colunas
   - Inputs percentuais (%) para taxas de crescimento
   - Botão "copiar para todos os anos"
   - Botão "aplicar tendência linear"

**Deliverables:**

- [x] Server Action valuation funcional
- [x] API Routes /api/valuation e /api/sensitivity funcionais
- [x] Documentação de API em markdown
- [x] Formulários de entrada com validação
- [x] Integração entre forms e Server Actions

**Commit Checkpoint:**

```bash
git add src/lib/actions/valuation.ts src/app/api/ src/components/forms/
git commit -m "feat(api): add Server Actions and API Routes for valuation

- Implement calculateValuationAction for Server Components
- Add POST /api/valuation endpoint for external integrations
- Add POST /api/sensitivity for sensitivity analysis
- Create React Hook Form input forms with Zod validation
- Add forms for DRE, Balance Sheet, Assumptions, and Projections
- Document API endpoints in docs/api-reference.md"
```

**Success Criteria:**

- Server Action retorna resultado correto quando chamado de componente
- API Route retorna JSON correto ao receber POST com dados válidos
- API retorna 401 se não autenticado
- Formulários validam em tempo real e exibem erros
- Submeter form chama Server Action e atualiza UI

---

### Phase 4 — Testing & Documentation (3-5 dias)

**PREVC Phase:** V (Verify)

**Owner:** Test Writer + Documentation Writer + Security Auditor

**Testing Tasks:**

1. **Testes de integração**
   - Testar Server Action com mock de Supabase
   - Testar API Routes com requests reais (supertest ou similar)
   - Validar que erros de validação retornam status 400

2. **Testes E2E (opcional para MVP)**
   - Playwright ou Cypress
   - Testar fluxo completo: login → criar modelo → preencher forms → calcular

3. **Performance testing**
   - Benchmark: executar valuation com modelo de 10 anos
   - Meta: <2 segundos no servidor
   - Se lento, otimizar cálculos

**Documentation Tasks:**

4. **Atualizar `docs/architecture.md`**
   - Adicionar diagrama do fluxo de cálculo
   - Documentar padrão Result
   - Documentar isolamento do core/

5. **Criar `docs/calculation-engine.md`**
   - Explicar cada função do core
   - Fórmulas utilizadas
   - Exemplos de uso
   - Como estender (adicionar novos cálculos)

6. **Atualizar `docs/api-reference.md`**
   - Endpoints disponíveis
   - Autenticação (session vs API Key)
   - Rate limiting (se aplicável)
   - Códigos de erro

7. **Criar `README.md` na pasta `src/core/`**
   - "Como usar o motor de cálculo"
   - Exemplos de código
   - Regras: zero deps de React/Next

**Security Audit:**

8. **Revisar autenticação nas APIs**
   - Confirmar que API Routes verificam auth
   - Confirmar que RLS do Supabase isola dados por usuário
   - Testar que usuário A não acessa modelos do usuário B

9. **Revisar validação de inputs**
   - Confirmar que todos os inputs são validados com Zod
   - Testar com inputs maliciosos (SQL injection, XSS, etc.)
   - Confirmar que erros de validação não vazam info sensível

**Deliverables:**

- [x] Testes de integração passando
- [x] Performance acceptable (<2s para valuation)
- [x] Documentação técnica completa
- [x] Security audit report (sem issues críticos)
- [x] README no core/ explicando uso

**Commit Checkpoint:**

```bash
git add docs/ src/core/README.md
git commit -m "docs: complete Fase 2 documentation and testing

- Add integration tests for Server Actions and API Routes
- Add performance benchmarks for valuation calculations
- Document calculation engine architecture and formulas
- Update API reference with authentication and endpoints
- Complete security audit (no critical issues)
- Add usage guide in src/core/README.md"
```

**Success Criteria:**

- Todos os testes (unit + integration) passam
- Cobertura >90%
- Documentação revisada e aprovada
- Security audit sem issues críticos
- Performance dentro do esperado

---

## Rollback Plan

### Rollback Triggers

- Critical bugs no cálculo que afetam precisão financeira
- Performance inaceitável (>5s para valuation simples)
- Falhas de segurança detectadas (acesso não autorizado a modelos)
- Erros de validação que bloqueiam uso legítimo

### Rollback Procedures

#### Phase 1 Rollback

- **Action:** Remover pasta `src/core/` criada, reverter package.json
- **Data Impact:** Nenhum (apenas código local)
- **Estimated Time:** <30 minutos

#### Phase 2 Rollback

- **Action:** Reverter commits de implementação do core, manter apenas estrutura
- **Data Impact:** Nenhum (cálculos ainda não expostos)
- **Estimated Time:** <1 hora

#### Phase 3 Rollback

- **Action:** Desabilitar API Routes (retornar 503), remover Server Actions
- **Data Impact:** Modelos salvos mantêm dados, mas cálculos não funcionam
- **Estimated Time:** 1-2 horas
- **Procedimento:**
  ```typescript
  // Temporariamente desabilitar API
  export async function POST(request: NextRequest) {
    return NextResponse.json(
      { success: false, error: "Service temporarily unavailable" },
      { status: 503 },
    );
  }
  ```

#### Phase 4 Rollback

- **Action:** Reverter documentação para estado anterior
- **Data Impact:** Nenhum
- **Estimated Time:** <30 minutos

### Post-Rollback Actions

1. Documentar razão do rollback em `.context/decisions/rollback-fase-2.md`
2. Notificar stakeholders (se aplicável)
3. Criar issue no repositório com detalhes do problema
4. Agendar post-mortem para analisar causa raiz
5. Atualizar plano com aprendizados antes de retry

---

## Evidence & Follow-up

### Artifacts to Collect

- **Code:**
  - Link do PR para merge de fase-2-motor-calculo
  - Cobertura de testes (screenshot ou link do coverage report)
  - Benchmark de performance (logs ou screenshot)
- **Documentation:**
  - `docs/calculation-engine.md` completo
  - `docs/api-reference.md` atualizado
  - `src/core/README.md` criado

- **Testing:**
  - Test suite completo em `src/core/**/*.test.ts`
  - Relatório de security audit (documento ou checklist)

- **Validation:**
  - Exemplo de valuation executado com sucesso (JSON response)
  - Teste de API via curl/Postman (collection exportada)

### Follow-up Actions

| Action                                           | Owner              | Deadline            | Status     |
| ------------------------------------------------ | ------------------ | ------------------- | ---------- |
| Validar fórmulas com especialista financeiro     | Feature Developer  | Final da Fase 2     | 🔲 Pending |
| Criar guia de troubleshooting para erros comuns  | Doc Writer         | Após Fase 2         | 🔲 Pending |
| Implementar rate limiting na API (se necessário) | Backend Specialist | Fase 3 (opcional)   | 🔲 Future  |
| Adicionar cache de cálculos para modelos grandes | Backend Specialist | Fase 3 (otimização) | 🔲 Future  |
| Criar endpoint de health check `/api/health`     | Backend Specialist | Antes de deploy     | 🔲 Pending |

### Success Metrics

- **Cobertura de testes:** >90% no módulo core/
- **Performance:** Valuation completo <2s (servidor local)
- **Zero dependências proibidas:** Nenhum import de React/Next/DOM em core/
- **API funcional:** 100% dos endpoints retornando respostas corretas
- **Documentação:** Todas as seções preenchidas e revisadas

---

## Next Steps After Fase 2

Após completar a Fase 2, avançar para:

1. **Fase 3: Visualização e Dashboard** (2-3 semanas)
   - Implementar tabelas de projeções com TanStack Table
   - Criar gráficos com Recharts
   - Dashboard com overview do valuation

2. **Fase 4: Análise de Sensibilidade Avançada** (1-2 semanas)
   - UI para configurar análise de sensibilidade
   - Gráficos de tornado
   - Grid 2D de sensibilidade

3. **Fase 5: Exportação para Excel** (1 semana)
   - Integrar SheetJS
   - Gerar planilhas formatadas
   - Export de projeções e gráficos

---

## Notes

- **Prioridade:** Esta é a fase mais crítica do projeto. O motor de cálculo é o coração da aplicação.
- **Qualidade sobre velocidade:** Não apressar implementação. Garantir precisão e testes completos.
- **Revisão financeira:** Ideal ter validação de especialista financeiro nas fórmulas.
- **Extensibilidade:** Projetar pensando em futuras features (múltiplos cenários, diferentes métodos de valuation).
