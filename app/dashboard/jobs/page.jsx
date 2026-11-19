import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/dashboard/page-header";
import { JobStatusBadge } from "@/components/dashboard/badges";
import JobRowActions from "@/components/dashboard/job-row-actions";
import SimplePagination from "@/components/dashboard/simple-pagination";
import { JOB_STATUSES, JOB_STATUS_LABEL, formatDay } from "@/lib/dashboard-constants";

export const metadata = { title: "Jobs" };

const PAGE_SIZE = 10;

export default async function JobsAdminPage({ searchParams }) {
  const user = await requireUser();
  const sp = await searchParams;

  const q = String(sp?.q ?? "").trim().slice(0, 100);
  const status = JOB_STATUSES.includes(sp?.status) ? sp.status : "";
  const page = Math.max(1, parseInt(sp?.page) || 1);

  const where = {
    ...(status && { status }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        featured: true,
        deadline: true,
        location: true,
        department: { select: { name: true } },
        _count: { select: { applications: true } },
      },
    }),
  ]);

  return (
    <>
      <PageHeader title="Jobs" description="Create, publish and manage open roles.">
        <Link href="/dashboard/jobs/new" className="btn btn-primary">
          <Plus className="size-4" aria-hidden /> New job
        </Link>
      </PageHeader>

      <form method="get" className="mb-4 flex flex-wrap gap-3" role="search">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" aria-hidden />
          <input name="q" defaultValue={q} placeholder="Search title or location" aria-label="Search jobs" className="field-control pl-10" />
        </div>
        <select name="status" defaultValue={status} aria-label="Filter by status" className="field-control w-auto">
          <option value="">All statuses</option>
          {JOB_STATUSES.map((s) => (
            <option key={s} value={s}>
              {JOB_STATUS_LABEL[s]}
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
              <th scope="col">Job</th>
              <th scope="col">Status</th>
              <th scope="col">Applicants</th>
              <th scope="col">Deadline</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                  No jobs found.
                </td>
              </tr>
            )}
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <Link href={`/dashboard/jobs/${job.id}/edit`} className="font-semibold hover:underline">
                    {job.title}
                  </Link>
                  {job.featured && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900">Featured</span>}
                  <p className="text-xs text-on-surface-variant">
                    {job.department.name} · {job.location}
                  </p>
                </td>
                <td>
                  <JobStatusBadge status={job.status} />
                </td>
                <td>
                  <Link href={`/dashboard/applications?jobId=${job.id}`} className="hover:underline">
                    {job._count.applications}
                  </Link>
                </td>
                <td className="whitespace-nowrap">{formatDay(job.deadline)}</td>
                <td>
                  <JobRowActions
                    job={{ id: job.id, slug: job.slug, title: job.title, status: job.status }}
                    canDelete={user.role === "ADMIN"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SimplePagination
        basePath="/dashboard/jobs"
        params={{ q, status }}
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        total={total}
      />
    </>
  );
}