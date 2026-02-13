---
status: ready
generated: 2026-02-12
agents:
  - type: "architect-specialist"
    role: "Definir arquitetura do sistema de mock e padrões de alternância"
  - type: "feature-developer"
    role: "Implementar dados mock, providers e serviços"
  - type: "test-writer"
    role: "Validar funcionamento do sistema de mock"
docs:
  - "architecture.md"
  - "development-workflow.md"
  - "testing-strategy.md"
phases:
  - id: "phase-1"
    name: "Estrutura de Dados Mock"
    prevc: "P"
  - id: "phase-2"
    name: "Sistema de Alternância"
    prevc: "E"
  - id: "phase-3"
    name: "Integração e Testes"
    prevc: "V"
---

# Sistema de Mock de Dados para Desenvolvimento

> Criar um sistema de mock de dados que permita testar a aplicação em modo de desenvolvimento sem acessar o Supabase de produção, com alternância fácil entre modos dev/prod

## Task Snapshot

- **Primary goal:** Permitir desenvolvimento e testes locais sem dependência do Supabase, mantendo a mesma interface de dados
- **Success signal:** Aplicação funcionando completamente com dados mock, alternância entre modos via variável de ambiente
- **Key references:**
  - [Architecture Notes](../docs/architecture.md)
  - [Development Workflow](../docs/development-workflow.md)
  - Fixtures existentes: `src/core/__fixtures__/sampleCompany.ts`

## Codebase Context

### Estrutura de Dados Atual

**Tabela Principal: `financial_models`**
```typescript
type FinancialModelBasic = {
  id: string;
  user_id: string;
  company_name: string;
  ticker_symbol?: string;
  description?: string;
  model_data: unknown; // JSON com dados de valuation
  created_at: string;
  updated_at: string;
};
```

**Tipos de Valuation (model_data):**
- `DREBaseInputs` / `DREProjectionInputs`
- `BalanceSheetBaseInputs` / `BalanceSheetProjectionInputs`
- `WACCCalculation`
- `FullValuationInput`

**Serviços Afetados:**
- `src/lib/actions/models.ts` - CRUD de modelos financeiros
- `src/lib/actions/auth.ts` - Autenticação
- `src/lib/supabase/client.ts` - Cliente browser
- `src/lib/supabase/server.ts` - Cliente server

**Fixtures Existentes:**
- `sampleDREBase`, `sampleDREProjection`
- `sampleBalanceSheetBase`, `sampleBalanceSheetProjection`
- `sampleWACC`, `sampleFullValuationInput`
- Empresas de exemplo: SaaS médio porte, Startup, Empresa madura

## Agent Lineup

| Agent | Role in this plan | First responsibility focus |
| --- | --- | --- |
| Architect Specialist | Definir padrões de abstração e injeção de dependência | Design do DataProvider interface |
| Feature Developer | Implementar mock data, providers e adapters | Criar dados mock realistas e completos |
| Test Writer | Validar comportamento idêntico entre mock e real | Testes de integração do sistema |

## Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (Pages, Components, Server Actions)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Service Layer                        │
│  getModels(), createModel(), getModelById(), etc.           │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│    Mock Provider        │   │   Supabase Provider     │
│   (Development)         │   │    (Production)         │
│                         │   │                         │
│  - In-memory store      │   │  - Real database        │
│  - Seeded data          │   │  - Auth integration     │
│  - Fast iteration       │   │  - Full features        │
└─────────────────────────┘   └─────────────────────────┘
              │                           │
              └─────────────┬─────────────┘
                            ▼
                  NEXT_PUBLIC_USE_MOCK_DATA
                    (env variable)
```

## Working Phases

### Phase 1 — Estrutura de Dados Mock

**Objetivo:** Criar dados mock completos e realistas para todas as entidades

**Steps:**

1. **Criar arquivo de dados mock de usuários**
   - Local: `src/lib/mock/data/users.ts`
   - Incluir: usuário admin, usuário comum, usuário demo
   - Campos: id, email, name, role, subscription, preferences

2. **Criar arquivo de dados mock de modelos financeiros**
   - Local: `src/lib/mock/data/models.ts`
   - Incluir: 5-8 modelos de exemplo com diferentes estágios
   - Usar fixtures existentes de `sampleCompany.ts`
   - Modelos: Startup tech, SaaS médio porte, Empresa madura, E-commerce

3. **Criar tipos e interfaces do sistema mock**
   - Local: `src/lib/mock/types.ts`
   - Interface `MockDataStore`
   - Interface `MockUser`
   - Type guards para validação

4. **Criar índice de exportação**
   - Local: `src/lib/mock/index.ts`

**Deliverables:**
- `src/lib/mock/data/users.ts`
- `src/lib/mock/data/models.ts`
- `src/lib/mock/types.ts`
- `src/lib/mock/index.ts`

**Commit Checkpoint:**
```bash
git commit -m "feat(mock): add mock data structure and sample data"
```

---

### Phase 2 — Sistema de Alternância

**Objetivo:** Implementar providers e lógica de alternância entre mock e produção

**Steps:**

1. **Configurar variável de ambiente**
   - Adicionar em `.env.local.example`:
     ```env
     NEXT_PUBLIC_USE_MOCK_DATA=true
     ```
   - Adicionar em `.env.development`:
     ```env
     NEXT_PUBLIC_USE_MOCK_DATA=true
     ```

2. **Criar utilitário de detecção de modo**
   - Local: `src/lib/mock/config.ts`
   - Função `isMockMode(): boolean`
   - Constante `MOCK_MODE` para uso em server/client

3. **Criar Mock Data Store (in-memory)**
   - Local: `src/lib/mock/store.ts`
   - Classe `MockDataStore` com operações CRUD
   - Métodos: `getModels`, `getModelById`, `createModel`, `updateModel`, `deleteModel`
   - Estado persistente durante a sessão (em memória)
   - Seed automático com dados iniciais

4. **Criar Mock Auth Provider**
   - Local: `src/lib/mock/auth.ts`
   - Função `getMockUser()` - retorna usuário demo
   - Função `mockSignIn()`, `mockSignOut()`
   - Simular delays realistas (50-100ms)

5. **Criar wrapper de serviços**
   - Local: `src/lib/services/models.ts` (novo)
   - Funções que checam `isMockMode()` e delegam para mock ou real
   - Manter mesma assinatura das funções originais

6. **Atualizar Server Actions**
   - Modificar `src/lib/actions/models.ts`
   - Adicionar condicional no início de cada função
   - Se mock mode, usar `MockDataStore`
   - Se não, usar Supabase normalmente

**Deliverables:**
- `src/lib/mock/config.ts`
- `src/lib/mock/store.ts`
- `src/lib/mock/auth.ts`
- `.env.local.example` atualizado
- `src/lib/actions/models.ts` modificado

**Commit Checkpoint:**
```bash
git commit -m "feat(mock): implement mock data store and mode switching"
```

---

### Phase 3 — Integração e Testes

**Objetivo:** Validar sistema completo e documentar uso

**Steps:**

1. **Criar testes para MockDataStore**
   - Local: `src/lib/mock/__tests__/store.test.ts`
   - Testar todas operações CRUD
   - Testar persistência em memória
   - Testar seed inicial

2. **Criar teste de integração**
   - Verificar que actions funcionam em mock mode
   - Verificar que dados são retornados corretamente
   - Verificar que operações CRUD funcionam

3. **Testar fluxo completo da aplicação**
   - Login em mock mode
   - Criar novo modelo
   - Editar modelo existente
   - Deletar modelo
   - Visualizar lista de modelos

4. **Adicionar indicador visual de modo**
   - Componente `DevModeIndicator`
   - Mostrar badge quando em mock mode
   - Visível apenas em desenvolvimento

5. **Documentar uso do sistema**
   - Atualizar README com instruções
   - Documentar variáveis de ambiente
   - Explicar como adicionar novos dados mock

**Deliverables:**
- `src/lib/mock/__tests__/store.test.ts`
- `src/components/dev/DevModeIndicator.tsx`
- README atualizado

**Commit Checkpoint:**
```bash
git commit -m "feat(mock): add tests, dev indicator and documentation"
```

## Arquivos a Criar/Modificar

### Novos Arquivos
| Arquivo | Descrição |
| --- | --- |
| `src/lib/mock/config.ts` | Configuração e detecção de modo |
| `src/lib/mock/types.ts` | Tipos do sistema mock |
| `src/lib/mock/store.ts` | Store in-memory com CRUD |
| `src/lib/mock/auth.ts` | Mock de autenticação |
| `src/lib/mock/data/users.ts` | Dados de usuários mock |
| `src/lib/mock/data/models.ts` | Dados de modelos mock |
| `src/lib/mock/index.ts` | Índice de exportação |
| `src/lib/mock/__tests__/store.test.ts` | Testes do store |
| `src/components/dev/DevModeIndicator.tsx` | Indicador visual |

### Arquivos Modificados
| Arquivo | Modificação |
| --- | --- |
| `src/lib/actions/models.ts` | Adicionar condicional para mock mode |
| `.env.local.example` | Adicionar `NEXT_PUBLIC_USE_MOCK_DATA` |

## Risk Assessment

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy |
| --- | --- | --- | --- |
| Dados mock ficarem desatualizados | Medium | Medium | Manter tipos sincronizados, criar script de validação |
| Comportamento diferente entre mock e prod | Low | High | Testes de integração comparando ambos modos |
| Exposição acidental do mock em produção | Low | Medium | Verificação no build, warning em console |

### Dependencies
- **Técnicas:** Estrutura de tipos já existente em `src/types/` e `src/core/types/`
- **Fixtures:** Aproveitar dados de `src/core/__fixtures__/sampleCompany.ts`

### Assumptions
- Variáveis de ambiente `NEXT_PUBLIC_*` são acessíveis tanto no client quanto server
- Next.js Server Actions suportam lógica condicional baseada em env vars
- Dados em memória são suficientes (não precisa persistir entre refreshes em dev)

## Success Criteria

- [ ] Aplicação inicia e funciona completamente com `NEXT_PUBLIC_USE_MOCK_DATA=true`
- [ ] Todas operações CRUD funcionam com mock data
- [ ] Alternância entre modos funciona sem restart do servidor
- [ ] Indicador visual mostra quando está em mock mode
- [ ] Testes passam para mock store
- [ ] Documentação clara de como usar e estender

## Rollback Plan

### Rollback Triggers
- Sistema de mock causando bugs em produção
- Comportamento inesperado nas Server Actions
- Performance degradada

### Rollback Procedures
**Phase 1 Rollback:** Deletar pasta `src/lib/mock/`
**Phase 2 Rollback:** Reverter mudanças em `src/lib/actions/models.ts`, remover env vars
**Phase 3 Rollback:** Reverter testes e componente DevModeIndicator

## Evidence & Follow-up

**Artifacts a coletar:**
- Screenshots da aplicação funcionando em mock mode
- Output dos testes do MockDataStore
- PR link com todas as mudanças

**Follow-up:**
- Considerar adicionar mais cenários de dados mock
- Avaliar necessidade de mock para outras features (relatórios, exports)
- Documentar processo de adicionar novos dados mock para a equipe
