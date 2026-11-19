import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ensureDefaultForm } from "@/lib/data/forms";
import PageHeader from "@/components/dashboard/page-header";
import FormRowActions from "@/components/dashboard/form-row-actions";
import { formatDay } from "@/lib/dashboard-constants";

export const metadata = { title: "Forms" };

export default async function FormsPage() {
  const user = await requireUser();
  await ensureDefaultForm();

  const forms = await prisma.applicationForm.findMany({
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      isDefault: true,
      fields: true,
      updatedAt: true,
      _count: { select: { jobs: true } },
    },
  });

  return (
    <>
      <PageHeader title="Application forms" description="Define the questions applicants answer. Pick a form for each job in the job editor.">
        <Link href="/dashboard/forms/new" className="btn btn-primary">
          <Plus className="size-4" aria-hidden /> New form
        </Link>
      </PageHeader>

      <div className="surface-card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Form</th>
              <th scope="col">Fields</th>
              <th scope="col">Jobs using it</th>
              <th scope="col">Updated</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form.id}>
                <td>
                  <Link href={`/dashboard/forms/${form.id}/edit`} className="font-semibold hover:underline">
                    {form.name}
                  </Link>
                  {form.isDefault && <span className="ml-2 rounded bg-teal-100 px-1.5 py-0.5 text-xs text-teal-900">Default</span>}
                  {form.description && <p className="max-w-md truncate text-xs text-on-surface-variant">{form.description}</p>}
                </td>
                <td>{Array.isArray(form.fields) ? form.fields.length : 0}</td>
                <td>{form.isDefault ? `${form._count.jobs} + all jobs without a form` : form._count.jobs}</td>
                <td className="whitespace-nowrap">{formatDay(form.updatedAt)}</td>
                <td>
                  <FormRowActions form={{ id: form.id, name: form.name, isDefault: form.isDefault }} canDelete={user.role === "ADMIN"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}