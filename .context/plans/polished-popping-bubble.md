# Plano: Melhorias de Performance — Vercel React Best Practices

## Contexto

A auditoria contra as 57 regras do Vercel React Best Practices identificou 3 categorias prioritárias de melhoria: (1) saves sequenciais que poderiam ser paralelos, (2) barrel files de runtime prejudicando tree-shaking, e (3) uso de `&&` em renderização condicional com risco de renderizar valores falsy. A aplicação já está bem estruturada — são ajustes pontuais, não uma refatoração arquitetural.

---

## Tarefa 1 — Eliminar Barrel Files de Runtime

**Regra:** `bundle-barrel-imports`
**Impacto:** CRÍTICO — barrel files impedem tree-shaking, aumentando o bundle

### Arquivos barrel a eliminar (runtime, não tipos)

| Barrel File | Importadores | Ação |
|---|---|---|
| `src/components/layout/index.ts` | Nenhum consumidor encontrado | Deletar |
| `src/lib/mock/index.ts` | 6 arquivos | Reescrever imports para paths diretos |
| `src/lib/supabase/index.ts` | Nenhum consumidor direto (usam `/server` ou `/client`) | Deletar |

### Barrel files a MANTER (apenas tipos — eliminados na compilação)

| Barrel File | Justificativa |
|---|---|
| `src/types/index.ts` | Só exporta tipos (apagados pelo TS) |
| `src/core/types/index.ts` | Só exporta interfaces/types |
| `src/core/validators/index.ts` | Contém Zod schemas (runtime), MAS é usado apenas em server actions — não afeta bundle do client |
| `src/core/index.ts` | Re-exporta types + cálculos server-side — nenhum componente client importa dele |

### Mudanças concretas

**1a. Deletar `src/components/layout/index.ts`**
Nenhum arquivo importa de `@/components/layout` (todos importam diretamente de `./Header`, `./Sidebar`, etc.)

**1b. Deletar `src/lib/supabase/index.ts`**
Todos os consumidores já importam de `@/lib/supabase/server` ou `@/lib/supabase/client` diretamente.

**1c. Reescrever imports de `@/lib/mock`** → imports diretos

Arquivos a alterar (6):
- `src/app/(dashboard)/layout.tsx` → `from "@/lib/mock/config"` e `from "@/lib/mock/auth"`
- `src/lib/auth.ts` → `from "@/lib/mock/config"` e `from "@/lib/mock/auth"`
- `src/lib/actions/auth.ts` → `from "@/lib/mock/config"`, `from "@/lib/mock/auth"`, `from "@/lib/mock/store"`
- `src/lib/actions/calculate.ts` → `from "@/lib/mock/config"` e `from "@/lib/mock/auth"`
- `src/lib/actions/models.ts` → `from "@/lib/mock/config"`, `from "@/lib/mock/auth"`, `from "@/lib/mock/store"`
- `src/components/dev/DevModeIndicator.tsx` → `from "@/lib/mock/config"`

Após reescrever todos, deletar `src/lib/mock/index.ts`.

---

## Tarefa 2 — Corrigir Renderização Condicional (`&&` → ternário)

**Regra:** `rendering-conditional-render`
**Impacto:** MÉDIO — `&&` pode renderizar `0`, `""` ou `NaN` na UI

### Escopo

23 arquivos usam `&&` para renderização JSX. Focar nos casos de risco (onde a condição pode ser `0` ou `""`):

**Arquivos prioritários** (condições que envolvem strings/números):
- `src/components/empty-state.tsx:22` — `{actionLabel && onAction && (` → ternário
- `src/components/layout/UserMenu.tsx` — `{userName && (` e `{userEmail && (` → ternário
- `src/components/layout/Header.tsx` — `{user && (` → ternário

**Arquivos de tabela** (condições booleanas — risco baixo, mas padronizar):
- `src/components/tables/DRETable.tsx` — `{hasPremises && (`, `{modelId && hasPremises && (`
- `src/components/tables/LoansTable.tsx` — idem
- `src/components/tables/WorkingCapitalTable.tsx` — idem
- `src/components/tables/FCFFTable.tsx` — idem
- `src/components/tables/InvestmentTable.tsx` — idem

**Arquivos de forms** (condições de error/state):
- `src/components/forms/LoginForm.tsx` — `{state?.error && (`
- `src/components/forms/SignupForm.tsx` — idem
- `src/components/forms/ForgotPasswordForm.tsx` — idem
- `src/components/forms/ResetPasswordForm.tsx` — idem
- `src/components/forms/DREBaseForm.tsx`
- `src/components/forms/BalanceSheetBaseForm.tsx`
- `src/components/forms/DREProjectionForm.tsx`
- `src/components/forms/BalanceSheetProjectionForm.tsx`

### Padrão de transformação

```tsx
// ❌ Antes
{condition && <Component />}

// ✅ Depois
{condition ? <Component /> : null}
```

---

## Tarefa 3 — Não há oportunidade real de `Promise.all` nos saves

**Reavaliação:** Após análise detalhada de `src/lib/actions/models.ts` e `src/lib/actions/calculate.ts`:

- **`saveDREBase` e `saveBalanceSheetBase`**: São chamados isoladamente por forms distintos (um de cada vez). Não há página que chame ambos simultaneamente.
- **`saveDREProjection` e `saveBalanceSheetProjection`**: Cada um depende de `getModelById` → `updateModel` → `recalculateModel`. São chamados por hooks de debounce independentes (800ms). Paralelizar dentro de cada um criaria race conditions.
- **`recalculateModel`**: O cálculo DRE→BP→DRE→BP é intrinsecamente sequencial (pass iterativo). Não pode ser paralelizado.
- **`revalidatePath`**: São chamadas síncronas (não retornam Promise). Não há benefício em `Promise.all`.

**Conclusão:** Não há saves independentes paralelizáveis nesta base de código. A oportunidade de `Promise.all` identificada inicialmente foi um falso positivo — os saves dependem uns dos outros via `recalculateModel`.

---

## Ordem de Execução

1. **Tarefa 1** — Barrel files (menor risco, maior impacto no bundle)
2. **Tarefa 2** — Renderização condicional (mecânico, sem risco de regressão)

---

## Verificação

1. `npm run build` — verificar que compila sem erros
2. `npm run lint` — sem erros de lint
3. `npm test` — testes existentes passando
4. Verificar manualmente no browser: dashboard, tabelas DRE, forms de input, charts
