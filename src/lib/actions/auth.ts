"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schemas de validação
const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const signUpSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string(),
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const resetPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// Type para retorno de ações
type ActionResult = {
  error?: string;
  success?: boolean;
  message?: string;
};

/**
 * Sign In - Autentica usuário existente
 */
export async function signIn(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  try {
    // Validar inputs
    const validatedFields = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.issues[0]?.message || "Erro de validação",
      };
    }

    const { email, password } = validatedFields.data;

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        error: "Email ou senha incorretos",
      };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      error: "Erro ao fazer login. Tente novamente.",
    };
  }
}

/**
 * Sign Up - Cria nova conta de usuário
 */
export async function signUp(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  try {
    // Validar inputs
    const validatedFields = signUpSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      name: formData.get("name"),
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.issues[0]?.message || "Erro de validação",
      };
    }

    const { email, password, name } = validatedFields.data;

    const supabase = await createClient();

    // Criar usuário
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        return {
          error: "Este email já está cadastrado",
        };
      }
      return {
        error: error.message,
      };
    }

    // Se confirmação de email não é necessária, redirecionar
    if (data.user && !data.user.identities?.length) {
      return {
        success: true,
        message: "Conta criada! Verifique seu email para confirmar.",
      };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      error: "Erro ao criar conta. Tente novamente.",
    };
  }
}

/**
 * Sign Out - Faz logout do usuário
 */
export async function signOut(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    revalidatePath("/", "layout");
    redirect("/login");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      error: "Erro ao fazer logout",
    };
  }
}

/**
 * Reset Password - Envia email para redefinição de senha
 */
export async function resetPassword(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const validatedFields = resetPasswordSchema.safeParse({
      email: formData.get("email"),
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.issues[0]?.message || "Erro de validação",
      };
    }

    const { email } = validatedFields.data;

    const supabase = await createClient();

    console.log("🔄 Iniciando reset de senha para:", email);
    console.log(
      "📧 URL de redirecionamento:",
      `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    );

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      console.error("❌ Erro ao enviar email:", error);

      // Tratar erro de rate limit especificamente
      if (error.message?.includes("rate limit") || error.status === 429) {
        return {
          error:
            "Limite de e-mails atingido. Aguarde 1 hora e tente novamente, ou use outro e-mail.",
        };
      }

      return {
        error: `Erro ao enviar email: ${error.message}`,
      };
    }

    console.log("✅ Email enviado com sucesso!", data);

    return {
      success: true,
      message:
        "Email de recuperação enviado! Verifique sua caixa de entrada (e spam).",
    };
  } catch (error) {
    console.error("❌ Exceção ao processar reset:", error);
    return {
      error: "Erro ao processar solicitação",
    };
  }
}

/**
 * Update Password - Atualiza senha do usuário (após reset)
 */
export async function updatePassword(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const validatedFields = updatePasswordSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.issues[0]?.message || "Erro de validação",
      };
    }

    const { password } = validatedFields.data;

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return {
        error: "Erro ao atualizar senha",
      };
    }

    revalidatePath("/", "layout");
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
 * Sign In with OAuth (Google, GitHub, etc.)
 */
export async function signInWithOAuth(
  provider: "google" | "github",
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      return {
        error: `Erro ao autenticar com ${provider}`,
      };
    }

    if (data.url) {
      redirect(data.url);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      error: "Erro ao processar solicitação",
    };
  }
}
