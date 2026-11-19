"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/lib/site";

const links = [
  {
    href: "/#why-us",
    label: `Why ${siteConfig.name}`,
    isActive: (pathname) => pathname === "/",
  },
  {
    href: "/jobs",
    label: "Open Positions",
    isActive: (pathname) => pathname.startsWith("/jobs"),
  },
  {
    href: "/#perks",
    label: "Culture & Perks",
    isActive: () => false,
  },
];

export function Navbar({ openCount }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const ctaLabel =
    openCount > 0
      ? `View ${openCount} ${openCount === 1 ? "Opening" : "Openings"}`
      : "View Openings";

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface/85 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="page-container flex h-20 items-center justify-between">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-10 md:flex">
          {links.map((link) => {
            const active = link.isActive(pathname);
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-label-lg transition-colors ${
                  active
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/jobs" className="btn btn-primary hidden sm:inline-flex">
            {ctaLabel}
          </Link>

          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-control text-on-surface hover:bg-surface-container md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-border-subtle bg-surface md:hidden"
        >
          <nav aria-label="Mobile" className="page-container flex flex-col gap-1 py-4">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-control px-3 py-3 text-label-lg text-on-surface hover:bg-surface-container"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/jobs"
              onClick={() => setOpen(false)}
              className="btn btn-primary mt-2"
            >
              {ctaLabel}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}