import Link from "next/link";
import LoginForm from "@/components/auth/login-form";

export const metadata = { title: "Sign in" };

function safeCallback(value) {
  const v = Array.isArray(value) ? value[0] : value;
  if (typeof v === "string" && v.startsWith("/dashboard") && !v.startsWith("//")) return v;
  return "/dashboard";
}

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  const notice =
    sp?.reset === "1"
      ? { tone: "success", text: "Password updated. You can sign in now." }
      : sp?.reason === "session"
        ? { tone: "info", text: "Your session has ended or your account is unavailable. Please sign in again." }
        : null;

  return (
    <div>
      <h1 className="text-headline-xl">Welcome back</h1>
      <p className="text-body-lg mt-2 text-on-surface-variant">Sign in to the staff dashboard.</p>

      {notice && (
        <p
          role="status"
          className={`mt-6 rounded-xl px-4 py-3 text-sm ${
            notice.tone === "success" ? "bg-emerald-50 text-emerald-900" : "bg-sky-50 text-sky-900"
          }`}
        >
          {notice.text}
        </p>
      )}

      <LoginForm callbackUrl={safeCallback(sp?.callbackUrl)} />

      <p className="mt-8 text-center text-sm text-on-surface-variant">
        <Link href="/" className="underline underline-offset-4 hover:text-primary">
          ← Back to careers site
        </Link>
      </p>
    </div>
  );
}