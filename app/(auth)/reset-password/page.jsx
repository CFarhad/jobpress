import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";
import ResetForm from "@/components/auth/reset-form";

export const metadata = { title: "Reset password" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }) {
  const sp = await searchParams;
  const token = typeof sp?.token === "string" ? sp.token : "";

  let valid = false;
  if (token.length >= 32 && token.length <= 128) {
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
      select: { usedAt: true, expiresAt: true },
    });
    valid = !!record && !record.usedAt && record.expiresAt > new Date();
  }

  if (!valid) {
    return (
      <div>
        <h1 className="text-headline-xl">Link expired</h1>
        <p className="text-body-lg mt-2 text-on-surface-variant">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className="btn btn-primary mt-8">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-headline-xl">Set a new password</h1>
      <p className="text-body-lg mt-2 text-on-surface-variant">
        Use at least 8 characters with upper-case, lower-case and a number.
      </p>
      <ResetForm token={token} />
    </div>
  );
}