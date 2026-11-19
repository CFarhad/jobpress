"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { saveJob } from "@/actions/jobs";
import RichTextEditor from "@/components/dashboard/rich-text-editor";
import { EXPERIENCE_LABEL, JOB_TYPE_LABEL, WORKPLACE_LABEL } from "@/lib/format";
import { JOB_STATUSES, JOB_STATUS_LABEL } from "@/lib/dashboard-constants";

const toNumber = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-label-md mb-1.5 block">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default function JobForm({ departments,forms = [], job }) {
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [values, setValues] = useState(() => ({
    title: job?.title ?? "",
    summary: job?.summary ?? "",
    departmentId: job?.departmentId ?? "",
    location: job?.location ?? "",
    type: job?.type ?? "FULL_TIME",
    workplace: job?.workplace ?? "ONSITE",
    experience: job?.experience ?? "MID",
    salaryMin: job?.salaryMin ?? "",
    salaryMax: job?.salaryMax ?? "",
    salaryCurrency: job?.salaryCurrency ?? "USD",
    deadline: job?.deadline ?? "",
    featured: job?.featured ?? false,
    status: job?.status ?? "DRAFT",
    description: job?.description ?? "",
    responsibilities: job?.responsibilities ?? "",
    requirements: job?.requirements ?? "",
    benefits: job?.benefits ?? "",
    formId: job?.formId ?? "",
  }));

  const set = (name) => (e) =>
    setValues((v) => ({ ...v, [name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const setHtml = (name) => (html) => setValues((v) => ({ ...v, [name]: html }));
  const props = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: set(name),
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  function onSubmit(event) {
    event.preventDefault();
    setErrors({});
    setMessage("");

    start(async () => {
      const result = await saveJob({
        ...values,
        id: job?.id,
        salaryMin: toNumber(values.salaryMin),
        salaryMax: toNumber(values.salaryMax),
        deadline: values.deadline || null,
        formId: values.formId || null,
      });
      // On success the action redirects, so we only get here on failure.
      if (result && !result.ok) {
        setErrors(result.errors ?? {});
        setMessage(result.message);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-3">
      {message && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 lg:col-span-3">
          {message}
        </p>
      )}

      <div className="space-y-6 lg:col-span-2">
        <section className="surface-card space-y-5 p-6">
          <Field id="title" label="Job title" error={errors.title}>
            <input {...props("title")} className="field-control" placeholder="e.g. Senior Product Designer" />
          </Field>
          <Field id="summary" label="Short summary" error={errors.summary} hint="Shown on job cards. Max 300 characters.">
            <textarea {...props("summary")} rows={3} maxLength={300} className="field-control" />
          </Field>
        </section>

        <section className="surface-card space-y-6 p-6">
          <Field id="description" label="Description" error={errors.description}>
            <RichTextEditor id="description" label="Description" value={values.description} onChange={setHtml("description")} placeholder="Describe the role…" error={errors.description} />
          </Field>
          <Field id="responsibilities" label="Responsibilities (optional)">
            <RichTextEditor id="responsibilities" label="Responsibilities" value={values.responsibilities} onChange={setHtml("responsibilities")} placeholder="What will they do?" />
          </Field>
          <Field id="requirements" label="Requirements (optional)">
            <RichTextEditor id="requirements" label="Requirements" value={values.requirements} onChange={setHtml("requirements")} placeholder="Skills and experience…" />
          </Field>
          <Field id="benefits" label="Benefits (optional)">
            <RichTextEditor id="benefits" label="Benefits" value={values.benefits} onChange={setHtml("benefits")} placeholder="Perks and benefits…" />
          </Field>
        </section>
      </div>

      <div className="space-y-6">
        <section className="surface-card space-y-5 p-6">
          <h2 className="text-headline-sm">Publishing</h2>
          <Field id="status" label="Status" error={errors.status} hint="Only published jobs appear on the careers site.">
            <select {...props("status")} className="field-control">
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {JOB_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field id="deadline" label="Application deadline" error={errors.deadline} hint="Optional. The job closes automatically after this date.">
            <input {...props("deadline")} type="date" className="field-control" />
          </Field>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={values.featured} onChange={set("featured")} className="size-4 rounded accent-[var(--color-primary)]" />
            Featured job
          </label>
        </section>

        <section className="surface-card space-y-5 p-6">
          <h2 className="text-headline-sm">Details</h2>
          <Field id="departmentId" label="Department" error={errors.departmentId}>
            <select {...props("departmentId")} className="field-control">
              <option value="">Select…</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="location" label="Location" error={errors.location}>
            <input {...props("location")} className="field-control" placeholder="Riyadh, Saudi Arabia" />
          </Field>
          <Field id="type" label="Job type" error={errors.type}>
            <select {...props("type")} className="field-control">
              {Object.entries(JOB_TYPE_LABEL).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="workplace" label="Workplace" error={errors.workplace}>
            <select {...props("workplace")} className="field-control">
              {Object.entries(WORKPLACE_LABEL).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="experience" label="Experience level" error={errors.experience}>
            <select {...props("experience")} className="field-control">
              {Object.entries(EXPERIENCE_LABEL).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="formId" label="Application form" error={errors.formId} hint="Applicants fill this form. Manage forms under Forms.">
            <select {...props("formId")} className="field-control">
              <option value="">
                Default form ({forms.find((f) => f.isDefault)?.name ?? "Standard application"})
              </option>
              {forms
                .filter((f) => !f.isDefault)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
            </select>
          </Field>
        </section>

        <section className="surface-card space-y-5 p-6">
          <h2 className="text-headline-sm">Salary (monthly, optional)</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field id="salaryMin" label="Min" error={errors.salaryMin}>
              <input {...props("salaryMin")} type="number" min="0" inputMode="numeric" className="field-control" />
            </Field>
            <Field id="salaryMax" label="Max" error={errors.salaryMax}>
              <input {...props("salaryMax")} type="number" min="0" inputMode="numeric" className="field-control" />
            </Field>
          </div>
          <Field id="salaryCurrency" label="Currency code" error={errors.salaryCurrency}>
            <input {...props("salaryCurrency")} maxLength={3} className="field-control uppercase" />
          </Field>
        </section>

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="btn btn-primary flex-1">
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {job ? "Save changes" : "Create job"}
          </button>
          <Link href="/dashboard/jobs" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}