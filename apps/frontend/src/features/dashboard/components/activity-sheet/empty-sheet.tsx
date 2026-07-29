import { CalendarX2 } from 'lucide-react';

import { Card } from '@/components/ui/card';

/**
 * A month with nothing in it. Not an error and not a blank page — a club that
 * met nobody and enrolled nobody in December is a fact the sheet reports, so it
 * names the club and the month it looked at and points at the filters.
 */
export function EmptySheet({
  clubName,
  monthLabel,
}: {
  clubName: string;
  monthLabel: string;
}) {
  return (
    <Card className="items-center gap-0 rounded-[14px] border-dashed p-8 text-center md:p-12">
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <CalendarX2 className="size-5" strokeWidth={1.9} />
      </span>
      <h2 className="mt-3.5 text-base font-bold leading-tight text-foreground">
        No activity recorded
      </h2>
      <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-muted-foreground">
        No sessions, roster changes or certifications were recorded for{' '}
        {clubName} in {monthLabel}, so there is nothing to generate. Pick
        another month or club above.
      </p>
    </Card>
  );
}
