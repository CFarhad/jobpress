"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { changePassword } from "@/actions/account";
import PasswordInput from "@/components/shared/password-input";

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  const formRef = useRef(null);
  const errors = state?.errors ?? {};

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const fields = [
    ["current", "Current password", "current-password"],
    ["password", "New password", "new-password"],
    ["confirm", "Confirm new password", "new-password"],
  ];

  return (
    <form ref={formRef} action={action} className="max-w-md space-y-5">
      <div aria-live="polite">
        {state?.message && (
          <p
            role={state.ok ? "status" : "alert"}
            className={`rounded-xl px-4 py-3 text-sm ${state.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"}`}
          >
            {state.message}
          </p>
        )}
      </div>

      {fields.map(([name, label, autoComplete]) => (
        <div key={name}>
          <label htmlFor={name} className="text-label-md mb-1.5 block">
            {label}
          </label>
          <PasswordInput id={name} name={name} autoComplete={autoComplete} required aria-invalid={!!errors[name]} />
          {errors[name] && (
            <p role="alert" className="mt-1 text-sm text-red-700">
              {errors[name]}
            </p>
          )}
        </div>
      ))}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Update password
      </button>
    </form>
  );
}