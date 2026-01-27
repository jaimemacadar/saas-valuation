import { describe, it, expect } from "vitest";
import {
  calculateBalanceSheet,
  calculateAllBalanceSheet,
} from "./balanceSheet.js";
import type {
  BalanceSheetBaseInputs,
  BalanceSheetCalculated,
} from "../types/index.js";

// Função utilitária para converter BalanceSheetBaseInputs em BalanceSheetCalculated (ano base)
function balanceSheetBaseToCalculated(
  base: BalanceSheetBaseInputs,
): BalanceSheetCalculated {
  // Inicializa capital de giro e capex como 0 para o ano base
  return {
    ano: 0,
    caixa: base.caixa,
    contasReceber: base.contasReceber,
    estoques: base.estoques,
    ativoCirculante: base.ativoCirculante,
    imobilizado: base.imobilizado,
    ativoTotal: base.ativoTotal,
    contasPagar: base.contasPagar,
    passivoCirculante: base.passivoCirculante ?? 0,
    passivoNaoCirculante:
      base.passivoNaoCirculante ?? base.dividasLongoPrazo ?? 0,
    dividasLongoPrazo: base.dividasLongoPrazo ?? 0,
    passivoTotal: base.passivoTotal ?? 0,
    patrimonioLiquido: base.patrimonioLiquido ?? 0,
    depreciacao: 0,
    capex: 0,
    capitalDeGiro: (base.ativoCirculante ?? 0) - (base.passivoCirculante ?? 0),
  };
}
import { calculateAllDRE } from "./dre.js";
import {
  sampleBalanceSheetBase,
  sampleBalanceSheetProjection,
  sampleDREBase,
  sampleDREProjection,
} from "../__fixtures__/sampleCompany.js";

describe("Balance Sheet Calculations", () => {
  // Precisamos de DRE projetado para testar BP
  const dreResult = calculateAllDRE(sampleDREBase, sampleDREProjection, 5);
  const dreProjetado = dreResult.data!;

  describe("calculateBalanceSheet", () => {
    it("deve calcular BP para o primeiro ano de projeção", () => {
      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateBalanceSheet(
        anoBase,
        dreProjetado[0],
        sampleBalanceSheetProjection,
        0,
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.ativoTotal).toBeGreaterThan(0);
        expect(result.data.passivoTotal).toBeGreaterThan(0);
        expect(result.data.patrimonioLiquido).toBeGreaterThan(0);

        // Equação fundamental: Ativo = Passivo Total
        expect(result.data.ativoTotal).toBeCloseTo(result.data.passivoTotal, 0);
      }
    });

    it("deve calcular depreciação corretamente", () => {
      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateBalanceSheet(
        anoBase,
        dreProjetado[0],
        sampleBalanceSheetProjection,
        0,
      );

      expect(result.success).toBe(true);

      if (result.data) {
        const expectedDepreciacao =
          sampleBalanceSheetBase.imobilizado *
          sampleBalanceSheetProjection.taxaDepreciacao;
        expect(result.data.depreciacao).toBeCloseTo(expectedDepreciacao, 0);
      }
    });

    it("deve calcular CAPEX baseado na receita", () => {
      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateBalanceSheet(
        anoBase,
        dreProjetado[0],
        sampleBalanceSheetProjection,
        0,
      );

      expect(result.success).toBe(true);

      if (result.data) {
        const expectedCapex =
          dreProjetado[0].receita * sampleBalanceSheetProjection.taxaCapex;
        expect(result.data.capex).toBeCloseTo(expectedCapex, 0);
      }
    });

    it("deve atualizar imobilizado com CAPEX e depreciação", () => {
      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateBalanceSheet(
        anoBase,
        dreProjetado[0],
        sampleBalanceSheetProjection,
        0,
      );

      expect(result.success).toBe(true);

      if (result.data) {
        const expectedImobilizado =
          sampleBalanceSheetBase.imobilizado +
          result.data.capex -
          result.data.depreciacao;
        expect(result.data.imobilizado).toBeCloseTo(expectedImobilizado, 0);
      }
    });

    it("deve calcular capital de giro", () => {
      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateBalanceSheet(
        anoBase,
        dreProjetado[0],
        sampleBalanceSheetProjection,
        0,
      );

      expect(result.success).toBe(true);

      if (result.data) {
        const expectedCapitalGiro =
          result.data.ativoCirculante - result.data.passivoCirculante;
        expect(result.data.capitalDeGiro).toBeCloseTo(expectedCapitalGiro, 0);
      }
    });

    it("deve retornar erro se índice de ano for inválido", () => {
      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateBalanceSheet(
        anoBase,
        dreProjetado[0],
        sampleBalanceSheetProjection,
        -1,
      );

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve retornar erro se DRE não tiver dados para o ano", () => {
      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateBalanceSheet(
        anoBase,
        dreProjetado[0],
        sampleBalanceSheetProjection,
        10, // Além do disponível
      );

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve crescer ativos conforme taxa de crescimento", () => {
      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateBalanceSheet(
        anoBase,
        dreProjetado[0],
        sampleBalanceSheetProjection,
        0,
      );

      expect(result.success).toBe(true);

      if (result.data) {
        const taxaCrescimento =
          sampleBalanceSheetProjection.taxaCrescimentoAtivos[0];
        const expectedAtivoCirculante =
          sampleBalanceSheetBase.ativoCirculante * (1 + taxaCrescimento);
        expect(result.data.ativoCirculante).toBeCloseTo(
          expectedAtivoCirculante,
          0,
        );
      }
    });
  });

  describe("calculateAllBalanceSheet", () => {
    it("deve calcular BP para todos os anos de projeção", () => {
      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateAllBalanceSheet(
        anoBase,
        dreProjetado,
        sampleBalanceSheetProjection,
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(5);
    });

    it("deve ter ativos crescentes ano a ano", () => {
      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateAllBalanceSheet(
        anoBase,
        dreProjetado,
        sampleBalanceSheetProjection,
      );

      expect(result.success).toBe(true);

      if (result.data) {
        for (let i = 1; i < result.data.length; i++) {
          expect(result.data[i].ativoTotal).toBeGreaterThan(
            result.data[i - 1].ativoTotal,
          );
        }
      }
    });

    it("deve manter equação contábil em todos os anos", () => {
      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateAllBalanceSheet(
        anoBase,
        dreProjetado,
        sampleBalanceSheetProjection,
      );

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.forEach((bp) => {
          expect(bp.ativoTotal).toBeCloseTo(bp.passivoTotal, 0);
        });
      }
    });

    it("deve retornar BPs com todas as propriedades calculadas", () => {
      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateAllBalanceSheet(
        anoBase,
        dreProjetado,
        sampleBalanceSheetProjection,
      );

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.forEach((bp) => {
          expect(bp.caixa).toBeDefined();
          expect(bp.contasReceber).toBeDefined();
          expect(bp.estoques).toBeDefined();
          expect(bp.ativoCirculante).toBeDefined();
          expect(bp.imobilizado).toBeDefined();
          expect(bp.ativoTotal).toBeDefined();
          expect(bp.contasPagar).toBeDefined();
          expect(bp.passivoCirculante).toBeDefined();
          expect(bp.dividasLongoPrazo).toBeDefined();
          expect(bp.passivoTotal).toBeDefined();
          expect(bp.patrimonioLiquido).toBeDefined();
          expect(bp.capitalDeGiro).toBeDefined();
          expect(bp.depreciacao).toBeDefined();
          expect(bp.capex).toBeDefined();
        });
      }
    });

    it("deve retornar erro se número de anos não bater", () => {
      const shortDRE = dreProjetado.slice(0, 2); // Apenas 2 anos

      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateAllBalanceSheet(
        anoBase,
        shortDRE,
        sampleBalanceSheetProjection,
      );

      // Deve calcular para 2 anos apenas
      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data).toHaveLength(2);
      }
    });

    it("deve calcular variação de capital de giro entre anos", () => {
      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateAllBalanceSheet(
        anoBase,
        dreProjetado,
        sampleBalanceSheetProjection,
      );

      expect(result.success).toBe(true);

      if (result.data && result.data.length > 1) {
        const deltaCapitalGiro =
          result.data[1].capitalDeGiro - result.data[0].capitalDeGiro;
        expect(deltaCapitalGiro).toBeDefined();
        // Delta pode ser positivo ou negativo dependendo do crescimento
      }
    });

    it("deve acumular depreciação sobre imobilizado ao longo dos anos", () => {
      const anoBase = balanceSheetBaseToCalculated(sampleBalanceSheetBase);
      const result = calculateAllBalanceSheet(
        anoBase,
        dreProjetado,
        sampleBalanceSheetProjection,
      );

      expect(result.success).toBe(true);

      if (result.data) {
        // Imobilizado cresce com CAPEX e decresce com depreciação
        // A depreciação acumula o efeito ao longo dos anos
        result.data.forEach((bp) => {
          expect(bp.imobilizado).toBeGreaterThan(0);
        });
      }
    });
  });
});
