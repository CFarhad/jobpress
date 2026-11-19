"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { actionUser, zodFieldErrors } from "@/lib/action-utils";
import { changePasswordSchema } from "@/lib/validations/auth";
import { hit } from "@/lib/throttle";

export async function changePassword(_prev, formData) {
  const auth = await actionUser();
  if (auth.error) return auth.error;

  if (!hit(`change-password:${auth.user.id}`, { limit: 5, windowMs: 15 * 60 * 1000 }).allowed) {
    return { ok: false, message: "Too many attempts. Try again later.", errors: {} };
  }

  const parsed = changePasswordSchema.safeParse({
    current: formData.get("current"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the errors below.", errors: zodFieldErrors(parsed.error) };
  }

  const record = await prisma.user.findUnique({ where: { id: auth.user.id }, select: { passwordHash: true } });
  const matches = record && (await bcrypt.compare(parsed.data.current, record.passwordHash));
  if (!matches) {
    return { ok: false, message: "Please fix the errors below.", errors: { current: "Current password is incorrect" } };
  }

  await prisma.user.update({
    where: { id: auth.user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) },
  });

  return { ok: true, message: "Password updated.", errors: {} };
}