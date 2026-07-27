import {
  Award,
  CalendarCheck,
  CircleCheckBig,
  PauseCircle,
  UserMinus,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react';
import type { DashboardQuery } from 'shared';

import { cn } from '@/lib/utils';
import { MetricCard } from './metric-card';
import { METRIC_TONE } from '../dashboard.constants';
import { useClubMetrics } from '../hooks/use-dashboard';

const RANGES: { value: DashboardQuery['range']; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '1m', label: '1 month' },
  { value: '6m', label: '6 months' },
];

export function ClubMetricsBoard({
  clubId,
  range,
  onRangeChange,
}: {
  /** Omitted for an authority reading every club at once. */
  clubId?: string;
  range: DashboardQuery['range'];
  onRangeChange: (range: DashboardQuery['range']) => void;
}) {
  const { data, isLoading, isError } = useClubMetrics({ clubId, range });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold leading-none tracking-tight text-foreground">
          Reporting
        </h2>

        {/* The range every card is measured over, and compared against. */}
        <div className="flex gap-[3px] rounded-xl border bg-muted p-1">
          {RANGES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onRangeChange(option.value)}
              className={cn(
                'rounded-[9px] px-3 py-1.5 text-[12.5px] font-semibold transition-colors',
                range === option.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <p className="py-8 text-center text-sm text-destructive">
          Couldn’t load these figures. Please try again.
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <MetricCard
            label="Total members"
            value={data.totalMembers.value}
            delta={null}
            note="Active right now"
            icon={Users}
            tone={METRIC_TONE.blue}
          />
          <MetricCard
            label="Active members"
            value={data.activeMembers.value}
            delta={data.activeMembers.delta}
            icon={UsersRound}
            tone={METRIC_TONE.blue}
          />
          <MetricCard
            label="On break"
            value={data.onBreak.value}
            delta={null}
            note="Paused right now"
            icon={PauseCircle}
            tone={METRIC_TONE.orange}
          />
          <MetricCard
            label="New joiners"
            value={data.newJoiners.value}
            delta={data.newJoiners.delta}
            icon={UserPlus}
            tone={METRIC_TONE.emerald}
          />
          <MetricCard
            label="Dropped out"
            value={data.droppedOut.value}
            delta={data.droppedOut.delta}
            icon={UserMinus}
            tone={METRIC_TONE.orange}
          />
          <MetricCard
            label="Sessions held"
            value={data.sessionsHeld.value}
            delta={data.sessionsHeld.delta}
            icon={CalendarCheck}
            tone={METRIC_TONE.violet}
            // Says why rather than reading as a club that never meets.
            unavailable={
              data.sessionsHeld.value === 0
                ? 'No way to log a session yet'
                : undefined
            }
          />
          <MetricCard
            label="Modules completed"
            value={data.modulesCompleted.value}
            delta={data.modulesCompleted.delta}
            icon={CircleCheckBig}
            tone={METRIC_TONE.emerald}
          />
          <MetricCard
            label="Certifications"
            value={data.certificationsObtained.value}
            delta={data.certificationsObtained.delta}
            icon={Award}
            tone={METRIC_TONE.orange}
            unavailable={
              data.certificationsObtained.value === 0
                ? 'Nothing awards these yet'
                : undefined
            }
          />
        </div>
      )}
    </section>
  );
}
