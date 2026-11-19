import { Heart, Monitor, Plane, TrendingUp } from "lucide-react";

const perks = [
  {
    icon: Plane,
    title: "Global Offsites",
    text: "Twice a year we fly the entire company to inspirational settings for strategy, connection, and restorative downtime.",
    well: "bg-secondary text-brand-sage",
  },
  {
    icon: TrendingUp,
    title: "Equal Equity Access",
    text: "Top-tier equity compensation with an industry-leading 10-year exercise window upon departure. We build wealth together.",
    well: "bg-primary-fixed text-primary",
  },
  {
    icon: Heart,
    title: "26 Wks Parental Leave",
    text: "Comprehensive, fully-paid parental leave for all new parents regardless of gender or geography, with phased returns.",
    well: "bg-tertiary-fixed text-tertiary",
  },
  {
    icon: Monitor,
    title: "$3k Workspace Setup",
    text: "Curate your dream ergonomic command center on day one, plus an ongoing $200/mo wellness & co-working stipend.",
    well: "bg-surface-container-high text-on-surface",
  },
];

export function Perks() {
  return (
    <section id="perks" className="scroll-mt-24 py-16">
      <div className="page-container">
        <div className="mx-auto mb-10 flex max-w-2xl flex-col gap-1 text-center">
          <span className="text-label-sm uppercase text-brand-sage">
            Comprehensive Care
          </span>
          <h2 className="text-headline-xl text-on-surface">
            Built to Support Your Life&apos;s Best Work
          </h2>
          <p className="text-body-lg text-on-surface-variant">
            Generous benefits designed for longevity, mental clarity, and mutual
            flourishing.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {perks.map(({ icon: Icon, title, text, well }) => (
            <article key={title} className="surface-card flex flex-col gap-4 p-6">
              <div
                className={`flex size-10 items-center justify-center rounded-md ${well}`}
              >
                <Icon className="size-5" aria-hidden />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-headline-sm text-on-surface">{title}</h3>
                <p className="text-body-md text-on-surface-variant">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}