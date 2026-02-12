# Sistema de Mock de Dados 🚧

Sistema completo de mock de dados para desenvolvimento sem dependência do Supabase.

## Visão Geral

O sistema de mock permite desenvolver e testar a aplicação usando dados simulados em memória, eliminando a necessidade de conectar ao Supabase durante o desenvolvimento.

## Ativação

### 1. Configurar variável de ambiente

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### 2. Reiniciar o servidor

```bash
npm run dev
```

### 3. Verificar ativação

Quando em modo mock, você verá:
- Badge laranja "🚧 MOCK MODE" no canto inferior direito
- Warning no console do navegador
- Logs de debug no terminal (em desenvolvimento)

## Desativação

Para voltar a usar dados reais do Supabase:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Ou simplesmente remova/comente a variável.

## Dados Disponíveis

### Usuários

O sistema inclui 3 usuários de exemplo:

| Email | Nome | Role | Subscription |
|-------|------|------|--------------|
| `demo@saasvaluation.com` | Usuário Demo | user | pro |
| `admin@saasvaluation.com` | Administrador | admin | enterprise |
| `usuario@exemplo.com` | João Silva | user | free |

**Auto-login:** O usuário demo é usado automaticamente.

### Modelos Financeiros

8 modelos pré-configurados com diferentes perfis:

1. **TechSaaS Solutions** - SaaS médio porte (R$ 10M receita)
2. **GrowthTech Startup** - Startup em crescimento (R$ 1M)
3. **Enterprise Solutions** - Empresa madura (R$ 100M)
4. **ShopFast E-commerce** - E-commerce (R$ 25M)
5. **PayTech Financial** - Fintech (R$ 15M)
6. **Nova Empresa** - Modelo vazio
7. **CloudOps Enterprise** - SaaS B2B (R$ 18M)
8. **ConnectMarket** - Marketplace (R$ 8M)

Todos incluem dados completos de DRE, Balanço Patrimonial e WACC.

## Funcionalidades

### Totalmente Funcionais

✅ **Autenticação**
- Login automático com usuário demo
- Sem necessidade de credenciais

✅ **CRUD de Modelos**
- Listar todos os modelos
- Visualizar modelo específico
- Criar novo modelo
- Editar modelo existente
- Deletar modelo
- Duplicar modelo

✅ **Persistência em Memória**
- Dados mantidos durante a sessão
- Mudanças persistem até refresh da página

✅ **Delays Realistas**
- Simula latência de rede
- 50-150ms conforme operação

## Estrutura de Arquivos

```
src/lib/mock/
├── config.ts           # Configuração e detecção de modo
├── types.ts            # Interfaces e type guards
├── store.ts            # Store in-memory com CRUD
├── auth.ts             # Mock de autenticação
├── index.ts            # Exportações
└── data/
    ├── users.ts        # Dados de usuários
    └── models.ts       # Dados de modelos financeiros
```

## Desenvolvimento

### Adicionar Novos Dados Mock

**1. Adicionar usuário:**

```typescript
// src/lib/mock/data/users.ts
export const NOVO_USUARIO: MockUser = {
  id: "user-custom-001",
  email: "novo@exemplo.com",
  name: "Novo Usuário",
  role: "user",
  subscription: "pro",
  created_at: new Date().toISOString(),
};

// Adicionar ao array
export const MOCK_USERS = [..., NOVO_USUARIO];
```

**2. Adicionar modelo:**

```typescript
// src/lib/mock/data/models.ts
export const NOVO_MODEL: MockFinancialModel = {
  id: "model-custom-001",
  user_id: DEMO_USER.id,
  company_name: "Minha Empresa",
  description: "Descrição do modelo",
  model_data: { /* dados de valuation */ },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Adicionar ao array
export const MOCK_FINANCIAL_MODELS = [..., NOVO_MODEL];
```

### Resetar Store

Durante desenvolvimento, pode ser útil resetar o store:

```typescript
import { resetMockStore } from '@/lib/mock';

// Limpa todos os dados e recria com seed inicial
resetMockStore();
```

### Debug

Logs automáticos em `NODE_ENV=development`:

```
[MOCK] Inicializando store com dados de exemplo
[MOCK] 8 modelos carregados
[MOCK] Buscando modelos para usuário demo-user-001
[MOCK] Encontrados 8 modelos
```

## Limitações

⚠️ **Dados não persistem entre refreshes**
- Store é in-memory
- Cada refresh recria dados iniciais

⚠️ **Sem sincronização em tempo real**
- Dados locais apenas
- Mudanças não são compartilhadas

⚠️ **Sem validação de Supabase**
- Pode haver divergências de schema
- Testar com dados reais periodicamente

## Casos de Uso

### Desenvolvimento Offline

Trabalhe sem conexão com internet ou sem acesso ao Supabase.

### Testes Rápidos

Teste features rapidamente sem setup de banco de dados.

### Demos e Apresentações

Mostre a aplicação com dados consistentes e sem expor dados reais.

### CI/CD

Execute testes de integração sem banco de dados.

## Troubleshooting

### Badge não aparece

- Verificar `NODE_ENV=development`
- Verificar `NEXT_PUBLIC_USE_MOCK_DATA=true`
- Limpar cache e reiniciar

### Dados não carregam

- Verificar console para erros
- Confirmar imports corretos
- Verificar se store foi inicializado

### Mudanças não persistem

- Normal em modo mock
- Dados resetam em cada refresh
- Use localStorage se precisar persistência

## Segurança

⚠️ **IMPORTANTE:** Nunca use mock mode em produção!

O sistema inclui verificações mas é responsabilidade do desenvolvedor:
- Manter `NEXT_PUBLIC_USE_MOCK_DATA=false` em produção
- Nunca comitar `.env.local` com mock ativado
- Revisar builds de produção

## Suporte

Problemas ou dúvidas:
1. Verificar este documento
2. Consultar código em `src/lib/mock/`
3. Abrir issue no repositório

---

Desenvolvido com ❤️ para facilitar o desenvolvimento
