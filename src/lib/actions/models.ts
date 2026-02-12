"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isMockMode,
  getMockUser,
  mockStore,
  mockDelay,
} from "@/lib/mock";

// Types
export type FinancialModelBasic = {
  id: string;
  user_id: string;
  company_name: string;
  ticker_symbol?: string;
  description?: string;
  model_data: unknown; // JSON com todos os dados do modelo
  created_at: string;
  updated_at: string;
};

type ActionResult<T = unknown> = {
  data?: T;
  error?: string;
  success?: boolean;
};

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
 * Get all models for authenticated user
 */
export async function getModels(): Promise<
  ActionResult<FinancialModelBasic[]>
> {
  try {
    const user = await requireAuth();

    // Mock mode
    if (isMockMode()) {
      await mockDelay("NORMAL");
      const models = mockStore.getModels(user.id);
      return {
        success: true,
        data: models,
      };
    }

    // Produção
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("financial_models")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      return {
        error: "Erro ao carregar modelos",
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      error: "Erro ao processar solicitação",
    };
  }
}

/**
 * Get single model by ID
 */
export async function getModelById(
  id: string,
): Promise<ActionResult<FinancialModelBasic>> {
  try {
    const user = await requireAuth();

    // Mock mode
    if (isMockMode()) {
      await mockDelay("FAST");
      const model = mockStore.getModelById(id, user.id);
      if (!model) {
        return {
          error: "Modelo não encontrado",
        };
      }
      return {
        success: true,
        data: model,
      };
    }

    // Produção
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("financial_models")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          error: "Modelo não encontrado",
        };
      }
      return {
        error: "Erro ao carregar modelo",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      error: "Erro ao processar solicitação",
    };
  }
}

/**
 * Create new financial model
 */
export async function createModel(formData: {
  company_name: string;
  ticker_symbol?: string;
  description?: string;
  model_data?: unknown;
}): Promise<ActionResult<FinancialModelBasic>> {
  try {
    const user = await requireAuth();

    // Validação básica
    if (!formData.company_name || formData.company_name.trim().length === 0) {
      return {
        error: "Nome da empresa é obrigatório",
      };
    }

    // Mock mode
    if (isMockMode()) {
      await mockDelay("NORMAL");
      const newModel = mockStore.createModel(user.id, {
        company_name: formData.company_name.trim(),
        ticker_symbol: formData.ticker_symbol?.trim(),
        description: formData.description?.trim(),
        model_data: formData.model_data || {},
      });

      revalidatePath("/dashboard");
      redirect(`/model/${newModel.id}/view/dre`);
    }

    // Produção
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("financial_models")
      .insert({
        user_id: user.id,
        company_name: formData.company_name.trim(),
        ticker_symbol: formData.ticker_symbol?.trim() || null,
        description: formData.description?.trim() || null,
        model_data: formData.model_data || {},
      })
      .select()
      .single();

    if (error) {
      return {
        error: "Erro ao criar modelo",
      };
    }

    revalidatePath("/dashboard");
    redirect(`/model/${data.id}/view/dre`);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      error: "Erro ao processar solicitação",
    };
  }
}

/**
 * Update existing model
 */
export async function updateModel(
  id: string,
  formData: {
    company_name?: string;
    ticker_symbol?: string;
    description?: string;
    model_data?: unknown;
  },
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Validação básica
    if (
      formData.company_name !== undefined &&
      formData.company_name.trim().length === 0
    ) {
      return {
        error: "Nome da empresa não pode ser vazio",
      };
    }

    // Mock mode
    if (isMockMode()) {
      await mockDelay("NORMAL");
      const updated = mockStore.updateModel(id, user.id, {
        company_name: formData.company_name?.trim(),
        ticker_symbol: formData.ticker_symbol?.trim(),
        description: formData.description?.trim(),
        model_data: formData.model_data,
      });

      if (!updated) {
        return {
          error: "Erro ao atualizar modelo",
        };
      }

      revalidatePath(`/model/${id}`);
      revalidatePath("/dashboard");

      return {
        success: true,
      };
    }

    // Produção
    const supabase = await createClient();

    const updateData: Partial<FinancialModelBasic> = {
      updated_at: new Date().toISOString(),
    };

    if (formData.company_name !== undefined) {
      updateData.company_name = formData.company_name.trim();
    }
    if (formData.ticker_symbol !== undefined) {
      updateData.ticker_symbol = formData.ticker_symbol?.trim() || undefined;
    }
    if (formData.description !== undefined) {
      updateData.description = formData.description?.trim() || undefined;
    }
    if (formData.model_data !== undefined) {
      updateData.model_data = formData.model_data;
    }

    const { error } = await supabase
      .from("financial_models")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return {
        error: "Erro ao atualizar modelo",
      };
    }

    revalidatePath(`/model/${id}`);
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      error: "Erro ao processar solicitação",
    };
  }
}

/**
 * Delete model
 */
export async function deleteModel(id: string): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Mock mode
    if (isMockMode()) {
      await mockDelay("SLOW");
      const deleted = mockStore.deleteModel(id, user.id);

      if (!deleted) {
        return {
          error: "Erro ao excluir modelo",
        };
      }

      revalidatePath("/dashboard");
      redirect("/dashboard");
    }

    // Produção
    const supabase = await createClient();
    const { error } = await supabase
      .from("financial_models")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return {
        error: "Erro ao excluir modelo",
      };
    }

    revalidatePath("/dashboard");
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      error: "Erro ao processar solicitação",
    };
  }
}

/**
 * Duplicate model
 */
export async function duplicateModel(id: string): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Mock mode
    if (isMockMode()) {
      await mockDelay("SLOW");
      const duplicate = mockStore.duplicateModel(id, user.id);

      if (!duplicate) {
        return {
          error: "Modelo não encontrado",
        };
      }

      revalidatePath("/dashboard");
      redirect(`/model/${duplicate.id}/view/dre`);
    }

    // Produção
    const supabase = await createClient();

    // Buscar modelo original
    const { data: original, error: fetchError } = await supabase
      .from("financial_models")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !original) {
      return {
        error: "Modelo não encontrado",
      };
    }

    // Criar cópia
    const { data: duplicate, error: createError } = await supabase
      .from("financial_models")
      .insert({
        user_id: user.id,
        company_name: `${original.company_name} (Cópia)`,
        ticker_symbol: original.ticker_symbol,
        description: original.description,
        model_data: original.model_data,
      })
      .select()
      .single();

    if (createError) {
      return {
        error: "Erro ao duplicar modelo",
      };
    }

    revalidatePath("/dashboard");
    redirect(`/model/${duplicate.id}/view/dre`);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      error: "Erro ao processar solicitação",
    };
  }
}
