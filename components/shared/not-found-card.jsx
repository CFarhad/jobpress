import Link from "next/link";

export function NotFoundCard() {
  return (
    <div className="page-container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="text-label-md uppercase text-brand-sage">Error 404</span>
      <h1 className="text-headline-xl text-on-surface">Page not found</h1>
      <p className="max-w-md text-body-lg text-on-surface-variant">
        The page you are looking for doesn&apos;t exist, or the position has
        been closed.
      </p>
      <div className="mt-2 flex gap-3">
        <Link href="/" className="btn btn-secondary">Go home</Link>
        <Link href="/jobs" className="btn btn-primary">View open roles</Link>
      </div>
    </div>
  );
}