"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-1xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <CardContent className="grid p-0 md:grid-cols-1">
              <form action={formAction} className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
                    <p className="text-balance text-muted-foreground">
                      Entre na sua conta SaaS Valuation
                    </p>
                  </div>

                  {/* Error Message */}
                  {state?.error && (
                    <div className="rounded-md bg-error-50 p-4 text-sm text-error-700">
                      {state.error}
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="seu@email.com"
                      required
                      disabled={isPending}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Senha</Label>
                      <Link
                        href="/forgot-password"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Esqueceu sua senha?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      disabled={isPending}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Entrando..." : "Entrar"}
                  </Button>
                  <div className="text-center text-sm">
                    Não tem uma conta?{" "}
                    <Link
                      href="/signup"
                      className="underline underline-offset-4"
                    >
                      Criar conta
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            Ao continuar, você concorda com nossos{" "}
            <Link href="#">Termos de Serviço</Link> e{" "}
            <Link href="#">Política de Privacidade</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
