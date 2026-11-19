"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Copy, Pencil, Star, Trash2 } from "lucide-react";
import { deleteForm, duplicateForm, setDefaultForm } from "@/actions/forms";
import ConfirmDialog from "@/components/dashboard/confirm-dialog";

const iconBtn =
  "flex size-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface disabled:opacity-40";

export default function FormRowActions({ form, canDelete }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  const run = (fn, onOk) => {
    setError("");
    start(async () => {
      const result = await fn();
      if (result?.ok) onOk?.();
      else if (result) setError(result.message);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-end gap-0.5">
        <Link href={`/dashboard/forms/${form.id}/edit`} className={iconBtn} aria-label={`Edit ${form.name}`} title="Edit">
          <Pencil className="size-4" aria-hidden />
        </Link>
        <button type="button" disabled={pending} onClick={() => run(() => duplicateForm(form.id))} className={iconBtn} aria-label={`Duplicate ${form.name}`} title="Duplicate">
          <Copy className="size-4" aria-hidden />
        </button>
        {!form.isDefault && (
          <button type="button" disabled={pending} onClick={() => run(() => setDefaultForm(form.id))} className={iconBtn} aria-label={`Make ${form.name} the default`} title="Make default">
            <Star className="size-4" aria-hidden />
          </button>
        )}
        {canDelete && !form.isDefault && (
          <button type="button" onClick={() => setConfirming(true)} className={`${iconBtn} hover:!text-red-700`} aria-label={`Delete ${form.name}`} title="Delete">
            <Trash2 className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {error && !confirming && (
        <p role="alert" className="mt-1 max-w-56 text-right text-xs text-red-700">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => {
          setConfirming(false);
          setError("");
        }}
        title="Delete this form?"
        description={`"${form.name}" will be permanently removed. Past applications keep their answers.`}
        confirmLabel="Delete form"
        pending={pending}
        error={error}
        onConfirm={() => run(() => deleteForm(form.id), () => setConfirming(false))}
      />
    </div>
  );
}