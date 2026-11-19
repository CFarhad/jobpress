import Link from "next/link";
import { Briefcase, FileEdit, Inbox, Sparkles, TrendingUp, UserCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/dashboard/page-header";
import { ApplicationStatusBadge } from "@/components/dashboard/badges";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL, formatDay } from "@/lib/dashboard-constants";

export const metadata = { title: "Overview" };

const BAR_COLORS = {
  NEW: "bg-sky-500",
  REVIEWED: "bg-slate-400",
  SHORTLISTED: "bg-violet-500",
  INTERVIEW: "bg-amber-500",
  REJECTED: "bg-red-500",
  HIRED: "bg-emerald-500",
};

export default async function OverviewPage() {
  const user = await requireUser();
  const now = new Date();

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - (13 - i));
    return d;
  });
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [openJobs, draftJobs, totalApps, newApps, weekApps, hired, recentApps, byStatus, series, topJobs] =
    await Promise.all([
      prisma.job.count({
        where: { status: "PUBLISHED", OR: [{ deadline: null }, { deadline: { gt: now } }] },
      }),
      prisma.job.count({ where: { status: "DRAFT" } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: "NEW" } }),
      prisma.application.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.application.count({ where: { status: "HIRED" } }),
      prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, fullName: true, status: true, createdAt: true, job: { select: { title: true } } },
      }),
      prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.application.findMany({ where: { createdAt: { gte: days[0] } }, select: { createdAt: true } }),
      prisma.job.findMany({
        orderBy: { applications: { _count: "desc" } },
        take: 5,
        select: { id: true, title: true, status: true, _count: { select: { applications: true } } },
      }),
    ]);

  const buckets = new Map(days.map((d) => [d.toISOString().slice(0, 10), 0]));
  for (const row of series) {
    const key = row.createdAt.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + 1);
  }
  const chart = [...buckets.entries()].map(([date, count]) => ({ date, count }));
  const max = Math.max(1, ...chart.map((c) => c.count));
  const chartTotal = chart.reduce((sum, c) => sum + c.count, 0);

  const statusCounts = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all]));

  const cards = [
    { label: "Open jobs", value: openJobs, icon: Briefcase, href: "/dashboard/jobs?status=PUBLISHED" },
    { label: "Draft jobs", value: draftJobs, icon: FileEdit, href: "/dashboard/jobs?status=DRAFT" },
    { label: "Total applications", value: totalApps, icon: Inbox, href: "/dashboard/applications" },
    { label: "New, awaiting review", value: newApps, icon: Sparkles, href: "/dashboard/applications?status=NEW" },
    { label: "Last 7 days", value: weekApps, icon: TrendingUp, href: "/dashboard/applications" },
    { label: "Hired", value: hired, icon: UserCheck, href: "/dashboard/applications?status=HIRED" },
  ];

  return (
    <>
      <PageHeader title={`Welcome back, ${user.name.split(" ")[0]}`} description="Here's what's happening with hiring." />

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="surface-card interactive-card flex items-center gap-4 p-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
              <Icon className="size-6" aria-hidden />
            </span>
            <span>
              <span className="block text-headline-lg">{value}</span>
              <span className="text-sm text-on-surface-variant">{label}</span>
            </span>
          </Link>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="surface-card p-6 lg:col-span-2" aria-labelledby="chart-title">
          <h2 id="chart-title" className="text-headline-sm">
            Applications · last 14 days
          </h2>
          <p className="text-sm text-on-surface-variant">{chartTotal} received</p>

          <div
            role="img"
            aria-label={`Bar chart of applications per day: ${chart.map((c) => `${c.date}: ${c.count}`).join(", ")}`}
            className="mt-6 flex h-52 items-end gap-1.5 sm:gap-2"
          >
            {chart.map((c) => (
              <div key={c.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-xs font-semibold text-on-surface-variant">{c.count || ""}</span>
                <div
                  title={`${c.date}: ${c.count}`}
                  className="w-full rounded-t-lg bg-primary/80"
                  style={{ height: `${Math.max((c.count / max) * 100, c.count ? 6 : 2)}%`, opacity: c.count ? 1 : 0.25 }}
                />
                <span className="text-[10px] text-on-surface-variant">{c.date.slice(8)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card p-6" aria-labelledby="pipeline-title">
          <h2 id="pipeline-title" className="text-headline-sm">
            Pipeline
          </h2>
          <ul className="mt-5 space-y-4">
            {APPLICATION_STATUSES.map((status) => {
              const count = statusCounts[status] ?? 0;
              const pct = totalApps ? Math.round((count / totalApps) * 100) : 0;
              return (
                <li key={status}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{APPLICATION_STATUS_LABEL[status]}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container-low">
                    <div className={`h-full rounded-full ${BAR_COLORS[status]}`} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-6" aria-labelledby="recent-title">
          <div className="flex items-center justify-between">
            <h2 id="recent-title" className="text-headline-sm">
              Recent applications
            </h2>
            <Link href="/dashboard/applications" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <p className="mt-4 text-sm text-on-surface-variant">No applications yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-outline/20">
              {recentApps.map((app) => (
                <li key={app.id}>
                  <Link href={`/dashboard/applications/${app.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{app.fullName}</span>
                      <span className="block truncate text-sm text-on-surface-variant">
                        {app.job.title} · {formatDay(app.createdAt)}
                      </span>
                    </span>
                    <ApplicationStatusBadge status={app.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-card p-6" aria-labelledby="top-title">
          <h2 id="top-title" className="text-headline-sm">
            Most applied jobs
          </h2>
          {topJobs.length === 0 ? (
            <p className="mt-4 text-sm text-on-surface-variant">No jobs yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-outline/20">
              {topJobs.map((job) => (
                <li key={job.id} className="flex items-center justify-between gap-3 py-3">
                  <Link href={`/dashboard/applications?jobId=${job.id}`} className="min-w-0 truncate font-medium hover:underline">
                    {job.title}
                  </Link>
                  <span className="shrink-0 text-sm text-on-surface-variant">{job._count.applications} applicants</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}