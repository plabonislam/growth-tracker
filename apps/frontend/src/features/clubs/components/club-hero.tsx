import { CLUB_ICONS } from '../clubs.constants';
import type { ClubDetail, ClubIconKey } from '../clubs.types';

type ClubHeroProps = Pick<
  ClubDetail,
  | 'name'
  | 'topicsCount'
  | 'membersLabel'
  | 'sessionsCount'
  | 'mentorsCount'
  | 'coordinatorName'
> & {
  /** Optional supporting line under the title. */
  tagline?: string;
  /** Club category icon; falls back to the engineering glyph. */
  iconKey?: ClubIconKey;
};

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="shrink-0 rounded-xl bg-muted p-3.5 max-[479px]:min-w-23 md:p-4">
      <div className="font-serif text-xl font-bold leading-none text-foreground md:text-[22px] lg:text-2xl">
        {value}
      </div>
      <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

/** "Priya Roy" → "PR"; single-word names fall back to the first two letters. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function CoordinatorChip({ name }: { name: string }) {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-xl bg-muted px-3 py-2.5 max-[479px]:w-full">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground md:size-9 md:text-xs">
        {initialsOf(name)}
      </div>
      <div className="min-w-0 leading-tight">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Coordinator
        </div>
        <div className="truncate text-[13px] font-semibold text-foreground">
          {name}
        </div>
      </div>
    </div>
  );
}

/**
 * Club detail hero — identity block (icon, name, tagline) with the coordinator
 * chip inline top-right, over a divider-topped stat grid. Mirrors "Club Details
 * Page Responsive": the chip drops below the title on mobile and the stats go
 * scroll-strip → 2×2 → 4-up across the breakpoints.
 */
export function ClubHero({
  name,
  topicsCount,
  membersLabel,
  sessionsCount,
  mentorsCount,
  coordinatorName,
  tagline,
  iconKey = 'engineering',
}: ClubHeroProps) {
  const Icon = CLUB_ICONS[iconKey];

  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm md:gap-4.5 md:p-6 lg:gap-6 lg:px-10 lg:py-8">
      {/* Chip drops below the title under 480px, inline top-right above it */}
      <div className="flex flex-col gap-4 min-[480px]:flex-row min-[480px]:items-start min-[480px]:justify-between min-[480px]:gap-5 lg:gap-6">
        <div className="flex min-w-0 items-start gap-3 md:gap-3.5 lg:gap-4">
          <div className="flex size-10.5 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground md:size-12 lg:size-13">
            <Icon className="size-5 md:size-6" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-[19px] font-bold leading-tight tracking-tight text-foreground md:text-[23px] lg:text-[28px]">
              {name}
            </h1>
            {tagline && (
              <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground md:text-[13px] lg:text-sm">
                {tagline}
              </p>
            )}
          </div>
        </div>

        {coordinatorName && <CoordinatorChip name={coordinatorName} />}
      </div>

      <div className="h-px bg-border" />

      {/* < 480px: scroll strip bleeding to the card edge. 480–1023: 2×2. ≥ 1024: 4-up. */}
      <div className="flex gap-2 overflow-x-auto max-[479px]:-mx-5 max-[479px]:px-5 min-[480px]:grid min-[480px]:grid-cols-2 min-[480px]:gap-3 lg:grid-cols-4 lg:gap-4">
        <Stat value={topicsCount} label="Active topics" />
        <Stat value={membersLabel} label="Members" />
        <Stat value={sessionsCount} label="Sessions held" />
        <Stat value={mentorsCount} label="Mentors" />
      </div>
    </section>
  );
}
