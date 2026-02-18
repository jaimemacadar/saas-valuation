import { describe, it, expect } from "vitest";
import { calculateFCFF, calculateAllFCFF } from "./fcff.js";
import { calculateAllDRE } from "./dre.js";
import { calculateAllBalanceSheet } from "./balanceSheet.js";
import {
  sampleDREBase,
  sampleDREProjection,
  sampleBalanceSheetBase,
  sampleBalanceSheetProjection,
} from "../__fixtures__/sampleCompany.js";

describe("FCFF Calculations", () => {
  // Preparar dados: DRE sem integração BP (despesasFinanceiras = 0)
  const dreResult = calculateAllDRE(sampleDREBase, sampleDREProjection);
  const dreProjetado = dreResult.data!;

  const bpResult = calculateAllBalanceSheet(
    sampleBalanceSheetBase,
    dreProjetado,
    sampleBalanceSheetProjection,
  );
  const bpProjetado = bpResult.data!;

  describe("calculateFCFF", () => {
    it("deve calcular FCFF para o primeiro ano projetado", () => {
      // dreProjetado[1] = ano 1, bpProjetado[1] = ano 1
      const result = calculateFCFF(dreProjetado[1], bpProjetado[1]);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(typeof result.data.nopat).toBe("number");
        expect(typeof result.data.fcff).toBe("number");
      }
    });

    it("deve calcular NOPAT = EBIT - IR/CSLL", () => {
      const result = calculateFCFF(dreProjetado[1], bpProjetado[1]);

      expect(result.success).toBe(true);

      if (result.data) {
        const expectedNOPAT = dreProjetado[1].ebit - dreProjetado[1].irCSLL;
        expect(result.data.nopat).toBeCloseTo(expectedNOPAT, 0);
      }
    });

    it("deve calcular FCFF = EBIT - NCG - CAPEX", () => {
      const result = calculateFCFF(dreProjetado[1], bpProjetado[1]);

      expect(result.success).toBe(true);

      if (result.data) {
        const { ebit, ncg, capex, fcff } = result.data;
        const expectedFCFF = ebit - ncg - capex;
        expect(fcff).toBeCloseTo(expectedFCFF, 0);
      }
    });

    it("deve ter depreciacaoAmortizacao do DRE", () => {
      const result = calculateFCFF(dreProjetado[1], bpProjetado[1]);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.depreciacaoAmortizacao).toBeCloseTo(
          dreProjetado[1].depreciacaoAmortizacao,
          0,
        );
      }
    });

    it("deve ter CAPEX igual ao do BP", () => {
      const result = calculateFCFF(dreProjetado[1], bpProjetado[1]);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.capex).toBeCloseTo(bpProjetado[1].capex, 0);
      }
    });

    it("deve ter NCG igual ao do BP", () => {
      const result = calculateFCFF(dreProjetado[1], bpProjetado[1]);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.ncg).toBeCloseTo(bpProjetado[1].ncg, 0);
      }
    });

    it("deve calcular FCFF para anos posteriores", () => {
      const result = calculateFCFF(dreProjetado[2], bpProjetado[2]);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(typeof result.data.fcff).toBe("number");
        expect(isFinite(result.data.fcff)).toBe(true);
      }
    });

    it("FCFF pode ser negativo se CAPEX e NCG forem altos", () => {
      // Isso é esperado em empresas em crescimento agressivo
      const result = calculateFCFF(dreProjetado[1], bpProjetado[1]);

      expect(result.success).toBe(true);

      if (result.data) {
        // FCFF pode ser negativo - isso é válido
        expect(typeof result.data.fcff).toBe("number");
      }
    });

    it("deve retornar year correto do DRE", () => {
      const result = calculateFCFF(dreProjetado[1], bpProjetado[1]);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.year).toBe(1);
      }
    });
  });

  describe("calculateAllFCFF", () => {
    it("deve calcular FCFF para todos os anos projetados", () => {
      const result = calculateAllFCFF(dreProjetado, bpProjetado);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(5); // 5 anos projetados (sem ano base)
    });

    it("deve retornar FCFFs com todas as propriedades obrigatórias", () => {
      const result = calculateAllFCFF(dreProjetado, bpProjetado);

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.forEach((fcff) => {
          expect(typeof fcff.year).toBe("number");
          expect(typeof fcff.ebit).toBe("number");
          expect(typeof fcff.nopat).toBe("number");
          expect(typeof fcff.depreciacaoAmortizacao).toBe("number");
          expect(typeof fcff.capex).toBe("number");
          expect(typeof fcff.ncg).toBe("number");
          expect(typeof fcff.fcff).toBe("number");
        });
      }
    });

    it("anos devem ser sequenciais (1, 2, 3, 4, 5)", () => {
      const result = calculateAllFCFF(dreProjetado, bpProjetado);

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.forEach((fcff, index) => {
          expect(fcff.year).toBe(index + 1);
        });
      }
    });

    it("deve ter NOPAT crescente se EBIT crescer", () => {
      const result = calculateAllFCFF(dreProjetado, bpProjetado);

      expect(result.success).toBe(true);

      if (result.data) {
        for (let i = 1; i < result.data.length; i++) {
          expect(result.data[i].nopat).toBeGreaterThan(
            result.data[i - 1].nopat,
          );
        }
      }
    });

    it("deve ter depreciacaoAmortizacao alinhada com DRE", () => {
      const result = calculateAllFCFF(dreProjetado, bpProjetado);

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.forEach((fcff, index) => {
          // fcff[index] corresponde ao dreProjetado[index + 1] (pula o ano base)
          expect(fcff.depreciacaoAmortizacao).toBeCloseTo(
            dreProjetado[index + 1].depreciacaoAmortizacao,
            0,
          );
        });
      }
    });

    it("deve retornar erro se DRE e BP tiverem tamanhos diferentes", () => {
      const shortDRE = dreProjetado.slice(0, 3); // 3 elementos vs 6 do bpProjetado
      const result = calculateAllFCFF(shortDRE, bpProjetado);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve retornar erro se arrays tiverem menos de 2 elementos", () => {
      const result = calculateAllFCFF([dreProjetado[0]], [bpProjetado[0]]);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("soma de FCFF deve ser um número finito válido", () => {
      const result = calculateAllFCFF(dreProjetado, bpProjetado);

      expect(result.success).toBe(true);

      if (result.data) {
        const totalFCFF = result.data.reduce((sum, fcff) => sum + fcff.fcff, 0);
        expect(typeof totalFCFF).toBe("number");
        expect(isFinite(totalFCFF)).toBe(true);
      }
    });

    it("CAPEX deve ser positivo em todos os anos", () => {
      const result = calculateAllFCFF(dreProjetado, bpProjetado);

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.forEach((fcff) => {
          expect(fcff.capex).toBeGreaterThanOrEqual(0);
        });
      }
    });
  });
});
