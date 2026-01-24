import { LoginForm } from "@/components/forms/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-secondary-900">
            SaaS Valuation
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-secondary-700">
            Bem-vindo de volta
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <LoginForm />

          {/* Divider */}
          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-secondary-200"></div>
            <span className="px-4 text-sm text-secondary-500">ou</span>
            <div className="flex-1 border-t border-secondary-200"></div>
          </div>

          {/* Links */}
          <div className="mt-6 space-y-3 text-center text-sm">
            <p className="text-secondary-600">
              Esqueceu sua senha?{" "}
              <Link
                href="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Recuperar senha
              </Link>
            </p>
            <p className="text-secondary-600">
              Não tem uma conta?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
