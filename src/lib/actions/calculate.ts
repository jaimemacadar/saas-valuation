// src/lib/actions/calculate.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isMockMode, getMockUser } from "@/lib/mock";
import { getModelById } from "./models";
import { calculateAllDRE } from "@/core/calculations/dre";
import { calculateAllBalanceSheet } from "@/core/calculations/balanceSheet";
import { calculateAllFCFF } from "@/core/calculations/fcff";
import { generateDefaultProjections } from "@/lib/utils/projection-defaults";
import type {
  DREBaseInputs,
  BalanceSheetBaseInputs,
  DREProjectionInputs,
  BalanceSheetProjectionInputs,
  DRECalculated,
  BalanceSheetCalculated,
  FCFFCalculated,
} from "@/core/types";

interface ActionResult {
  success?: boolean;
  error?: string;
  data?: {
    dre?: DRECalculated[];
    balanceSheet?: BalanceSheetCalculated[];
    fcff?: FCFFCalculated[];
  };
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

    // Se não existem premissas, gerar padrão (crescimento 5%)
    if (!dreProjection || !balanceSheetProjection) {
      const defaultProjections = generateDefaultProjections(
        dreBase,
        balanceSheetBase,
        anosProjecao
      );
      dreProjection = defaultProjections.dreProjection;
      balanceSheetProjection = defaultProjections.balanceSheetProjection;
    }

    // Calcular projeções
    const dreResult = calculateAllDRE(dreBase, dreProjection);
    if (!dreResult.success || !dreResult.data) {
      return {
        error: "Erro ao calcular DRE projetado",
      };
    }

    const balanceSheetResult = calculateAllBalanceSheet(
      balanceSheetBase,
      dreResult.data,
      balanceSheetProjection
    );
    if (!balanceSheetResult.success || !balanceSheetResult.data) {
      return {
        error: "Erro ao calcular Balanço Patrimonial projetado",
      };
    }

    const fcffResult = calculateAllFCFF(dreResult.data, balanceSheetResult.data);
    if (!fcffResult.success || !fcffResult.data) {
      return {
        error: "Erro ao calcular FCFF",
      };
    }

    // Atualizar model_data com resultados calculados e premissas (se geradas)
    const updatedModelData = {
      ...currentModelData,
      // Salvar premissas se foram geradas automaticamente
      ...((!currentModelData.dreProjection || !currentModelData.balanceSheetProjection) && {
        dreProjection,
        balanceSheetProjection,
        anosProjecao,
      }),
      // Salvar resultados calculados
      dre: dreResult.data,
      balanceSheet: balanceSheetResult.data,
      fcff: fcffResult.data,
    };

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

    return {
      success: true,
      data: {
        dre: dreResult.data,
        balanceSheet: balanceSheetResult.data,
        fcff: fcffResult.data,
      },
    };
  } catch (error) {
    console.error("Erro ao recalcular modelo:", error);
    return {
      error: "Erro ao recalcular modelo",
    };
  }
}
