# Configuração do Supabase

Este documento contém as instruções para configurar o banco de dados Supabase para o projeto SaaS Valuation.

## 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha um nome para o projeto (ex: "saas-valuation")
4. Defina uma senha forte para o banco de dados
5. Escolha a região mais próxima
6. Aguarde a criação do projeto (~2 minutos)

## 2. Configurar Variáveis de Ambiente

1. No dashboard do Supabase, vá em **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** (URL do projeto)
   - **anon public** (chave pública anônima)

3. Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Importante:** Nunca commite o arquivo `.env.local` no git!

## 3. Executar Script SQL

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em "+ New Query"
3. Copie todo o conteúdo do arquivo `supabase/schema.sql`
4. Cole no editor SQL
5. Clique em "Run" para executar

Isso criará:

- ✅ Tabela `user_profiles` com RLS
- ✅ Tabela `financial_models` com RLS
- ✅ Índices para performance
- ✅ Policies de segurança
- ✅ Trigger para criar perfil automaticamente

## 4. Verificar Configuração

### Verificar Tabelas

1. Vá em **Table Editor**
2. Você deve ver as tabelas:
   - `user_profiles`
   - `financial_models`

### Verificar RLS

1. Vá em **Authentication** > **Policies**
2. Você deve ver as policies criadas para cada tabela

### Verificar Triggers

1. Vá em **Database** > **Triggers**
2. Você deve ver o trigger `on_auth_user_created`

## 5. Configurar Autenticação

### Email/Password

1. Vá em **Authentication** > **Providers**
2. Email Provider já vem habilitado por padrão
3. Configure as opções:
   - **Enable email confirmations**: Desabilitado (para desenvolvimento)
   - **Enable auto-confirm users**: Habilitado (para desenvolvimento)

> **Produção:** Habilite confirmação de email em produção!

### OAuth (Opcional)

#### Google OAuth

1. Vá em **Authentication** > **Providers**
2. Habilite **Google**
3. Siga as instruções para criar credenciais no Google Cloud Console
4. Cole Client ID e Client Secret
5. Adicione a URL de callback autorizada

#### GitHub OAuth

1. Vá em **Authentication** > **Providers**
2. Habilite **GitHub**
3. Siga as instruções para criar OAuth App no GitHub
4. Cole Client ID e Client Secret
5. Adicione a URL de callback autorizada

## 6. Testar Configuração

### Criar Conta de Teste

1. Inicie o projeto: `npm run dev`
2. Acesse: http://localhost:3000/signup
3. Crie uma conta de teste
4. Verifique se o perfil foi criado automaticamente:
   - No Supabase, vá em **Table Editor** > **user_profiles**
   - Você deve ver o registro do novo usuário

### Testar RLS

1. Crie 2 contas diferentes
2. Em cada conta, crie um modelo
3. Verifique que cada usuário vê apenas seus próprios modelos

## 7. Estrutura das Tabelas

### user_profiles

| Coluna     | Tipo                     | Descrição                  |
| ---------- | ------------------------ | -------------------------- |
| id         | UUID (PK)                | ID do usuário (auth.users) |
| name       | TEXT                     | Nome completo              |
| avatar_url | TEXT                     | URL do avatar              |
| created_at | TIMESTAMP WITH TIME ZONE | Data de criação            |
| updated_at | TIMESTAMP WITH TIME ZONE | Data de atualização        |

### financial_models

| Coluna        | Tipo                     | Descrição                  |
| ------------- | ------------------------ | -------------------------- |
| id            | UUID (PK)                | ID do modelo               |
| user_id       | UUID (FK)                | ID do usuário proprietário |
| company_name  | TEXT                     | Nome da empresa            |
| ticker_symbol | TEXT                     | Ticker da ação             |
| description   | TEXT                     | Descrição do modelo        |
| model_data    | JSONB                    | Dados do modelo (JSON)     |
| created_at    | TIMESTAMP WITH TIME ZONE | Data de criação            |
| updated_at    | TIMESTAMP WITH TIME ZONE | Data de atualização        |

## 8. Políticas de Segurança (RLS)

### Princípios

- ✅ Usuários veem apenas seus próprios dados
- ✅ Usuários modificam apenas seus próprios dados
- ✅ Isolamento completo entre usuários
- ✅ Segurança implementada no banco de dados

### Políticas Implementadas

#### user_profiles

- `Users can view own profile` - SELECT
- `Users can update own profile` - UPDATE
- `Users can insert own profile` - INSERT

#### financial_models

- `Users can view own models` - SELECT
- `Users can insert own models` - INSERT
- `Users can update own models` - UPDATE
- `Users can delete own models` - DELETE

## 9. Troubleshooting

### Erro: "relation 'public.user_profiles' does not exist"

- Execute o script SQL novamente
- Verifique se o schema foi criado corretamente

### Erro: "new row violates row-level security policy"

- Verifique se o usuário está autenticado
- Verifique se as policies foram criadas corretamente
- Execute: `SELECT * FROM pg_policies WHERE schemaname = 'public';`

### Erro: "User not found"

- Verifique se o token JWT é válido
- Limpe cookies e faça login novamente
- Verifique variáveis de ambiente

### Perfil não é criado automaticamente

- Verifique se o trigger `on_auth_user_created` existe
- Execute: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Recrie o trigger se necessário

## 10. Backup e Migração

### Exportar Schema

```bash
# No SQL Editor do Supabase
SELECT * FROM information_schema.tables WHERE table_schema = 'public';
```

### Backup de Dados

1. Vá em **Database** > **Backups**
2. Configure backups automáticos
3. Faça backup manual antes de mudanças importantes

## 11. Produção

### Checklist antes de deploy

- [ ] Configurar variáveis de ambiente de produção
- [ ] Habilitar confirmação de email
- [ ] Configurar domínio customizado
- [ ] Habilitar SSL/TLS
- [ ] Configurar rate limiting
- [ ] Revisar políticas de RLS
- [ ] Configurar backups automáticos
- [ ] Testar com dados reais

### Segurança

- ✅ Nunca exponha a `service_role` key no cliente
- ✅ Use apenas `anon` key no frontend
- ✅ Sempre valide dados no servidor
- ✅ Mantenha RLS habilitado
- ✅ Monitore logs de autenticação
