import Link from "next/link";
import { Download, FileText, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/dashboard/page-header";
import ApplicationStatusSelect from "@/components/dashboard/application-status-select";
import SimplePagination from "@/components/dashboard/simple-pagination";
import {
  APPLICATIONS_PAGE_SIZE,
  buildApplicationWhere,
  parseApplicationFilters,
} from "@/lib/data/applications";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL, formatDay } from "@/lib/dashboard-constants";

export const metadata = { title: "Applications" };

export default async function ApplicationsPage({ searchParams }) {
  await requireUser();
  const sp = await searchParams;
  const filters = parseApplicationFilters(sp);
  const where = buildApplicationWhere(filters);

  const [total, applications, jobs] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * APPLICATIONS_PAGE_SIZE,
      take: APPLICATIONS_PAGE_SIZE,
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        createdAt: true,
        job: { select: { title: true } },
      },
    }),
    prisma.job.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  const exportParams = new URLSearchParams();
  if (filters.q) exportParams.set("q", filters.q);
  if (filters.status) exportParams.set("status", filters.status);
  if (filters.jobId) exportParams.set("jobId", filters.jobId);

  return (
    <>
      <PageHeader title="Applications" description="Review candidates and move them through the pipeline.">
        <a href={`/api/applications/export?${exportParams.toString()}`} className="btn btn-secondary">
          <Download className="size-4" aria-hidden /> Export CSV
        </a>
      </PageHeader>

      <form method="get" role="search" className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" aria-hidden />
          <input name="q" defaultValue={filters.q} placeholder="Search name or email" aria-label="Search applications" className="field-control pl-10" />
        </div>
        <select name="status" defaultValue={filters.status} aria-label="Filter by status" className="field-control w-auto">
          <option value="">All statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {APPLICATION_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select name="jobId" defaultValue={filters.jobId} aria-label="Filter by job" className="field-control w-auto max-w-64">
          <option value="">All jobs</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
      </form>

      <div className="surface-card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Applicant</th>
              <th scope="col">Job</th>
              <th scope="col">Applied</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                  No applications found.
                </td>
              </tr>
            )}
            {applications.map((app) => (
              <tr key={app.id}>
                <td>
                  <Link href={`/dashboard/applications/${app.id}`} className="font-semibold hover:underline">
                    {app.fullName}
                  </Link>
                  <p className="text-xs text-on-surface-variant">{app.email}</p>
                </td>
                <td>{app.job.title}</td>
                <td className="whitespace-nowrap">{formatDay(app.createdAt)}</td>
                <td>
                  <ApplicationStatusSelect id={app.id} status={app.status} />
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    <a
                      href={`/api/files/${app.id}`}
                      className="flex size-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low"
                      aria-label={`Download CV of ${app.fullName}`}
                      title="Download CV"
                    >
                      <FileText className="size-4" aria-hidden />
                    </a>
                    <Link href={`/dashboard/applications/${app.id}`} className="btn btn-secondary btn-sm">
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SimplePagination
        basePath="/dashboard/applications"
        params={{ q: filters.q, status: filters.status, jobId: filters.jobId }}
        page={filters.page}
        totalPages={Math.max(1, Math.ceil(total / APPLICATIONS_PAGE_SIZE))}
        total={total}
      />
    </>
  );
}