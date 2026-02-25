/**
 * Cálculos de Indicadores Financeiros
 *
 * Módulo extensível para cálculo de indicadores/ratios financeiros.
 * Usa registry pattern para facilitar adição de novos indicadores.
 *
 * Usa decimal.js para precisão financeira.
 */

import Decimal from "decimal.js";
import type {
  DRECalculated,
  BalanceSheetCalculated,
  IndicadorCalculated,
  IndicadoresCalculated,
  CalculationResult,
} from "../types/index.js";

// ============================================================
// Funções individuais de indicadores
// ============================================================

/**
 * Vendas-Imobilizado = Receita Bruta / Imobilizado Líquido
 *
 * Indica quanto de receita a empresa gera por unidade de ativo imobilizado.
 * Quanto maior, mais eficiente o uso dos ativos fixos.
 */
function calcVendasImobilizado(
  dre: DRECalculated,
  bp: BalanceSheetCalculated,
): IndicadorCalculated {
  const numerator = new Decimal(dre.receitaBruta);
  const denominator = new Decimal(bp.ativoRealizavelLP.imobilizado);

  const value = denominator.isZero()
    ? new Decimal(0)
    : numerator.div(denominator);

  return {
    year: dre.year,
    id: "vendas-imobilizado",
    label: "Vendas / Imobilizado",
    value: value.toNumber(),
    format: "multiple",
    numerator: numerator.toNumber(),
    denominator: denominator.toNumber(),
  };
}

function calcEmprestimosEbitda(
  dre: DRECalculated,
  bp: BalanceSheetCalculated,
): IndicadorCalculated {
  const cp = new Decimal(bp.passivoCirculante.emprestimosFinanciamentosCP);
  const lp = new Decimal(bp.passivoRealizavelLP.emprestimosFinanciamentosLP);
  const numerator = cp.plus(lp);
  const denominator = new Decimal(dre.ebitda);

  const value = denominator.isZero()
    ? new Decimal(0)
    : numerator.div(denominator);

  return {
    year: dre.year,
    id: "emprestimos-ebitda",
    label: "Empréstimos / EBITDA",
    value: value.toNumber(),
    format: "multiple",
    numerator: numerator.toNumber(),
    denominator: denominator.toNumber(),
  };
}

/**
 * Lucro Líquido / PL = Lucro Líquido / Patrimônio Líquido
 *
 * Indica a rentabilidade do patrimônio líquido (ROE simplificado).
 * Quanto maior, mais rentável para o acionista.
 */
function calcPatrimonioLiquidoLucroLiquido(
  dre: DRECalculated,
  bp: BalanceSheetCalculated,
): IndicadorCalculated {
  const numerator = new Decimal(dre.lucroLiquido);
  const denominator = new Decimal(bp.patrimonioLiquido.total);

  const value = denominator.isZero()
    ? new Decimal(0)
    : numerator.div(denominator).mul(100);

  return {
    year: dre.year,
    id: "lucro-liquido-pl",
    label: "Lucro Líquido / PL",
    value: value.toNumber(),
    format: "percentage",
    numerator: numerator.toNumber(),
    denominator: denominator.toNumber(),
  };
}

// ============================================================
// Registry de indicadores
// ============================================================

type IndicadorFn = (
  dre: DRECalculated,
  bp: BalanceSheetCalculated,
) => IndicadorCalculated;

const INDICATOR_REGISTRY: IndicadorFn[] = [
  calcVendasImobilizado,
  calcEmprestimosEbitda,
  calcPatrimonioLiquidoLucroLiquido,
];

// ============================================================
// API pública
// ============================================================

/**
 * Calcula todos os indicadores para um ano
 *
 * @param dreAno - DRE do ano
 * @param bpAno - BP do ano
 * @returns Resultado do cálculo com indicadores do ano
 */
export function calculateIndicadores(
  dreAno: DRECalculated,
  bpAno: BalanceSheetCalculated,
): CalculationResult<IndicadoresCalculated> {
  try {
    const indicadores = INDICATOR_REGISTRY.map((fn) => fn(dreAno, bpAno));

    return {
      success: true,
      data: { year: dreAno.year, indicadores },
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao calcular indicadores: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Calcula indicadores para todos os anos (incluindo ano base)
 *
 * @param dreCalculado - Array de DREs calculados (incluindo ano base)
 * @param bpCalculado - Array de BPs calculados (incluindo ano base)
 * @returns Resultado do cálculo com array de indicadores
 */
export function calculateAllIndicadores(
  dreCalculado: DRECalculated[],
  bpCalculado: BalanceSheetCalculated[],
): CalculationResult<IndicadoresCalculated[]> {
  try {
    if (dreCalculado.length !== bpCalculado.length) {
      return {
        success: false,
        errors: ["Arrays de DRE e BP devem ter o mesmo tamanho"],
      };
    }

    const results: IndicadoresCalculated[] = [];

    for (let i = 0; i < dreCalculado.length; i++) {
      const result = calculateIndicadores(dreCalculado[i], bpCalculado[i]);

      if (!result.success || !result.data) {
        return {
          success: false,
          errors: result.errors || [
            `Erro ao calcular indicadores do ano ${dreCalculado[i].year}`,
          ],
        };
      }

      results.push(result.data);
    }

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro ao calcular projeção de indicadores: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}
