import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Logo() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2"
      aria-label={`${siteConfig.name} ${siteConfig.tagline} home`}
    >
      <div className="flex size-9 items-center justify-center rounded-control bg-primary text-headline-sm text-primary-foreground transition-transform group-hover:scale-105">
        {siteConfig.name.charAt(0)}
      </div>
      <div className="flex flex-col">
        <span className="text-headline-sm text-on-surface">
          {siteConfig.name}
        </span>
        <span className="text-label-sm uppercase text-on-surface-variant">
          {siteConfig.tagline}
        </span>
      </div>
    </Link>
  );
}