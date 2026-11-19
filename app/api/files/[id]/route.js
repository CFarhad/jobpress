import { readFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { resolveCvPath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const application = await prisma.application.findUnique({
    where: { id },
    select: { cvStoredName: true, cvOriginalName: true, cvMimeType: true },
  });
  if (!application) return new Response("Not found", { status: 404 });

  let file;
  try {
    file = await readFile(resolveCvPath(application.cvStoredName));
  } catch {
    return new Response("File not found", { status: 404 });
  }

  const ascii = application.cvOriginalName.replace(/[^\w.\- ]/g, "_");
  const encoded = encodeURIComponent(application.cvOriginalName);

  return new Response(file, {
    headers: {
      "Content-Type": application.cvMimeType || "application/octet-stream",
      "Content-Length": String(file.length),
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}