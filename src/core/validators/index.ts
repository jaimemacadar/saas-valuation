// src/core/validators/index.ts
import { z } from "zod";

// DRE Base Inputs Schema (conforme PRD)
export const DREBaseInputsSchema = z.object({
  receitaBruta: z.number().positive("Receita bruta deve ser positiva"),
  impostosEDevolucoes: z
    .number()
    .nonnegative("Impostos e devoluções devem ser não-negativos"),
  cmv: z.number().nonnegative("CMV deve ser não-negativo"),
  despesasOperacionais: z
    .number()
    .nonnegative("Despesas operacionais devem ser não-negativas"),
  irCSLL: z.number(), // Pode ser negativo (crédito fiscal em empresas com prejuízo)
  dividendos: z.number().nonnegative("Dividendos devem ser não-negativos"),
});

export type DREBaseInputsValidated = z.infer<typeof DREBaseInputsSchema>;

// DRE Projection Inputs Schema (por ano, conforme PRD)
export const DREProjectionInputsSchema = z.object({
  year: z.number().int().positive("Ano deve ser positivo"),
  receitaBrutaGrowth: z
    .number()
    .min(-100, "Taxa de crescimento não pode ser menor que -100%"),
  impostosEDevolucoesRate: z
    .number()
    .min(0)
    .max(100, "Taxa de impostos deve estar entre 0 e 100%"),
  cmvRate: z
    .number()
    .min(0)
    .max(100, "Margem CMV deve estar entre 0 e 100%"),
  despesasOperacionaisRate: z
    .number()
    .min(0)
    .max(100, "Margem de despesas operacionais deve estar entre 0 e 100%"),
  irCSLLRate: z
    .number()
    .min(0)
    .max(100, "Taxa de IR/CSLL deve estar entre 0 e 100%"),
  dividendosRate: z
    .number()
    .min(0)
    .max(100, "Taxa de dividendos deve estar entre 0 e 100%"),
});

export type DREProjectionInputsValidated = z.infer<
  typeof DREProjectionInputsSchema
>;

// Balance Sheet Base Inputs Schema (nested, conforme PRD)
export const BalanceSheetBaseInputsSchema = z.object({
  ativoCirculante: z.object({
    caixaEquivalentes: z
      .number()
      .nonnegative("Caixa deve ser não-negativo"),
    aplicacoesFinanceiras: z
      .number()
      .nonnegative("Aplicações financeiras devem ser não-negativas"),
    contasReceber: z
      .number()
      .nonnegative("Contas a receber devem ser não-negativas"),
    estoques: z.number().nonnegative("Estoques devem ser não-negativos"),
    outrosCreditos: z
      .number()
      .nonnegative("Outros créditos devem ser não-negativos"),
  }),
  ativoRealizavelLP: z.object({
    investimentos: z
      .number()
      .nonnegative("Investimentos devem ser não-negativos"),
    ativoImobilizadoBruto: z
      .number()
      .nonnegative("Imobilizado bruto deve ser não-negativo"),
    depreciacaoAcumulada: z
      .number()
      .nonnegative("Depreciação acumulada deve ser não-negativa"),
    intangivel: z
      .number()
      .nonnegative("Intangível deve ser não-negativo"),
  }),
  passivoCirculante: z.object({
    fornecedores: z
      .number()
      .nonnegative("Fornecedores devem ser não-negativos"),
    impostosAPagar: z
      .number()
      .nonnegative("Impostos a pagar devem ser não-negativos"),
    obrigacoesSociaisETrabalhistas: z
      .number()
      .nonnegative("Obrigações sociais devem ser não-negativas"),
    emprestimosFinanciamentosCP: z
      .number()
      .nonnegative("Empréstimos CP devem ser não-negativos"),
    outrasObrigacoes: z
      .number()
      .nonnegative("Outras obrigações devem ser não-negativas"),
  }),
  passivoRealizavelLP: z.object({
    emprestimosFinanciamentosLP: z
      .number()
      .nonnegative("Empréstimos LP devem ser não-negativos"),
  }),
  patrimonioLiquido: z.object({
    capitalSocial: z
      .number()
      .nonnegative("Capital social deve ser não-negativo"),
    lucrosAcumulados: z.number(), // Pode ser negativo (prejuízos acumulados)
  }),
});

export type BalanceSheetBaseInputsValidated = z.infer<
  typeof BalanceSheetBaseInputsSchema
>;

// Balance Sheet Projection Inputs Schema (por ano, conforme PRD)
export const BalanceSheetProjectionInputsSchema = z.object({
  year: z.number().int().positive("Ano deve ser positivo"),
  taxaDepreciacao: z
    .number()
    .min(0)
    .max(100, "Taxa de depreciação deve estar entre 0 e 100%"),
  indiceImobilizadoVendas: z
    .number()
    .min(0)
    .max(1, "Índice imobilizado/vendas deve estar entre 0 e 1"),
  taxaJurosAplicacoes: z
    .number()
    .min(0)
    .max(100, "Taxa de juros de aplicações deve estar entre 0 e 100%"),
  prazoCaixaEquivalentes: z
    .number()
    .min(0)
    .max(360, "Prazo deve estar entre 0 e 360 dias"),
  prazoContasReceber: z
    .number()
    .min(0)
    .max(360, "Prazo deve estar entre 0 e 360 dias"),
  prazoEstoques: z
    .number()
    .min(0)
    .max(360, "Prazo deve estar entre 0 e 360 dias"),
  prazoOutrosCreditos: z
    .number()
    .min(0)
    .max(360, "Prazo deve estar entre 0 e 360 dias"),
  prazoFornecedores: z
    .number()
    .min(0)
    .max(360, "Prazo deve estar entre 0 e 360 dias"),
  prazoImpostosAPagar: z
    .number()
    .min(0)
    .max(360, "Prazo deve estar entre 0 e 360 dias"),
  prazoObrigacoesSociais: z
    .number()
    .min(0)
    .max(360, "Prazo deve estar entre 0 e 360 dias"),
  prazoOutrasObrigacoes: z
    .number()
    .min(0)
    .max(360, "Prazo deve estar entre 0 e 360 dias"),
  taxaNovosEmprestimosCP: z
    .number()
    .min(-100)
    .max(100, "Taxa de novos empréstimos CP deve estar entre -100% e 100%"),
  taxaNovosEmprestimosLP: z
    .number()
    .min(-100)
    .max(100, "Taxa de novos empréstimos LP deve estar entre -100% e 100%"),
  taxaJurosEmprestimo: z
    .number()
    .min(0)
    .max(100, "Taxa de juros deve estar entre 0% e 100%"),
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
  dreProjection: z.array(DREProjectionInputsSchema),
  balanceSheetBase: BalanceSheetBaseInputsSchema,
  balanceSheetProjection: z.array(BalanceSheetProjectionInputsSchema),
  wacc: WACCCalculationSchema,
  taxaCrescimentoPerpetuo: z
    .number()
    .min(0)
    .max(50, "Taxa de crescimento perpétuo deve estar entre 0 e 50%"),
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
