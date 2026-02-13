import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isMockMode, getMockUser } from "@/lib/mock";

/**
 * Helper para garantir que usuário está autenticado
 * Usado em Server Components e Server Actions
 */
export async function requireAuth(): Promise<User> {
  // Mock mode
  if (isMockMode()) {
    const mockUser = await getMockUser();
    if (!mockUser) {
      redirect("/login");
    }
    return { id: mockUser.id, email: mockUser.email } as User;
  }

  // Produção
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
 * Obtém usuário autenticado sem redirecionar
 * Retorna null se não autenticado
 */
export async function getCurrentUser(): Promise<User | null> {
  // Mock mode
  if (isMockMode()) {
    const mockUser = await getMockUser();
    if (!mockUser) return null;
    return { id: mockUser.id, email: mockUser.email } as User;
  }

  // Produção
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * Verifica se usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}
