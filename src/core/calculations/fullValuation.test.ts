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

    it("deve retornar DRE projetado com número correto de anos", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.dre).toHaveLength(
          sampleFullValuationInput.anosProjecao,
        );
      }
    });

    it("deve retornar BP projetado com número correto de anos", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.balanceSheet).toHaveLength(
          sampleFullValuationInput.anosProjecao,
        );
      }
    });

    it("deve retornar FCFF projetado com número correto de anos", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.fcff).toHaveLength(
          sampleFullValuationInput.anosProjecao,
        );
      }
    });

    it("deve retornar valuation com valor da empresa", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.valuation.valorEmpresa).toBeGreaterThan(0);
        expect(result.data.valuation.valorTerminal).toBeGreaterThan(0);
        expect(result.data.valuation.valorPresenteTerminal).toBeGreaterThan(0);
      }
    });

    it("DRE deve ter receita crescente ao longo dos anos", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        for (let i = 1; i < result.data.dre.length; i++) {
          expect(result.data.dre[i].receita).toBeGreaterThan(
            result.data.dre[i - 1].receita,
          );
        }
      }
    });

    it("BP deve manter equação contábil em todos os anos", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.balanceSheet.forEach((bp) => {
          const totalPassivoMaisPL = bp.passivoTotal + bp.patrimonioLiquido;
          expect(bp.ativoTotal).toBeCloseTo(totalPassivoMaisPL, 0);
        });
      }
    });

    it("FCFF deve ser calculado a partir de DRE e BP", () => {
      const result = executeFullValuation(sampleFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.fcff.forEach((fcff, index) => {
          const dre = result.data!.dre[index];
          const bp = result.data!.balanceSheet[index];

          // NOPAT = EBIT * (1 - taxa imposto)
          const expectedNOPAT =
            dre.ebit * (1 - sampleFullValuationInput.dreBase.taxaImposto);
          expect(fcff.nopat).toBeCloseTo(expectedNOPAT, 0);

          // Depreciação deve vir do BP
          expect(fcff.depreciacao).toBeCloseTo(bp.depreciacao, 0);

          // CAPEX deve vir do BP
          expect(fcff.capex).toBeCloseTo(bp.capex, 0);
        });
      }
    });

    it("deve funcionar com empresa startup", () => {
      const result = executeFullValuation(startupFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        // Startup deve ter crescimento explosivo
        const firstYearRevenue = result.data.dre[0].receita;
        const lastYearRevenue =
          result.data.dre[result.data.dre.length - 1].receita;
        expect(lastYearRevenue).toBeGreaterThan(firstYearRevenue * 3);

        // Valor da empresa deve ser positivo mesmo com FCFF negativo inicial
        expect(result.data.valuation.valorEmpresa).toBeGreaterThan(0);
      }
    });

    it("deve funcionar com empresa madura", () => {
      const result = executeFullValuation(matureFullValuationInput);

      expect(result.success).toBe(true);

      if (result.data) {
        // Empresa madura tem crescimento moderado
        const firstYearRevenue = result.data.dre[0].receita;
        const lastYearRevenue =
          result.data.dre[result.data.dre.length - 1].receita;
        expect(lastYearRevenue).toBeGreaterThan(firstYearRevenue);
        expect(lastYearRevenue).toBeLessThan(firstYearRevenue * 1.5);

        // Empresa madura tende a ter FCFF positivo em todos os anos
        result.data.fcff.forEach((fcff) => {
          expect(fcff.fcff).toBeGreaterThan(0);
        });
      }
    });

    it("deve validar inputs antes de executar", () => {
      const invalidInput = {
        ...sampleFullValuationInput,
        dreBase: {
          ...sampleFullValuationInput.dreBase,
          receita: -1000, // Receita negativa - inválido!
        },
      };

      const result = executeFullValuation(invalidInput);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve retornar erro se premissas de projeção tiverem tamanho errado", () => {
      const invalidInput = {
        ...sampleFullValuationInput,
        anosProjecao: 5,
        dreProjection: {
          ...sampleFullValuationInput.dreProjection,
          taxaCrescimentoReceita: [0.15, 0.12], // Só 2 anos, mas pede 5!
        },
      };

      const result = executeFullValuation(invalidInput);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve retornar erro se taxa de crescimento perpétuo >= WACC", () => {
      const invalidInput = {
        ...sampleFullValuationInput,
        taxaCrescimentoPerpetuo: 0.2, // Maior que WACC!
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

    it("deve funcionar com 1 ano de projeção", () => {
      const oneYearInput = {
        ...sampleFullValuationInput,
        anosProjecao: 1,
        dreProjection: {
          taxaCrescimentoReceita: [0.15],
          taxaCMV: [0.3],
          taxaDespesasOperacionais: [0.45],
          taxaDespesasFinanceiras: [0.02],
        },
        balanceSheetProjection: {
          ...sampleFullValuationInput.balanceSheetProjection,
          taxaCrescimentoAtivos: [0.12],
          taxaCrescimentoPassivos: [0.08],
        },
      };

      const result = executeFullValuation(oneYearInput);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.dre).toHaveLength(1);
        expect(result.data.balanceSheet).toHaveLength(1);
        expect(result.data.fcff).toHaveLength(1);
      }
    });

    it("deve funcionar com 10 anos de projeção", () => {
      const tenYearInput = {
        ...sampleFullValuationInput,
        anosProjecao: 10,
        dreProjection: {
          taxaCrescimentoReceita: Array(10).fill(0.1),
          taxaCMV: Array(10).fill(0.3),
          taxaDespesasOperacionais: Array(10).fill(0.45),
          taxaDespesasFinanceiras: Array(10).fill(0.02),
        },
        balanceSheetProjection: {
          ...sampleFullValuationInput.balanceSheetProjection,
          taxaCrescimentoAtivos: Array(10).fill(0.1),
          taxaCrescimentoPassivos: Array(10).fill(0.08),
        },
      };

      const result = executeFullValuation(tenYearInput);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.dre).toHaveLength(10);
        expect(result.data.valuation.valorPresenteFCFF).toHaveLength(10);
      }
    });
  });

  describe("executeQuickValuation", () => {
    it("deve executar valuation rápido com valores padrão", () => {
      const result = executeQuickValuation(10_000_000); // R$ 10M receita

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
        expect(result.data.dre).toHaveLength(5);
        expect(result.data.balanceSheet).toHaveLength(5);
        expect(result.data.fcff).toHaveLength(5);
      }
    });

    it("deve aceitar número de anos customizado", () => {
      const result = executeQuickValuation(10_000_000, 7);

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.dre).toHaveLength(7);
      }
    });

    it("deve funcionar com receita pequena", () => {
      const result = executeQuickValuation(100_000); // R$ 100K

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.valuation.valorEmpresa).toBeGreaterThan(0);
      }
    });

    it("deve funcionar com receita grande", () => {
      const result = executeQuickValuation(1_000_000_000); // R$ 1B

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
        // Receita dobrou, valuation deve aproximadamente dobrar também
        const ratio =
          result2.data.valuation.valorEmpresa /
          result1.data.valuation.valorEmpresa;
        expect(ratio).toBeGreaterThan(1.5);
        expect(ratio).toBeLessThan(2.5);
      }
    });

    it("deve usar premissas simplificadas mas realistas", () => {
      const result = executeQuickValuation(10_000_000);

      expect(result.success).toBe(true);

      if (result.data) {
        // Todas as projeções devem ser válidas
        result.data.dre.forEach((dre) => {
          expect(dre.receita).toBeGreaterThan(0);
          expect(dre.lucrobruto / dre.receita).toBeGreaterThan(0);
          expect(dre.lucrobruto / dre.receita).toBeLessThan(1);
        });

        result.data.fcff.forEach((fcff) => {
          expect(fcff.nopat).toBeGreaterThan(0);
        });
      }
    });
  });
});
