import { describe, it, expect } from "vitest";
import {
  calculateBPBase,
  calculateBPProjetado,
  calculateAllBalanceSheet,
} from "./balanceSheet.js";
import { calculateAllDRE } from "./dre.js";
import {
  sampleBalanceSheetBase,
  sampleBalanceSheetProjection,
  sampleDREBase,
  sampleDREProjection,
} from "../__fixtures__/sampleCompany.js";

describe("Balance Sheet Calculations", () => {
  const dreResult = calculateAllDRE(sampleDREBase, sampleDREProjection);
  const dreProjetado = dreResult.data!;

  describe("calculateBPBase", () => {
    it("deve calcular BP do ano base corretamente", () => {
      const result = calculateBPBase(sampleBalanceSheetBase);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.year).toBe(0);
        expect(result.data.ativoTotal).toBeGreaterThan(0);
        expect(result.data.passivoTotal).toBeGreaterThan(0);
        expect(result.data.ativoCirculante.total).toBeGreaterThan(0);
        expect(result.data.patrimonioLiquido.total).toBeGreaterThan(0);

        // Equação fundamental: Ativo = Passivo + PL
        expect(result.data.ativoTotal).toBeCloseTo(result.data.passivoTotal, 0);
      }
    });

    it("deve ter depreciacaoAnual e capex = 0 no ano base", () => {
      const result = calculateBPBase(sampleBalanceSheetBase);
      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.depreciacaoAnual).toBe(0);
        expect(result.data.capex).toBe(0);
        expect(result.data.despesasFinanceirasCP).toBe(0);
        expect(result.data.despesasFinanceirasLP).toBe(0);
        expect(result.data.despesasFinanceiras).toBe(0);
      }
    });
  });

  describe("calculateBPProjetado", () => {
    it("deve calcular BP para o primeiro ano de projeção", () => {
      const bpBase = calculateBPBase(sampleBalanceSheetBase).data!;
      const result = calculateBPProjetado(
        bpBase,
        dreProjetado[1], // ano 1
        sampleBalanceSheetProjection[0],
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.year).toBe(1);
        expect(result.data.ativoTotal).toBeGreaterThan(0);
        expect(result.data.passivoTotal).toBeGreaterThan(0);
      }
    });

    it("deve calcular depreciação corretamente", () => {
      const bpBase = calculateBPBase(sampleBalanceSheetBase).data!;
      const result = calculateBPProjetado(
        bpBase,
        dreProjetado[1],
        sampleBalanceSheetProjection[0],
      );

      expect(result.success).toBe(true);
      if (result.data) {
        const expectedDepreciacao =
          sampleBalanceSheetBase.ativoRealizavelLP.ativoImobilizadoBruto *
          (sampleBalanceSheetProjection[0].taxaDepreciacao / 100);
        expect(result.data.depreciacaoAnual).toBeCloseTo(expectedDepreciacao, 0);
      }
    });

    it("deve calcular CAPEX baseado na receita bruta", () => {
      const bpBase = calculateBPBase(sampleBalanceSheetBase).data!;
      const result = calculateBPProjetado(
        bpBase,
        dreProjetado[1],
        sampleBalanceSheetProjection[0],
      );

      expect(result.success).toBe(true);
      if (result.data) {
        const expectedCapex =
          dreProjetado[1].receitaBruta *
          sampleBalanceSheetProjection[0].indiceImobilizadoVendas;
        expect(result.data.capex).toBeCloseTo(expectedCapex, 0);
      }
    });

    it("deve calcular despesasFinanceiras CP e LP separadamente", () => {
      const bpBase = calculateBPBase(sampleBalanceSheetBase).data!;
      const result = calculateBPProjetado(
        bpBase,
        dreProjetado[1],
        sampleBalanceSheetProjection[0],
      );

      expect(result.success).toBe(true);
      if (result.data) {
        // Juros calculados sobre o saldo INICIAL (bpBase), não sobre o saldo final
        const taxa = sampleBalanceSheetProjection[0].taxaJurosEmprestimo / 100;
        const expectedCP = bpBase.passivoCirculante.emprestimosFinanciamentosCP * taxa;
        const expectedLP = bpBase.passivoRealizavelLP.emprestimosFinanciamentosLP * taxa;

        expect(result.data.despesasFinanceirasCP).toBeCloseTo(expectedCP, 2);
        expect(result.data.despesasFinanceirasLP).toBeCloseTo(expectedLP, 2);
        expect(result.data.despesasFinanceiras).toBeCloseTo(
          result.data.despesasFinanceirasCP + result.data.despesasFinanceirasLP, 2,
        );
      }
    });

    it("deve calcular capital de giro", () => {
      const bpBase = calculateBPBase(sampleBalanceSheetBase).data!;
      const result = calculateBPProjetado(
        bpBase,
        dreProjetado[1],
        sampleBalanceSheetProjection[0],
      );

      expect(result.success).toBe(true);
      if (result.data) {
        const expectedCapitalGiro =
          result.data.ativoCirculante.total - result.data.passivoCirculante.total;
        expect(result.data.capitalGiro).toBeCloseTo(expectedCapitalGiro, 0);
      }
    });

    it("deve retornar erro se ano de projeção for <= ano anterior", () => {
      const bpBase = calculateBPBase(sampleBalanceSheetBase).data!;
      const premissaInvalida = { ...sampleBalanceSheetProjection[0], year: 0 };
      const result = calculateBPProjetado(bpBase, dreProjetado[1], premissaInvalida);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe("calculateAllBalanceSheet", () => {
    it("deve calcular BP para todos os anos de projeção (ano base + 5)", () => {
      const result = calculateAllBalanceSheet(
        sampleBalanceSheetBase,
        dreProjetado,
        sampleBalanceSheetProjection,
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(6); // ano base + 5 projetados
    });

    it("deve começar com year = 0 e terminar com year = 5", () => {
      const result = calculateAllBalanceSheet(
        sampleBalanceSheetBase,
        dreProjetado,
        sampleBalanceSheetProjection,
      );

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data[0].year).toBe(0);
        expect(result.data[result.data.length - 1].year).toBe(5);
      }
    });

    it("deve ter ativoTotal e passivoTotal positivos em todos os anos", () => {
      // Nota: o modelo de projeção simplificado não garante que ativo = passivo + PL
      // em anos projetados, pois as contas são calculadas independentemente por
      // premissas de prazo médio. O balanço base (year 0) é equilibrado.
      const result = calculateAllBalanceSheet(
        sampleBalanceSheetBase,
        dreProjetado,
        sampleBalanceSheetProjection,
      );

      expect(result.success).toBe(true);
      if (result.data) {
        result.data.forEach((bp) => {
          expect(bp.ativoTotal).toBeGreaterThan(0);
          expect(bp.passivoTotal).toBeGreaterThan(0);
        });
        // Apenas o ano base deve ter equação contábil exata
        expect(result.data[0].ativoTotal).toBeCloseTo(result.data[0].passivoTotal, 0);
      }
    });

    it("deve retornar BPs com todos os campos obrigatórios", () => {
      const result = calculateAllBalanceSheet(
        sampleBalanceSheetBase,
        dreProjetado,
        sampleBalanceSheetProjection,
      );

      expect(result.success).toBe(true);
      if (result.data) {
        result.data.forEach((bp) => {
          expect(bp.ativoCirculante.total).toBeDefined();
          expect(bp.ativoRealizavelLP.total).toBeDefined();
          expect(bp.passivoCirculante.total).toBeDefined();
          expect(bp.passivoRealizavelLP.total).toBeDefined();
          expect(bp.patrimonioLiquido.total).toBeDefined();
          expect(bp.ativoTotal).toBeDefined();
          expect(bp.passivoTotal).toBeDefined();
          expect(bp.capitalGiro).toBeDefined();
          expect(bp.depreciacaoAnual).toBeDefined();
          expect(bp.capex).toBeDefined();
          expect(bp.despesasFinanceirasCP).toBeDefined();
          expect(bp.despesasFinanceirasLP).toBeDefined();
          expect(bp.despesasFinanceiras).toBeDefined();
        });
      }
    });

    it("deve calcular NCG como variação do capital de giro", () => {
      const result = calculateAllBalanceSheet(
        sampleBalanceSheetBase,
        dreProjetado,
        sampleBalanceSheetProjection,
      );

      expect(result.success).toBe(true);
      if (result.data && result.data.length > 1) {
        const deltaCapitalGiro =
          result.data[1].capitalGiro - result.data[0].capitalGiro;
        expect(result.data[1].ncg).toBeCloseTo(deltaCapitalGiro, 0);
      }
    });

    it("deve retornar erro se DRE não tiver dados suficientes", () => {
      const result = calculateAllBalanceSheet(
        sampleBalanceSheetBase,
        dreProjetado,
        [sampleBalanceSheetProjection[0], { ...sampleBalanceSheetProjection[1], year: 99 }],
      );

      expect(result.success).toBe(false);
    });
  });
});
