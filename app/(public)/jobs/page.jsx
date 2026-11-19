import Link from "next/link";
import { SearchX } from "lucide-react";
import { JobRow } from "@/components/jobs/job-row";
import { JobFilters } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/jobs/pagination";
import { getFilterOptions, getJobs, parseJobFilters } from "@/lib/data/jobs";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Open Positions",
  description: `Browse open roles at ${siteConfig.name} and apply online.`,
  alternates: { canonical: "/jobs" },
};

export default async function JobsPage({ searchParams }) {
  const filters = parseJobFilters(await searchParams);

  const [{ jobs, total, totalPages, page }, options] = await Promise.all([
    getJobs(filters),
    getFilterOptions(),
  ]);

  const hasFilters = Boolean(
    filters.q ||
      filters.department ||
      filters.location ||
      filters.type ||
      filters.workplace ||
      filters.experience
  );

  return (
    <div className="page-container py-12 md:py-16">
      <header className="mb-8 flex max-w-2xl flex-col gap-2">
        <span className="text-label-sm uppercase text-brand-sage">
          Careers at {siteConfig.name}
        </span>
        <h1 className="text-headline-xl text-on-surface">Open Positions</h1>
        <p className="text-body-lg text-on-surface-variant">
          Find a role that fits your skills and the way you like to work.
        </p>
      </header>

      <JobFilters filters={filters} options={options} hasFilters={hasFilters} />

      <div className="mb-4 mt-8 text-body-md text-on-surface-variant" aria-live="polite">
        <strong className="text-on-surface">{total}</strong>{" "}
        {total === 1 ? "role" : "roles"} found
        {filters.q && (
          <>
            {" "}
            for <strong className="text-on-surface">“{filters.q}”</strong>
          </>
        )}
      </div>

      {jobs.length > 0 ? (
        <>
          <div className="flex flex-col gap-3">
            {jobs.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} filters={filters} />
        </>
      ) : (
        <div className="surface-card flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
            <SearchX className="size-7" aria-hidden />
          </div>
          <h2 className="text-headline-sm text-on-surface">
            No roles match your search
          </h2>
          <p className="max-w-md text-body-md text-on-surface-variant">
            Try a different keyword or remove some filters. New positions are
            added regularly.
          </p>
          {hasFilters && (
            <Link href="/jobs" className="btn btn-secondary mt-2">
              Clear all filters
            </Link>
          )}
        </div>
      )}
    </div>
  );
}