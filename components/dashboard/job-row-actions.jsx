"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Archive, ExternalLink, Pencil, Trash2, Upload } from "lucide-react";
import { deleteJob, setJobStatus } from "@/actions/jobs";
import ConfirmDialog from "@/components/dashboard/confirm-dialog";

const iconBtn =
  "flex size-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface disabled:opacity-40";

export default function JobRowActions({ job, canDelete }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  function changeStatus(status) {
    setError("");
    start(async () => {
      const result = await setJobStatus(job.id, status);
      if (!result.ok) setError(result.message);
    });
  }

  function remove() {
    setError("");
    start(async () => {
      const result = await deleteJob(job.id);
      if (!result.ok) setError(result.message);
      else setConfirming(false);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-0.5">
        {job.status === "PUBLISHED" && (
          <Link href={`/jobs/${job.slug}`} target="_blank" className={iconBtn} aria-label={`View ${job.title} on site`} title="View on site">
            <ExternalLink className="size-4" aria-hidden />
          </Link>
        )}
        <Link href={`/dashboard/jobs/${job.id}/edit`} className={iconBtn} aria-label={`Edit ${job.title}`} title="Edit">
          <Pencil className="size-4" aria-hidden />
        </Link>
        {job.status !== "PUBLISHED" ? (
          <button type="button" disabled={pending} onClick={() => changeStatus("PUBLISHED")} className={iconBtn} aria-label={`Publish ${job.title}`} title="Publish">
            <Upload className="size-4" aria-hidden />
          </button>
        ) : (
          <button type="button" disabled={pending} onClick={() => changeStatus("CLOSED")} className={iconBtn} aria-label={`Close ${job.title}`} title="Close job">
            <Archive className="size-4" aria-hidden />
          </button>
        )}
        {canDelete && (
          <button type="button" onClick={() => setConfirming(true)} className={`${iconBtn} hover:!text-red-700`} aria-label={`Delete ${job.title}`} title="Delete">
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
        onClose={() => setConfirming(false)}
        title="Delete this job?"
        description={`"${job.title}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete job"
        pending={pending}
        error={error}
        onConfirm={remove}
      />
    </div>
  );
}