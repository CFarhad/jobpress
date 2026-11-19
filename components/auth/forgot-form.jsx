"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { requestPasswordReset } from "@/actions/auth";

export default function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);

  return (
    <form action={action} className="mt-8 space-y-5">
      <div aria-live="polite">
        {state && (
          <p
            role={state.ok ? "status" : "alert"}
            className={`rounded-xl px-4 py-3 text-sm ${
              state.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"
            }`}
          >
            {state.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="text-label-md mb-1.5 block">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="field-control" />
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}