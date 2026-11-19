"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { resetPassword } from "@/actions/auth";
import PasswordInput from "@/components/shared/password-input";

export default function ResetForm({ token }) {
  const [state, action, pending] = useActionState(resetPassword, null);
  const errors = state?.errors ?? {};

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="token" value={token} />

      <div aria-live="polite">
        {state && !state.ok && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="text-label-md mb-1.5 block">
          New password
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && (
          <p id="password-error" className="mt-1 text-sm text-red-700">
            {errors.password}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirm" className="text-label-md mb-1.5 block">
          Confirm password
        </label>
        <PasswordInput
          id="confirm"
          name="confirm"
          autoComplete="new-password"
          required
          aria-invalid={!!errors.confirm}
          aria-describedby={errors.confirm ? "confirm-error" : undefined}
        />
        {errors.confirm && (
          <p id="confirm-error" className="mt-1 text-sm text-red-700">
            {errors.confirm}
          </p>
        )}
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}