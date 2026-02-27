---
name: Security Audit
description: Security review checklist for code and infrastructure
phases: [R, V]
---

# Security Audit Guidelines

## OWASP Top 10 Checklist

### 1. Broken Access Control

#### ✅ Verificações

```typescript
// ❌ Vulnerável: Sem verificação de ownership
export async function deleteModel(id: string) {
  const supabase = await createClient();
  await supabase.from('financial_models').delete().eq('id', id);
}

// ✅ Seguro: Verifica ownership
export async function deleteModel(id: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  // Verificar se usuário é dono do modelo
  const { data: model } = await supabase
    .from('financial_models')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!model || model.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' };
  }

  await supabase.from('financial_models').delete().eq('id', id);
}
```

#### Checklist

- [ ] Todas as Server Actions verificam autenticação
- [ ] Ownership verificado antes de operações (update, delete)
- [ ] RLS (Row Level Security) habilitado no Supabase
- [ ] Funções admin separadas e protegidas
- [ ] IDs não são sequenciais (use UUIDs)

### 2. Cryptographic Failures

#### ✅ Verificações

```typescript
// ❌ Vulnerável: Senha em texto plano
const user = {
  email: 'user@example.com',
  password: 'mypassword123', // NUNCA!
};

// ✅ Seguro: Supabase Auth cuida de hashing
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'mypassword123', // Será hasheado pelo Supabase
});
```

#### Checklist

- [ ] Senhas nunca armazenadas em texto plano (Supabase Auth)
- [ ] HTTPS em produção
- [ ] Tokens sensíveis não expostos no frontend
- [ ] Environment variables para secrets
- [ ] Cookies com flags `httpOnly`, `secure`, `sameSite`

### 3. Injection

#### ✅ SQL Injection

```typescript
// ❌ Vulnerável: String concatenation
const userId = req.query.id;
const query = `SELECT * FROM users WHERE id = ${userId}`; // NUNCA!

// ✅ Seguro: Query builder do Supabase
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId); // Parametrizado
```

#### ✅ XSS Prevention

```typescript
// ❌ Vulnerável: dangerouslySetInnerHTML com input do usuário
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Seguro: React escapa automaticamente
<div>{userInput}</div>

// Se HTML é necessário, sanitize primeiro
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

#### Checklist

- [ ] Usar query builder (Supabase client, não SQL raw)
- [ ] Nunca usar `dangerouslySetInnerHTML` com input do usuário
- [ ] Validar e sanitizar todos os inputs
- [ ] Escape de caracteres especiais quando necessário
- [ ] Content Security Policy (CSP) headers

### 4. Insecure Design

#### ✅ Princípio de Menor Privilégio

```typescript
// ❌ Vulnerável: Admin check no frontend apenas
export function AdminPanel() {
  const isAdmin = checkIsAdmin(); // No frontend!

  if (!isAdmin) return null;

  return <div>Admin controls</div>;
}

// ✅ Seguro: Verificação no servidor
export async function getAdminData() {
  'use server';

  const user = await requireAuth();

  if (!isAdmin(user)) {
    throw new ForbiddenError();
  }

  // ... admin operations
}
```

#### Checklist

- [ ] Segurança em múltiplas camadas (defense in depth)
- [ ] Validação tanto no cliente quanto servidor
- [ ] Rate limiting em operações sensíveis
- [ ] Fail securely (negar por padrão)
- [ ] Logs de ações sensíveis

### 5. Security Misconfiguration

#### ✅ Environment Variables

```bash
# .env.local (NÃO commitar!)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # NUNCA expor no frontend!

# .env.example (Commitar)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### ✅ Next.js Config

```typescript
// next.config.ts
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

#### Checklist

- [ ] `.env` files não commitados (.gitignore)
- [ ] Secrets não hardcoded no código
- [ ] Security headers configurados
- [ ] Erros não expõem stack traces em produção
- [ ] CORS configurado corretamente
- [ ] Debug mode desabilitado em produção

### 6. Vulnerable Components

#### ✅ Dependency Management

```bash
# Verificar vulnerabilidades
npm audit

# Fix automático
npm audit fix

# Check específico
npm audit --production
```

#### Checklist

- [ ] `npm audit` executado regularmente
- [ ] Dependências atualizadas
- [ ] Apenas dependências necessárias instaladas
- [ ] Lockfile commitado (package-lock.json)
- [ ] Renovate/Dependabot configurado

### 7. Authentication Failures

#### ✅ Supabase Auth

```typescript
// ✅ Password requirements
const passwordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Deve conter maiúscula')
  .regex(/[a-z]/, 'Deve conter minúscula')
  .regex(/[0-9]/, 'Deve conter número')
  .regex(/[^A-Za-z0-9]/, 'Deve conter caractere especial');

// ✅ Session handling
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return user;
}
```

#### Checklist

- [ ] Senhas fortes exigidas
- [ ] MFA disponível (se aplicável)
- [ ] Sessions têm timeout
- [ ] Logout limpa sessions corretamente
- [ ] Rate limiting em login/signup
- [ ] Proteção contra brute force
- [ ] Password reset seguro

### 8. Software and Data Integrity

#### ✅ Input Validation

```typescript
// Sempre validar com Zod
const createModelSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  company_name: z.string().max(255).optional(),
  model_type: z.enum(['DCF', 'Multiples', 'DDM']),
});

// Nunca confiar em input do cliente
export async function createModel(input: unknown) {
  // Validação
  const validated = createModelSchema.parse(input);

  // Proceder com dados validados
}
```

#### Checklist

- [ ] Todos os inputs validados com Zod
- [ ] File uploads verificados (tipo, tamanho)
- [ ] Integrity checks em dados críticos
- [ ] CI/CD pipeline seguro
- [ ] Code signing (se aplicável)

### 9. Logging and Monitoring

#### ✅ Logging Seguro

```typescript
// ❌ Vulnerável: Loga dados sensíveis
console.log('User logged in:', {
  email: user.email,
  password: user.password, // NUNCA!
  creditCard: user.creditCard, // NUNCA!
});

// ✅ Seguro: Loga apenas dados necessários
console.log('User logged in:', {
  userId: user.id,
  timestamp: new Date().toISOString(),
});

// Para debug, sanitize dados sensíveis
const sanitizeForLogging = (obj: any) => {
  const { password, creditCard, ...safe } = obj;
  return safe;
};
```

#### Checklist

- [ ] Logs não contêm senhas, tokens, ou dados sensíveis
- [ ] Failed login attempts logados
- [ ] Ações administrativas logadas
- [ ] Alertas configurados para atividades suspeitas
- [ ] Logs têm timestamps
- [ ] Retention policy definida

### 10. Server-Side Request Forgery (SSRF)

#### ✅ Prevenção

```typescript
// ❌ Vulnerável: URL do usuário sem validação
export async function fetchExternalData(url: string) {
  const response = await fetch(url); // PERIGOSO!
  return response.json();
}

// ✅ Seguro: Whitelist de URLs permitidas
const ALLOWED_DOMAINS = [
  'api.example.com',
  'data.example.com',
];

export async function fetchExternalData(url: string) {
  const parsedUrl = new URL(url);

  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
    throw new Error('URL não permitida');
  }

  // Também bloquear URLs internas
  if (parsedUrl.hostname === 'localhost' ||
      parsedUrl.hostname.startsWith('192.168.') ||
      parsedUrl.hostname.startsWith('10.')) {
    throw new Error('URL interna não permitida');
  }

  const response = await fetch(url);
  return response.json();
}
```

#### Checklist

- [ ] URLs externas validadas (whitelist)
- [ ] Bloqueio de IPs privados/internos
- [ ] Timeout em requests externos
- [ ] Validação de response

## Specific to This Project

### Supabase RLS Policies

```sql
-- Policy: Users can only see their own models
CREATE POLICY "Users can view their own models"
ON financial_models
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only update their own models
CREATE POLICY "Users can update their own models"
ON financial_models
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can only delete their own models
CREATE POLICY "Users can delete their own models"
ON financial_models
FOR DELETE
USING (auth.uid() = user_id);
```

### Mock Mode Security

```typescript
// Mock mode apenas em desenvolvimento
export function isMockMode() {
  return process.env.NODE_ENV === 'development' &&
         process.env.NEXT_PUBLIC_ENABLE_MOCK === 'true';
}

// Nunca em produção
if (isMockMode() && process.env.NODE_ENV === 'production') {
  throw new Error('Mock mode não pode estar ativo em produção!');
}
```

### Client/Server Boundary

```typescript
// ❌ Vulnerável: Secret no cliente
'use client';
const API_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Exposto!

// ✅ Seguro: Secret apenas no servidor
'use server';
const API_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Seguro
```

## Security Audit Checklist

### Pre-deploy

- [ ] `npm audit` limpo
- [ ] Environment variables configuradas
- [ ] RLS policies testadas
- [ ] Auth flows testados
- [ ] Rate limiting testado
- [ ] Error handling não expõe informações
- [ ] HTTPS configurado
- [ ] Security headers configurados

### Code Review

- [ ] Sem hardcoded secrets
- [ ] Inputs validados
- [ ] Ownership verificado
- [ ] SQL injection prevenido
- [ ] XSS prevenido
- [ ] Logs seguros
- [ ] Error messages seguros

### Regular Audits

- [ ] Semanal: `npm audit`
- [ ] Mensal: Review de logs de segurança
- [ ] Trimestral: Penetration testing
- [ ] Anual: Full security audit