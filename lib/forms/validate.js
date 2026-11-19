import { CORE_FIELDS } from "@/lib/forms/fields";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;
const REQUIRED = "This field is required";

export const fieldName = (key) => `field_${key}`;

/** Reads raw values for every field in the form from a FormData (browser or server). */
export function readAnswers(fields, formData) {
  const out = {};
  for (const f of fields) {
    const name = fieldName(f.key);
    if (f.type === "checkboxes") out[f.key] = formData.getAll(name).map(String);
    else if (f.type === "checkbox") out[f.key] = formData.get(name) === "yes";
    else out[f.key] = String(formData.get(name) ?? "");
  }
  return out;
}

export function validateField(field, raw) {
  const core = CORE_FIELDS[field.key];
  const bad = (error) => ({ value: null, error });
  const ok = (value) => ({ value, error: "" });

  if (field.type === "checkbox") {
    const checked = raw === true;
    return field.required && !checked ? bad("This box must be checked") : ok(checked);
  }

  if (field.type === "checkboxes") {
    const picked = [...new Set(Array.isArray(raw) ? raw : [])];
    if (picked.some((v) => !field.options.includes(v))) return bad("Invalid selection");
    if (field.required && picked.length === 0) return bad("Select at least one option");
    return ok(picked);
  }

  const text = String(raw ?? "").trim();
  if (!text) return field.required ? bad(REQUIRED) : ok("");

  switch (field.type) {
    case "text": {
      const min = core?.min ?? 0;
      const max = core?.max ?? 200;
      if (text.length < min) return bad(`Use at least ${min} characters`);
      if (text.length > max) return bad(`Use at most ${max} characters`);
      return ok(text);
    }
    case "textarea": {
      const max = core?.max ?? 3000;
      return text.length > max ? bad(`Use at most ${max} characters`) : ok(text);
    }
    case "email": {
      const email = text.toLowerCase();
      return email.length <= 254 && EMAIL_RE.test(email) ? ok(email) : bad("Enter a valid email address");
    }
    case "phone":
      return PHONE_RE.test(text) ? ok(text) : bad("Enter a valid phone number");
    case "url": {
      if (text.length > 300) return bad("Link is too long");
      try {
        const url = new URL(text);
        return ["http:", "https:"].includes(url.protocol) ? ok(text) : bad("Link must start with http:// or https://");
      } catch {
        return bad("Enter a valid link, e.g. https://example.com");
      }
    }
    case "number": {
      const n = Number(text);
      return Number.isFinite(n) && Math.abs(n) <= 1e12 ? ok(n) : bad("Enter a valid number");
    }
    case "date": {
      const valid = /^\d{4}-\d{2}-\d{2}$/.test(text) && new Date(text).toISOString().slice(0, 10) === text;
      return valid ? ok(text) : bad("Enter a valid date");
    }
    case "select":
    case "radio":
      return field.options.includes(text) ? ok(text) : bad("Choose one of the options");
    default:
      return bad("Unsupported field");
  }
}

export function validateAnswers(fields, raw) {
  const values = {};
  const errors = {};
  for (const f of fields) {
    const result = validateField(f, raw[f.key]);
    if (result.error) errors[f.key] = result.error;
    else values[f.key] = result.value;
  }
  return { values, errors };
}

/** Splits validated values into Application columns and custom answers (with label snapshots). */
export function splitAnswers(fields, values) {
  const core = {};
  const answers = [];
  for (const f of fields) {
    const v = values[f.key];
    if (CORE_FIELDS[f.key]) {
      core[f.key] = typeof v === "string" && v ? v : null;
      continue;
    }
    const empty = v === "" || v === null || v === undefined || (Array.isArray(v) && v.length === 0);
    if (!empty) answers.push({ key: f.key, label: f.label, type: f.type, value: v });
  }
  return { core, answers };
}