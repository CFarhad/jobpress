import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SimplePagination({ basePath, params = {}, page, totalPages, total }) {
  if (totalPages <= 1) {
    return <p className="px-1 pt-4 text-sm text-on-surface-variant">{total} result{total === 1 ? "" : "s"}</p>;
  }

  const href = (p) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between pt-4">
      <p className="text-sm text-on-surface-variant">
        Page {page} of {totalPages} · {total} results
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className="btn btn-secondary btn-sm">
            <ChevronLeft className="size-4" aria-hidden /> Previous
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link href={href(page + 1)} className="btn btn-secondary btn-sm">
            Next <ChevronRight className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}