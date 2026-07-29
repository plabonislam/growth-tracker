import { GraduationCap } from 'lucide-react';

import { Card } from '@/components/ui/card';
import type { JourneySummary } from '../dashboard.types';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_TONES = ['bg-primary', 'bg-sky-500', 'bg-emerald-500'];

/**
 * The club the learner is in: what it is, how far through it they are, and who
 * else is in it. The people sit in a panel at the foot of the card, pinned
 * there so this card and the topic beside it end on the same line.
 */
export function JourneyCard({ journey }: { journey: JourneySummary }) {
  return (
    <Card className="h-full gap-0 rounded-[14px] p-4 md:p-5 lg:p-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <span className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1.5 text-[9.5px] font-semibold uppercase leading-none tracking-[0.12em] text-primary">
          Active club
        </span>
        <span className="text-[11.5px] font-medium leading-none text-muted-foreground">
          Member since {journey.memberSince}
        </span>
      </div>

      <div className="mt-3.5 flex items-center gap-3">
        <span className="inline-flex size-[42px] shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <GraduationCap className="size-5" strokeWidth={1.9} />
        </span>
        <h3 className="min-w-0 text-base font-bold leading-tight tracking-tight text-foreground md:text-lg lg:text-xl">
          {journey.clubName}
        </h3>
      </div>

      <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
        {journey.description}
      </p>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-2.5">
          <span className="text-[11.5px] font-semibold leading-none text-muted-foreground">
            Overall progress
          </span>
          <span className="text-[13px] font-bold leading-none text-primary">
            {journey.progressPct}%
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
            style={{ width: `${journey.progressPct}%` }}
          />
        </div>
      </div>

      <div className="mt-auto pt-3.5 md:pt-5">
        <div className="flex items-center gap-2.5 rounded-[11px] border bg-muted/40 px-3 py-2.5">
          <span className="flex shrink-0 -space-x-2.5">
            {journey.memberNames.map((name, i) => (
              <span
                key={name}
                className={`flex size-[26px] items-center justify-center rounded-full text-[9px] font-semibold text-white ring-2 ring-card ${
                  AVATAR_TONES[i % AVATAR_TONES.length]
                }`}
              >
                {initials(name)}
              </span>
            ))}
            <span className="flex size-[26px] items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground ring-2 ring-card">
              +{journey.extraMembers}
            </span>
          </span>
          <p className="min-w-0 flex-1 text-[11.5px] font-medium leading-[1.35] text-muted-foreground">
            {journey.membersNote}
          </p>
        </div>
      </div>
    </Card>
  );
}
