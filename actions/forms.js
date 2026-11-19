"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { actionUser, fail, succeed } from "@/lib/action-utils";
import { formSchema } from "@/lib/validations/form";
import { CHOICE_TYPES } from "@/lib/forms/fields";

function nestedErrors(error) {
  const out = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const clearDefaults = () => prisma.applicationForm.updateMany({ where: { isDefault: true }, data: { isDefault: false } });

export async function saveForm(input) {
  const auth = await actionUser();
  if (auth.error) return auth.error;

  const parsed = formSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", nestedErrors(parsed.error));
  const d = parsed.data;

  const data = {
    name: d.name,
    description: d.description || null,
    fields: d.fields.map((f) => (CHOICE_TYPES.includes(f.type) ? f : { ...f, options: [] })),
  };

  try {
    if (d.id) {
      const existing = await prisma.applicationForm.findUnique({ where: { id: d.id }, select: { isDefault: true } });
      if (!existing) return fail("This form no longer exists.");
      // The default can only be changed by making another form the default.
      const isDefault = existing.isDefault || d.isDefault;
      await prisma.$transaction([
        ...(isDefault && !existing.isDefault ? [clearDefaults()] : []),
        prisma.applicationForm.update({ where: { id: d.id }, data: { ...data, isDefault } }),
      ]);
    } else {
      await prisma.$transaction([
        ...(d.isDefault ? [clearDefaults()] : []),
        prisma.applicationForm.create({ data: { ...data, isDefault: d.isDefault } }),
      ]);
    }
  } catch (error) {
    console.error("saveForm failed:", error);
    return fail("Could not save the form. Please try again.");
  }

  revalidatePath("/dashboard/forms");
  redirect("/dashboard/forms");
}

export async function duplicateForm(id) {
  const auth = await actionUser();
  if (auth.error) return auth.error;

  const form = await prisma.applicationForm.findUnique({ where: { id } });
  if (!form) return fail("Form not found.");

  await prisma.applicationForm.create({
    data: {
      name: `${form.name} (copy)`.slice(0, 80),
      description: form.description,
      isDefault: false,
      fields: form.fields,
    },
  });

  revalidatePath("/dashboard/forms");
  return succeed("Form duplicated.");
}

export async function setDefaultForm(id) {
  const auth = await actionUser();
  if (auth.error) return auth.error;

  const exists = await prisma.applicationForm.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return fail("Form not found.");

  await prisma.$transaction([clearDefaults(), prisma.applicationForm.update({ where: { id }, data: { isDefault: true } })]);

  revalidatePath("/dashboard/forms");
  return succeed("Default form updated.");
}

export async function deleteForm(id) {
  const auth = await actionUser({ admin: true });
  if (auth.error) return auth.error;

  const form = await prisma.applicationForm.findUnique({
    where: { id },
    select: { isDefault: true, _count: { select: { jobs: true } } },
  });
  if (!form) return fail("Form not found.");
  if (form.isDefault) return fail("The default form can't be deleted. Make another form the default first.");
  if (form._count.jobs > 0) {
    return fail(`This form is used by ${form._count.jobs} job(s). Switch those jobs to another form first.`);
  }

  await prisma.applicationForm.delete({ where: { id } });
  revalidatePath("/dashboard/forms");
  return succeed("Form deleted.");
}