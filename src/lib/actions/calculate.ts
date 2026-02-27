// src/lib/actions/calculate.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isMockMode } from "@/lib/mock/config";
import { getMockUser } from "@/lib/mock/auth";
import { mockStore } from "@/lib/mock/store";
import { getModelById } from "./models";
import { calculateAllDRE } from "@/core/calculations/dre";
import { calculateAllBalanceSheet } from "@/core/calculations/balanceSheet";
import { calculateAllFCFF } from "@/core/calculations/fcff";
import { calculateAllIndicadores } from "@/core/calculations/indicadores";
import { generateDefaultProjections } from "@/lib/utils/projection-defaults";
import type {
  DREBaseInputs,
  BalanceSheetBaseInputs,
  DREProjectionInputs,
  BalanceSheetProjectionInputs,
  DRECalculated,
  BalanceSheetCalculated,
  FCFFCalculated,
  IndicadoresCalculated,
} from "@/core/types";

interface ActionResult {
  success?: boolean;
  error?: string;
  data?: {
    dre?: DRECalculated[];
    balanceSheet?: BalanceSheetCalculated[];
    fcff?: FCFFCalculated[];
    indicadores?: IndicadoresCalculated[];
  };
}

const DEFAULT_BP_PROJECTION_PREMISES: Omit<BalanceSheetProjectionInputs, "year"> = {
  taxaDepreciacao: 20,
  indiceImobilizadoVendas: 0.05,
  taxaJurosAplicacoes: 0,
  prazoCaixaEquivalentes: 54,
  prazoContasReceber: 45,
  prazoEstoques: 11,
  prazoOutrosCreditos: 0,
  prazoFornecedores: 22,
  prazoImpostosAPagar: 7,
  prazoObrigacoesSociais: 11,
  prazoOutrasObrigacoes: 0,
  taxaNovosEmprestimosCP: 0,
  taxaNovosEmprestimosLP: 0,
  taxaJurosEmprestimo: 0,
};

function normalizeProjectionYears<T extends { year: number }>(projection: T[]): T[] {
  if (projection.length === 0) return projection;
  const sorted = [...projection].sort((a, b) => a.year - b.year);
  return sorted.map((item, index) => ({ ...item, year: index + 1 }));
}

/**
 * Get authenticated user or redirect to login
 */
async function requireAuth() {
  // Mock mode: retorna usuário mock
  if (isMockMode()) {
    const mockUser = await getMockUser();
    if (!mockUser) {
      redirect("/login");
    }
    return { id: mockUser.id, email: mockUser.email };
  }

  // Produção: usa Supabase
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Recalcula todas as projeções do modelo baseado nos dados base e premissas.
 *
 * Fluxo:
 * 1. Verifica se existem dados base (DRE e BP)
 * 2. Se não existem premissas, gera premissas padrão (crescimento 5%)
 * 3. Calcula DRE projetado
 * 4. Calcula Balanço Patrimonial projetado
 * 5. Calcula FCFF
 * 6. Salva resultados no model_data
 */
export async function recalculateModel(modelId: string): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Buscar modelo atual
    const modelResult = await getModelById(modelId);
    if (!modelResult.success || !modelResult.data) {
      return {
        error: "Modelo não encontrado",
      };
    }

    const currentModelData = (modelResult.data.model_data as any) || {};

    // Verificar se existem dados base
    const dreBase = currentModelData.dreBase as DREBaseInputs | undefined;
    const balanceSheetBase = currentModelData.balanceSheetBase as BalanceSheetBaseInputs | undefined;

    if (!dreBase || !balanceSheetBase) {
      // Não há dados suficientes para calcular
      return {
        success: true,
        data: {},
      };
    }

    // Obter ou gerar premissas de projeção
    let dreProjection = currentModelData.dreProjection as DREProjectionInputs[] | undefined;
    let balanceSheetProjection = currentModelData.balanceSheetProjection as BalanceSheetProjectionInputs[] | undefined;
    const anosProjecao = currentModelData.anosProjecao || 5;
    const hasValidDREProjection =
      Array.isArray(dreProjection) && dreProjection.length > 0;
    const hasValidBPProjection =
      Array.isArray(balanceSheetProjection) && balanceSheetProjection.length > 0;

    // Se não existem premissas, gerar padrão (crescimento 5%)
    if (!hasValidDREProjection || !hasValidBPProjection) {
      const defaultProjections = generateDefaultProjections(
        dreBase,
        balanceSheetBase,
        anosProjecao
      );
      dreProjection = defaultProjections.dreProjection;
      balanceSheetProjection = defaultProjections.balanceSheetProjection;
    } else {
      // IMPORTANTE: Se os arrays têm tamanhos diferentes, estender o menor
      // copiando os valores do último ano para os anos faltantes
      if (dreProjection.length !== balanceSheetProjection.length) {
        const maxLength = Math.max(dreProjection.length, balanceSheetProjection.length);

        // Estender DRE se necessário
        if (dreProjection.length < maxLength) {
          const lastDREPremise = dreProjection[dreProjection.length - 1];
          for (let year = dreProjection.length + 1; year <= maxLength; year++) {
            dreProjection.push({
              ...lastDREPremise,
              year,
            });
          }
        }

        // Estender BP se necessário
        if (balanceSheetProjection.length < maxLength) {
          const lastBPPremise = balanceSheetProjection[balanceSheetProjection.length - 1];
          for (let year = balanceSheetProjection.length + 1; year <= maxLength; year++) {
            balanceSheetProjection.push({
              ...lastBPPremise,
              year,
            });
          }
        }
      }
    }

    const dreProjectionNormalized = normalizeProjectionYears(dreProjection || []);
    const balanceSheetProjectionNormalized = normalizeProjectionYears(balanceSheetProjection || [])
      .map((premissa) => ({
        ...DEFAULT_BP_PROJECTION_PREMISES,
        ...premissa,
      }));
    const yearsWereNormalized =
      JSON.stringify(dreProjection) !== JSON.stringify(dreProjectionNormalized) ||
      JSON.stringify(balanceSheetProjection) !== JSON.stringify(balanceSheetProjectionNormalized);

    dreProjection = dreProjectionNormalized;
    balanceSheetProjection = balanceSheetProjectionNormalized;

    // ============================================================
    // Fluxo iterativo DRE → BP → DRE (integração sem circularidade)
    // Pass 1: DRE parcial (despesasFinanceiras = 0) → receita e EBIT corretos
    // Pass 2: BP com DRE parcial → empréstimos e depreciacaoAnual corretos
    // Pass 3: DRE final com D&A e despesasFinanceiras do BP → lucroLiquido correto
    // Pass 4: BP final com DRE correto → lucrosAcumulados corretos
    // ============================================================
    const drePass1 = calculateAllDRE(dreBase, dreProjection);
    if (!drePass1.success || !drePass1.data) {
      console.error('[recalculateModel] Erro ao calcular DRE pass 1:', drePass1.errors);
      return { error: drePass1.errors?.[0] || "Erro ao calcular DRE projetado" };
    }

    const bpPass1 = calculateAllBalanceSheet(balanceSheetBase, drePass1.data, balanceSheetProjection);
    if (!bpPass1.success || !bpPass1.data) {
      return { error: bpPass1.errors?.[0] || "Erro ao calcular Balanço Patrimonial projetado" };
    }

    // Extrair D&A e despesasFinanceiras do BP para cada ano projetado
    const bpDataForDRE = bpPass1.data
      .filter((bp) => bp.year > 0)
      .map((bp) => ({
        year: bp.year,
        despesasFinanceiras: bp.despesasFinanceiras,
        depreciacaoAnual: bp.depreciacaoAnual,
      }));

    // DRE final com dados reais do BP
    const dreResult = calculateAllDRE(dreBase, dreProjection, bpDataForDRE);
    if (!dreResult.success || !dreResult.data) {
      console.error('[recalculateModel] Erro ao calcular DRE final:', dreResult.errors);
      return { error: dreResult.errors?.[0] || "Erro ao calcular DRE projetado" };
    }

    // BP final com DRE corrigido (lucrosAcumulados corretos)
    const balanceSheetResult = calculateAllBalanceSheet(
      balanceSheetBase,
      dreResult.data,
      balanceSheetProjection
    );
    if (!balanceSheetResult.success || !balanceSheetResult.data) {
      return {
        error:
          balanceSheetResult.errors?.[0] ||
          "Erro ao calcular Balanço Patrimonial projetado",
      };
    }
    const fcffResult = calculateAllFCFF(dreResult.data, balanceSheetResult.data);
    if (!fcffResult.success || !fcffResult.data) {
      return {
        error: fcffResult.errors?.[0] || "Erro ao calcular FCFF",
      };
    }

    // Calcular Indicadores Financeiros
    const indicadoresResult = calculateAllIndicadores(dreResult.data, balanceSheetResult.data);
    if (!indicadoresResult.success || !indicadoresResult.data) {
      return {
        error:
          indicadoresResult.errors?.[0] ||
          "Erro ao calcular indicadores financeiros",
      };
    }

    // Verificar se as premissas foram estendidas
    const premissasForamEstendidas =
      dreProjection.length !== (currentModelData.dreProjection as any[])?.length ||
      balanceSheetProjection.length !== (currentModelData.balanceSheetProjection as any[])?.length;

    // Atualizar model_data com resultados calculados e premissas (se geradas ou estendidas)
    const updatedModelData = {
      ...currentModelData,
      // Salvar premissas se foram geradas automaticamente OU estendidas
      ...((!currentModelData.dreProjection ||
        !currentModelData.balanceSheetProjection ||
        premissasForamEstendidas ||
        yearsWereNormalized) && {
        dreProjection,
        balanceSheetProjection,
        anosProjecao: Math.max(dreProjection.length, balanceSheetProjection.length),
      }),
      // Salvar resultados calculados
      dre: dreResult.data,
      balanceSheet: balanceSheetResult.data,
      fcff: fcffResult.data,
      indicadores: indicadoresResult.data,
    };

    if (isMockMode()) {
      const updated = mockStore.updateModel(modelId, user.id, {
        model_data: updatedModelData,
      });

      if (!updated) {
        return {
          error: "Erro ao salvar cálculos no mock store",
        };
      }
    } else {
      // Atualizar no banco de dados
      const supabase = await createClient();
      const { error: updateError } = await supabase
        .from("financial_models")
        .update({
          model_data: updatedModelData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", modelId)
        .eq("user_id", user.id);

      if (updateError) {
        return {
          error: "Erro ao salvar cálculos no banco de dados",
        };
      }
    }

    // Invalidar cache das páginas de visualização
    revalidatePath(`/model/${modelId}`);
    revalidatePath(`/model/${modelId}/input/base`);
    revalidatePath(`/model/${modelId}/view/balance-sheet`);
    revalidatePath(`/model/${modelId}/input/projections`);

    return {
      success: true,
      data: {
        dre: dreResult.data,
        balanceSheet: balanceSheetResult.data,
        fcff: fcffResult.data,
        indicadores: indicadoresResult.data,
      },
    };
  } catch (error) {
    console.error("Erro ao recalcular modelo:", error);
    const message = error instanceof Error ? error.message : String(error);
    return {
      error: `Erro ao recalcular modelo: ${message}`,
    };
  }
}
