import { ChevronRight } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { AGENDA_ICONS, AGENDA_TONE } from '../dashboard.constants';
import type { AgendaItem } from '../dashboard.types';

/**
 * A short list of dated things — deadlines, events — with its own title inside
 * the card, so each list is a self-contained panel rather than a heading with
 * a detached box under it. `action` is the small thing that sits opposite the
 * title: a count, or a way to see the rest.
 */
export function AgendaCard({
  title,
  action,
  items,
  emptyLabel,
}: {
  title: string;
  action?: React.ReactNode;
  items: AgendaItem[];
  /** Shown in place of the rows when there is nothing on the list. */
  emptyLabel: string;
}) {
  return (
    <Card className="gap-0 rounded-[14px] p-4 md:p-5">
      <div className="flex items-baseline justify-between gap-2.5">
        <h2 className="text-[15px] font-bold leading-tight text-foreground">
          {title}
        </h2>
        {action}
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-[12.5px] text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {items.map((item) => {
            const Icon = AGENDA_ICONS[item.iconKey];
            const tone = AGENDA_TONE[item.tone];
            return (
              <button
                key={item.id}
                type="button"
                className="flex w-full items-center gap-2.5 rounded-[11px] border bg-muted/40 px-3 py-2.5 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-[9px] ${tone.tile}`}
                >
                  <Icon className="size-[15px]" strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold leading-[1.3] text-foreground">
                    {item.title}
                  </span>
                  <span
                    className={`mt-1 block text-[11px] font-semibold leading-none ${tone.when}`}
                  >
                    {item.when}
                  </span>
                </span>
                <ChevronRight
                  className="size-3.5 shrink-0 text-muted-foreground"
                  strokeWidth={2.2}
                />
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
