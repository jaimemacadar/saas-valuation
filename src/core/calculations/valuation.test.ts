import { describe, it, expect } from "vitest";
import { calculateValuation, calculateSharePrice } from "./valuation.js";
import { calculateAllFCFF } from "./fcff.js";
import { calculateAllDRE } from "./dre.js";
import { calculateAllBalanceSheet } from "./balanceSheet.js";
import {
  sampleDREBase,
  sampleDREProjection,
  sampleBalanceSheetBase,
  sampleBalanceSheetProjection,
  sampleWACC,
} from "../__fixtures__/sampleCompany.js";

describe("Valuation Calculations", () => {
  // Preparar FCFF para testes
  const dreResult = calculateAllDRE(sampleDREBase, sampleDREProjection, 5);
  const dreProjetado = dreResult.data!;

  const bpResult = calculateAllBalanceSheet(
    sampleBalanceSheetBase,
    dreProjetado,
    sampleBalanceSheetProjection,
  );
  const bpProjetado = bpResult.data!;

  const fcffResult = calculateAllFCFF(dreProjetado, bpProjetado);
  const fcffProjetado = fcffResult.data!;

  describe("calculateValuation", () => {
    it("deve calcular valuation por DCF", () => {
      const result = calculateValuation({
        fcff: fcffProjetado,
        wacc: sampleWACC.wacc,
        taxaCrescimentoPerpetuo: 0.03,
        anoBase: 0,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.valorEmpresa).toBeGreaterThan(0);
        expect(result.data.valorTerminal).toBeGreaterThan(0);
        expect(result.data.valorPresenteFCFF).toHaveLength(5);
      }
    });

    it("deve descontar FCFFs corretamente", () => {
      const result = calculateValuation({
        fcff: fcffProjetado,
        wacc: sampleWACC.wacc,
        taxaCrescimentoPerpetuo: 0.03,
        anoBase: 0,
      });

      expect(result.success).toBe(true);

      if (result.data) {
        // FCFFs descontados devem ser menores que FCFFs brutos
        fcffProjetado.forEach((fcff, index) => {
          expect(result.data!.valorPresenteFCFF[index]).toBeLessThanOrEqual(
            fcff.fcff,
          );
        });
      }
    });

    it("deve calcular valor terminal usando fórmula de Gordon", () => {
      const result = calculateValuation({
        fcff: fcffProjetado,
        wacc: sampleWACC.wacc,
        taxaCrescimentoPerpetuo: 0.03,
        anoBase: 0,
      });

      expect(result.success).toBe(true);

      if (result.data) {
        // VT = FCFF_último * (1 + g) / (WACC - g)
        const ultimoFCFF = fcffProjetado[fcffProjetado.length - 1].fcff;
        const g = 0.03;
        const expectedVT = (ultimoFCFF * (1 + g)) / (sampleWACC.wacc - g);

        expect(result.data.valorTerminal).toBeCloseTo(expectedVT, -3); // Precisão de milhares
      }
    });

    it("deve somar VPL de FCFFs + VT descontado", () => {
      const result = calculateValuation({
        fcff: fcffProjetado,
        wacc: sampleWACC.wacc,
        taxaCrescimentoPerpetuo: 0.03,
        anoBase: 0,
      });

      expect(result.success).toBe(true);

      if (result.data) {
        const vplFCFF = result.data.valorPresenteFCFF.reduce(
          (sum, fcff) => sum + fcff,
          0,
        );
        const vtDescontado = result.data.valorPresenteTerminal;
        const expectedVE = vplFCFF + vtDescontado;

        expect(result.data.valorEmpresa).toBeCloseTo(expectedVE, 0);
      }
    });

    it("deve retornar erro se taxa de crescimento >= WACC", () => {
      const result = calculateValuation({
        fcff: fcffProjetado,
        wacc: 0.1,
        taxaCrescimentoPerpetuo: 0.12, // g > WACC - inválido!
        anoBase: 0,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve retornar erro se taxa de crescimento for negativa", () => {
      const result = calculateValuation({
        fcff: fcffProjetado,
        wacc: sampleWACC.wacc,
        taxaCrescimentoPerpetuo: -0.05,
        anoBase: 0,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve descontar mais anos futuros mais fortemente", () => {
      const result = calculateValuation({
        fcff: fcffProjetado,
        wacc: sampleWACC.wacc,
        taxaCrescimentoPerpetuo: 0.03,
        anoBase: 0,
      });

      expect(result.success).toBe(true);

      if (result.data) {
        // Fator de desconto aumenta exponencialmente
        // FCFFs de anos mais distantes valem menos
        for (let i = 1; i < result.data.valorPresenteFCFF.length; i++) {
          const desconto1 =
            result.data.valorPresenteFCFF[i - 1] / fcffProjetado[i - 1].fcff;
          const desconto2 =
            result.data.valorPresenteFCFF[i] / fcffProjetado[i].fcff;
          // Desconto2 deve ser menor (mais descontado) que desconto1
          expect(desconto2).toBeLessThan(desconto1);
        }
      }
    });

    it("valor terminal deve ser significativo na valuation", () => {
      const result = calculateValuation({
        fcff: fcffProjetado,
        wacc: sampleWACC.wacc,
        taxaCrescimentoPerpetuo: 0.03,
        anoBase: 0,
      });

      expect(result.success).toBe(true);

      if (result.data) {
        // VT tipicamente representa 50-70% do valor total
        const ratioVT =
          result.data.valorPresenteTerminal / result.data.valorEmpresa;

        expect(ratioVT).toBeGreaterThan(0.4); // Pelo menos 40%
        expect(ratioVT).toBeLessThan(0.9); // Menos que 90%
      }
    });

    it("deve funcionar com taxa de crescimento perpétuo baixa", () => {
      const result = calculateValuation({
        fcff: fcffProjetado,
        wacc: sampleWACC.wacc,
        taxaCrescimentoPerpetuo: 0.01, // 1% - muito conservador
        anoBase: 0,
      });

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.valorEmpresa).toBeGreaterThan(0);
        // VT será menor com crescimento baixo
      }
    });

    it("deve funcionar com WACC alto (startup)", () => {
      const result = calculateValuation({
        fcff: fcffProjetado,
        wacc: 0.25, // 25% - altíssimo risco
        taxaCrescimentoPerpetuo: 0.03,
        anoBase: 0,
      });

      expect(result.success).toBe(true);

      if (result.data) {
        // Desconto alto reduz valuation
        expect(result.data.valorEmpresa).toBeGreaterThan(0);
      }
    });
  });

  describe("calculateSharePrice", () => {
    it("deve calcular preço por ação", () => {
      const valuationResult = calculateValuation({
        fcff: fcffProjetado,
        wacc: sampleWACC.wacc,
        taxaCrescimentoPerpetuo: 0.03,
        anoBase: 0,
      });

      expect(valuationResult.success).toBe(true);

      const result = calculateSharePrice({
        valorEmpresa: valuationResult.data!.valorEmpresa,
        dividaLiquida: 1_000_000, // R$ 1M de dívida líquida
        acoesEmCirculacao: 1_000_000, // 1M de ações
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.precoPorAcao).toBeGreaterThan(0);
        expect(result.data.valorPatrimonioLiquido).toBeGreaterThan(0);
      }
    });

    it("deve subtrair dívida líquida do valor da empresa", () => {
      const valorEmpresa = 50_000_000; // R$ 50M
      const dividaLiquida = 5_000_000; // R$ 5M

      const result = calculateSharePrice({
        valorEmpresa: valorEmpresa,
        dividaLiquida: dividaLiquida,
        acoesEmCirculacao: 1_000_000,
      });

      expect(result.success).toBe(true);

      if (result.data) {
        const expectedPL = valorEmpresa - dividaLiquida;
        expect(result.data.valorPatrimonioLiquido).toBeCloseTo(expectedPL, 0);
      }
    });

    it("deve calcular preço por ação = PL / ações", () => {
      const result = calculateSharePrice({
        valorEmpresa: 50_000_000,
        dividaLiquida: 5_000_000,
        acoesEmCirculacao: 1_000_000,
      });

      expect(result.success).toBe(true);

      if (result.data) {
        const expectedPreco = (50_000_000 - 5_000_000) / 1_000_000;
        expect(result.data.precoPorAcao).toBeCloseTo(expectedPreco, 2);
      }
    });

    it("deve aceitar dívida líquida negativa (caixa líquido)", () => {
      const result = calculateSharePrice({
        valorEmpresa: 50_000_000,
        dividaLiquida: -10_000_000, // Mais caixa que dívida
        acoesEmCirculacao: 1_000_000,
      });

      expect(result.success).toBe(true);

      if (result.data) {
        // Caixa líquido aumenta valor do PL
        expect(result.data.valorPatrimonioLiquido).toBe(60_000_000);
      }
    });

    it("deve retornar erro se ações em circulação for zero", () => {
      const result = calculateSharePrice({
        valorEmpresa: 50_000_000,
        dividaLiquida: 5_000_000,
        acoesEmCirculacao: 0,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve retornar erro se ações em circulação for negativa", () => {
      const result = calculateSharePrice({
        valorEmpresa: 50_000_000,
        dividaLiquida: 5_000_000,
        acoesEmCirculacao: -1000,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it("deve funcionar com valores muito pequenos", () => {
      const result = calculateSharePrice({
        valorEmpresa: 100_000,
        dividaLiquida: 10_000,
        acoesEmCirculacao: 10_000,
      });

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.precoPorAcao).toBeCloseTo(9, 2);
      }
    });

    it("deve funcionar com valores muito grandes", () => {
      const result = calculateSharePrice({
        valorEmpresa: 1_000_000_000_000, // R$ 1 trilhão
        dividaLiquida: 100_000_000_000, // R$ 100 bilhões
        acoesEmCirculacao: 10_000_000_000, // 10 bilhões de ações
      });

      expect(result.success).toBe(true);

      if (result.data) {
        expect(result.data.precoPorAcao).toBeCloseTo(90, 0);
      }
    });
  });
});
