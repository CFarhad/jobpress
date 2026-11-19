import Link from "next/link";
import ForgotForm from "@/components/auth/forgot-form";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-headline-xl">Forgot password?</h1>
      <p className="text-body-lg mt-2 text-on-surface-variant">
        Enter your account email and we will send you a link to reset it.
      </p>
      <ForgotForm />
      <p className="mt-8 text-center text-sm">
        <Link href="/login" className="text-primary underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}