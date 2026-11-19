import { prisma } from "@/lib/prisma";
import { DEFAULT_FIELDS, normalizeFields } from "@/lib/forms/fields";

/** The form for a job: its own form, else the default form, else the built-in fallback. */
export async function resolveForm(formId) {
  let form = formId ? await prisma.applicationForm.findUnique({ where: { id: formId } }) : null;
  if (!form) form = await prisma.applicationForm.findFirst({ where: { isDefault: true } });

  if (!form) {
    return { id: null, name: "Standard application", description: "", fields: DEFAULT_FIELDS };
  }
  return {
    id: form.id,
    name: form.name,
    description: form.description ?? "",
    fields: normalizeFields(form.fields),
  };
}

/** Creates the editable default form the first time the Forms page is opened. */
export async function ensureDefaultForm() {
  const existing = await prisma.applicationForm.findFirst({ where: { isDefault: true }, select: { id: true } });
  if (existing) return existing;
  return prisma.applicationForm.create({
    data: { name: "Standard application", description: "", isDefault: true, fields: DEFAULT_FIELDS },
    select: { id: true },
  });
}