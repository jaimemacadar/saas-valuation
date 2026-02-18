import { describe, it, expect } from "vitest";
import {
  executeFullValuation,
  executeQuickValuation,
} from "./fullValuation.js";
import {
  sampleFullValuationInput,
  startupFullValuationInput,
  matureFullValuationInput,
} from "../__fixtures__/sampleCompany.js";

describe("Full Valuation Orchestrator", () => {
  describe("executeFullValuation", () => {
    it("deve executar valuation completo com sucesso", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.dre).toBeDefined();
        expect(result.data.balanceSheet).toBeDefined();
        expect(result.data.fcff).toBeDefined();
        expect(result.data.valuation).toBeDefined();
        expect(result.data.wacc).toBeDefined();
      }
    });

    it("deve retornar DRE com ano base + anos projetados", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        // DRE inclui ano base (year=0) + anos projetados
        expect(result.data.dre).toHaveLength(
          sampleFullValuationInput.anosProjecao + 1,
        );
        expect(result.data.dre[0].year).toBe(0);
        expect(result.data.dre[result.data.dre.length - 1].year).toBe(
          sampleFullValuationInput.anosProjecao,
        );
      }
    });

    it("deve retornar BP com ano base + anos projetados", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.balanceSheet).toHaveLength(
          sampleFullValuationInput.anosProjecao + 1,
        );
      }
    });

    it("deve retornar FCFF apenas para anos projetados", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.fcff).toHaveLength(
          sampleFullValuationInput.anosProjecao,
        );
      }
    });

    it("deve retornar valuation com valor da empresa positivo", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.valuation.valorEmpresa).toBeGreaterThan(0);
        expect(result.data.valuation.valorTerminal).toBeGreaterThan(0);
        expect(result.data.valuation.valorPresenteTerminal).toBeGreaterThan(0);
      }
    });

    it("DRE deve ter receita bruta crescente nos anos projetados", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        // Começa do índice 2 (comparando ano 2 com ano 1) para garantir crescimento
        for (let i = 2; i < result.data.dre.length; i++) {
          expect(result.data.dre[i].receitaBruta).toBeGreaterThan(
            result.data.dre[i - 1].receitaBruta,
          );
        }
      }
    });

    it("BP deve ter ativoTotal e passivoTotal positivos em todos os anos", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.balanceSheet.forEach((bp) => {
          expect(bp.ativoTotal).toBeGreaterThan(0);
          expect(bp.passivoTotal).toBeGreaterThan(0);
        });
      }
    });

    it("FCFF deve ter campos obrigatórios em todos os anos", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.fcff.forEach((fcff) => {
          expect(typeof fcff.ebit).toBe("number");
          expect(typeof fcff.nopat).toBe("number");
          expect(typeof fcff.depreciacaoAmortizacao).toBe("number");
          expect(typeof fcff.capex).toBe("number");
          expect(typeof fcff.ncg).toBe("number");
          expect(typeof fcff.fcff).toBe("number");
        });
      }
    });

    it("deve funcionar com empresa startup", () => {
      const result = executeFullValuation(startupFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        // Startup deve ter crescimento expressivo entre anos projetados
        const firstYearRevenue = result.data.dre[1].receitaBruta;
        const lastYearRevenue =
          result.data.dre[result.data.dre.length - 1].receitaBruta;
        expect(lastYearRevenue).toBeGreaterThan(firstYearRevenue * 3);

        // valorEmpresa pode ser negativo para startup com prejuízo recorrente (matematicamente correto)
        expect(typeof result.data.valuation.valorEmpresa).toBe("number");
        expect(isFinite(result.data.valuation.valorEmpresa)).toBe(true);
      }
    });

    it("deve funcionar com empresa madura", () => {
      const result = executeFullValuation(matureFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        // Empresa madura tem crescimento moderado
        const firstYearRevenue = result.data.dre[1].receitaBruta;
        const lastYearRevenue =
          result.data.dre[result.data.dre.length - 1].receitaBruta;
        expect(lastYearRevenue).toBeGreaterThan(firstYearRevenue);
        expect(lastYearRevenue).toBeLessThan(firstYearRevenue * 1.5);
      }
    });

    it("deve validar inputs antes de executar", () => {
      const invalidInput = {
        ...sampleFullValuationInput,
        dreBase: {
          ...sampleFullValuationInput.dreBase,
          receitaBruta: -1000, // Receita negativa - inválido!
        },
      };

      const result = executeFullValuation(invalidInput);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve retornar erro se taxa de crescimento perpétuo >= WACC", () => {
      // WACC da amostra é 12.522%
      const invalidInput = {
        ...sampleFullValuationInput,
        taxaCrescimentoPerpetuo: 15, // 15% > WACC de 12.522%
      };

      const result = executeFullValuation(invalidInput);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve preservar WACC informado no resultado", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.wacc).toEqual(sampleFullValuationInput.wacc);
      }
    });

    it("resultado deve ser consistente entre execuções", () => {
      const result1 = executeFullValuation(sampleFullValuationInput);
      const result2 = executeFullValuation(sampleFullValuationInput);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      if (result1.data && result2.data) {
        expect(result1.data.valuation.valorEmpresa).toBeCloseTo(
          result2.data.valuation.valorEmpresa,
          0,
        );
      }
    });

    it("valorPresenteFCFF deve ter o mesmo número de anos que fcff", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.valuation.valorPresenteFCFF).toHaveLength(
          result.data.fcff.length,
        );
      }
    });
  });

  describe("executeQuickValuation", () => {
    it("deve executar valuation rápido com valores padrão", () => {
      const result = executeQuickValuation(10_000_000);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.valuation.valorEmpresa).toBeGreaterThan(0);
      }
    });

    it("deve usar 5 anos de projeção como padrão", () => {
      const result = executeQuickValuation(10_000_000);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.dre).toHaveLength(6); // base + 5 projetados
        expect(result.data.balanceSheet).toHaveLength(6);
        expect(result.data.fcff).toHaveLength(5);
      }
    });

    it("deve aceitar número de anos customizado", () => {
      const result = executeQuickValuation(10_000_000, 7);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.dre).toHaveLength(8); // base + 7 projetados
      }
    });

    it("deve funcionar com receita pequena", () => {
      const result = executeQuickValuation(100_000);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.valuation.valorEmpresa).toBeGreaterThan(0);
      }
    });

    it("deve funcionar com receita grande", () => {
      const result = executeQuickValuation(1_000_000_000);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.valuation.valorEmpresa).toBeGreaterThan(0);
      }
    });

    it("valuation deve ser proporcional à receita", () => {
      const result1 = executeQuickValuation(10_000_000);
      const result2 = executeQuickValuation(20_000_000);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      if (result1.data && result2.data) {
        const ratio =
          result2.data.valuation.valorEmpresa /
          result1.data.valuation.valorEmpresa;
        expect(ratio).toBeGreaterThan(1.5);
        expect(ratio).toBeLessThan(2.5);
      }
    });

    it("DRE projetada deve ter receitaBruta positiva em todos os anos", () => {
      const result = executeQuickValuation(10_000_000);

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.dre.forEach((dre) => {
          expect(dre.receitaBruta).toBeGreaterThan(0);
        });
      }
    });
  });
});
