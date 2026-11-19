import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/dashboard/page-header";
import JobForm from "@/components/dashboard/job-form";

export const metadata = { title: "Edit job" };

export default async function EditJobPage({ params }) {
  const { id } = await params;

  const [job, departments, forms] = await Promise.all([
    prisma.job.findUnique({ where: { id } }),
    prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.applicationForm.findMany({ orderBy: [{ isDefault: "desc" }, { name: "asc" }], select: { id: true, name: true, isDefault: true } }),
  ]);

  if (!job) notFound();

  const initial = {
    id: job.id,
    title: job.title,
    summary: job.summary,
    departmentId: job.departmentId,
    location: job.location,
    type: job.type,
    workplace: job.workplace,
    experience: job.experience,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    deadline: job.deadline ? job.deadline.toISOString().slice(0, 10) : "",
    featured: job.featured,
    status: job.status,
    description: job.description ?? "",
    responsibilities: job.responsibilities ?? "",
    requirements: job.requirements ?? "",
    benefits: job.benefits ?? "",
    formId: job.formId ?? "",
  };

  return (
    <>
      <PageHeader title="Edit job" description={job.title} />
      <JobForm departments={departments} forms={forms} job={initial} />
    </>
  );
}
