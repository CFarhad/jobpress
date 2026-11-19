"use client";

import { Loader2 } from "lucide-react";
import Modal from "@/components/dashboard/modal";

export default function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  pending = false,
  error = "",
  onConfirm,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={pending}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className="btn btn-danger" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}