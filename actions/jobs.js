"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cleanHtml } from "@/lib/sanitize";
import { jobSchema } from "@/lib/validations/job";
import { uniqueJobSlug } from "@/lib/slug";
import { actionUser, fail, succeed, zodFieldErrors } from "@/lib/action-utils";
import { JOB_STATUSES } from "@/lib/dashboard-constants";

function refresh() {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/");
  revalidatePath("/jobs");
}

export async function saveJob(input) {
  const auth = await actionUser();
  if (auth.error) return auth.error;

  const parsed = jobSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please fix the highlighted fields.", zodFieldErrors(parsed.error));
  }
  const d = parsed.data;

  const data = {
    title: d.title,
    summary: d.summary,
    location: d.location,
    type: d.type,
    workplace: d.workplace,
    experience: d.experience,
    salaryMin: d.salaryMin,
    salaryMax: d.salaryMax,
    salaryCurrency: d.salaryCurrency,
    featured: d.featured,
    status: d.status,
    departmentId: d.departmentId,
    deadline: d.deadline ? new Date(`${d.deadline}T23:59:59.000Z`) : null,
    description: cleanHtml(d.description),
    responsibilities: cleanHtml(d.responsibilities) || "",
    requirements: cleanHtml(d.requirements) || "",
    benefits: cleanHtml(d.benefits) || "",
    formId: d.formId || null,
  };

  try {
    if (d.id) {
      const existing = await prisma.job.findUnique({ where: { id: d.id }, select: { publishedAt: true } });
      if (!existing) return fail("This job no longer exists.");
      await prisma.job.update({
        where: { id: d.id },
        data: {
          ...data,
          publishedAt: d.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
        },
      });
    } else {
      await prisma.job.create({
        data: {
          ...data,
          slug: await uniqueJobSlug(d.title),
          publishedAt: d.status === "PUBLISHED" ? new Date() : null,
          createdById: auth.user.id,
        },
      });
    }
  } catch (error) {
    console.error("saveJob failed:", error);
    if (error.code === "P2003") return fail("The selected department or form no longer exists.");
    return fail("Could not save the job. Please try again.");
  }

  refresh();
  redirect("/dashboard/jobs");
}

export async function setJobStatus(id, status) {
  const auth = await actionUser();
  if (auth.error) return auth.error;
  if (!JOB_STATUSES.includes(status)) return fail("Invalid status.");

  const job = await prisma.job.findUnique({ where: { id }, select: { publishedAt: true } });
  if (!job) return fail("Job not found.");

  await prisma.job.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? (job.publishedAt ?? new Date()) : job.publishedAt,
    },
  });

  refresh();
  return succeed("Status updated.");
}

export async function deleteJob(id) {
  const auth = await actionUser({ admin: true });
  if (auth.error) return auth.error;

  const applications = await prisma.application.count({ where: { jobId: id } });
  if (applications > 0) {
    return fail(`This job has ${applications} application(s) and can't be deleted. Close it instead.`);
  }

  try {
    await prisma.job.delete({ where: { id } });
  } catch (error) {
    console.error("deleteJob failed:", error);
    return fail("Could not delete this job.");
  }

  refresh();
  return succeed("Job deleted.");
}