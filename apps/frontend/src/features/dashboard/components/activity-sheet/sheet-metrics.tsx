import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SheetMetric } from '../../activity-sheet.types';

/**
 * The strip of figures a sheet opens with. Each carries the month's count, how
 * it moved on the month before, and the line that qualifies it — a number on
 * its own says nothing about whether the club is going anywhere.
 */
export function SheetMetrics({ metrics }: { metrics: SheetMetric[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 min-[560px]:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-5">
      {metrics.map((metric) => (
        <MetricCell key={metric.key} metric={metric} />
      ))}
    </div>
  );
}

function MetricCell({ metric }: { metric: SheetMetric }) {
  const { delta } = metric;
  const rising = delta !== null && delta > 0;
  const flat = delta === 0;

  return (
    <Card className="gap-0 rounded-[13px] p-3.5 md:p-4">
      <span className="text-[9.5px] font-semibold uppercase leading-[1.3] tracking-[0.1em] text-muted-foreground">
        {metric.label}
      </span>

      <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1.5">
        <span
          className={cn(
            'text-[22px] font-bold leading-none tracking-tight md:text-[27px]',
            metric.muted ? 'text-muted-foreground/60' : 'text-foreground',
          )}
        >
          {metric.value}
        </span>
        {metric.unit && (
          <span className="text-[11.5px] font-semibold leading-none text-muted-foreground">
            {metric.unit}
          </span>
        )}

        {delta !== null && (
          <span
            title={metric.deltaNote}
            className={cn(
              'ml-auto inline-flex items-center rounded-full px-2 py-1 text-[10.5px] font-semibold leading-none',
              flat
                ? 'bg-muted text-muted-foreground'
                : rising
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-destructive/10 text-destructive',
            )}
          >
            {flat ? 'no change' : `${rising ? '+' : '−'}${Math.abs(delta)}`}
          </span>
        )}
      </div>

      <span className="mt-2.5 block text-[11.5px] font-medium leading-[1.35] text-muted-foreground">
        {metric.note}
      </span>
    </Card>
  );
}
