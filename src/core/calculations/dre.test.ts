import { calculateAllDRE } from "./dre.js";
import type { DREBaseInputs, DREProjectionInputs } from "../types/index.js";
import {
  sampleDREBase,
  sampleDREProjection,
  startupDREBase,
  startupDREProjection,
} from "../__fixtures__/sampleCompany.js";

describe("DRE Calculations", () => {
  describe("calculateAllDRE", () => {
    it("deve calcular DRE base e primeiro ano de projeção", () => {
      const result = calculateAllDRE(sampleDREBase, sampleDREProjection);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        // Deve ter ano base (0) + 5 anos de projeção
        expect(result.data).toHaveLength(6);

        // Ano base (year 0)
        expect(result.data[0].year).toBe(0);
        expect(result.data[0].receitaBruta).toBeCloseTo(10_000_000, 0);

        // Ano 1: crescimento de 20%
        expect(result.data[1].year).toBe(1);
        expect(result.data[1].receitaBruta).toBeCloseTo(12_000_000, 0); // 10M * 1.20
        expect(result.data[1].lucroLiquido).toBeGreaterThan(0); // Deve ser lucrativo
      }
    });

    it("deve calcular crescimento acumulado corretamente", () => {
      const result = calculateAllDRE(sampleDREBase, sampleDREProjection);

      expect(result.success).toBe(true);

      if (result.data) {
        // Ano 2: crescimento acumulado 20% * 18%
        const expectedReceita = 10_000_000 * 1.2 * 1.18;
        expect(result.data[2].receitaBruta).toBeCloseTo(expectedReceita, 0);
      }
    });

    it("deve calcular corretamente o lucro líquido com base nas premissas", () => {
      const result = calculateAllDRE(sampleDREBase, sampleDREProjection);

      expect(result.success).toBe(true);

      if (result.data) {
        // Validar ano 1
        const year1 = result.data[1];
        const {
          receitaBruta,
          impostosEDevolucoes,
          receitaLiquida,
          cmv,
          lucroBruto,
          despesasOperacionais,
          ebit,
          lucroAntesIR,
          irCSLL,
          lucroLiquido,
        } = year1;

        // Validar cálculos em cascata
        expect(receitaLiquida).toBeCloseTo(receitaBruta - impostosEDevolucoes);
        expect(lucroBruto).toBeCloseTo(receitaLiquida - cmv);
        expect(ebit).toBeCloseTo(lucroBruto - despesasOperacionais);
        // lucroAntesIR = ebit - despesasFinanceiras (0 neste caso)
        expect(lucroLiquido).toBeCloseTo(lucroAntesIR - irCSLL);
      }
    });

    it("deve funcionar com startup em crescimento agressivo", () => {
      const result = calculateAllDRE(startupDREBase, startupDREProjection);

      expect(result.success).toBe(true);

      if (result.data) {
        // Ano base
        expect(result.data[0].receitaBruta).toBeCloseTo(1_000_000, 0);

        // Ano 1: crescimento de 100%
        expect(result.data[1].receitaBruta).toBeCloseTo(2_000_000, 0); // 1M * 2.0
        // Pode ter lucro negativo devido a alto investimento
      }
    });

    it("deve manter precisão com números decimais", () => {
      const preciseDREBase: DREBaseInputs = {
        receitaBruta: 12345.67,
        impostosEDevolucoes: 987.65,
        cmv: 4567.89,
        despesasOperacionais: 3456.78,
        irCSLL: 456.78,
        dividendos: 100.00,
      };

      const preciseDREProjection: DREProjectionInputs[] = [
        {
          year: 1,
          receitaBrutaGrowth: 12.34,
          impostosEDevolucoesRate: 8,
          cmvRate: 36.78,
          despesasOperacionaisRate: 27.89,
          irCSLLRate: 34,
          dividendosRate: 25,
        },
      ];

      const result = calculateAllDRE(preciseDREBase, preciseDREProjection);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // Verificar que não há erros de arredondamento grosseiros
      if (result.data) {
        expect(result.data[1].receitaBruta).toBeGreaterThan(12345);
        expect(result.data[1].receitaBruta).toBeLessThan(15000);
      }
    });

    it("deve ter receita crescente ano a ano", () => {
      const result = calculateAllDRE(sampleDREBase, sampleDREProjection);

      expect(result.success).toBe(true);

      if (result.data) {
        // Verificar crescimento ano a ano (pulando ano base)
        for (let i = 2; i < result.data.length; i++) {
          expect(result.data[i].receitaBruta).toBeGreaterThan(
            result.data[i - 1].receitaBruta,
          );
        }
      }
    });

    it("deve retornar erro se array de premissas for vazio", () => {
      const result = calculateAllDRE(sampleDREBase, []);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve funcionar com 1 ano de projeção", () => {
      const projection1Year: DREProjectionInputs[] = [
        {
          year: 1,
          receitaBrutaGrowth: 15,
          impostosEDevolucoesRate: 8,
          cmvRate: 30,
          despesasOperacionaisRate: 45,
          irCSLLRate: 34,
          dividendosRate: 20,
        },
      ];

      const result = calculateAllDRE(sampleDREBase, projection1Year);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2); // Ano base + 1 ano projetado
    });

    it("deve calcular corretamente startup com crescimento explosivo", () => {
      const result = calculateAllDRE(startupDREBase, startupDREProjection);

      expect(result.success).toBe(true);

      if (result.data) {
        // Ano base
        expect(result.data[0].receitaBruta).toBeCloseTo(1_000_000, 0);

        // Primeiro ano projetado deve dobrar receita
        expect(result.data[1].receitaBruta).toBeCloseTo(2_000_000, 0);

        // Último ano deve ter receita muito maior
        expect(result.data[5].receitaBruta).toBeGreaterThan(5_000_000);
      }
    });

    it("deve retornar DREs com todas as propriedades calculadas", () => {
      const result = calculateAllDRE(sampleDREBase, sampleDREProjection);

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.forEach((dre) => {
          expect(dre.year).toBeDefined();
          expect(dre.receitaBruta).toBeDefined();
          expect(dre.impostosEDevolucoes).toBeDefined();
          expect(dre.receitaLiquida).toBeDefined();
          expect(dre.cmv).toBeDefined();
          expect(dre.lucroBruto).toBeDefined();
          expect(dre.despesasOperacionais).toBeDefined();
          expect(dre.ebit).toBeDefined();
          expect(dre.depreciacaoAmortizacao).toBeDefined();
          expect(dre.ebitda).toBeDefined();
          expect(dre.despesasFinanceiras).toBeDefined();
          expect(dre.lucroAntesIR).toBeDefined();
          expect(dre.irCSLL).toBeDefined();
          expect(dre.lucroLiquido).toBeDefined();
          expect(dre.dividendos).toBeDefined();
        });
      }
    });
  });
});
