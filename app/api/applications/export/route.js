import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { buildApplicationWhere, parseApplicationFilters } from "@/lib/data/applications";
import { APPLICATION_STATUS_LABEL } from "@/lib/dashboard-constants";
import { formatAnswer } from "@/lib/forms/fields";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PHONE_LIKE = /^[+\-]?[\d\s()\-]+$/;

// Escape for CSV and neutralise spreadsheet formula injection (=, +, -, @).
function cell(value) {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text) && !PHONE_LIKE.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const where = buildApplicationWhere(parseApplicationFilters(params));

  const applications = await prisma.application.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10000,
    include: { job: { select: { title: true, department: { select: { name: true } } } } },
  });

  const header = [
    "Applied at (UTC)", "Full name", "Email", "Phone", "Country", "City",
    "Job", "Department", "Status", "LinkedIn", "Portfolio", "CV file", "Answers"
  ];

  const rows = applications.map((a) => [
    a.createdAt.toISOString(),
    a.fullName,
    a.email,
    a.phone,
    a.country,
    a.city,
    a.job.title,
    a.job.department.name,
    APPLICATION_STATUS_LABEL[a.status],
    a.linkedinUrl,
    a.portfolioUrl,
    a.cvOriginalName,
    Array.isArray(a.answers) ? a.answers.map((x) => `${x.label}: ${formatAnswer(x.value)}`).join(" | ") : ""
  ]);

  const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="applications-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}