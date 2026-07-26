import type { LucideIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';
import type { LearnerMetric } from '../dashboard.types';

/**
 * One figure from the top row: what it measures, the number, and the line that
 * qualifies it. The icon carries the only colour on the card, so a row of four
 * reads as one strip rather than four competing tiles.
 */
export function MetricTile({
  metric,
  label,
  icon: Icon,
  /** Literal Tailwind classes for the icon tile — see `METRIC_TONE`. */
  tone,
}: {
  metric: LearnerMetric;
  label: string;
  icon: LucideIcon;
  tone: string;
}) {
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

      {/* Padded to two digits, so a row of figures lines up on its own column */}
      <span className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[22px] font-bold leading-none tracking-tight text-foreground md:text-[27px]">
          {String(metric.value).padStart(2, '0')}
        </span>
        {metric.unit && (
          <span className="text-xs font-semibold leading-none text-muted-foreground">
            {metric.unit}
          </span>
        )}
      </span>

      <span className="mt-2.5 block text-[11.5px] font-medium leading-[1.35] text-muted-foreground">
        {metric.note}
      </span>
    </Card>
  );
}
