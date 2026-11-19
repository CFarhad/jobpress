import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { dirname } from "path";
import { prisma } from "@/lib/prisma";
import { hit } from "@/lib/throttle";
import { resolveCvPath, deleteCv } from "@/lib/storage";
import { sendApplicationConfirmation } from "@/lib/email";
import { resolveForm } from "@/lib/data/forms";
import { readAnswers, splitAnswers, validateAnswers } from "@/lib/forms/validate";
import { CV_MIME, fileExtension, matchesSignature, validateCvFile } from "@/lib/forms/cv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 6 * 1024 * 1024;
const json = (body, status = 200) => NextResponse.json(body, { status });

function clientIp(request) {
  return (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim() || "unknown";
}

function safeFileName(name) {
  return (
    String(name)
      .replace(/[\\/]/g, "_")
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .trim()
      .slice(0, 150) || "cv"
  );
}

export async function POST(request) {
  // 1. Rate limit (per IP)
  if (!hit(`apply:${clientIp(request)}`, { limit: 10, windowMs: 60 * 60 * 1000 }).allowed) {
    return json({ ok: false, message: "Too many applications from your network. Please try again later." }, 429);
  }

  // 2. Size guard before parsing the body
  if (Number(request.headers.get("content-length") ?? 0) > MAX_REQUEST_BYTES) {
    return json({ ok: false, message: "The upload is too large." }, 413);
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return json({ ok: false, message: "Invalid request." }, 400);
  }

  // 3. Honeypot: pretend success so bots don't adapt
  if (String(formData.get("botcheck") ?? "").trim() !== "") return json({ ok: true });

  // 4. The job decides the form. Never trust the client for this.
  const jobId = String(formData.get("jobId") ?? "");
  const job = jobId
    ? await prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true, title: true, status: true, deadline: true, formId: true },
      })
    : null;
  const open = job && job.status === "PUBLISHED" && (!job.deadline || job.deadline > new Date());
  if (!open) return json({ ok: false, message: "This job is no longer accepting applications." }, 404);

  const form = await resolveForm(job.formId);

  // 5. Validate fields, CV and consent
  const { values, errors } = validateAnswers(form.fields, readAnswers(form.fields, formData));

  const cv = formData.get("cv");
  const cvError = validateCvFile(cv);
  if (cvError) errors.cv = cvError;
  if (!formData.get("consent")) errors.consent = "You must agree before submitting";

  let buffer = null;
  let extension = "";
  if (!errors.cv) {
    extension = fileExtension(cv.name);
    buffer = Buffer.from(await cv.arrayBuffer());
    if (!matchesSignature(buffer, extension)) errors.cv = "The file content doesn't match its type";
  }

  if (Object.keys(errors).length > 0) {
    return json({ ok: false, message: "Please fix the highlighted fields.", errors }, 400);
  }

  const { core, answers } = splitAnswers(form.fields, values);

  // 6. Duplicate application for the same job
  const duplicate = await prisma.application.findUnique({
    where: { jobId_email: { jobId: job.id, email: core.email } },
    select: { id: true },
  });
  if (duplicate) {
    return json({ ok: false, message: "You have already applied for this job with this email.", errors: { email: "Already applied" } }, 409);
  }

  // 7. Save the file, then the record. Remove the file if the database fails.
  const storedName = `${randomUUID()}.${extension}`;
  const filePath = resolveCvPath(storedName);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer, { flag: "wx" });

  try {
    await prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          jobId: job.id,
          fullName: core.fullName,
          email: core.email,
          phone: core.phone ?? null,
          country: core.country ?? null,
          city: core.city ?? null,
          coverLetter: core.coverLetter ?? null,
          linkedinUrl: core.linkedinUrl ?? null,
          portfolioUrl: core.portfolioUrl ?? null,
          answers: answers.length ? answers : undefined,
          cvOriginalName: safeFileName(cv.name),
          cvStoredName: storedName,
          cvMimeType: CV_MIME[extension],
          cvSize: cv.size,
          consent: true,
          status: "NEW",
        },
      });
      await tx.statusHistory.create({ data: { applicationId: application.id, toStatus: "NEW" } });
    });
  } catch (error) {
    await deleteCv(storedName).catch(() => {});
    if (error.code === "P2002") {
      return json({ ok: false, message: "You have already applied for this job with this email.", errors: { email: "Already applied" } }, 409);
    }
    console.error("Application save failed:", error);
    return json({ ok: false, message: "Could not submit your application. Please try again." }, 500);
  }

  // 8. Confirmation email (never blocks the response)
  try {
    await sendApplicationConfirmation({ to: core.email, name: core.fullName, jobTitle: job.title });
  } catch (error) {
    console.error("Confirmation email failed:", error);
  }

  return json({ ok: true });
}