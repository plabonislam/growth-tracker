import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * One reporting card: the count, and which way it moved against the period
 * before it. A card with nothing to compare against — a point-in-time count
 * like total members — passes `delta: null` and shows what it is instead.
 */
export function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
  tone,
  /** Said in place of a delta, e.g. "right now" for a snapshot. */
  note,
  /** Explains a figure that can only be zero, e.g. an unbuilt feature. */
  unavailable,
}: {
  label: string;
  value: number;
  delta: number | null;
  icon: LucideIcon;
  tone: string;
  note?: string;
  unavailable?: string;
}) {
  const rising = delta !== null && delta > 0;
  const falling = delta !== null && delta < 0;

  return (
    <Card className="gap-0 rounded-[13px] p-3.5 md:p-4">
      <div className="flex items-center justify-between gap-2.5">
        <span className="text-[9.5px] font-semibold uppercase leading-[1.3] tracking-[0.1em] text-muted-foreground">
          {label}
        </span>
        <span
          className={`inline-flex size-7 shrink-0 items-center justify-center rounded-lg ${tone}`}
        >
          <Icon className="size-3.5" strokeWidth={2} />
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="text-[22px] font-bold leading-none tracking-tight text-foreground md:text-[27px]">
          {value}
        </span>

        {delta !== null && delta !== 0 && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[11.5px] font-semibold leading-none',
              rising
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-destructive',
            )}
          >
            {rising ? (
              <ArrowUpRight className="size-3.5" strokeWidth={2.4} />
            ) : (
              <ArrowDownRight className="size-3.5" strokeWidth={2.4} />
            )}
            {Math.abs(delta)}
          </span>
        )}
      </div>

      <span className="mt-2.5 block text-[11.5px] font-medium leading-[1.35] text-muted-foreground">
        {unavailable ??
          note ??
          (delta === 0
            ? 'No change on the period before'
            : falling
              ? 'Down on the period before'
              : 'Up on the period before')}
      </span>
    </Card>
  );
}
