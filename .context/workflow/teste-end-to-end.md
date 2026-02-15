# Teste End-to-End - Premissas de Projeção

**Data:** 2026-02-15
**Objetivo:** Validar o fluxo completo de Premissas de Projeção implementado nas Phases 1-3

## Pré-requisitos

- ✅ Servidor de desenvolvimento rodando (`npm run dev`)
- ✅ Navegador aberto em `http://localhost:3000`
- ✅ Usuário autenticado no sistema

---

## Cenário 1: Criar Modelo e Preencher Dados Base

### Passo 1.1: Criar Novo Modelo
1. Navegar para `/dashboard`
2. Clicar em "Novo Modelo" ou "Criar Modelo"
3. Preencher informações básicas:
   - Nome da empresa: "Empresa Teste E2E"
   - Ticker (opcional): "TESTE3"
   - Descrição (opcional): "Modelo para teste end-to-end"
4. Salvar modelo

**Resultado esperado:** ✓ Modelo criado com sucesso, redirecionado para página do modelo

---

### Passo 1.2: Preencher DRE Base
1. Navegar para "Dados Ano Base" no sidebar
2. Preencher aba "DRE" com valores:
   - Receita Bruta: R$ 10.000.000,00
   - Impostos e Devoluções: R$ 1.700.000,00
   - CMV: R$ 4.000.000,00
   - Despesas Operacionais: R$ 2.000.000,00
   - IR/CSLL: R$ 850.000,00
   - Dividendos: R$ 500.000,00
3. Salvar dados

**Cálculos esperados no preview:**
- Receita Líquida: R$ 8.300.000,00 (10M - 1.7M)
- Lucro Bruto: R$ 4.300.000,00 (8.3M - 4M)
- EBIT: R$ 2.300.000,00 (4.3M - 2M)
- Lucro Líquido: R$ 1.450.000,00 (2.3M - 0.85M)

**Resultado esperado:** ✓ Dados salvos com sucesso

---

### Passo 1.3: Preencher Balanço Patrimonial Base
1. Navegar para aba "Balanço Patrimonial"
2. Preencher **Ativo Circulante**:
   - Caixa e Equivalentes: R$ 1.500.000,00
   - Aplicações Financeiras: R$ 500.000,00
   - Contas a Receber: R$ 2.000.000,00
   - Estoques: R$ 1.500.000,00
   - Ativos Biológicos: R$ 0,00
   - Outros Créditos: R$ 500.000,00
   - **Total AC: R$ 6.000.000,00**

3. Preencher **Ativo Realizável LP**:
   - Investimentos: R$ 500.000,00
   - Imobilizado Bruto: R$ 5.000.000,00
   - Depreciação Acumulada: R$ 1.000.000,00
   - Intangível: R$ 500.000,00
   - **Total ARLP: R$ 5.000.000,00** (Imobilizado líquido + outros)

4. Preencher **Passivo Circulante**:
   - Fornecedores: R$ 1.200.000,00
   - Impostos a Pagar: R$ 400.000,00
   - Obrigações Sociais: R$ 600.000,00
   - Empréstimos CP: R$ 800.000,00
   - Outras Obrigações: R$ 500.000,00
   - **Total PC: R$ 3.500.000,00**

5. Preencher **Passivo Realizável LP**:
   - Empréstimos LP: R$ 2.000.000,00
   - **Total PRLP: R$ 2.000.000,00**

6. Preencher **Patrimônio Líquido**:
   - Capital Social: R$ 4.000.000,00
   - Lucros Acumulados: R$ 1.500.000,00
   - **Total PL: R$ 5.500.000,00**

**Validação do Balanço:**
- Ativo Total: R$ 11.000.000,00 (AC + ARLP)
- Passivo + PL: R$ 11.000.000,00 (PC + PRLP + PL)
- **Diferença: R$ 0,00** ✓ Balanço equilibrado

7. Salvar dados

**Resultado esperado:** ✓ Dados salvos com sucesso, balanço equilibrado

---

## Cenário 2: Verificar Auto-Cálculo com Defaults (5% crescimento)

### Passo 2.1: Verificar DRE Projetado
1. Navegar para "DRE Projetado" no sidebar
2. Verificar se a tabela exibe dados para:
   - Ano Base (year 0)
   - Ano 1 a Ano 5

**Valores esperados para Ano 1 (crescimento 5%):**
- Receita Bruta: ~R$ 10.500.000,00 (10M × 1.05)
- Impostos e Devoluções: ~R$ 1.785.000,00 (17% de 10.5M)
- Receita Líquida: ~R$ 8.715.000,00
- CMV: ~R$ 4.200.000,00 (48.2% de RL)
- Lucro Bruto: ~R$ 4.515.000,00
- Despesas Operacionais: ~R$ 2.100.000,00 (24.1% de RL)
- EBIT: ~R$ 2.415.000,00
- IR/CSLL: ~R$ 820.000,00 (34% de LAIR)
- Lucro Líquido: ~R$ 1.595.000,00

**Resultado esperado:** ✓ Tabela exibe projeções com crescimento 5%

---

### Passo 2.2: Verificar Balanço Projetado
1. Navegar para "Balanço Projetado" no sidebar
2. Verificar se a tabela exibe dados para Ano Base e Anos 1-5
3. Verificar se os prazos médios foram calculados automaticamente

**Resultado esperado:** ✓ Tabela exibe projeções do balanço

---

### Passo 2.3: Verificar FCFF
1. Navegar para "Fluxo de Caixa Livre" no sidebar
2. Verificar se a tabela exibe FCFF calculado para Anos 1-5

**Resultado esperado:** ✓ FCFF calculado e exibido

---

## Cenário 3: Modificar Premissas de Projeção

### Passo 3.1: Acessar Premissas de Projeção
1. Navegar para "Premissas Projeção" no sidebar
2. Verificar se existem 2 tabs: "DRE" e "Balanço Patrimonial"

**Resultado esperado:** ✓ Página de premissas carregada com tabs

---

### Passo 3.2: Gerar Premissas Padrão (se necessário)
1. Se a tabela estiver vazia, clicar em "Gerar Defaults" (botão com ícone Sparkles ✨)
2. Verificar se a tabela é preenchida com 5 anos de premissas

**Resultado esperado:** ✓ Premissas padrão geradas com base no Ano Base

---

### Passo 3.3: Modificar Premissas DRE
1. Na aba "DRE", localizar a linha "Taxa Crescimento Receita Bruta (%)"
2. Alterar valores:
   - Ano 1: 15% (ao invés de 5%)
   - Ano 2: 12% (ao invés de 5%)
   - Ano 3: 10%
   - Ano 4: 8%
   - Ano 5: 5%

3. Modificar outras premissas se desejar (ex: taxa CMV)

4. Salvar premissas

**Resultado esperado:** ✓ Premissas salvas com sucesso

---

### Passo 3.4: Verificar Atualização Automática
1. Navegar de volta para "DRE Projetado"
2. Verificar se os valores foram recalculados

**Valores esperados para Ano 1 (crescimento 15%):**
- Receita Bruta: ~R$ 11.500.000,00 (10M × 1.15)
- Valores subsequentes recalculados conforme novas taxas

**Resultado esperado:** ✓ DRE atualizado com novos valores

---

### Passo 3.5: Modificar Premissas do Balanço
1. Voltar para "Premissas Projeção"
2. Clicar na aba "Balanço Patrimonial"
3. Verificar se as premissas de prazos médios foram preenchidas
4. Modificar algumas premissas:
   - Prazo Contas a Receber: alterar de ~45 para 60 dias
   - Taxa Depreciação: ajustar se necessário

5. Salvar premissas

**Resultado esperado:** ✓ Premissas do BP salvas

---

### Passo 3.6: Verificar Balanço Atualizado
1. Navegar para "Balanço Projetado"
2. Verificar se Contas a Receber cresceu (prazo maior)
3. Verificar se o balanço continua equilibrado

**Resultado esperado:** ✓ Balanço atualizado e equilibrado

---

## Cenário 4: Funcionalidades da Tabela Inline

### Passo 4.1: Navegação por Tab
1. Na página "Premissas Projeção", clicar em um input
2. Pressionar Tab para navegar entre células
3. Verificar se a navegação funciona horizontalmente e verticalmente

**Resultado esperado:** ✓ Tab navega entre células de input

---

### Passo 4.2: Botão "Copiar para todos os anos"
1. Modificar o valor do Ano 1 em alguma premissa
2. Clicar no botão "Copiar para todos os anos" (se existir)
3. Verificar se o valor é replicado para Anos 2-5

**Resultado esperado:** ✓ Valor copiado para todos os anos

---

### Passo 4.3: Tooltips Explicativos
1. Passar o mouse sobre os labels das premissas
2. Verificar se aparecem tooltips com explicações

**Resultado esperado:** ✓ Tooltips informativos exibidos

---

## Cenário 5: Validação de Dados

### Passo 5.1: Tentar Salvar Balanço Desequilibrado
1. Voltar para "Dados Ano Base" > "Balanço Patrimonial"
2. Modificar Capital Social para R$ 1.000.000,00 (criar desequilíbrio)
3. Tentar salvar

**Resultado esperado:** ✓ Erro exibido: "Ativo Total deve ser igual a Passivo + PL"

---

### Passo 5.2: Valores Negativos
1. Tentar inserir valores negativos onde não deveria ser permitido
2. Verificar validação

**Resultado esperado:** ✓ Validação adequada de valores

---

## Cenário 6: Responsividade

### Passo 6.1: Teste em Desktop
1. Redimensionar janela para diferentes larguras (1920px, 1440px, 1280px)
2. Verificar se a tabela de premissas se adapta

**Resultado esperado:** ✓ Layout responsivo

---

### Passo 6.2: Teste em Tablet/Mobile
1. Abrir DevTools e simular tablet (768px)
2. Verificar se a tabela tem scroll horizontal
3. Verificar navegação do sidebar

**Resultado esperado:** ✓ Usável em telas menores

---

## Resultados do Teste

### Resumo de Validação

| Cenário | Status | Observações |
|---------|--------|-------------|
| 1. Criar modelo e dados base | ⏳ | Aguardando teste manual |
| 2. Auto-cálculo com defaults | ⏳ | Aguardando teste manual |
| 3. Modificar premissas | ⏳ | Aguardando teste manual |
| 4. Funcionalidades tabela inline | ⏳ | Aguardando teste manual |
| 5. Validação de dados | ⏳ | Aguardando teste manual |
| 6. Responsividade | ⏳ | Aguardando teste manual |

---

## Bugs Encontrados

_Nenhum bug reportado ainda. Preencher após testes._

---

## Melhorias Sugeridas

_Nenhuma melhoria sugerida ainda. Preencher após testes._

---

## Conclusão

**Data de conclusão:** _Aguardando_
**Status geral:** _Aguardando teste manual_
**Aprovado para produção:** ❓
