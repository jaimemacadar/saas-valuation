---
slug: getting-started
category: getting-started
generatedAt: 2026-01-27T02:46:29.286Z
updatedAt: 2026-02-14
---

# How do I set up and run this project?

## Pré-requisitos

- **Node.js** 18+ (LTS recomendado)
- **npm** ou **yarn** ou **pnpm** ou **bun**
- **Git**

## Opção 1: Desenvolvimento com Mock Data (Recomendado para começar) 🚧

Ideal para desenvolvimento local sem configurar Supabase:

### 1. Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd saas-valuation

# Instale as dependências
npm install
```

### 2. Configuração

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Ativar modo mock
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### 3. Execute o projeto

```bash
npm run dev
```

### 4. Acesse a aplicação

- Abra http://localhost:3000
- Faça login com as credenciais de teste:
  - **Email**: `test@example.com`
  - **Senha**: `password123`
- Você verá um badge "🚧 MOCK MODE" indicando que está usando dados simulados

### 5. Dados de exemplo

O modo mock inclui:
- 3 usuários pré-configurados
- 5+ modelos de exemplo com dados financeiros completos
- Autenticação simulada com sessões
- CRUD completo funcionando em memória

**📖 Documentação completa:** [MOCK_MODE.md](../../../MOCK_MODE.md)

## Opção 2: Desenvolvimento com Supabase (Produção)

### 1. Criar projeto no Supabase

1. Acesse https://supabase.com
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Copie as credenciais (URL e Anon Key)

### 2. Configuração

Crie um arquivo `.env.local`:

```env
# Desativar mock
NEXT_PUBLIC_USE_MOCK_DATA=false

# Credenciais Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Executar migrações

```bash
# Se houver scripts de setup do banco
npm run db:migrate
```

### 4. Execute o projeto

```bash
npm run dev
```

## Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm start

# Testes
npm test
npm run test:watch

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check
```

## Estrutura de Pastas

```
saas-valuation/
├── src/
│   ├── app/              # Páginas e rotas (Next.js App Router)
│   ├── components/       # Componentes React reutilizáveis
│   ├── core/            # Lógica de negócio e cálculos
│   ├── lib/             # Utilitários e integrações
│   │   ├── supabase/    # Cliente Supabase
│   │   └── mock/        # Sistema de mock
│   └── types/           # Tipos TypeScript
├── public/              # Arquivos estáticos
└── .context/            # Documentação e planos
```

## Próximos Passos

1. Explore o dashboard em http://localhost:3000/dashboard
2. Crie um novo modelo de valuation
3. Visualize demonstrativos financeiros (DRE, Balanço)
4. Leia a [documentação de arquitetura](../architecture.md)
5. Consulte o [glossário](../glossary.md) para termos de domínio

## Problemas Comuns

### Erro de porta em uso

```bash
# Use uma porta diferente
PORT=3001 npm run dev
```

### Erro de módulos não encontrados

```bash
# Limpe node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Mock mode não ativa

- Verifique se `.env.local` existe na raiz
- Confirme que `NEXT_PUBLIC_USE_MOCK_DATA=true`
- Reinicie o servidor (`Ctrl+C` e `npm run dev` novamente)