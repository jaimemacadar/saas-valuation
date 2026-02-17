// src/lib/actions/calculate.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

    console.log('[recalculateModel] dreBase:', dreBase);
    console.log('[recalculateModel] balanceSheetBase:', balanceSheetBase);

    if (!dreBase || !balanceSheetBase) {
      // Não há dados suficientes para calcular
      console.log('[recalculateModel] Dados base insuficientes');
      return {
        success: true,
        data: {},
      };
    }

    // Obter ou gerar premissas de projeção
    let dreProjection = currentModelData.dreProjection as DREProjectionInputs[] | undefined;
    let balanceSheetProjection = currentModelData.balanceSheetProjection as BalanceSheetProjectionInputs[] | undefined;
    const anosProjecao = currentModelData.anosProjecao || 5;

    console.log('[recalculateModel] Configuração de anos:', {
      anosProjecaoSalvo: currentModelData.anosProjecao,
      anosProjecaoUsado: anosProjecao,
      dreProjectionLength: dreProjection?.length,
      balanceSheetProjectionLength: balanceSheetProjection?.length,
    });

    // Se não existem premissas, gerar padrão (crescimento 5%)
    if (!dreProjection || dreProjection.length === 0 || !balanceSheetProjection || balanceSheetProjection.length === 0) {
      console.log('[recalculateModel] Gerando premissas padrão para', anosProjecao, 'anos');
      const defaultProjections = generateDefaultProjections(
        dreBase,
        balanceSheetBase,
        anosProjecao
      );
      dreProjection = defaultProjections.dreProjection;
      balanceSheetProjection = defaultProjections.balanceSheetProjection;
    } else {
      console.log('[recalculateModel] Usando premissas existentes:', {
        dreProjection: dreProjection.length,
        balanceSheetProjection: balanceSheetProjection.length,
      });

      // IMPORTANTE: Se os arrays têm tamanhos diferentes, estender o menor
      // copiando os valores do último ano para os anos faltantes
      if (dreProjection.length !== balanceSheetProjection.length) {
        const maxLength = Math.max(dreProjection.length, balanceSheetProjection.length);
        console.warn('[recalculateModel] Arrays com tamanhos diferentes! Estendendo para:', maxLength);

        // Estender DRE se necessário
        if (dreProjection.length < maxLength) {
          const lastDREPremise = dreProjection[dreProjection.length - 1];
          for (let year = dreProjection.length + 1; year <= maxLength; year++) {
            dreProjection.push({
              ...lastDREPremise,
              year,
            });
          }
          console.log('[recalculateModel] DRE estendido para', maxLength, 'anos');
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
          console.log('[recalculateModel] BP estendido para', maxLength, 'anos');
        }
      }
    }

    // Calcular projeções
    console.log('[recalculateModel] Calculando DRE com', dreProjection.length, 'anos de projeção');
    const dreResult = calculateAllDRE(dreBase, dreProjection);
    console.log('[recalculateModel] Resultado DRE:', {
      success: dreResult.success,
      dataLength: dreResult.data?.length,
      errors: dreResult.errors,
    });

    if (!dreResult.success || !dreResult.data) {
      console.error('[recalculateModel] Erro ao calcular DRE:', dreResult.errors);
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

    // Verificar se as premissas foram estendidas
    const premissasForamEstendidas =
      dreProjection.length !== (currentModelData.dreProjection as any[])?.length ||
      balanceSheetProjection.length !== (currentModelData.balanceSheetProjection as any[])?.length;

    // Atualizar model_data com resultados calculados e premissas (se geradas ou estendidas)
    const updatedModelData = {
      ...currentModelData,
      // Salvar premissas se foram geradas automaticamente OU estendidas
      ...((!currentModelData.dreProjection || !currentModelData.balanceSheetProjection || premissasForamEstendidas) && {
        dreProjection,
        balanceSheetProjection,
        anosProjecao: Math.max(dreProjection.length, balanceSheetProjection.length),
      }),
      // Salvar resultados calculados
      dre: dreResult.data,
      balanceSheet: balanceSheetResult.data,
      fcff: fcffResult.data,
    };

    console.log('[recalculateModel] Salvando dados:', {
      dreCount: dreResult.data.length,
      balanceSheetCount: balanceSheetResult.data.length,
      fcffCount: fcffResult.data.length,
    });

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

    // Invalidar cache das páginas de visualização
    revalidatePath(`/model/${modelId}/view/dre`);
    revalidatePath(`/model/${modelId}/view/balance-sheet`);
    revalidatePath(`/model/${modelId}/view/fcff`);
    revalidatePath(`/model/${modelId}/input/projections`);

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
