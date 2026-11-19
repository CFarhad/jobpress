"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteApplication } from "@/actions/applications";
import ConfirmDialog from "@/components/dashboard/confirm-dialog";

export default function DeleteApplicationButton({ id, name }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function confirm() {
    setError("");
    start(async () => {
      const result = await deleteApplication(id);
      // success redirects; we only get a value back on failure
      if (result && !result.ok) setError(result.message);
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-danger-soft btn-sm">
        <Trash2 className="size-4" aria-hidden /> Delete application
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete this application?"
        description={`${name}'s application, notes and CV file will be permanently deleted.`}
        confirmLabel="Delete"
        pending={pending}
        error={error}
        onConfirm={confirm}
      />
    </>
  );
}