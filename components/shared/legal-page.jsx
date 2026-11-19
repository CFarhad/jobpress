export function LegalPage({ title, updated, sections }) {
  return (
    <article className="page-container max-w-3xl py-12 md:py-16">
      <h1 className="text-headline-xl text-on-surface">{title}</h1>
      <p className="mt-2 text-body-md text-outline">Last updated: {updated}</p>

      <div className="mt-10 flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-2 text-headline-sm text-on-surface">
              {section.heading}
            </h2>
            <p className="text-body-lg text-on-surface-variant">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}