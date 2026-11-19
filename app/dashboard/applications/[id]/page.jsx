import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import ApplicationStatusSelect from "@/components/dashboard/application-status-select";
import NotesPanel from "@/components/dashboard/notes-panel";
import DeleteApplicationButton from "@/components/dashboard/delete-application-button";
import { ApplicationStatusBadge } from "@/components/dashboard/badges";
import { APPLICATION_STATUS_LABEL, formatDateTime } from "@/lib/dashboard-constants";
import { formatAnswer } from "@/lib/forms/fields";

export const metadata = { title: "Application" };

export default async function ApplicationDetailPage({ params }) {
  const user = await requireUser();
  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: { select: { id: true, title: true, department: { select: { name: true } } } },
    },
  });
  if (!application) notFound();

  const [notes, history] = await Promise.all([
    prisma.note.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    }),
    prisma.statusHistory.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: "desc" },
      include: { changedBy: { select: { name: true } } },
    }),
  ]);

  const noteItems = notes.map((n) => ({
    id: n.id,
    content: n.content,
    authorId: n.author?.id ?? null,
    authorName: n.author?.name ?? "Unknown",
    createdLabel: formatDateTime(n.createdAt),
  }));

  const location = [application.city, application.country].filter(Boolean).join(", ");
  const answers = Array.isArray(application.answers) ? application.answers : [];

  return (
    <>
      <Link href="/dashboard/applications" className="mb-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> All applications
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-headline-xl">{application.fullName}</h1>
          <p className="text-body-lg mt-1 text-on-surface-variant">
            Applied for{" "}
            <Link href={`/dashboard/applications?jobId=${application.job.id}`} className="font-semibold text-on-surface hover:underline">
              {application.job.title}
            </Link>{" "}
            · {application.job.department.name} · {formatDateTime(application.createdAt)}
          </p>
        </div>
        <ApplicationStatusBadge status={application.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="surface-card p-6" aria-labelledby="contact-title">
            <h2 id="contact-title" className="text-headline-sm mb-4">
              Contact
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="size-4 text-on-surface-variant" aria-hidden />
                <a href={`mailto:${application.email}`} className="hover:underline">
                  {application.email}
                </a>
              </li>
              {application.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="size-4 text-on-surface-variant" aria-hidden />
                  <a href={`tel:${application.phone}`} className="hover:underline">
                    {application.phone}
                  </a>
                </li>
              )}
              {location && (
                <li className="flex items-center gap-3">
                  <MapPin className="size-4 text-on-surface-variant" aria-hidden />
                  {location}
                </li>
              )}
              {application.linkedinUrl && (
                <li className="flex items-center gap-3">
                  <ExternalLink className="size-4 text-on-surface-variant" aria-hidden />
                  <a
                    href={application.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="break-all text-primary hover:underline"
                  >
                    LinkedIn profile
                  </a>
                </li>
              )}
              {application.portfolioUrl && (
                <li className="flex items-center gap-3">
                  <ExternalLink className="size-4 text-on-surface-variant" aria-hidden />
                  <a
                    href={application.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="break-all text-primary hover:underline"
                  >
                    Portfolio / website
                  </a>
                </li>
              )}
            </ul>
          </section>
          
          {answers.length > 0 && (
            <section className="surface-card p-6" aria-labelledby="answers-title">
              <h2 id="answers-title" className="text-headline-sm mb-4">
                Additional answers
              </h2>
              <dl className="space-y-4 text-sm">
                {answers.map((a) => (
                  <div key={a.key}>
                    <dt className="text-on-surface-variant">{a.label}</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap font-medium">{formatAnswer(a.value)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="surface-card p-6" aria-labelledby="cover-title">
            <h2 id="cover-title" className="text-headline-sm mb-4">
              Cover letter
            </h2>
            {application.coverLetter ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{application.coverLetter}</p>
            ) : (
              <p className="text-sm text-on-surface-variant">No cover letter provided.</p>
            )}
          </section>

          <section className="surface-card p-6" aria-labelledby="notes-title">
            <h2 id="notes-title" className="text-headline-sm mb-4">
              Internal notes
            </h2>
            <NotesPanel applicationId={application.id} notes={noteItems} currentUserId={user.id} isAdmin={user.role === "ADMIN"} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="surface-card p-6" aria-labelledby="status-title">
            <h2 id="status-title" className="text-headline-sm mb-4">
              Status
            </h2>
            <ApplicationStatusSelect id={application.id} status={application.status} />
          </section>

          <section className="surface-card p-6" aria-labelledby="cv-title">
            <h2 id="cv-title" className="text-headline-sm mb-4">
              CV
            </h2>
            <p className="break-all text-sm">{application.cvOriginalName}</p>
            <p className="mb-4 text-xs text-on-surface-variant">{(application.cvSize / 1024 / 1024).toFixed(2)} MB</p>
            <a href={`/api/files/${application.id}`} className="btn btn-primary w-full">
              <Download className="size-4" aria-hidden /> Download CV
            </a>
          </section>

          <section className="surface-card p-6" aria-labelledby="history-title">
            <h2 id="history-title" className="text-headline-sm mb-4">
              History
            </h2>
            <ol className="space-y-4 border-l-2 border-outline/20 pl-4">
              {history.map((h) => (
                <li key={h.id} className="text-sm">
                  <p className="font-medium">
                    {h.fromStatus ? `${APPLICATION_STATUS_LABEL[h.fromStatus]} → ` : ""}
                    {APPLICATION_STATUS_LABEL[h.toStatus]}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {h.changedBy?.name ?? "Applicant"} · {formatDateTime(h.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {user.role === "ADMIN" && <DeleteApplicationButton id={application.id} name={application.fullName} />}
        </div>
      </div>
    </>
  );
}
