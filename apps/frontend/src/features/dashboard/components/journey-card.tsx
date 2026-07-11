import { Award, CalendarDays } from 'lucide-react';

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

const AVATAR_TONES = ['bg-primary', 'bg-indigo-500', 'bg-emerald-500'];

export function JourneyCard({ journey }: { journey: JourneySummary }) {
  return (
    <Card className="h-full gap-4 p-5 md:p-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-block rounded bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              Current Club
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              Member since {journey.memberSince}
            </span>
          </div>
          <h3 className="font-serif text-xl font-semibold leading-tight">
            {journey.clubName}
          </h3>
        </div>
        <span className="flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700">
          <Award className="size-3.5" />
          {journey.cohortBadge}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-end justify-between text-sm font-medium">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="text-primary">{journey.progressPct}% Complete</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${journey.progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {journey.memberNames.map((name, i) => (
            <span
              key={name}
              className={`flex size-8 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-card ${
                AVATAR_TONES[i % AVATAR_TONES.length]
              }`}
            >
              {initials(name)}
            </span>
          ))}
          <span className="flex size-8 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground ring-2 ring-card">
            +{journey.extraMembers}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{journey.membersNote}</p>
      </div>
    </Card>
  );
}
