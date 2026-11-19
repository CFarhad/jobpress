// app/(public)/jobs/[slug]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  GraduationCap,
  Laptop,
  MapPin,
} from "lucide-react";
import { ApplyForm } from "@/components/jobs/apply-form";
import { JobRow } from "@/components/jobs/job-row";
import { ShareButtons } from "@/components/jobs/share-buttons";
import { getJobBySlug, getSimilarJobs } from "@/lib/data/jobs";
import { resolveForm } from "@/lib/data/forms"; // NEW
import {
  EXPERIENCE_LABEL,
  JOB_TYPE_LABEL,
  WORKPLACE_LABEL,
  formatDate,
  formatSalary,
} from "@/lib/format";
import { cleanHtml } from "@/lib/sanitize";
import { buildJobPostingJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job not found" };

  return {
    title: job.title,
    description: job.summary,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: {
      title: `${job.title} | ${siteConfig.name}`,
      description: job.summary,
      url: `/jobs/${job.slug}`,
      type: "website",
    },
  };
}

function ContentSection({ title, html }) {
  if (!html) return null;
  return (
    <section>
      <h2 className="mb-4 text-headline-md text-on-surface">{title}</h2>
      <div
        className="prose-job"
        dangerouslySetInnerHTML={{ __html: cleanHtml(html) }}
      />
    </section>
  );
}

function Detail({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-surface-container-low text-primary">
        <Icon className="size-4.5" aria-hidden />
      </span>
      <div className="flex flex-col">
        <span className="text-label-sm uppercase text-outline">{label}</span>
        <span className="text-label-lg text-on-surface">{value}</span>
      </div>
    </li>
  );
}

export default async function JobDetailPage({ params }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  // NEW: load the form chosen for this job (falls back to the default form)
  const [similar, form] = await Promise.all([
    getSimilarJobs(job),
    resolveForm(job.formId),
  ]);

  const isExpired = Boolean(job.deadline && job.deadline < new Date());
  const url = `${siteConfig.url}/jobs/${job.slug}`;
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  // "<" is escaped so job text can never close the script tag
  const jsonLd = JSON.stringify(buildJobPostingJsonLd(job, url)).replace(
    /</g,
    "\\u003c"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <div className="page-container py-10 md:py-14">
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-1.5 text-label-lg text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All positions
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Main column */}
          <div className="flex flex-col gap-10 lg:col-span-8">
            <header className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="job-chip">{job.department.name}</span>
                <span className="workplace-chip">
                  {WORKPLACE_LABEL[job.workplace]}
                </span>
                <span className="workplace-chip">{JOB_TYPE_LABEL[job.type]}</span>
              </div>
              <h1 className="text-headline-xl text-on-surface">{job.title}</h1>
              <p className="text-body-xl text-on-surface-variant">{job.summary}</p>
            </header>

            <ContentSection title="About the role" html={job.description} />
            <ContentSection title="Responsibilities" html={job.responsibilities} />
            <ContentSection title="Requirements" html={job.requirements} />
            <ContentSection title="Benefits" html={job.benefits} />

            <section id="apply" className="surface-card relative scroll-mt-28 p-6 md:p-8">
              <h2 className="text-headline-md text-on-surface">
                Apply for this position
              </h2>
              <p className="mb-6 mt-1 text-body-md text-on-surface-variant">
                Fields marked * are required. It takes about 5 minutes.
              </p>
              {isExpired ? (
                <p className="rounded-control bg-surface-container-low p-4 text-body-lg text-on-surface-variant">
                  The deadline for this position has passed, so we are no longer
                  accepting applications.{" "}
                  <Link href="/jobs" className="text-primary underline">
                    See other open roles
                  </Link>
                  .
                </p>
              ) : (
                <ApplyForm
                  jobId={job.id}
                  jobTitle={job.title}
                  intro={form.description}
                  fields={form.fields}
                />
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="flex flex-col gap-6 lg:sticky lg:top-28">
              <div className="surface-card flex flex-col gap-5 p-6">
                <h2 className="text-headline-sm text-on-surface">Job overview</h2>
                <ul className="flex flex-col gap-4">
                  <Detail icon={Building2} label="Team" value={job.department.name} />
                  <Detail icon={MapPin} label="Location" value={job.location} />
                  <Detail icon={Briefcase} label="Job type" value={JOB_TYPE_LABEL[job.type]} />
                  <Detail icon={Laptop} label="Workplace" value={WORKPLACE_LABEL[job.workplace]} />
                  <Detail icon={GraduationCap} label="Experience" value={EXPERIENCE_LABEL[job.experience]} />
                  <Detail icon={Banknote} label="Salary" value={salary} />
                  <Detail icon={CalendarDays} label="Posted" value={formatDate(job.publishedAt ?? job.createdAt)} />
                  <Detail icon={CalendarClock} label="Apply before" value={formatDate(job.deadline)} />
                </ul>

                {isExpired ? (
                  <p className="rounded-control bg-surface-container-low px-4 py-3 text-center text-label-lg text-on-surface-variant">
                    Applications closed
                  </p>
                ) : (
                  <a href="#apply" className="btn btn-primary w-full">
                    Apply now
                  </a>
                )}
              </div>

              <div className="surface-card flex flex-col gap-3 p-6">
                <h2 className="text-label-lg text-on-surface">Share this role</h2>
                <ShareButtons url={url} title={`${job.title} at ${siteConfig.name}`} />
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-headline-lg text-on-surface">Similar roles</h2>
            <div className="flex flex-col gap-3">
              {similar.map((item) => (
                <JobRow key={item.id} job={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}