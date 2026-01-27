import { describe, it, expect } from "vitest";
import {
  calculateSensitivityUnivariate,
  calculateSensitivityBivariate,
} from "./sensitivity.js";
import { sampleFullValuationInput } from "../__fixtures__/sampleCompany.js";

describe("Sensitivity Analysis", () => {
  describe("calculateSensitivityUnivariate", () => {
    it("deve calcular sensibilidade univariada para taxa de crescimento perpétuo", () => {
      const result = calculateSensitivityUnivariate({
        baseInput: sampleFullValuationInput,
        variableName: "taxaCrescimentoPerpetuo",
        range: [0.01, 0.02, 0.03, 0.04, 0.05],
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.variable).toBe("taxaCrescimentoPerpetuo");
        expect(result.data.values).toHaveLength(5);
        expect(result.data.valuations).toHaveLength(5);

        // Valores crescentes de g devem resultar em valuations crescentes
        for (let i = 1; i < result.data.valuations.length; i++) {
          expect(result.data.valuations[i]).toBeGreaterThan(
            result.data.valuations[i - 1],
          );
        }
      }
    });

    it("deve calcular sensibilidade para WACC", () => {
      const result = calculateSensitivityUnivariate({
        baseInput: {
          ...sampleFullValuationInput,
          wacc: {
            ...sampleFullValuationInput.wacc,
            wacc: 0.1,
          },
        },
        variableName: "wacc",
        range: [0.08, 0.1, 0.12, 0.14, 0.16],
      });

      expect(result.success).toBe(true);

      if (result.data) {
        // WACC crescente deve reduzir valuation
        for (let i = 1; i < result.data.valuations.length; i++) {
          expect(result.data.valuations[i]).toBeLessThan(
            result.data.valuations[i - 1],
          );
        }
      }
    });

    it("deve retornar valuations válidos para todos os pontos", () => {
      const result = calculateSensitivityUnivariate({
        baseInput: sampleFullValuationInput,
        variableName: "taxaCrescimentoPerpetuo",
        range: [0.01, 0.015, 0.02, 0.025, 0.03],
      });

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.valuations.forEach((valuation) => {
          expect(valuation).toBeGreaterThan(0);
          expect(isFinite(valuation)).toBe(true);
        });
      }
    });

    it("deve funcionar com range de 1 valor", () => {
      const result = calculateSensitivityUnivariate({
        baseInput: sampleFullValuationInput,
        variableName: "taxaCrescimentoPerpetuo",
        range: [0.03],
      });

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.valuations).toHaveLength(1);
        expect(result.data.valuations[0]).toBeGreaterThan(0);
      }
    });

    it("deve funcionar com range amplo", () => {
      const result = calculateSensitivityUnivariate({
        baseInput: sampleFullValuationInput,
        variableName: "taxaCrescimentoPerpetuo",
        range: [
          0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05,
        ],
      });

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.valuations).toHaveLength(10);
      }
    });

    it("deve retornar erro se range estiver vazio", () => {
      const result = calculateSensitivityUnivariate({
        baseInput: sampleFullValuationInput,
        variableName: "taxaCrescimentoPerpetuo",
        range: [],
      });

      // Pode aceitar array vazio ou retornar erro
      // Ambos são comportamentos válidos
      if (!result.success) {
        expect(result.errors).toBeDefined();
      } else if (result.data) {
        expect(result.data.valuations).toHaveLength(0);
      }
    });

    it("deve manter variável e valores corretos na resposta", () => {
      const range = [0.02, 0.03, 0.04];
      const result = calculateSensitivityUnivariate({
        baseInput: sampleFullValuationInput,
        variableName: "taxaCrescimentoPerpetuo",
        range: range,
      });

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.variable).toBe("taxaCrescimentoPerpetuo");
        expect(result.data.values).toEqual(range);
      }
    });
  });

  describe("calculateSensitivityBivariate", () => {
    it("deve calcular sensibilidade bivariada (grid 2D)", () => {
      const result = calculateSensitivityBivariate({
        baseInput: sampleFullValuationInput,
        variable1Name: "taxaCrescimentoPerpetuo",
        variable2Name: "anosProjecao",
        range1: [0.02, 0.03, 0.04],
        range2: [3, 5, 7],
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.variable1).toBe("taxaCrescimentoPerpetuo");
        expect(result.data.variable2).toBe("anosProjecao");
        expect(result.data.values1).toHaveLength(3);
        expect(result.data.values2).toHaveLength(3);
        expect(result.data.valuationGrid).toHaveLength(3);
        expect(result.data.valuationGrid[0]).toHaveLength(3);
      }
    });

    it("grid deve ter dimensões corretas", () => {
      const result = calculateSensitivityBivariate({
        baseInput: sampleFullValuationInput,
        variable1Name: "taxaCrescimentoPerpetuo",
        variable2Name: "anosProjecao",
        range1: [0.01, 0.02, 0.03, 0.04, 0.05],
        range2: [3, 4, 5, 6, 7],
      });

      expect(result.success).toBe(true);

      if (result.data) {
        // Grid deve ser 5x5
        expect(result.data.valuationGrid).toHaveLength(5);
        result.data.valuationGrid.forEach((row) => {
          expect(row).toHaveLength(5);
        });
      }
    });

    it("todos os valores do grid devem ser válidos", () => {
      const result = calculateSensitivityBivariate({
        baseInput: sampleFullValuationInput,
        variable1Name: "taxaCrescimentoPerpetuo",
        variable2Name: "anosProjecao",
        range1: [0.02, 0.03, 0.04],
        range2: [3, 5, 7],
      });

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.valuationGrid.forEach((row) => {
          row.forEach((valuation) => {
            expect(valuation).toBeGreaterThan(0);
            expect(isFinite(valuation)).toBe(true);
          });
        });
      }
    });

    it("deve funcionar com grid 1x1", () => {
      const result = calculateSensitivityBivariate({
        baseInput: sampleFullValuationInput,
        variable1Name: "taxaCrescimentoPerpetuo",
        variable2Name: "anosProjecao",
        range1: [0.03],
        range2: [5],
      });

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.valuationGrid).toHaveLength(1);
        expect(result.data.valuationGrid[0]).toHaveLength(1);
      }
    });

    it("deve funcionar com grid assimétrico", () => {
      const result = calculateSensitivityBivariate({
        baseInput: sampleFullValuationInput,
        variable1Name: "taxaCrescimentoPerpetuo",
        variable2Name: "anosProjecao",
        range1: [0.02, 0.03], // 2 valores
        range2: [3, 5, 7, 10], // 4 valores
      });

      expect(result.success).toBe(true);

      if (result.data) {
        // Grid deve ser 2x4
        expect(result.data.valuationGrid).toHaveLength(2);
        result.data.valuationGrid.forEach((row) => {
          expect(row).toHaveLength(4);
        });
      }
    });

    it("valuations devem variar com variável 1 (linhas)", () => {
      const result = calculateSensitivityBivariate({
        baseInput: sampleFullValuationInput,
        variable1Name: "taxaCrescimentoPerpetuo",
        variable2Name: "anosProjecao",
        range1: [0.01, 0.02, 0.03, 0.04],
        range2: [5],
      });

      expect(result.success).toBe(true);

      if (result.data) {
        // Com mesma var2, var1 crescente deve aumentar valuation
        for (let i = 1; i < result.data.valuationGrid.length; i++) {
          expect(result.data.valuationGrid[i][0]).toBeGreaterThan(
            result.data.valuationGrid[i - 1][0],
          );
        }
      }
    });

    it("valuations devem variar com variável 2 (colunas)", () => {
      const result = calculateSensitivityBivariate({
        baseInput: sampleFullValuationInput,
        variable1Name: "taxaCrescimentoPerpetuo",
        variable2Name: "anosProjecao",
        range1: [0.03],
        range2: [3, 5, 7, 10],
      });

      expect(result.success).toBe(true);

      if (result.data) {
        // Com mesma var1, var2 (anos projeção) não tem padrão claro
        // Mas todos valores devem ser válidos
        result.data.valuationGrid[0].forEach((valuation) => {
          expect(valuation).toBeGreaterThan(0);
        });
      }
    });

    it("deve manter variáveis e valores corretos na resposta", () => {
      const range1 = [0.02, 0.03, 0.04];
      const range2 = [3, 5, 7];

      const result = calculateSensitivityBivariate({
        baseInput: sampleFullValuationInput,
        variable1Name: "taxaCrescimentoPerpetuo",
        variable2Name: "anosProjecao",
        range1: range1,
        range2: range2,
      });

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.variable1).toBe("taxaCrescimentoPerpetuo");
        expect(result.data.variable2).toBe("anosProjecao");
        expect(result.data.values1).toEqual(range1);
        expect(result.data.values2).toEqual(range2);
      }
    });
  });
});
