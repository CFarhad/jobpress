import { CORE_FIELDS } from "@/lib/forms/fields";
import { fieldName } from "@/lib/forms/validate";

const AUTOCOMPLETE = {
  fullName: "name",
  email: "email",
  phone: "tel",
  country: "country-name",
  city: "address-level2",
};
const INPUT_TYPE = { text: "text", email: "email", phone: "tel", url: "url", number: "number", date: "date" };

export default function FieldRenderer({ field, error }) {
  const name = fieldName(field.key);
  const hintId = `${name}-hint`;
  const errorId = `${name}-error`;
  const describedBy = [field.helpText && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  const aria = {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    "aria-required": field.required || undefined,
  };

  const marker = field.required ? (
    <span aria-hidden="true" className="text-red-700"> *</span>
  ) : (
    <span className="text-xs font-normal text-on-surface-variant"> (optional)</span>
  );

  const footer = (
    <>
      {field.helpText && (
        <p id={hintId} className="mt-1 text-xs text-on-surface-variant">
          {field.helpText}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </>
  );

  if (field.type === "checkbox") {
    return (
      <div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" id={name} name={name} value="yes" {...aria} className="mt-0.5 size-4 rounded accent-[var(--color-primary)]" />
          <span>
            {field.label}
            {marker}
          </span>
        </label>
        {footer}
      </div>
    );
  }

  if (field.type === "radio" || field.type === "checkboxes") {
    const inputType = field.type === "radio" ? "radio" : "checkbox";
    return (
      <fieldset aria-describedby={describedBy}>
        <legend className="text-label-md mb-1.5">
          {field.label}
          {marker}
        </legend>
        <div className="space-y-2">
          {field.options.map((option, i) => (
            <label key={option} className="flex items-center gap-3 text-sm">
              <input
                type={inputType}
                id={i === 0 ? name : `${name}_${i}`}
                name={name}
                value={option}
                aria-invalid={error ? true : undefined}
                className="size-4 accent-[var(--color-primary)]"
              />
              {option}
            </label>
          ))}
        </div>
        {footer}
      </fieldset>
    );
  }

  return (
    <div>
      <label htmlFor={name} className="text-label-md mb-1.5 block">
        {field.label}
        {marker}
      </label>

      {field.type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          rows={field.key === "coverLetter" ? 6 : 4}
          maxLength={CORE_FIELDS[field.key]?.max ?? 3000}
          placeholder={field.placeholder || undefined}
          className="field-control"
          {...aria}
        />
      ) : field.type === "select" ? (
        <select id={name} name={name} defaultValue="" className="field-control" {...aria}>
          <option value="">Select…</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={INPUT_TYPE[field.type] ?? "text"}
          step={field.type === "number" ? "any" : undefined}
          inputMode={field.type === "number" ? "decimal" : undefined}
          maxLength={field.type === "text" ? (CORE_FIELDS[field.key]?.max ?? 200) : undefined}
          autoComplete={AUTOCOMPLETE[field.key] ?? "off"}
          placeholder={field.placeholder || undefined}
          className="field-control"
          {...aria}
        />
      )}
      {footer}
    </div>
  );
}