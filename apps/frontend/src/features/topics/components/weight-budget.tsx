import { cn } from '@/lib/utils';

type WeightBudgetProps = {
  /** Weight already spent by the topic's existing modules, 0–100. */
  allocated: number;
  /** Weight typed into the form for the module being authored. */
  pending: number;
  /** Modules the topic already has — context for where `allocated` came from. */
  moduleCount: number;
  className?: string;
};

/**
 * The topic's 100% progress budget, drawn as one bar: solid for weight the
 * existing modules already hold, hatched for the module being authored. Weight
 * is the only hard constraint a mentor has to reason about while writing a
 * module, so it gets a live picture rather than a caption.
 */
export function WeightBudget({
  allocated,
  pending,
  moduleCount,
  className,
}: WeightBudgetProps) {
  const total = allocated + pending;
  const over = Math.max(0, total - 100);
  const remaining = Math.max(0, 100 - total);

  // Segments share one 100% track, so the pending slice only draws into space
  // the existing modules left behind.
  const allocatedWidth = Math.min(100, allocated);
  const pendingWidth = Math.min(pending, Math.max(0, 100 - allocated));

  const usedLabel =
    moduleCount === 0
      ? 'No modules yet'
      : `${moduleCount} module${moduleCount === 1 ? '' : 's'} hold ${allocated}%`;

  const statusLabel =
    over > 0
      ? `${over}% over — learner progress would read past 100%`
      : total === 100
        ? 'Fully allocated'
        : pending > 0
          ? `${remaining}% left after this module`
          : `${remaining}% left to allocate`;

  return (
    <div className={cn('rounded-xl border bg-card p-4 sm:p-5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Curriculum budget
        </h3>
        <p
          className={cn(
            'font-serif text-2xl font-bold leading-none tabular-nums',
            over > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-foreground',
          )}
        >
          {total}
          <span className="text-sm font-semibold text-muted-foreground">
            /100%
          </span>
        </p>
      </div>

      {/* The bar is decorative — the line below carries the same reading */}
      <div
        aria-hidden
        className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            'h-full transition-[width] duration-300 ease-out motion-reduce:transition-none',
            over > 0 ? 'bg-amber-500' : 'bg-primary',
          )}
          style={{ width: `${allocatedWidth}%` }}
        />
        <div
          className={cn(
            'h-full transition-[width] duration-300 ease-out motion-reduce:transition-none',
            over > 0 ? 'bg-amber-400' : 'bg-primary/45',
          )}
          style={{
            width: `${pendingWidth}%`,
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent 0 3px, rgba(255,255,255,0.5) 3px 6px)',
          }}
        />
      </div>

      <p
        aria-live="polite"
        className={cn(
          'mt-2.5 text-[13px] leading-relaxed',
          over > 0
            ? 'font-medium text-amber-700 dark:text-amber-500'
            : 'text-muted-foreground',
        )}
      >
        {usedLabel} · {statusLabel}
      </p>
    </div>
  );
}
