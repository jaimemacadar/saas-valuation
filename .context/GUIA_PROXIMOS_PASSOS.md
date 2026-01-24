# Guia de Próximos Passos - Fase 1.5

**Status:** ✅ Implementação Completa | ⚠️ Testes Aguardando Configuração

---

## 🎯 Objetivo

Completar os testes da **Fase 1.5: Autenticação e Contas de Usuário** configurando o Supabase e validando todos os fluxos.

---

## ✅ O que foi implementado

### Backend (Server Actions)

- ✅ `src/lib/actions/auth.ts` - Autenticação completa
- ✅ `src/lib/actions/models.ts` - Gerenciamento de modelos
- ✅ `src/lib/auth.ts` - Helpers de autenticação

### Frontend (Páginas e Componentes)

- ✅ `src/app/(auth)/login/page.tsx` - Página de login
- ✅ `src/app/(auth)/signup/page.tsx` - Página de signup
- ✅ `src/app/(auth)/forgot-password/page.tsx` - Recuperação de senha
- ✅ `src/components/forms/LoginForm.tsx` - Formulário de login
- ✅ `src/components/forms/SignupForm.tsx` - Formulário de signup
- ✅ `src/components/forms/ForgotPasswordForm.tsx` - Formulário de recuperação
- ✅ `src/app/(dashboard)/dashboard/page.tsx` - Dashboard

### Infraestrutura

- ✅ `src/lib/supabase/client.ts` - Cliente Supabase (browser)
- ✅ `src/lib/supabase/server.ts` - Cliente Supabase (servidor)
- ✅ `src/lib/supabase/middleware.ts` - Middleware de autenticação
- ✅ `middleware.ts` - Middleware Next.js
- ✅ `supabase/schema.sql` - Script SQL com RLS
- ✅ `supabase/README.md` - Documentação Supabase

---

## 🚀 Como Começar os Testes

### Passo 1: Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Project Name:** `saas-valuation` (ou seu nome preferido)
   - **Database Password:** Escolha uma senha forte
   - **Region:** Escolha a região mais próxima
   - **Pricing Plan:** Free
4. Aguarde ~2 minutos para criação

### Passo 2: Obter Credenciais

1. No dashboard do Supabase, vá em **Settings > API**
2. Copie:
   - **Project URL** (exemplo: `https://xxx.supabase.co`)
   - **anon public** key (começando com `eyJ...`)
3. Guarde estas informações

### Passo 3: Atualizar Variáveis de Ambiente

Edite o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Substitua:

- `seu-projeto` com seu project ID
- `sua-chave-anon-aqui` com a chave copiada

### Passo 4: Executar Script SQL

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **"New Query"**
3. Copie o conteúdo completo de `supabase/schema.sql`
4. Cole no editor SQL
5. Clique em **"Run"** (botão com ▶️)

**Resultado esperado:** Verá a mensagem "Query executed successfully" para cada tabela criada.

### Passo 5: Reiniciar Servidor

```bash
# Pare o servidor (Ctrl+C)
# Execute:
npm run dev
```

O servidor deve carregar agora com Supabase configurado.

---

## 🧪 Testes Manuais

### Teste 1: Criar Conta (Signup)

1. Acesse http://localhost:3000/signup
2. Preencha:
   - **Nome:** João Silva
   - **Email:** joao@example.com
   - **Senha:** teste123456
   - **Confirmar Senha:** teste123456
3. Clique em **"Criar conta"**

**Resultado esperado:**

- ✅ Redireciona para `/dashboard`
- ✅ Header mostra nome do usuário
- ✅ Dashboard vazio (sem modelos)

**Verificação no Supabase:**

- Vá em **Table Editor**
- Tabela `user_profiles` deve ter novo registro
- Tabela `auth.users` deve ter novo usuário

### Teste 2: Criar Modelo

1. No dashboard, clique em **"Novo Modelo"**
2. Preencha:
   - **Nome da Empresa:** Empresa Teste S.A.
   - **Ticker:** TEST3
   - **Descrição:** Modelo de teste
3. Clique em **"Criar"**

**Resultado esperado:**

- ✅ Redireciona para página de modelo
- ✅ Dashboard mostra novo modelo
- ✅ Modelo no Supabase (`financial_models` table)

### Teste 3: Logout

1. No dashboard, clique em **"Sair"** (menu do usuário)

**Resultado esperado:**

- ✅ Redireciona para `/login`
- ✅ Sessão limpa

### Teste 4: Login

1. Acesse http://localhost:3000/login
2. Preencha:
   - **Email:** joao@example.com
   - **Senha:** teste123456
3. Clique em **"Entrar"**

**Resultado esperado:**

- ✅ Redireciona para `/dashboard`
- ✅ Modelos aparecem
- ✅ Header mostra nome do usuário

### Teste 5: Verificar RLS (Row Level Security)

1. Crie OUTRA conta (outro email)
2. Não deve conseguir ver modelos da primeira conta
3. Só verá seus próprios modelos

**Verificação:**

- Cada usuário vê apenas seus próprios dados
- Tentativa de acessar URL de modelo de outro usuário redireciona

---

## 🔒 Configurações Adicionais (Opcional)

### Habilitar OAuth (Google)

1. No Supabase, vá em **Authentication > Providers**
2. Clique em **"Google"**
3. Siga as instruções para criar credenciais no Google Cloud
4. Cole Client ID e Client Secret
5. Defina URL de callback autorizada:
   ```
   http://localhost:3000/auth/callback
   ```

### Habilitar Email Confirmação

Para desenvolvimento:

1. Vá em **Authentication > Email Templates**
2. Desabilite "Email confirmations" ou configure para auto-confirmar

Para produção:

1. Habilite email confirmations
2. Configure provedor de email (SendGrid, etc.)

---

## 📊 Checklist de Testes

### Antes de Iniciar

- [ ] Projeto Supabase criado
- [ ] Credenciais copiadas
- [ ] `.env.local` atualizado
- [ ] Script SQL executado
- [ ] Servidor reiniciado

### Testes de Autenticação

- [ ] Signup funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Recuperação de senha funciona
- [ ] Roteamento protegido funciona

### Testes de Modelos

- [ ] Criar modelo funciona
- [ ] Listar modelos funciona
- [ ] Atualizar modelo funciona
- [ ] Deletar modelo funciona
- [ ] Duplicar modelo funciona

### Testes de Segurança

- [ ] Usuário A não vê modelos de Usuário B
- [ ] Usuário A não consegue editar modelos de Usuário B
- [ ] Rota `/dashboard` requer autenticação
- [ ] RLS no banco está ativo

---

## 🐛 Troubleshooting

### Erro: "Unable to acquire lock"

**Solução:**

```bash
# Encerrar processos Node.js
Get-Process node | Stop-Process -Force
# Remover pasta .next
Remove-Item .\.next -Recurse -Force
# Reiniciar
npm run dev
```

### Erro: "Supabase URL is not configured"

**Solução:**

- Verificar `.env.local` existe na raiz
- Verificar valores `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Reiniciar servidor

### Erro: "Permission denied" (Windows)

**Solução:**

```bash
# Abrir PowerShell como Administrador
npm run dev
```

### Erro: "Port 3000 already in use"

**Solução:**

```bash
# O servidor usa porta 3001 automaticamente
# Ou encerrar processo em 3000:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

---

## 📚 Recursos

| Recurso        | Link                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| Supabase Docs  | https://supabase.com/docs                                                          |
| Next.js Docs   | https://nextjs.org/docs                                                            |
| Server Actions | https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions |
| RLS Policies   | https://supabase.com/docs/guides/auth/row-level-security                           |
| Zod Validation | https://zod.dev                                                                    |

---

## 💡 Dicas Úteis

1. **Debugar Server Actions:** Abra DevTools → Network → Veja requisições para `_rpc`
2. **Verificar RLS:** No Supabase, vá em **Authentication > Policies** para ver policies ativas
3. **Limpar Cache:** `Ctrl+Shift+Delete` em `http://localhost:3000`
4. **Ver Logs:** DevTools → Console para erros do cliente
5. **Supabase Admin:** Vá em **Database > Connections** para ver estatísticas

---

## ✅ Conclusão

Com esses passos, você terá a **Fase 1.5 totalmente funcional** com:

- ✅ Autenticação completa
- ✅ Gerenciamento de usuários
- ✅ Persistência de modelos
- ✅ Isolamento de dados
- ✅ Segurança via RLS

Pronto para iniciar a **Fase 2: Motor de Cálculo**! 🚀

---

**Dúvidas?** Veja `supabase/README.md` para mais detalhes.
