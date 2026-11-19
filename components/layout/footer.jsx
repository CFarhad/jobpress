import Link from "next/link";
import { Globe, Mail } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low">
      <div className="page-container py-16 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="flex flex-col gap-4 md:col-span-4">
            <Logo />
            <p className="max-w-sm text-body-md text-on-surface-variant">
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Globe className="size-5" aria-hidden />
              <span className="text-label-md">{siteConfig.regionNote}</span>
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Footer" className="flex flex-col gap-3 md:col-span-2">
            <span className="mb-1 text-label-lg text-on-surface">Explore</span>
            <FooterLink href="/#why-us">Why {siteConfig.name}</FooterLink>
            <FooterLink href="/jobs">Open Positions</FooterLink>
            <FooterLink href="/#perks">Culture & Perks</FooterLink>
            <FooterLink href="/login">Staff Login</FooterLink>
          </nav>

          {/* Offices */}
          <div className="flex flex-col gap-3 md:col-span-3">
            <span className="mb-1 text-label-lg text-on-surface">
              Office Hubs
            </span>
            {siteConfig.offices.map((office) => (
              <div key={office.city}>
                <strong className="block text-label-md text-on-surface">
                  {office.city}
                </strong>
                <span className="text-body-md text-on-surface-variant">
                  {office.address}
                </span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3 md:col-span-3">
            <span className="mb-1 text-label-lg text-on-surface">
              Get in Touch
            </span>
            <p className="text-body-md text-on-surface-variant">
              Questions about a role or our hiring process? We read every
              message.
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center gap-2 text-label-lg text-primary hover:underline"
            >
              <Mail className="size-4" aria-hidden />
              {siteConfig.email}
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-8 text-body-md text-on-surface-variant sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6 text-label-md">
            <Link href="/privacy" className="hover:text-on-surface">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-on-surface">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-body-md text-on-surface-variant transition-colors hover:text-on-surface"
    >
      {children}
    </Link>
  );
}