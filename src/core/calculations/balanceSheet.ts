/**
 * Cálculos de Balanço Patrimonial
 *
 * Implementa projeções de Balanço Patrimonial integradas com DRE conforme PRD.
 * Usa decimal.js para precisão financeira.
 */

import Decimal from "decimal.js";
import type {
  BalanceSheetBaseInputs,
  BalanceSheetProjectionInputs,
  BalanceSheetCalculated,
  DRECalculated,
  CalculationResult,
} from "../types/index.js";

/**
 * Calcula Balanço Patrimonial do ano base a partir dos inputs
 *
 * @param bpBase - Dados de entrada do ano base
 * @returns BP calculado do ano base (year 0)
 */
export function calculateBPBase(
  bpBase: BalanceSheetBaseInputs,
): CalculationResult<BalanceSheetCalculated> {
  try {
    // Ativo Circulante
    const acCaixa = new Decimal(bpBase.ativoCirculante.caixaEquivalentes);
    const acAplicacoes = new Decimal(bpBase.ativoCirculante.aplicacoesFinanceiras);
    const acContasReceber = new Decimal(bpBase.ativoCirculante.contasReceber);
    const acEstoques = new Decimal(bpBase.ativoCirculante.estoques);
    const acAtivosBio = new Decimal(bpBase.ativoCirculante.ativosBiologicos);
    const acOutros = new Decimal(bpBase.ativoCirculante.outrosCreditos);
    const totalAC = acCaixa
      .plus(acAplicacoes)
      .plus(acContasReceber)
      .plus(acEstoques)
      .plus(acAtivosBio)
      .plus(acOutros);

    // Ativo Realizável LP
    const arlpInvestimentos = new Decimal(
      bpBase.ativoRealizavelLP.investimentos,
    );
    const arlpImobBruto = new Decimal(
      bpBase.ativoRealizavelLP.ativoImobilizadoBruto,
    );
    const arlpDeprecAcum = new Decimal(
      bpBase.ativoRealizavelLP.depreciacaoAcumulada,
    );
    const arlpImobilizado = arlpImobBruto.minus(arlpDeprecAcum);
    const arlpIntangivel = new Decimal(bpBase.ativoRealizavelLP.intangivel);
    const totalARLP = arlpInvestimentos
      .plus(arlpImobilizado)
      .plus(arlpIntangivel);

    // Passivo Circulante
    const pcFornecedores = new Decimal(bpBase.passivoCirculante.fornecedores);
    const pcImpostos = new Decimal(bpBase.passivoCirculante.impostosAPagar);
    const pcObrigacoes = new Decimal(
      bpBase.passivoCirculante.obrigacoesSociaisETrabalhistas,
    );
    const pcEmprestimosCP = new Decimal(
      bpBase.passivoCirculante.emprestimosFinanciamentosCP,
    );
    const pcOutras = new Decimal(bpBase.passivoCirculante.outrasObrigacoes);
    const totalPC = pcFornecedores
      .plus(pcImpostos)
      .plus(pcObrigacoes)
      .plus(pcEmprestimosCP)
      .plus(pcOutras);

    // Passivo Realizável LP
    const prlpEmprestimosLP = new Decimal(
      bpBase.passivoRealizavelLP.emprestimosFinanciamentosLP,
    );
    const totalPRLP = prlpEmprestimosLP;

    // Patrimônio Líquido
    const plCapitalSocial = new Decimal(
      bpBase.patrimonioLiquido.capitalSocial,
    );
    const plLucrosAcum = new Decimal(
      bpBase.patrimonioLiquido.lucrosAcumulados,
    );
    const totalPL = plCapitalSocial.plus(plLucrosAcum);

    // Totais gerais
    const ativoTotal = totalAC.plus(totalARLP);
    const passivoTotal = totalPC.plus(totalPRLP).plus(totalPL);

    // Capital de Giro — excluindo Aplicações Financeiras (conta financeira, não operacional)
    const capitalGiro = totalAC.minus(acAplicacoes).minus(totalPC);

    return {
      success: true,
      data: {
        year: 0,
        ativoCirculante: {
          caixaEquivalentes: acCaixa.toNumber(),
          aplicacoesFinanceiras: acAplicacoes.toNumber(),
          contasReceber: acContasReceber.toNumber(),
          estoques: acEstoques.toNumber(),
          ativosBiologicos: acAtivosBio.toNumber(),
          outrosCreditos: acOutros.toNumber(),
          total: totalAC.toNumber(),
        },
        ativoRealizavelLP: {
          investimentos: arlpInvestimentos.toNumber(),
          imobilizadoBruto: arlpImobBruto.toNumber(),
          depreciacaoAcumulada: arlpDeprecAcum.toNumber(),
          imobilizado: arlpImobilizado.toNumber(),
          intangivel: arlpIntangivel.toNumber(),
          total: totalARLP.toNumber(),
        },
        passivoCirculante: {
          fornecedores: pcFornecedores.toNumber(),
          impostosAPagar: pcImpostos.toNumber(),
          obrigacoesSociaisETrabalhistas: pcObrigacoes.toNumber(),
          emprestimosFinanciamentosCP: pcEmprestimosCP.toNumber(),
          outrasObrigacoes: pcOutras.toNumber(),
          total: totalPC.toNumber(),
        },
        passivoRealizavelLP: {
          emprestimosFinanciamentosLP: prlpEmprestimosLP.toNumber(),
          total: totalPRLP.toNumber(),
        },
        patrimonioLiquido: {
          capitalSocial: plCapitalSocial.toNumber(),
          lucrosAcumulados: plLucrosAcum.toNumber(),
          total: totalPL.toNumber(),
        },
        depreciacaoAnual: 0,
        capex: 0,
        novosEmprestimosFinanciamentosCP: 0,
        novosEmprestimosFinanciamentosLP: 0,
        despesasFinanceirasCP: 0,
        despesasFinanceirasLP: 0,
        despesasFinanceiras: 0,
        receitasFinanceiras: 0,
        novasAplicacoes: 0,
        capitalGiro: capitalGiro.toNumber(),
        ncg: 0,
        ativoTotal: ativoTotal.toNumber(),
        passivoTotal: passivoTotal.toNumber(),
      },
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao calcular BP base: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Calcula BP projetado de um ano baseado no ano anterior, DRE e premissas
 *
 * @param bpAnterior - BP do ano anterior
 * @param dreAno - DRE do ano atual
 * @param premissas - Premissas de projeção do ano atual
 * @returns BP calculado do ano projetado
 */
export function calculateBPProjetado(
  bpAnterior: BalanceSheetCalculated,
  dreAno: DRECalculated,
  premissas: BalanceSheetProjectionInputs,
): CalculationResult<BalanceSheetCalculated> {
  try {
    // Validar year
    if (premissas.year <= bpAnterior.year) {
      return {
        success: false,
        errors: [
          `Ano de projeção ${premissas.year} deve ser maior que ano anterior ${bpAnterior.year}`,
        ],
      };
    }

    const receitaBruta = new Decimal(dreAno.receitaBruta);

    // ========== ATIVO CIRCULANTE ==========
    // Caixa e Equivalentes: prazo médio (sem mudança)
    const acCaixa = receitaBruta
      .times(premissas.prazoCaixaEquivalentes)
      .div(360);

    // Aplicações Financeiras: lógica de saldo
    const saldoInicialAplicacoes = new Decimal(bpAnterior.ativoCirculante.aplicacoesFinanceiras);
    const taxaJurosAplicacoes = new Decimal(premissas.taxaJurosAplicacoes ?? 0).div(100);
    const receitasFinanceiras = saldoInicialAplicacoes.times(taxaJurosAplicacoes);
    const novasAplicacoes = new Decimal(0); // placeholder — será conectado ao FCFF
    const acAplicacoes = saldoInicialAplicacoes.plus(novasAplicacoes).plus(receitasFinanceiras);

    // Bases de cálculo da DRE
    const cmv = new Decimal(dreAno.cmv);
    const impostosEDevolucoes = new Decimal(dreAno.impostosEDevolucoes);
    const despesasOperacionais = new Decimal(dreAno.despesasOperacionais);

    // Prazos médios em dias
    const acContasReceber = receitaBruta
      .times(premissas.prazoContasReceber)
      .div(360);
    const acEstoques = cmv.times(premissas.prazoEstoques).div(360);
    const acAtivosBio = receitaBruta
      .times(premissas.prazoAtivosBiologicos)
      .div(360);

    // Outros Créditos: prazo médio sobre Receita Bruta
    const acOutros = receitaBruta.times(premissas.prazoOutrosCreditos).div(360);

    const totalAC = acCaixa
      .plus(acAplicacoes)
      .plus(acContasReceber)
      .plus(acEstoques)
      .plus(acAtivosBio)
      .plus(acOutros);

    // ========== ATIVO REALIZÁVEL LP ==========
    // Investimentos: manter do ano anterior (simplificação)
    const arlpInvestimentos = new Decimal(
      bpAnterior.ativoRealizavelLP.investimentos,
    );

    // Imobilizado
    const taxaDepreciacao = new Decimal(premissas.taxaDepreciacao).div(100);
    const depreciacaoAnual = new Decimal(
      bpAnterior.ativoRealizavelLP.imobilizadoBruto,
    ).times(taxaDepreciacao);

    // CAPEX: Receita Bruta * Índice Imobilizado/Vendas
    const capex = receitaBruta.times(premissas.indiceImobilizadoVendas);

    const arlpImobBruto = new Decimal(
      bpAnterior.ativoRealizavelLP.imobilizadoBruto,
    ).plus(capex);
    const arlpDeprecAcum = new Decimal(
      bpAnterior.ativoRealizavelLP.depreciacaoAcumulada,
    ).plus(depreciacaoAnual);
    const arlpImobilizado = arlpImobBruto.minus(arlpDeprecAcum);

    // Intangível: manter do ano anterior
    const arlpIntangivel = new Decimal(
      bpAnterior.ativoRealizavelLP.intangivel,
    );

    const totalARLP = arlpInvestimentos
      .plus(arlpImobilizado)
      .plus(arlpIntangivel);

    // ========== PASSIVO CIRCULANTE ==========
    // Prazos médios com bases corretas por conta
    const pcFornecedores = cmv.times(premissas.prazoFornecedores).div(360);
    const pcImpostos = impostosEDevolucoes.times(premissas.prazoImpostosAPagar).div(360);
    const pcObrigacoes = despesasOperacionais.times(premissas.prazoObrigacoesSociais).div(360);

    // ========== DESPESAS FINANCEIRAS ==========
    // Calculadas sobre o saldo inicial (ano anterior) para evitar circularidade
    const taxaJuros = new Decimal(premissas.taxaJurosEmprestimo ?? 0).div(100);
    const despesasFinanceirasCP = new Decimal(
      bpAnterior.passivoCirculante.emprestimosFinanciamentosCP,
    ).times(taxaJuros);
    const despesasFinanceirasLP = new Decimal(
      bpAnterior.passivoRealizavelLP.emprestimosFinanciamentosLP,
    ).times(taxaJuros);
    const despesasFinanceiras = despesasFinanceirasCP.plus(despesasFinanceirasLP);

    // Empréstimos CP: início + novos - juros pagos
    // Suporte a legado: fallback para taxaNovosEmprestimosFinanciamentos se CP/LP não existirem
    const taxaCP = new Decimal(
      premissas.taxaNovosEmprestimosCP ??
      (premissas as any).taxaNovosEmprestimosFinanciamentos ??
      0
    ).div(100);
    const novosEmprestimosCP = new Decimal(
      bpAnterior.passivoCirculante.emprestimosFinanciamentosCP,
    ).times(taxaCP);
    const pcEmprestimosCP = new Decimal(
      bpAnterior.passivoCirculante.emprestimosFinanciamentosCP,
    ).plus(novosEmprestimosCP).minus(despesasFinanceirasCP);

    // Outras Obrigações: prazo médio sobre Receita Bruta
    const pcOutras = receitaBruta.times(premissas.prazoOutrasObrigacoes).div(360);

    const totalPC = pcFornecedores
      .plus(pcImpostos)
      .plus(pcObrigacoes)
      .plus(pcEmprestimosCP)
      .plus(pcOutras);

    // ========== PASSIVO REALIZÁVEL LP ==========
    // Empréstimos LP: início + novos - juros pagos
    const taxaLP = new Decimal(
      premissas.taxaNovosEmprestimosLP ??
      (premissas as any).taxaNovosEmprestimosFinanciamentos ??
      0
    ).div(100);
    const novosEmprestimosLP = new Decimal(
      bpAnterior.passivoRealizavelLP.emprestimosFinanciamentosLP,
    ).times(taxaLP);
    const prlpEmprestimosLP = new Decimal(
      bpAnterior.passivoRealizavelLP.emprestimosFinanciamentosLP,
    ).plus(novosEmprestimosLP).minus(despesasFinanceirasLP);
    const totalPRLP = prlpEmprestimosLP;

    // ========== PATRIMÔNIO LÍQUIDO ==========
    // Capital Social: manter
    const plCapitalSocial = new Decimal(
      bpAnterior.patrimonioLiquido.capitalSocial,
    );

    // Lucros Acumulados: ano anterior + lucro líquido - dividendos
    const plLucrosAcum = new Decimal(
      bpAnterior.patrimonioLiquido.lucrosAcumulados,
    )
      .plus(dreAno.lucroLiquido)
      .minus(dreAno.dividendos);

    const totalPL = plCapitalSocial.plus(plLucrosAcum);

    // ========== TOTAIS E CONTAS AUXILIARES ==========
    const ativoTotal = totalAC.plus(totalARLP);
    const passivoTotal = totalPC.plus(totalPRLP).plus(totalPL);
    // Capital de Giro — excluindo Aplicações Financeiras (conta financeira, não operacional)
    const capitalGiro = totalAC.minus(acAplicacoes).minus(totalPC);
    const ncg = capitalGiro.minus(bpAnterior.capitalGiro);

    return {
      success: true,
      data: {
        year: premissas.year,
        ativoCirculante: {
          caixaEquivalentes: acCaixa.toNumber(),
          aplicacoesFinanceiras: acAplicacoes.toNumber(),
          contasReceber: acContasReceber.toNumber(),
          estoques: acEstoques.toNumber(),
          ativosBiologicos: acAtivosBio.toNumber(),
          outrosCreditos: acOutros.toNumber(),
          total: totalAC.toNumber(),
        },
        ativoRealizavelLP: {
          investimentos: arlpInvestimentos.toNumber(),
          imobilizadoBruto: arlpImobBruto.toNumber(),
          depreciacaoAcumulada: arlpDeprecAcum.toNumber(),
          imobilizado: arlpImobilizado.toNumber(),
          intangivel: arlpIntangivel.toNumber(),
          total: totalARLP.toNumber(),
        },
        passivoCirculante: {
          fornecedores: pcFornecedores.toNumber(),
          impostosAPagar: pcImpostos.toNumber(),
          obrigacoesSociaisETrabalhistas: pcObrigacoes.toNumber(),
          emprestimosFinanciamentosCP: pcEmprestimosCP.toNumber(),
          outrasObrigacoes: pcOutras.toNumber(),
          total: totalPC.toNumber(),
        },
        passivoRealizavelLP: {
          emprestimosFinanciamentosLP: prlpEmprestimosLP.toNumber(),
          total: totalPRLP.toNumber(),
        },
        patrimonioLiquido: {
          capitalSocial: plCapitalSocial.toNumber(),
          lucrosAcumulados: plLucrosAcum.toNumber(),
          total: totalPL.toNumber(),
        },
        depreciacaoAnual: depreciacaoAnual.toNumber(),
        capex: capex.toNumber(),
        novosEmprestimosFinanciamentosCP: novosEmprestimosCP.toNumber(),
        novosEmprestimosFinanciamentosLP: novosEmprestimosLP.toNumber(),
        despesasFinanceirasCP: despesasFinanceirasCP.toNumber(),
        despesasFinanceirasLP: despesasFinanceirasLP.toNumber(),
        despesasFinanceiras: despesasFinanceiras.toNumber(),
        receitasFinanceiras: receitasFinanceiras.toNumber(),
        novasAplicacoes: novasAplicacoes.toNumber(),
        capitalGiro: capitalGiro.toNumber(),
        ncg: ncg.toNumber(),
        ativoTotal: ativoTotal.toNumber(),
        passivoTotal: passivoTotal.toNumber(),
      },
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao calcular BP projetado: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Calcula projeção completa de BP integrada com DRE
 * NOTA: Requer DRE já calculado (ano base + projetado)
 *
 * @param bpBase - Dados de entrada do ano base
 * @param dreCalculado - Array de DRE calculado (incluindo ano base)
 * @param premissasProjecao - Array de premissas BP por ano (1, 2, 3...)
 * @returns Array com BP do ano base + BPs projetados
 */
export function calculateAllBalanceSheet(
  bpBase: BalanceSheetBaseInputs,
  dreCalculado: DRECalculated[],
  premissasProjecao: BalanceSheetProjectionInputs[],
): CalculationResult<BalanceSheetCalculated[]> {
  try {
    // Validar entradas
    if (dreCalculado.length === 0) {
      return {
        success: false,
        errors: ["Array de DRE calculado não pode ser vazio"],
      };
    }

    if (premissasProjecao.length === 0) {
      return {
        success: false,
        errors: ["Array de premissas de projeção não pode ser vazio"],
      };
    }

    // Calcular ano base (year 0)
    const resultadoBase = calculateBPBase(bpBase);
    if (!resultadoBase.success || !resultadoBase.data) {
      return {
        success: false,
        errors: resultadoBase.errors || ["Erro ao calcular BP base"],
      };
    }

    const bpProjetado: BalanceSheetCalculated[] = [resultadoBase.data];

    // Calcular cada ano projetado (alinhado com DRE projetado)
    for (let i = 0; i < premissasProjecao.length; i++) {
      const bpAnterior = bpProjetado[bpProjetado.length - 1];
      const premissas = premissasProjecao[i];

      // DRE do ano atual (year 1, 2, 3...)
      const dreAno = dreCalculado.find((d) => d.year === premissas.year);
      if (!dreAno) {
        return {
          success: false,
          errors: [
            `DRE não encontrado para o ano ${premissas.year}. Certifique-se de que DRE foi calculado primeiro.`,
          ],
        };
      }

      const resultado = calculateBPProjetado(bpAnterior, dreAno, premissas);

      if (!resultado.success || !resultado.data) {
        return {
          success: false,
          errors: resultado.errors || [
            `Erro ao calcular BP do ano ${premissas.year}`,
          ],
        };
      }

      bpProjetado.push(resultado.data);
    }

    return {
      success: true,
      data: bpProjetado,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao calcular projeção completa de BP: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}
