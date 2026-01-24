import { SignupForm } from "@/components/forms/SignupForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-secondary-900">
            SaaS Valuation
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-secondary-700">
            Criar nova conta
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Comece a avaliar empresas gratuitamente
          </p>
        </div>

        {/* Signup Form */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <SignupForm />

          {/* Divider */}
          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-secondary-200"></div>
            <span className="px-4 text-sm text-secondary-500">ou</span>
            <div className="flex-1 border-t border-secondary-200"></div>
          </div>

          {/* Link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-secondary-600">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
