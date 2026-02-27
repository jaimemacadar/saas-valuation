# Workflow: Bug de Premissas Nao Atualizando Projecoes (Producao)

## Contexto
- Sintoma: alteracoes nas premissas nao refletem nas tabelas e projecoes.
- Ambiente: modo producao (nao mock).
- Hipotese principal: dados legados do BP sem campos novos (ex.: `prazoAtivosBiologicos`) interrompem o recalc e deixam UI com dados antigos.

## Agentes/Skills aplicados
- `bug-fixer` (ai-context): reproduzir, achar causa raiz, corrigir com baixo impacto.
- `code-reviewer` (ai-context): revisar risco de regressao e cobertura de testes.
- Skills: `bug-investigation`, `code-review`.

## Fluxo de Investigacao
1. Reproduzir
- Abrir modelo antigo em producao.
- Alterar premissa na aba de projecoes/tabelas inline.
- Confirmar se "Salvo" aparece, mas valores calculados nao mudam.

2. Isolar ponto de quebra
- Verificar `saveDREProjection` / `saveBalanceSheetProjection`.
- Verificar execucao de `recalculateModel`.
- Confirmar se o recalc falha com campo ausente em `balanceSheetProjection` legado.

3. Validar impacto de novas contas (Ano Base)
- Conferir inclusao de `ativosBiologicos` e `prazoAtivosBiologicos`.
- Garantir fallback para modelos antigos sem esse campo.

4. Confirmar core de calculo
- Executar testes do core (`balanceSheet`, `dre`, `fcff`).
- Confirmar que o pipeline DRE -> BP -> DRE -> BP -> FCFF retorna sucesso.

## Correcao implementada
1. Backward compatibility no core
- `calculateBPProjetado` usa fallback `prazoAtivosBiologicos ?? 0`.

2. Transparencia no save de premissas
- `saveDREProjection` e `saveBalanceSheetProjection` agora retornam erro quando `recalculateModel` falha.
- Evita falso positivo de "salvo com sucesso" quando os calculos nao foram atualizados.

3. Teste de regressao
- Cenário legado: projection sem `prazoAtivosBiologicos` continua calculando sem quebrar.

## Checklist de Validacao Final
- Alterar premissa DRE e verificar atualizacao imediata das linhas calculadas.
- Alterar premissa BP e verificar reflexo em tabelas auxiliares e FCFF.
- Confirmar ausencia de erro silencioso ao salvar.
- Rodar testes automatizados relevantes antes de merge.
