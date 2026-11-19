"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { deleteCv } from "@/lib/storage";
import { actionUser, fail, succeed } from "@/lib/action-utils";
import { APPLICATION_STATUSES } from "@/lib/dashboard-constants";

const noteSchema = z.string().trim().min(1, "Write something first").max(2000, "Max 2000 characters");

function refresh(id) {
  revalidatePath("/dashboard", "layout");
  if (id) revalidatePath(`/dashboard/applications/${id}`);
}

export async function updateApplicationStatus(id, status) {
  const auth = await actionUser();
  if (auth.error) return auth.error;
  if (!APPLICATION_STATUSES.includes(status)) return fail("Invalid status.");

  const current = await prisma.application.findUnique({ where: { id }, select: { status: true } });
  if (!current) return fail("Application not found.");
  if (current.status === status) return succeed("No change.");

  await prisma.$transaction([
    prisma.application.update({ where: { id }, data: { status } }),
    prisma.statusHistory.create({
      data: { applicationId: id, fromStatus: current.status, toStatus: status, changedById: auth.user.id },
    }),
  ]);

  refresh(id);
  return succeed("Status updated.");
}

export async function addNote(applicationId, content) {
  const auth = await actionUser();
  if (auth.error) return auth.error;

  const parsed = noteSchema.safeParse(content);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const exists = await prisma.application.findUnique({ where: { id: applicationId }, select: { id: true } });
  if (!exists) return fail("Application not found.");

  await prisma.note.create({
    data: { applicationId, content: parsed.data, authorId: auth.user.id },
  });

  refresh(applicationId);
  return succeed("Note added.");
}

export async function deleteNote(noteId) {
  const auth = await actionUser();
  if (auth.error) return auth.error;

  const note = await prisma.note.findUnique({ where: { id: noteId }, select: { authorId: true, applicationId: true } });
  if (!note) return fail("Note not found.");
  if (note.authorId !== auth.user.id && auth.user.role !== "ADMIN") {
    return fail("You can only delete your own notes.");
  }

  await prisma.note.delete({ where: { id: noteId } });
  refresh(note.applicationId);
  return succeed("Note deleted.");
}

export async function deleteApplication(id) {
  const auth = await actionUser({ admin: true });
  if (auth.error) return auth.error;

  const application = await prisma.application.findUnique({ where: { id }, select: { cvStoredName: true } });
  if (!application) return fail("Application not found.");

  await prisma.$transaction([
    prisma.note.deleteMany({ where: { applicationId: id } }),
    prisma.statusHistory.deleteMany({ where: { applicationId: id } }),
    prisma.application.delete({ where: { id } }),
  ]);

  try {
    await deleteCv(application.cvStoredName);
  } catch (error) {
    console.error("Could not remove CV file:", error);
  }

  refresh();
  redirect("/dashboard/applications");
}