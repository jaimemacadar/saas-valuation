jest.mock("next/navigation", () => ({ redirect: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { signIn } from "@/lib/actions/auth";

describe("signIn", () => {
  it("deve retornar erro para email inválido", async () => {
    const formData = new FormData();
    formData.append("email", "email-invalido");
    formData.append("password", "123456");
    const result = await signIn({}, formData);
    expect(result.error).toBeDefined();
    expect(result.success).not.toBe(true);
  });

  it("deve retornar erro para senha curta", async () => {
    const formData = new FormData();
    formData.append("email", "teste@email.com");
    formData.append("password", "123");
    const result = await signIn({}, formData);
    expect(result.error).toBeDefined();
    expect(result.success).not.toBe(true);
  });
});

import { signOut, signInWithOAuth } from "@/lib/actions/auth";
import * as supabaseServer from "@/lib/supabase/server";

describe("signOut", () => {
  it("deve chamar o método de signOut do supabase sem lançar erro", async () => {
    // Mock do supabase
    const mockSignOut = jest.fn().mockResolvedValue({ error: undefined });
    jest.spyOn(supabaseServer, "createClient").mockReturnValue({
      auth: {
        signOut: mockSignOut,
      },
    } as never);
    await expect(signOut()).resolves.not.toThrow();
    expect(mockSignOut).toHaveBeenCalled();
  });
});

it("deve executar signOut sem lançar erro", async () => {
  await expect(signOut()).resolves.not.toThrow();
});

describe("signInWithOAuth", () => {
  it("deve retornar erro claro se OAuth for cancelado", async () => {
    // Mock do supabase
    jest.spyOn(supabaseServer, "createClient").mockReturnValue({
      auth: {
        signInWithOAuth: async () => ({
          error: { message: "User cancelled" },
        }),
      },
    } as never);
    const result = await signInWithOAuth("google");
    expect(result.error).toMatch(/cancelada/i);
  });

  it("deve retornar erro se não houver URL de redirecionamento", async () => {
    jest.spyOn(supabaseServer, "createClient").mockReturnValue({
      auth: {
        signInWithOAuth: async () => ({ data: {}, error: undefined }),
      },
    } as never);
    const result = await signInWithOAuth("github");
    expect(result.error).toMatch(/url de redirecionamento/i);
  });
});
