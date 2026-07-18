import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export function EnrollmentPagination({
  page,
  pageCount,
  rangeLabel,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  rangeLabel: string;
  onPageChange: (page: number) => void;
}) {
  // Collapse long ranges to first, last, and a window around the current page.
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );

  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <p className="text-xs text-muted-foreground">{rangeLabel}</p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex size-7 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        {pages.map((p, i) => {
          const prev = pages[i - 1];
          const showEllipsis = prev !== undefined && p - prev > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-1 text-xs text-muted-foreground">…</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  'flex size-7 items-center justify-center rounded-md text-xs font-medium transition-colors',
                  p === page
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {p}
              </button>
            </span>
          );
        })}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="flex size-7 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
