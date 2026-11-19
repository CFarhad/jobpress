import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Rocket, Search } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function Hero({ openCount, teamCount }) {
  const { hero } = siteConfig;

  return (
    <section className="relative overflow-hidden pb-16 pt-10 md:pb-24">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-pulse-glow absolute -top-24 left-1/3 size-96 rounded-full bg-primary-fixed/35 blur-3xl" />
        <div
          className="animate-pulse-glow absolute right-10 top-48 size-80 rounded-full bg-secondary-fixed/30 blur-3xl"
          style={{ animationDelay: "-3s" }}
        />
      </div>

      <div className="page-container relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        {/* Text column */}
        <div className="animate-fade-1 flex flex-col gap-6 lg:col-span-7">
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-secondary px-3.5 py-1.5 text-label-md text-secondary-foreground shadow-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span>{hero.badge}</span>
          </div>

          <h1 className="text-display-lg text-on-surface">
            {hero.titleBefore}{" "}
            <span className="text-primary">{siteConfig.name}</span>.
          </h1>

          <p className="max-w-2xl text-body-xl text-on-surface-variant">
            {hero.text}
          </p>

          {/* Search */}
          <form
            action="/jobs"
            method="get"
            role="search"
            className="flex max-w-xl flex-col gap-2 pt-1 sm:flex-row sm:items-stretch"
          >
            <div className="relative flex-1">
              <label htmlFor="hero-search" className="sr-only">
                Search roles by discipline or keyword
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-outline"
                aria-hidden
              />
              <input
                id="hero-search"
                name="q"
                type="search"
                placeholder="Search by discipline or keyword..."
                className="field-control pl-11 pr-4 text-body-md shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary h-auto min-h-[3.25rem] shrink-0"
            >
              Search Jobs
            </button>
          </form>

          <Link
            href="#open-roles"
            className="group inline-flex items-center gap-1.5 self-start text-label-lg text-primary hover:underline"
          >
            Browse all {openCount} open {openCount === 1 ? "role" : "roles"}
            <ArrowDown
              className="size-4 transition-transform group-hover:translate-y-0.5"
              aria-hidden
            />
          </Link>

          {/* Proof points */}
          <dl className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2 text-on-surface-variant">
            {hero.stats.map((stat, index) => (
              <div key={stat.label} className="flex items-center gap-8">
                {index > 0 && (
                  <span
                    aria-hidden
                    className="hidden h-8 w-px bg-surface-container-highest sm:block"
                  />
                )}
                <div className="flex flex-col">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-headline-sm text-on-surface">
                    {stat.value}
                  </dd>
                  <span
                    aria-hidden
                    className="text-label-sm uppercase text-outline"
                  >
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Image column */}
        <div className="animate-fade-2 relative lg:col-span-5">
          <div className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-container-high shadow-xl">
            <Image
              src={hero.image}
              alt={hero.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
          </div>

          <div className="animate-float absolute -bottom-5 -left-3 flex items-center gap-3 rounded-lg bg-surface-container-lowest/95 p-4 shadow-xl backdrop-blur-md sm:-left-5">
            <div className="flex size-10 items-center justify-center rounded-control bg-primary-fixed text-primary">
              <Rocket className="size-5" aria-hidden />
            </div>
            <div className="flex flex-col pr-1">
              <span className="text-label-lg text-on-surface">
                We&apos;re hiring actively
              </span>
              <span className="text-label-sm text-on-surface-variant">
                {openCount} open {openCount === 1 ? "role" : "roles"} across{" "}
                {teamCount} {teamCount === 1 ? "team" : "teams"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}