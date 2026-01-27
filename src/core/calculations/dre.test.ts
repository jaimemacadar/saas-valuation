import { describe, it, expect } from "vitest";
import { calculateDRE, calculateAllDRE } from "./dre.js";
import type { DREBaseInputs, DREProjectionInputs } from "../types/index.js";
import {
  sampleDREBase,
  sampleDREProjection,
  startupDREBase,
  startupDREProjection,
} from "../__fixtures__/sampleCompany.js";

import Decimal from "decimal.js";

// Função utilitária para converter DREBaseInputs em DRECalculated (ano base)
function dreBaseToCalculated(
  base: DREBaseInputs,
): import("../types/index.js").DRECalculated {
  const receita = new Decimal(base.receita);
  const cmv = new Decimal(base.custoMercadoriaVendida);
  const despesasOperacionais = new Decimal(base.despesasOperacionais);
  const despesasFinanceiras = new Decimal(base.despesasFinanceiras);
  const taxaImposto = new Decimal(base.taxaImposto);
  const lucrobruto = receita.minus(cmv);
  const ebit = lucrobruto.minus(despesasOperacionais);
  const lucroAntesImpostos = ebit.minus(despesasFinanceiras);
  const impostos = lucroAntesImpostos.times(taxaImposto);
  const lucroLiquido = lucroAntesImpostos.minus(impostos);
  return {
    ano: 0,
    receita: receita.toNumber(),
    cmv: cmv.toNumber(),
    lucrobruto: lucrobruto.toNumber(),
    despesasOperacionais: despesasOperacionais.toNumber(),
    ebit: ebit.toNumber(),
    despesasFinanceiras: despesasFinanceiras.toNumber(),
    lucroAntesImpostos: lucroAntesImpostos.toNumber(),
    impostos: impostos.toNumber(),
    lucroLiquido: lucroLiquido.toNumber(),
  };
}

describe("DRE Calculations", () => {
  describe("calculateDRE", () => {
    it("deve calcular DRE para o primeiro ano de projeção", () => {
      const anoBase = dreBaseToCalculated(sampleDREBase);
      const result = calculateDRE(anoBase, sampleDREProjection, 0);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        // Ano 0: crescimento de 20%
        expect(result.data.receita).toBeCloseTo(12_000_000, 0); // 10M * 1.20
        expect(result.data.lucroLiquido).toBeGreaterThan(0); // Deve ser lucrativo
      }
    });

    it("deve calcular DRE para o segundo ano de projeção", () => {
      const anoBase = dreBaseToCalculated(sampleDREBase);
      const result = calculateDRE(anoBase, sampleDREProjection, 1);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        // Ano 1: crescimento acumulado 20% * 18%
        const expectedReceita = 10_000_000 * 1.2 * 1.18;
        expect(result.data.receita).toBeCloseTo(expectedReceita, 0);
      }
    });

    it("deve calcular corretamente o lucro líquido", () => {
      const anoBase = dreBaseToCalculated(sampleDREBase);
      const result = calculateDRE(anoBase, sampleDREProjection, 0);

      expect(result.success).toBe(true);

      if (result.data) {
        const {
          receita,
          cmv,
          lucrobruto,
          despesasOperacionais,
          ebit,
          despesasFinanceiras,
          lucroAntesImpostos,
          impostos,
          lucroLiquido,
        } = result.data;

        // Validar cálculos em cascata
        expect(lucrobruto).toBeCloseTo(receita - cmv);
        expect(ebit).toBeCloseTo(lucrobruto - despesasOperacionais);
        expect(lucroAntesImpostos).toBeCloseTo(ebit - despesasFinanceiras);
        expect(lucroLiquido).toBeCloseTo(lucroAntesImpostos - impostos);
      }
    });

    it("deve retornar erro se índice de ano for inválido", () => {
      const anoBase = dreBaseToCalculated(sampleDREBase);
      const result = calculateDRE(anoBase, sampleDREProjection, -1);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve retornar erro se índice exceder projeções", () => {
      const anoBase = dreBaseToCalculated(sampleDREBase);
      const result = calculateDRE(anoBase, sampleDREProjection, 10);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve funcionar com startup em crescimento agressivo", () => {
      const anoBase = dreBaseToCalculated(startupDREBase);
      const result = calculateDRE(anoBase, startupDREProjection, 0);

      expect(result.success).toBe(true);

      if (result.data) {
        // Startup ano 0: crescimento de 100%
        expect(result.data.receita).toBeCloseTo(2_000_000, 0); // 1M * 2.0
        // Pode ter lucro negativo devido a alto investimento
      }
    });

    it("deve manter precisão com números decimais", () => {
      const preciseDREBase: DREBaseInputs = {
        receita: 12345.67,
        custoMercadoriaVendida: 4567.89,
        despesasOperacionais: 3456.78,
        despesasFinanceiras: 234.56,
        taxaImposto: 0.34,
      };

      const preciseDREProjection: DREProjectionInputs = {
        taxaCrescimentoReceita: [0.1234],
        taxaCMV: [0.3678],
        taxaDespesasOperacionais: [0.2789],
        taxaDespesasFinanceiras: [0.0189],
      };

      const anoBase = dreBaseToCalculated(preciseDREBase);
      const result = calculateDRE(anoBase, preciseDREProjection, 0);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // Verificar que não há erros de arredondamento grosseiros
      if (result.data) {
        expect(result.data.receita).toBeGreaterThan(12345);
        expect(result.data.receita).toBeLessThan(15000);
      }
    });
  });

  describe("calculateAllDRE", () => {
    it("deve calcular DRE para todos os anos de projeção", () => {
      const result = calculateAllDRE(sampleDREBase, sampleDREProjection, 5);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(5);
    });

    it("deve ter receita crescente ano a ano", () => {
      const result = calculateAllDRE(sampleDREBase, sampleDREProjection, 5);

      expect(result.success).toBe(true);

      if (result.data) {
        for (let i = 1; i < result.data.length; i++) {
          expect(result.data[i].receita).toBeGreaterThan(
            result.data[i - 1].receita,
          );
        }
      }
    });

    it("deve retornar erro se anos de projeção não baterem com premissas", () => {
      const result = calculateAllDRE(
        sampleDREBase,
        sampleDREProjection,
        10, // Mais anos que premissas disponíveis
      );

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve funcionar com 1 ano de projeção", () => {
      const projection1Year: DREProjectionInputs = {
        taxaCrescimentoReceita: [0.15],
        taxaCMV: [0.3],
        taxaDespesasOperacionais: [0.45],
        taxaDespesasFinanceiras: [0.02],
      };

      const result = calculateAllDRE(sampleDREBase, projection1Year, 1);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it("deve calcular corretamente startup com crescimento explosivo", () => {
      const result = calculateAllDRE(startupDREBase, startupDREProjection, 5);

      expect(result.success).toBe(true);

      if (result.data) {
        // Primeiro ano deve dobrar receita
        expect(result.data[0].receita).toBeCloseTo(2_000_000, 0);

        // Último ano deve ter receita muito maior
        expect(result.data[4].receita).toBeGreaterThan(5_000_000);
      }
    });

    it("deve retornar DREs com todas as propriedades calculadas", () => {
      const result = calculateAllDRE(sampleDREBase, sampleDREProjection, 5);

      expect(result.success).toBe(true);

      if (result.data) {
        result.data.forEach((dre) => {
          expect(dre.receita).toBeDefined();
          expect(dre.cmv).toBeDefined();
          expect(dre.lucrobruto).toBeDefined();
          expect(dre.despesasOperacionais).toBeDefined();
          expect(dre.ebit).toBeDefined();
          expect(dre.despesasFinanceiras).toBeDefined();
          expect(dre.lucroAntesImpostos).toBeDefined();
          expect(dre.impostos).toBeDefined();
          expect(dre.lucroLiquido).toBeDefined();
        });
      }
    });

    it("deve validar que arrays de premissas têm tamanhos corretos", () => {
      const invalidProjection: DREProjectionInputs = {
        taxaCrescimentoReceita: [0.15, 0.12], // 2 anos
        taxaCMV: [0.3], // 1 ano - inconsistente!
        taxaDespesasOperacionais: [0.45, 0.44],
        taxaDespesasFinanceiras: [0.02, 0.018],
      };

      const result = calculateAllDRE(sampleDREBase, invalidProjection, 2);

      // Deve falhar por inconsistência ou aceitar e usar primeira margem
      // Dependendo da implementação
      expect(result.success).toBe(false);
    });
  });
});
