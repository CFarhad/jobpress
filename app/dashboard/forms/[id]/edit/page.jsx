import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/dashboard/page-header";
import FormBuilder from "@/components/dashboard/form-builder";
import { normalizeFields } from "@/lib/forms/fields";

export const metadata = { title: "Edit form" };

export default async function EditFormPage({ params }) {
  const { id } = await params;
  const form = await prisma.applicationForm.findUnique({ where: { id } });
  if (!form) notFound();

  return (
    <>
      <PageHeader title="Edit form" description={form.name} />
      <FormBuilder
        form={{
          id: form.id,
          name: form.name,
          description: form.description ?? "",
          isDefault: form.isDefault,
          fields: normalizeFields(form.fields),
        }}
      />
    </>
  );
}