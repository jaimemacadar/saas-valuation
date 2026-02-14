# SaaS Valuation Platform

Plataforma web para modelagem, análise e avaliação de empresas SaaS. Permite a founders, investidores e analistas criar modelos financeiros, projeções e realizar valuation com diversos métodos.

## ✨ Funcionalidades Principais

- 🔐 **Autenticação completa** - Login, signup, reset de senha
- 📊 **Gestão de Modelos** - CRUD completo com cards visuais
- 💰 **Visualização Financeira** - DRE, Balanço Patrimonial, FCFF
- 📝 **Entrada de Dados** - Formulários estruturados para ano base e premissas
- 🚧 **Modo Mock** - Desenvolvimento offline sem backend
- 🎨 **UI Moderna** - Tailwind CSS + Radix UI + shadcn/ui
- 📱 **Responsivo** - Interface adaptável para desktop e mobile

## 🛠️ Stack Tecnológico

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** para type-safety
- **Supabase** (PostgreSQL + Auth)
- **Tailwind CSS** + **Radix UI**
- **Jest** para testes
- **ESLint** para qualidade de código

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Desenvolvimento com Mock Data 🚧

Para desenvolver **sem conexão com Supabase**, ative o modo mock:

1. Configure no `.env.local`:
   ```env
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```

2. Reinicie o servidor de desenvolvimento

3. Você verá um badge "🚧 MOCK MODE" no canto superior direito

**Credenciais de teste:**
- Email: `test@example.com`
- Senha: `password123`

📖 **Documentação completa:** [MOCK_MODE.md](./MOCK_MODE.md)

### Desenvolvimento Normal (com Supabase)

1. Configure as variáveis de ambiente no `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Execute o servidor de desenvolvimento:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

3. Abra [http://localhost:3000](http://localhost:3000) no navegador

### Estrutura do Projeto

```
src/
├── app/                      # Rotas e páginas (Next.js App Router)
│   ├── (auth)/              # Páginas de autenticação
│   └── (dashboard)/         # Páginas protegidas
│       ├── dashboard/       # Dashboard principal
│       └── model/[id]/      # Detalhes e edição de modelos
├── components/              # Componentes React
│   ├── ui/                  # Componentes base (Radix UI)
│   └── dev/                 # Componentes de desenvolvimento
├── core/                    # Lógica de negócio e cálculos
│   ├── calculations/        # Cálculos de valuation, WACC, etc.
│   └── types/              # Tipos de domínio
├── lib/                     # Utilitários e integrações
│   ├── supabase/           # Cliente Supabase
│   ├── mock/               # Sistema de mock para desenvolvimento
│   └── actions/            # Server Actions (Next.js)
└── types/                   # Tipos compartilhados
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
