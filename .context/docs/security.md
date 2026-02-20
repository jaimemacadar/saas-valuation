---
type: doc
name: security
description: Security policies, authentication, secrets management, and compliance requirements
category: security
generated: 2026-01-27
updated: 2026-02-19
status: filled
scaffoldVersion: "2.0.0"
---

## Notas de Segurança & Conformidade

O projeto SaaS Valuation aplica as melhores práticas de segurança em todas as camadas da aplicação. Toda comunicação usa HTTPS, operações sensíveis são protegidas por verificações de autenticação e autorização via middleware, e a gestão de secrets é feita exclusivamente por variáveis de ambiente. A base de código segue os padrões de codificação segura com revisões periódicas.

## Autenticação & Autorização

### Provedor de Identidade

A autenticação é gerenciada integralmente pelo **Supabase Auth**, que utiliza:

- **JWT (JSON Web Tokens)** para gerenciamento de sessão
- **HTTP-only cookies** para armazenar tokens de sessão (proteção contra XSS)
- **Refresh tokens** para renovação automática de sessões
- **Email/senha** como método primário de autenticação
- **Reset de senha por email** com link temporário seguro

### Proteção de Rotas

O middleware (`middleware.ts`) protege todas as rotas do dashboard:

```typescript
// middleware.ts - Verifica sessão em cada requisição
export async function middleware(request: NextRequest) {
  return await updateSession(request) // Valida e renova JWT
}

// Matcher: aplica middleware a todas as rotas exceto assets estáticos
```

Funções de autorização em `src/lib/auth.ts`:
- `requireAuth()` — Exige sessão válida, redireciona para login se ausente
- `getCurrentUser()` — Retorna usuário autenticado atual
- `isAuthenticated()` — Verifica se há sessão ativa

### Isolamento de Dados

- **Row Level Security (RLS)** no Supabase garante que usuários só acessem seus próprios dados
- Todas as Server Actions validam a identidade do usuário antes de operações CRUD
- O `user_id` é sempre extraído do JWT, nunca de parâmetros de entrada do usuário

## Secrets & Dados Sensíveis

### Gestão de Variáveis de Ambiente

| Variável | Descrição | Exposição |
|----------|-----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Pública (prefixo `NEXT_PUBLIC_`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase | Pública (segura para uso no cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço Supabase | **Privada — nunca expor ao cliente** |
| `NEXT_PUBLIC_USE_MOCK_DATA` | Ativa modo mock de desenvolvimento | Pública |

### Regras de Segurança

- **Nunca commitar** arquivos `.env*` (exceto `.env.example` com valores de placeholder)
- **Nunca logar** tokens, senhas ou chaves de API
- **Rotacionar** secrets periodicamente ou após suspeita de comprometimento
- Usar **`.env.local`** para desenvolvimento local (ignorado pelo git)

### Criptografia

- Dados em repouso: gerenciados pelo Supabase (PostgreSQL com criptografia nativa)
- Dados em trânsito: TLS/HTTPS obrigatório em produção
- Senhas: gerenciadas pelo Supabase Auth (bcrypt com salt)

## Conformidade & Políticas

- **LGPD/GDPR**: Dados de usuário são coletados apenas com finalidade específica. Usuários podem solicitar exclusão de conta e dados.
- **OWASP Top 10**: Proteções contra XSS (HTTP-only cookies, CSP), SQL Injection (Supabase parameterized queries), CSRF (tokens SameSite).
- **Princípio do menor privilégio**: A chave anônima do Supabase tem permissões mínimas; operações privilegiadas usam RLS.

## Resposta a Incidentes

Em caso de suspeita de incidente de segurança:

1. **Conter**: Revogar imediatamente chaves/tokens comprometidos no dashboard do Supabase
2. **Investigar**: Revisar logs de auditoria do Supabase e logs da aplicação
3. **Remediar**: Corrigir a vulnerabilidade, rotacionar todos os secrets afetados
4. **Documentar**: Registrar timeline, impacto e ações tomadas
5. **Notificar**: Comunicar usuários afetados conforme exigido pela LGPD

O Supabase fornece logs de auditoria, controles de acesso e monitoramento de atividade anormal no dashboard do projeto.

---

Veja também: [Notas de Arquitetura](./architecture.md)
