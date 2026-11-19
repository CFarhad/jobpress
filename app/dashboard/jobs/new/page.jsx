import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/dashboard/page-header";
import JobForm from "@/components/dashboard/job-form";

export const metadata = { title: "New job" };

export default async function NewJobPage() {
  const [departments, forms] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.applicationForm.findMany({ orderBy: [{ isDefault: "desc" }, { name: "asc" }], select: { id: true, name: true, isDefault: true } }),
  ]);

  return (
    <>
      <PageHeader title="New job" description="Save as draft first, publish when you're ready." />
      <JobForm departments={departments} forms={forms} />
    </>
  );
}