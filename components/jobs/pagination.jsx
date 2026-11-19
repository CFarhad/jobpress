import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function pageItems(page, totalPages) {
  const items = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      items.push(p);
    } else if (items[items.length - 1] !== "…") {
      items.push("…");
    }
  }
  return items;
}

export function Pagination({ page, totalPages, filters }) {
  if (totalPages <= 1) return null;

  function hrefFor(target) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (!value || key === "page") continue;
      if (key === "sort" && value === "newest") continue;
      params.set(key, String(value));
    }
    if (target > 1) params.set("page", String(target));
    const query = params.toString();
    return query ? `/jobs?${query}` : "/jobs";
  }

  const base =
    "flex size-10 items-center justify-center rounded-control text-label-lg transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          aria-label="Previous page"
          className={`${base} bg-surface-container-low text-primary hover:bg-surface-container-high`}
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
      ) : (
        <span
          aria-hidden
          className={`${base} bg-surface-container-low text-outline opacity-50`}
        >
          <ChevronLeft className="size-5" />
        </span>
      )}

      {pageItems(page, totalPages).map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-1 text-outline">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === page ? "page" : undefined}
            className={`${base} ${
              item === page
                ? "bg-primary text-primary-foreground"
                : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
            }`}
          >
            {item}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          aria-label="Next page"
          className={`${base} bg-surface-container-low text-primary hover:bg-surface-container-high`}
        >
          <ChevronRight className="size-5" aria-hidden />
        </Link>
      ) : (
        <span
          aria-hidden
          className={`${base} bg-surface-container-low text-outline opacity-50`}
        >
          <ChevronRight className="size-5" />
        </span>
      )}
    </nav>
  );
}