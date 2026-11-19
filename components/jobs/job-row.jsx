import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { JOB_TYPE_LABEL, WORKPLACE_LABEL, formatSalary } from "@/lib/format";

export function JobRow({ job }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="interactive-card group flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center md:p-8"
    >
      <div className="flex max-w-xl flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="job-chip">{job.department.name}</span>
          <span className="workplace-chip">
            {WORKPLACE_LABEL[job.workplace]}
          </span>
          <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
            <MapPin className="size-3.5" aria-hidden />
            {job.location}
          </span>
        </div>

        <h3 className="mt-1 text-headline-sm text-on-surface transition-colors group-hover:text-primary">
          {job.title}
        </h3>
        <p className="text-body-md text-on-surface-variant">{job.summary}</p>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-8 md:justify-end">
        <div className="flex flex-col md:text-right">
          <span className="text-headline-sm text-on-surface">
            {salary ?? "Competitive"}
          </span>
          <span className="text-label-sm text-outline">
            {JOB_TYPE_LABEL[job.type]}
          </span>
        </div>

        <span className="flex h-11 items-center gap-1.5 rounded-control bg-surface-container-low px-5 text-label-lg text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          Apply
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}