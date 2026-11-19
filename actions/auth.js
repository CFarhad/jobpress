"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hit } from "@/lib/throttle";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/auth-email";
import { forgotSchema, resetSchema } from "@/lib/validations/auth";
import { zodFieldErrors } from "@/lib/action-utils";

const RESET_TTL_MS = 60 * 60 * 1000;

async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "unknown").split(",")[0].trim() || "unknown";
}

export async function requestPasswordReset(_prev, formData) {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, message: "Enter a valid email address." };

  const { email } = parsed.data;
  const generic = {
    ok: true,
    message: "If an account exists for that email, we've sent a password reset link.",
  };

  const ip = await clientIp();
  if (!hit(`forgot-ip:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 }).allowed) {
    return { ok: false, message: "Too many requests. Please try again later." };
  }
  if (!hit(`forgot-email:${email}`, { limit: 3, windowMs: 60 * 60 * 1000 }).allowed) {
    return generic;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.isActive) {
    const token = generateToken();
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + RESET_TTL_MS),
        },
      }),
    ]);

    const base = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        url: `${base}/reset-password?token=${token}`,
      });
    } catch (error) {
      console.error("Password reset email failed:", error);
    }
  }

  return generic;
}

export async function resetPassword(_prev, formData) {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the errors below.", errors: zodFieldErrors(parsed.error) };
  }

  const { token, password } = parsed.data;
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, isActive: true } } },
  });

  if (!record || record.usedAt || record.expiresAt < new Date() || !record.user.isActive) {
    return { ok: false, message: "This reset link is invalid or has expired. Request a new one.", errors: {} };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, usedAt: null } }),
  ]);

  redirect("/login?reset=1");
}