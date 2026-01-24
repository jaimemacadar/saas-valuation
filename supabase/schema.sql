-- =====================================================
-- SCHEMA SQL PARA SUPABASE
-- SaaS Valuation - Financial Models
-- =====================================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: user_profiles
-- Armazena informações adicionais dos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: financial_models
-- Armazena os modelos de valuation criados pelos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS public.financial_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  ticker_symbol TEXT,
  description TEXT,
  model_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_financial_models_user_id 
  ON public.financial_models(user_id);

CREATE INDEX IF NOT EXISTS idx_financial_models_updated_at 
  ON public.financial_models(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_financial_models_company_name 
  ON public.financial_models(company_name);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_financial_models_updated_at
  BEFORE UPDATE ON public.financial_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_models ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES: user_profiles
-- =====================================================

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Usuários podem inserir apenas seu próprio perfil
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- POLICIES: financial_models
-- =====================================================

-- Usuários podem ver apenas seus próprios modelos
CREATE POLICY "Users can view own models"
  ON public.financial_models
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem inserir modelos para si mesmos
CREATE POLICY "Users can insert own models"
  ON public.financial_models
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas seus próprios modelos
CREATE POLICY "Users can update own models"
  ON public.financial_models
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar apenas seus próprios modelos
CREATE POLICY "Users can delete own models"
  ON public.financial_models
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNÇÃO: Criar perfil automaticamente após signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- DADOS DE TESTE (OPCIONAL - COMENTAR EM PRODUÇÃO)
-- =====================================================

-- Inserir usuário de teste (descomentar se necessário)
-- INSERT INTO auth.users (id, email) 
-- VALUES ('00000000-0000-0000-0000-000000000001', 'teste@example.com');

-- Inserir modelo de teste (descomentar se necessário)
-- INSERT INTO public.financial_models (user_id, company_name, ticker_symbol, description)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'Empresa Teste S.A.',
--   'TEST3',
--   'Modelo de teste para validação do sistema'
-- );
