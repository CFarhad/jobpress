import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { siteConfig } from "@/lib/site";

export const metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-brand-deep p-12 text-white lg:flex">
        <Link href="/" className="text-headline-md">
          {siteConfig.name} <span className="opacity-70">{siteConfig.tagline}</span>
        </Link>
        <div className="max-w-md">
          <ShieldCheck className="mb-6 size-10 opacity-80" aria-hidden />
          <p className="text-headline-lg">Hiring, organised.</p>
          <p className="text-body-lg mt-4 opacity-80">
            Manage open roles, review applications and keep your hiring pipeline moving, all in one place.
          </p>
        </div>
        <p className="text-sm opacity-60">Authorised staff only. Access is granted by an administrator.</p>
      </aside>

      <main id="main" className="flex items-center justify-center bg-surface px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}