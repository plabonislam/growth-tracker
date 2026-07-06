import { ChevronRight } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { AGENDA_ICONS, AGENDA_TONE } from '../dashboard.constants';
import type { AgendaItem } from '../dashboard.types';

export function AgendaCard({ items }: { items: AgendaItem[] }) {
  return (
    <Card className="gap-0 divide-y p-0">
      {items.map((item) => {
        const Icon = AGENDA_ICONS[item.iconKey];
        const tone = AGENDA_TONE[item.tone];
        return (
          <button
            key={item.id}
            type="button"
            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/40"
          >
            <span className="flex items-center gap-4">
              <span
                className={`flex size-12 items-center justify-center rounded-lg ${tone.tile}`}
              >
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  {item.title}
                </span>
                <span className={`block text-xs font-medium ${tone.when}`}>
                  {item.when}
                </span>
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
          </button>
        );
      })}
    </Card>
  );
}
