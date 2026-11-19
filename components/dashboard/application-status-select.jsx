"use client";

import { useEffect, useState, useTransition } from "react";
import { updateApplicationStatus } from "@/actions/applications";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL } from "@/lib/dashboard-constants";

export default function ApplicationStatusSelect({ id, status }) {
  const [value, setValue] = useState(status);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => setValue(status), [status],[]);

  function onChange(event) {
    const next = event.target.value;
    const previous = value;
    setValue(next);
    setError("");
    start(async () => {
      const result = await updateApplicationStatus(id, next);
      if (!result.ok) {
        setValue(previous);
        setError(result.message);
      }
    });
  }

  return (
    <div>
      <select
        value={value}
        onChange={onChange}
        disabled={pending}
        aria-label="Application status"
        className="w-40 rounded-lg border border-outline/30 bg-white px-3 py-1.5 text-sm disabled:opacity-60"
      >
        {APPLICATION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {APPLICATION_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}