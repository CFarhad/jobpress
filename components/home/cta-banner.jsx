import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function CtaBanner({ openCount }) {
  return (
    <section className="py-16">
      <div className="page-container">
        <div className="relative overflow-hidden rounded-xl bg-primary-deep p-8 text-primary-foreground shadow-xl md:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -right-20 size-80 rounded-full bg-secondary-fixed/20 blur-3xl"
          />

          <div className="relative z-10 flex flex-col items-center justify-between gap-10 md:flex-row">
            <div className="flex max-w-xl flex-col gap-2 text-center md:text-left">
              <span className="text-label-md uppercase text-primary-fixed">
                Join the Journey
              </span>
              <h2 className="text-headline-xl !text-primary-foreground">
                Ready to do your life&apos;s best work at {siteConfig.name}?
              </h2>
              <p className="text-body-lg text-primary-foreground/80">
                We move rapidly, champion high agency, and prize clarity.
                Applications take under 5 minutes with immediate hiring team
                review.
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-3 sm:flex-row">
              <Link href="/jobs" className="btn btn-light">
                View All {openCount} {openCount === 1 ? "Role" : "Roles"}
              </Link>
              <a
                href={`mailto:${siteConfig.email}`}
                className="btn bg-transparent text-primary-foreground hover:bg-white/10"
              >
                General Inquiries
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}