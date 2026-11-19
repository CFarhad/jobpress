"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Loader2, Lock, Plus, Trash2 } from "lucide-react";
import { saveForm } from "@/actions/forms";
import FieldRenderer from "@/components/forms/field-renderer";
import { CHOICE_TYPES, CORE_FIELDS, FIELD_TYPE_LABEL, coreFieldDefinition } from "@/lib/forms/fields";

const newKey = () => `q_${(Math.random().toString(36).slice(2) + "xxxxxx").slice(0, 8)}`;

function Row({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-label-md mb-1.5 block">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default function FormBuilder({ form }) {
  const [pending, start] = useTransition();
  const [name, setName] = useState(form.name);
  const [description, setDescription] = useState(form.description ?? "");
  const [isDefault, setIsDefault] = useState(form.isDefault);
  const [fields, setFields] = useState(form.fields);
  const [openKey, setOpenKey] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const unusedCore = Object.keys(CORE_FIELDS).filter((k) => !fields.some((f) => f.key === k));

  const patch = (key, changes) => setFields((list) => list.map((f) => (f.key === key ? { ...f, ...changes } : f)));
  const remove = (key) => setFields((list) => list.filter((f) => f.key !== key));
  const move = (index, dir) =>
    setFields((list) => {
      const target = index + dir;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  function addCore(key) {
    setFields((list) => [...list, coreFieldDefinition(key)]);
    setOpenKey(key);
  }

  function addCustom(type) {
    const key = newKey();
    setFields((list) => [
      ...list,
      {
        key,
        label: "Untitled question",
        type,
        required: false,
        placeholder: "",
        helpText: "",
        options: CHOICE_TYPES.includes(type) ? ["Option 1", "Option 2"] : [],
      },
    ]);
    setOpenKey(key);
  }

  function changeType(field, type) {
    const options = CHOICE_TYPES.includes(type) && field.options.length < 2 ? ["Option 1", "Option 2"] : field.options;
    patch(field.key, { type, options });
  }

  const errorFor = (i) => {
    const prefix = `fields.${i}.`;
    const key = Object.keys(errors).find((k) => k.startsWith(prefix));
    return key ? errors[key] : "";
  };

  function onSubmit(event) {
    event.preventDefault();
    setErrors({});
    setMessage("");

    start(async () => {
      const result = await saveForm({
        id: form.id,
        name,
        description,
        isDefault,
        fields: fields.map((f) => ({
          ...f,
          options: CHOICE_TYPES.includes(f.type) ? f.options.map((o) => o.trim()).filter(Boolean) : [],
        })),
      });
      // Success redirects, so a returned value means failure.
      if (result && !result.ok) {
        const errs = result.errors ?? {};
        setErrors(errs);
        setMessage(result.message);
        const first = Object.keys(errs).find((k) => k.startsWith("fields."));
        if (first && fields[Number(first.split(".")[1])]) setOpenKey(fields[Number(first.split(".")[1])].key);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 xl:grid-cols-5">
      {message && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 xl:col-span-5">
          {message}
        </p>
      )}

      <div className="space-y-6 xl:col-span-3">
        <section className="surface-card space-y-5 p-6">
          <Row id="form-name" label="Form name" error={errors.name}>
            <input id="form-name" value={name} onChange={(e) => setName(e.target.value)} className="field-control" placeholder="e.g. Engineering application" />
          </Row>
          <Row id="form-description" label="Intro text (optional)" error={errors.description}>
            <textarea id="form-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="field-control" placeholder="Shown above the form on the job page." />
          </Row>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={isDefault} disabled={form.isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="size-4 rounded accent-[var(--color-primary)]" />
            Use as the default form (for jobs without a specific form)
          </label>
        </section>

        <section className="surface-card p-6" aria-labelledby="fields-title">
          <h2 id="fields-title" className="text-headline-sm">
            Fields
          </h2>
          <p className="mb-4 text-sm text-on-surface-variant">
            CV upload and the consent checkbox are always added at the end of the form.
          </p>
          {errors.fields && (
            <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {errors.fields}
            </p>
          )}

          <ol className="space-y-3">
            {fields.map((field, i) => {
              const core = CORE_FIELDS[field.key];
              const locked = !!core?.locked;
              const open = openKey === field.key;
              const err = errorFor(i);
              const panelId = `panel-${field.key}`;

              return (
                <li key={field.key} className={`rounded-2xl border ${err ? "border-red-400" : "border-outline/30"} bg-white`}>
                  <div className="flex items-center gap-2 p-3">
                    <div className="flex flex-col">
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${field.label} up`} className="rounded p-0.5 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30">
                        <ChevronUp className="size-4" aria-hidden />
                      </button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === fields.length - 1} aria-label={`Move ${field.label} down`} className="rounded p-0.5 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30">
                        <ChevronDown className="size-4" aria-hidden />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpenKey(open ? null : field.key)}
                      aria-expanded={open}
                      aria-controls={panelId}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate font-semibold">
                        {field.label || "Untitled"}
                        {field.required && <span className="text-red-700"> *</span>}
                      </span>
                      <span className="block text-xs text-on-surface-variant">
                        {core ? "Standard" : "Custom"} · {FIELD_TYPE_LABEL[field.type]}
                        {err && <span className="ml-2 text-red-700">{err}</span>}
                      </span>
                    </button>

                    {locked ? (
                      <span className="flex items-center gap-1 px-2 text-xs text-on-surface-variant">
                        <Lock className="size-3.5" aria-hidden /> Required
                      </span>
                    ) : (
                      <button type="button" onClick={() => remove(field.key)} aria-label={`Remove ${field.label}`} className="rounded-lg p-2 text-on-surface-variant hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    )}
                  </div>

                  {open && (
                    <div id={panelId} className="space-y-4 border-t border-outline/20 p-4">
                      <Row id={`${field.key}-label`} label="Label" error={errors[`fields.${i}.label`]}>
                        <input id={`${field.key}-label`} value={field.label} onChange={(e) => patch(field.key, { label: e.target.value })} className="field-control" maxLength={120} />
                      </Row>

                      {!core && (
                        <Row id={`${field.key}-type`} label="Answer type">
                          <select id={`${field.key}-type`} value={field.type} onChange={(e) => changeType(field, e.target.value)} className="field-control">
                            {Object.entries(FIELD_TYPE_LABEL).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </Row>
                      )}

                      {CHOICE_TYPES.includes(field.type) && (
                        <Row id={`${field.key}-options`} label="Options (one per line)" error={errors[`fields.${i}.options`]}>
                          <textarea
                            id={`${field.key}-options`}
                            value={field.options.join("\n")}
                            onChange={(e) => patch(field.key, { options: e.target.value.split("\n") })}
                            rows={4}
                            className="field-control"
                          />
                        </Row>
                      )}

                      {!["checkbox", "checkboxes", "radio", "select", "date"].includes(field.type) && (
                        <Row id={`${field.key}-placeholder`} label="Placeholder (optional)">
                          <input id={`${field.key}-placeholder`} value={field.placeholder} onChange={(e) => patch(field.key, { placeholder: e.target.value })} className="field-control" maxLength={120} />
                        </Row>
                      )}

                      <Row id={`${field.key}-help`} label="Help text (optional)">
                        <input id={`${field.key}-help`} value={field.helpText} onChange={(e) => patch(field.key, { helpText: e.target.value })} className="field-control" maxLength={300} />
                      </Row>

                      <label className="flex items-center gap-3 text-sm">
                        <input type="checkbox" checked={field.required} disabled={locked} onChange={(e) => patch(field.key, { required: e.target.checked })} className="size-4 rounded accent-[var(--color-primary)]" />
                        Required
                      </label>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="mt-6 space-y-4 border-t border-outline/20 pt-5">
            {unusedCore.length > 0 && (
              <div>
                <p className="text-label-md mb-2">Add a standard field</p>
                <div className="flex flex-wrap gap-2">
                  {unusedCore.map((key) => (
                    <button key={key} type="button" onClick={() => addCore(key)} className="btn btn-secondary btn-sm">
                      <Plus className="size-4" aria-hidden /> {CORE_FIELDS[key].label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-label-md mb-2">Add a custom question</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(FIELD_TYPE_LABEL).map(([type, label]) => (
                  <button key={type} type="button" onClick={() => addCustom(type)} className="btn btn-secondary btn-sm">
                    <Plus className="size-4" aria-hidden /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {form.id ? "Save form" : "Create form"}
          </button>
          <Link href="/dashboard/forms" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </div>

      <aside className="xl:col-span-2" aria-label="Form preview">
        <div className="surface-card p-6 xl:sticky xl:top-6">
          <h2 className="text-headline-sm mb-1">Preview</h2>
          <p className="mb-5 text-xs text-on-surface-variant">What applicants will see.</p>
          <div inert className="space-y-5">
            {description && <p className="text-sm text-on-surface-variant">{description}</p>}
            {fields.map((f) => (
              <FieldRenderer key={f.key} field={{ ...f, label: f.label || "Untitled" }} />
            ))}
            <div>
              <p className="text-label-md mb-1.5">
                CV / Résumé <span aria-hidden className="text-red-700">*</span>
              </p>
              <div className="rounded-xl border border-dashed border-outline/50 px-4 py-5 text-sm text-on-surface-variant">
                PDF, DOC or DOCX · max 5 MB
              </div>
            </div>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-0.5 size-4" />
              <span>I agree to the processing of my personal data.</span>
            </label>
          </div>
        </div>
      </aside>
    </form>
  );
}