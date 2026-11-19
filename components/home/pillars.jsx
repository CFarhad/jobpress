import { ArrowRight, Compass, Cpu, Globe } from "lucide-react";

const pillars = [
  {
    icon: Compass,
    title: "Autonomy & Ownership",
    text: "You own problem spaces from architecture to telemetry. We set high-conviction outcomes and leave execution blueprints entirely to the builders.",
    note: "Direct impact index",
    well: "bg-secondary text-brand-sage group-hover:rotate-3",
  },
  {
    icon: Cpu,
    title: "Deep Craft",
    text: "P99.9 latency matters. Micro-interactions matter. We value disciplined simplicity over sprawling technical debt and prioritize deliberate, elegant solutions.",
    note: "Zero fluff methodology",
    well: "bg-primary-fixed text-primary group-hover:-rotate-3",
  },
  {
    icon: Globe,
    title: "Radical Flexibility",
    text: "Work when and where your thinking peaks. Asynchronous documentation replaces calendar fatigue so you can sustain long stretches of uninterrupted flow.",
    note: "Async-first doctrine",
    well: "bg-tertiary-fixed text-tertiary group-hover:rotate-3",
  },
];

export function Pillars() {
  return (
    <section id="why-us" className="scroll-mt-24 py-16">
      <div className="page-container">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex max-w-xl flex-col gap-1">
            <span className="text-label-sm uppercase text-brand-sage">
              Our Tenets
            </span>
            <h2 className="text-headline-xl text-on-surface">
              The Principles of High-Agency Engineering
            </h2>
          </div>
          <p className="max-w-md text-body-md text-on-surface-variant">
            We reject bloated meetings, vanity metrics, and layers of
            governance. We trust expert builders to ship extraordinary systems.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {pillars.map(({ icon: Icon, title, text, note, well }) => (
            <article
              key={title}
              className="interactive-card group flex flex-col gap-4 p-8"
            >
              <div
                className={`flex size-12 items-center justify-center rounded-control transition-transform duration-300 group-hover:scale-110 ${well}`}
              >
                <Icon className="size-6" aria-hidden />
              </div>
              <h3 className="text-headline-sm text-on-surface transition-colors group-hover:text-primary">
                {title}
              </h3>
              <p className="text-body-md text-on-surface-variant">{text}</p>
              <div className="mt-auto flex items-center gap-1 pt-2 text-label-md text-primary opacity-80 group-hover:opacity-100">
                <span>{note}</span>
                <ArrowRight className="size-4" aria-hidden />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}