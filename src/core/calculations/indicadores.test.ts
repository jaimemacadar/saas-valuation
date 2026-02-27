import { describe, it, expect } from "vitest";
import { calculateAllDRE } from "./dre.js";
import { calculateAllBalanceSheet } from "./balanceSheet.js";
import { calculateAllIndicadores } from "./indicadores.js";
import {
  sampleDREBase,
  sampleDREProjection,
  sampleBalanceSheetBase,
  sampleBalanceSheetProjection,
} from "../__fixtures__/sampleCompany.js";

describe("Indicadores Calculations", () => {
  it("deve calcular indicadores para todos os anos sem erro", () => {
    const dreResult = calculateAllDRE(sampleDREBase, sampleDREProjection);
    expect(dreResult.success).toBe(true);
    expect(dreResult.data).toBeDefined();

    const bpResult = calculateAllBalanceSheet(
      sampleBalanceSheetBase,
      dreResult.data!,
      sampleBalanceSheetProjection,
    );
    expect(bpResult.success).toBe(true);
    expect(bpResult.data).toBeDefined();

    const indicadoresResult = calculateAllIndicadores(
      dreResult.data!,
      bpResult.data!,
    );

    expect(indicadoresResult.success).toBe(true);
    expect(indicadoresResult.data).toBeDefined();
    expect(indicadoresResult.data).toHaveLength(dreResult.data!.length);
  });
});
