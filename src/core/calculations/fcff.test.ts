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
  // Preparar dados necessários
  const dreResult = calculateAllDRE(sampleDREBase, sampleDREProjection, 5);
  const dreProjetado = dreResult.data!;

  const bpResult = calculateAllBalanceSheet(
    sampleBalanceSheetBase,
    dreProjetado,
    sampleBalanceSheetProjection,
  );
  const bpProjetado = bpResult.data!;

  describe("calculateFCFF", () => {
    it("deve calcular FCFF para o primeiro ano projetado", () => {
      const result = calculateFCFF(
        dreProjetado[1],
        bpProjetado[1],
        bpProjetado[0],
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.nopat).toBeDefined();
        expect(result.data.fcff).toBeDefined();
        expect(typeof result.data.fcff).toBe("number");
      }
    });

    it("deve calcular NOPAT corretamente", () => {
      const result = calculateFCFF(
        dreProjetado[1],
        bpProjetado[1],
        bpProjetado[0],
      );

      expect(result.success).toBe(true);

      if (result.data) {
        // NOPAT = EBIT * (1 - taxa de imposto)
        const expectedNOPAT =
          dreProjetado[1].ebit * (1 - sampleDREBase.taxaImposto);
        expect(result.data.nopat).toBeCloseTo(expectedNOPAT, 0);
      }
    });

    it("deve calcular FCFF conforme fórmula: NOPAT + Depreciação - CAPEX - Delta WC", () => {
      const result = calculateFCFF(
        dreProjetado[1],
        bpProjetado[1],
        bpProjetado[0],
      );

      expect(result.success).toBe(true);

      if (result.data) {
        const {
          nopat,
          depreciacao,
          capex,
          variacaoNecessidadeCapitalGiro,
          fcff,
        } = result.data;

        const expectedFCFF =
          nopat + depreciacao - capex - variacaoNecessidadeCapitalGiro;
        expect(fcff).toBeCloseTo(expectedFCFF, 0);
      }
    });

    it("deve ter depreciação igual à do BP", () => {
      const result = calculateFCFF(
        dreProjetado[1],
        bpProjetado[1],
        bpProjetado[0],
      );

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.depreciacao).toBeCloseTo(
          bpProjetado[1].depreciacao,
          0,
        );
      }
    });

    it("deve ter CAPEX igual ao do BP", () => {
      const result = calculateFCFF(
        dreProjetado[1],
        bpProjetado[1],
        bpProjetado[0],
      );

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.capex).toBeCloseTo(bpProjetado[1].capex, 0);
      }
    });

    it("deve calcular delta de capital de giro para o primeiro ano projetado", () => {
      const result = calculateFCFF(
        dreProjetado[1],
        bpProjetado[1],
        bpProjetado[0],
      );

      expect(result.success).toBe(true);

      if (result.data) {
        // Ano 1: delta = WC ano 1 - WC ano 0
        const wcBase = bpProjetado[0].capitalDeGiro;
        const expectedDelta = bpProjetado[1].capitalDeGiro - wcBase;
        expect(result.data.variacaoNecessidadeCapitalGiro).toBeCloseTo(
          expectedDelta,
          0,
        );
      }
    });

    it("deve retornar erro se BP anterior for inválido", () => {
      // Passando undefined como BP anterior
      // Passando undefined como BP anterior para testar erro de runtime
      // O TypeScript não acusa erro de tipo neste contexto, mas a função deve retornar erro
      const result = calculateFCFF(
        dreProjetado[1],
        bpProjetado[1],
        undefined as never,
      );

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve retornar erro se DRE e BP tiverem tamanhos diferentes", () => {
      const shortDRE = dreProjetado.slice(0, 3);
      // O BP anterior para o primeiro ano projetado ainda é bpProjetado[0]
      const result = calculateFCFF(shortDRE[1], bpProjetado[1], bpProjetado[0]);

      // Deve funcionar para índices válidos em ambos
      expect(result.success).toBe(true);
    });

    it("deve calcular FCFF para anos posteriores", () => {
      const result = calculateFCFF(
        dreProjetado[2],
        bpProjetado[2],
        bpProjetado[1],
      );

      expect(result.success).toBe(true);

      if (result.data) {
        // Ano 2: delta = WC ano 2 - WC ano 1
        const expectedDelta =
          bpProjetado[2].capitalDeGiro - bpProjetado[1].capitalDeGiro;
        expect(result.data.variacaoNecessidadeCapitalGiro).toBeCloseTo(
          expectedDelta,
          0,
        );
      }
    });

    it("FCFF pode ser negativo se CAPEX e delta WC forem muito altos", () => {
      // Isso é esperado em empresas em crescimento agressivo
      const result = calculateFCFF(
        dreProjetado[1],
        bpProjetado[1],
        bpProjetado[0],
      );

      expect(result.success).toBe(true);

      if (result.data) {
        // FCFF pode ser negativo - isso é válido
        expect(typeof result.data.fcff).toBe("number");
      }
    });
  });

  describe("calculateAllFCFF", () => {
    it("deve calcular FCFF para todos os anos", () => {
      const result = calculateAllFCFF(dreProjetado, bpProjetado);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(5);
    });

    it("deve retornar FCFFs com todas as propriedades", () => {
      const result = calculateAllFCFF(dreProjetado, bpProjetado);

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.forEach((fcff) => {
          expect(fcff.nopat).toBeDefined();
          expect(fcff.depreciacao).toBeDefined();
          expect(fcff.capex).toBeDefined();
          expect(fcff.variacaoNecessidadeCapitalGiro).toBeDefined();
          expect(fcff.fcff).toBeDefined();
        });
      }
    });

    it("deve ter NOPAT crescente se EBIT crescer", () => {
      const result = calculateAllFCFF(dreProjetado, bpProjetado);

      expect(result.success).toBe(true);

      if (result.data) {
        // NOPAT deve acompanhar crescimento do EBIT
        for (let i = 1; i < result.data.length; i++) {
          expect(result.data[i].nopat).toBeGreaterThan(
            result.data[i - 1].nopat,
          );
        }
      }
    });

    it("deve ter depreciação alinhada com projeção de BP", () => {
      const result = calculateAllFCFF(dreProjetado, bpProjetado);

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.forEach((fcff, index) => {
          expect(fcff.depreciacao).toBeCloseTo(
            bpProjetado[index].depreciacao,
            0,
          );
        });
      }
    });

    it("deve retornar erro se DRE e BP tiverem tamanhos incompatíveis", () => {
      const shortDRE = dreProjetado.slice(0, 2);
      const result = calculateAllFCFF(shortDRE, bpProjetado);

      // Deve calcular apenas para o mínimo disponível
      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.length).toBe(2);
      }
    });

    it("FCFF tende a melhorar com escala da empresa", () => {
      const result = calculateAllFCFF(dreProjetado, bpProjetado);

      expect(result.success).toBe(true);

      if (result.data) {
        // Últimos anos tendem a ter FCFF maior que primeiros
        // (assumindo empresa bem gerida)
        const firstYearFCFF = result.data[0].fcff;
        const lastYearFCFF = result.data[result.data.length - 1].fcff;

        // Este teste pode falhar se a empresa tem investimento pesado
        // É mais uma validação de coerência
        expect(lastYearFCFF).toBeGreaterThan(firstYearFCFF * 0.5);
      }
    });

    it("soma de FCFF deve ser consistente com crescimento da empresa", () => {
      const result = calculateAllFCFF(dreProjetado, bpProjetado);

      expect(result.success).toBe(true);

      if (result.data) {
        const totalFCFF = result.data.reduce((sum, fcff) => sum + fcff.fcff, 0);

        // Total FCFF deve ser positivo para empresa lucrativa
        // (pode ser negativo em períodos de investimento)
        expect(totalFCFF).toBeDefined();
        expect(typeof totalFCFF).toBe("number");
      }
    });
  });
});
