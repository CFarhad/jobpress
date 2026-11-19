function Bar({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-control bg-surface-container-high ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div className="page-container py-12 md:py-16" aria-busy="true">
      <div className="mb-8 flex flex-col gap-3">
        <Bar className="h-3 w-32" />
        <Bar className="h-10 w-72" />
        <Bar className="h-5 w-96 max-w-full" />
      </div>

      <div className="surface-card flex flex-col gap-5 p-6">
        <Bar className="h-[3.25rem] w-full" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Bar key={i} className="h-[3.25rem]" />
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-card flex flex-col gap-3 p-8">
            <Bar className="h-6 w-48 rounded-full" />
            <Bar className="h-6 w-2/3" />
            <Bar className="h-4 w-full max-w-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}