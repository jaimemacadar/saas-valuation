// src/core/validators/index.ts
import { z } from "zod";

// DRE Base Inputs Schema
export const DREBaseInputsSchema = z.object({
  receita: z.number().positive("Receita deve ser positiva"),
  custoMercadoriaVendida: z.number().nonnegative("CMV deve ser não-negativo"),
  despesasOperacionais: z
    .number()
    .nonnegative("Despesas operacionais devem ser não-negativas"),
  despesasFinanceiras: z
    .number()
    .nonnegative("Despesas financeiras devem ser não-negativas"),
  taxaImposto: z
    .number()
    .min(0)
    .max(1, "Taxa de imposto deve estar entre 0 e 1"),
});

export type DREBaseInputsValidated = z.infer<typeof DREBaseInputsSchema>;

// DRE Projection Inputs Schema
export const DREProjectionInputsSchema = z.object({
  taxaCrescimentoReceita: z.array(
    z.number().min(-1, "Taxa de crescimento não pode ser menor que -100%"),
  ),
  taxaCMV: z.array(
    z.number().min(0).max(1, "Margem CMV deve estar entre 0 e 1"),
  ),
  taxaDespesasOperacionais: z.array(
    z
      .number()
      .min(0)
      .max(1, "Margem de despesas operacionais deve estar entre 0 e 1"),
  ),
  taxaDespesasFinanceiras: z.array(
    z
      .number()
      .min(0)
      .max(1, "Taxa de despesas financeiras deve estar entre 0 e 1"),
  ),
});

export type DREProjectionInputsValidated = z.infer<
  typeof DREProjectionInputsSchema
>;

// Balance Sheet Base Inputs Schema
export const BalanceSheetBaseInputsSchema = z.object({
  caixa: z.number().nonnegative("Caixa deve ser não-negativo"),
  contasReceber: z
    .number()
    .nonnegative("Contas a receber devem ser não-negativas"),
  estoques: z.number().nonnegative("Estoques devem ser não-negativos"),
  ativoCirculante: z
    .number()
    .nonnegative("Ativo circulante deve ser não-negativo"),
  imobilizado: z.number().nonnegative("Imobilizado deve ser não-negativo"),
  ativoTotal: z.number().positive("Ativo total deve ser positivo"),
  contasPagar: z.number().nonnegative("Contas a pagar devem ser não-negativas"),
  passivoCirculante: z
    .number()
    .nonnegative("Passivo circulante deve ser não-negativo"),
  dividasLongoPrazo: z
    .number()
    .nonnegative("Dívidas de longo prazo devem ser não-negativas"),
  passivoTotal: z.number().nonnegative("Passivo total deve ser não-negativo"),
  patrimonioLiquido: z
    .number()
    .nonnegative("Patrimônio líquido deve ser não-negativo"),
});

export type BalanceSheetBaseInputsValidated = z.infer<
  typeof BalanceSheetBaseInputsSchema
>;

// Balance Sheet Projection Inputs Schema
export const BalanceSheetProjectionInputsSchema = z.object({
  taxaCrescimentoAtivos: z.array(
    z
      .number()
      .min(-1, "Taxa de crescimento de ativos não pode ser menor que -100%"),
  ),
  taxaCrescimentoPassivos: z.array(
    z
      .number()
      .min(-1, "Taxa de crescimento de passivos não pode ser menor que -100%"),
  ),
  taxaDepreciacao: z
    .number()
    .min(0)
    .max(1, "Taxa de depreciação deve estar entre 0 e 1"),
  taxaCapex: z.number().min(0).max(1, "Taxa de CAPEX deve estar entre 0 e 1"),
});

export type BalanceSheetProjectionInputsValidated = z.infer<
  typeof BalanceSheetProjectionInputsSchema
>;

// WACC Calculation Schema
export const WACCCalculationSchema = z.object({
  custoCapitalProprio: z
    .number()
    .min(0, "Custo de capital próprio deve ser não-negativo"),
  custoCapitalTerceiros: z
    .number()
    .min(0, "Custo de capital de terceiros deve ser não-negativo"),
  wacc: z.number().min(0, "WACC deve ser não-negativo"),
  pesoCapitalProprio: z
    .number()
    .min(0)
    .max(1, "Peso do capital próprio deve estar entre 0 e 1"),
  pesoCapitalTerceiros: z
    .number()
    .min(0)
    .max(1, "Peso do capital de terceiros deve estar entre 0 e 1"),
});

export type WACCCalculationValidated = z.infer<typeof WACCCalculationSchema>;

// Full Valuation Input Schema
export const FullValuationInputSchema = z.object({
  dreBase: DREBaseInputsSchema,
  dreProjection: DREProjectionInputsSchema,
  balanceSheetBase: BalanceSheetBaseInputsSchema,
  balanceSheetProjection: BalanceSheetProjectionInputsSchema,
  wacc: WACCCalculationSchema,
  taxaCrescimentoPerpetuo: z
    .number()
    .min(0)
    .max(0.1, "Taxa de crescimento perpétuo deve estar entre 0 e 10%"),
  anosProjecao: z
    .number()
    .int()
    .min(1)
    .max(20, "Anos de projeção devem estar entre 1 e 20"),
});

export type FullValuationInputValidated = z.infer<
  typeof FullValuationInputSchema
>;

// Validation helper function
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.issues.map(
      (err) => `${err.path.join(".")}: ${err.message}`,
    ),
  };
}
