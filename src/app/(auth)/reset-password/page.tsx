import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-secondary-900">
            SaaS Valuation
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-secondary-700">
            Redefinir senha
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Digite sua nova senha abaixo
          </p>
        </div>

        {/* Reset Password Form */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <ResetPasswordForm />

          {/* Link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-secondary-600">
              Lembrou sua senha?{" "}
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
