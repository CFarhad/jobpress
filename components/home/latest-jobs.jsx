import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JobRow } from "@/components/jobs/job-row";
import { siteConfig } from "@/lib/site";

const pillBase = "rounded-full px-4 py-2 text-label-md transition-all";
const pillActive = "bg-primary text-primary-foreground shadow-sm";
const pillIdle =
  "bg-surface-container-high text-on-surface hover:bg-surface-container-highest";

export function LatestJobs({ jobs, departments, activeTeam, totalOpen }) {
  return (
    <section id="open-roles" className="scroll-mt-24 py-16">
      <div className="page-container">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex flex-col gap-1">
            <span className="text-label-sm uppercase text-brand-sage">
              Current Opportunities
            </span>
            <h2 className="text-headline-xl text-on-surface">
              Open Roles at {siteConfig.name}
            </h2>
          </div>

          {/* Team filters (URL-based, no client JS needed) */}
          <nav
            aria-label="Filter roles by team"
            className="flex flex-wrap items-center gap-2"
          >
            <Link
              href="/#open-roles"
              aria-current={!activeTeam ? "true" : undefined}
              className={`${pillBase} ${!activeTeam ? pillActive : pillIdle}`}
            >
              All Teams ({totalOpen})
            </Link>
            {departments.map((department) => {
              const active = activeTeam === department.slug;
              return (
                <Link
                  key={department.id}
                  href={`/?team=${department.slug}#open-roles`}
                  aria-current={active ? "true" : undefined}
                  className={`${pillBase} ${active ? pillActive : pillIdle}`}
                >
                  {department.name} ({department._count.jobs})
                </Link>
              );
            })}
          </nav>
        </div>

        {jobs.length > 0 ? (
          <div className="flex flex-col gap-3">
            {jobs.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="surface-card flex flex-col items-center gap-3 p-12 text-center">
            <h3 className="text-headline-sm text-on-surface">
              No open roles in this team right now
            </h3>
            <p className="max-w-md text-body-md text-on-surface-variant">
              Check back soon, or browse the other teams.
            </p>
            <Link href="/#open-roles" className="btn btn-secondary mt-2">
              Show all teams
            </Link>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link href="/jobs" className="btn btn-secondary group">
            View all roles
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  );
}