"use client";

import { useActionState } from "react";
import { resetPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPassword, null);

  return (
    <form action={formAction} className="space-y-6">
      {/* Error Message */}
      {state?.error && (
        <div className="rounded-md bg-error-50 p-4 text-sm text-error-700">
          {state.error}
        </div>
      )}

      {/* Success Message */}
      {state?.success && state?.message && (
        <div className="rounded-md bg-success-50 p-4 text-sm text-success-700">
          {state.message}
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="seu@email.com"
          disabled={isPending || state?.success}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending || state?.success}
      >
        {isPending ? "Enviando..." : "Enviar email de recuperação"}
      </Button>
    </form>
  );
}
