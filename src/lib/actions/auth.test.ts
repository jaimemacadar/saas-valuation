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
