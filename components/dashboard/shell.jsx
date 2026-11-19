"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Briefcase, ExternalLink, Inbox, LayoutDashboard, LogOut, Menu, UserCog, Users, X } from "lucide-react";
import { ROLE_LABEL } from "@/lib/dashboard-constants";
import { siteConfig } from "@/lib/site";
import { ClipboardList } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/applications", label: "Applications", icon: Inbox, badge: true },
  { href: "/dashboard/forms", label: "Forms", icon: ClipboardList },
  { href: "/dashboard/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/dashboard/account", label: "Account", icon: UserCog },
];

export default function DashboardShell({ user, newCount, children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname],[]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const items = NAV.filter((item) => !item.adminOnly || user.role === "ADMIN");
  const isActive = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  return (
    <div className="min-h-screen bg-surface">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />
      )}

      <aside
        aria-label="Dashboard navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-brand-deep text-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/dashboard" className="text-headline-sm">
            {siteConfig.name} <span className="opacity-70">Admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  active ? "bg-white/15" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="size-5" aria-hidden />
                <span className="flex-1">{item.label}</span>
                {item.badge && newCount > 0 && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-brand-deep">
                    {newCount > 99 ? "99+" : newCount}
                    <span className="sr-only"> new</span>
                  </span>
                )}
              </Link>
            );
          })}

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="size-5" aria-hidden />
            View careers site
          </Link>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-white/60">
              {user.email} · {ROLE_LABEL[user.role]}
            </p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-5" aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-outline/20 bg-surface/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 hover:bg-surface-container-low"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="size-6" aria-hidden />
          </button>
          <span className="text-headline-sm">{siteConfig.name} Admin</span>
        </header>

        <main id="dashboard-main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}