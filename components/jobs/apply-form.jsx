"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import FieldRenderer from "@/components/forms/field-renderer";
import { fieldName, readAnswers, validateAnswers } from "@/lib/forms/validate";
import { CV_ACCEPT, validateCvFile } from "@/lib/forms/cv";

const CONSENT_ERROR = "You must agree before submitting";

export default function ApplyForm({ jobId, jobTitle, fields, intro }) {
  const formRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  function check(formData) {
    const { errors: found } = validateAnswers(fields, readAnswers(fields, formData));
    const cvError = validateCvFile(formData.get("cv"));
    if (cvError) found.cv = cvError;
    if (!formData.get("consent")) found.consent = CONSENT_ERROR;
    return found;
  }

  const keyOf = (name) => (name.startsWith("field_") ? name.slice(6) : name);
  const isOurs = (name) => name === "cv" || name === "consent" || name.startsWith("field_");

  function onBlur(event) {
    const { name, type } = event.target;
    if (!name || !isOurs(name) || type === "radio" || type === "checkbox") return;
    const key = keyOf(name);
    const found = check(new FormData(formRef.current));
    setErrors((prev) => {
      const next = { ...prev };
      if (found[key]) next[key] = found[key];
      else delete next[key];
      return next;
    });
  }

  function onChange(event) {
    const { name } = event.target;
    if (!name || !isOurs(name)) return;
    const key = keyOf(name);
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (pending) return;
    setMessage("");

    const formData = new FormData(formRef.current);
    const found = check(formData);
    setErrors(found);

    const first = Object.keys(found)[0];
    if (first) {
      const name = first === "cv" || first === "consent" ? first : fieldName(first);
      formRef.current.querySelector(`[name="${name}"]`)?.focus();
      return;
    }

    formData.set("jobId", jobId);
    setPending(true);
    try {
      const response = await fetch("/api/applications", { method: "POST", body: formData });
      const body = await response.json().catch(() => ({}));

      if (response.ok && body.ok) {
        setDone(true);
        return;
      }
      setErrors(body.errors ?? {});
      setMessage(body.message ?? "Something went wrong. Please try again.");
    } catch {
      setMessage("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div role="status" className="rounded-3xl bg-primary-fixed/40 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 size-12 text-primary" aria-hidden />
        <h2 className="text-headline-md">Application sent</h2>
        <p className="text-body-lg mt-2 text-on-surface-variant">
          Thanks for applying for {jobTitle}. We have emailed you a confirmation and will be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} onBlur={onBlur} onChange={onChange} noValidate className="relative space-y-5">
      {intro && <p className="text-sm text-on-surface-variant">{intro}</p>}

      <div aria-live="polite">
        {message && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {message}
          </p>
        )}
      </div>

      {fields.map((field) => (
        <FieldRenderer key={field.key} field={field} error={errors[field.key]} />
      ))}

      <div>
        <label htmlFor="cv" className="text-label-md mb-1.5 block">
          CV / Résumé <span aria-hidden="true" className="text-red-700">*</span>
        </label>
        <input
          id="cv"
          name="cv"
          type="file"
          accept={CV_ACCEPT}
          aria-required="true"
          aria-invalid={errors.cv ? true : undefined}
          aria-describedby={errors.cv ? "cv-error" : "cv-hint"}
          className="field-control file:mr-4 file:rounded-lg file:border-0 file:bg-primary-fixed file:px-3 file:py-1.5 file:text-sm file:font-semibold"
        />
        {errors.cv ? (
          <p id="cv-error" role="alert" className="mt-1 text-sm text-red-700">
            {errors.cv}
          </p>
        ) : (
          <p id="cv-hint" className="mt-1 text-xs text-on-surface-variant">
            PDF, DOC or DOCX · max 5 MB
          </p>
        )}
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="mt-0.5 size-4 rounded accent-[var(--color-primary)]"
          />
          <span>
            I agree to the processing of my personal data as described in the{" "}
            <Link href="/privacy" target="_blank" className="text-primary underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.consent && (
          <p id="consent-error" role="alert" className="mt-1 text-sm text-red-700">
            {errors.consent}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people, tempting to bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
        <label>
          Leave this empty
          <input name="botcheck" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {pending ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}

export { ApplyForm }