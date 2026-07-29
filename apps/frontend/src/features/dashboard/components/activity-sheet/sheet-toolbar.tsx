import {
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Download,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { MonthOption } from '../../activity-sheet.types';

export interface ClubOption {
  id: string;
  name: string;
  /** "16 members" — sits beside the name so a club can be picked by size. */
  note?: string;
}

/** The three controls share one shell so they line up as a single group. */
const CONTROL =
  'flex min-h-11 w-full items-center gap-2.5 rounded-[10px] border bg-card px-3.5 py-3 text-[12.5px] font-semibold text-foreground transition-colors hover:border-muted-foreground/40';

/**
 * The head of the sheet: what it covers on the left, and on the right the
 * controls that decide it. Club and month drive every figure below, so they sit
 * with the export beside the heading rather than above their own sections.
 */
export function SheetToolbar({
  heading,
  note,
  hasData,
  clubs,
  clubId,
  onClubChange,
  months,
  monthId,
  onMonthChange,
  onExport,
}: {
  heading: string;
  note: string;
  /** Drives the pill: a generated sheet, or a month with nothing in it. */
  hasData: boolean;
  /** Empty for a coordinator, who has no club to choose between. */
  clubs: ClubOption[];
  /** Undefined is "All clubs", which only an authority may ask for. */
  clubId?: string;
  onClubChange: (clubId: string | undefined) => void;
  months: MonthOption[];
  monthId: string;
  onMonthChange: (monthId: string) => void;
  onExport?: () => void;
}) {
  const club = clubs.find((option) => option.id === clubId);
  const month = months.find((option) => option.id === monthId);

  return (
    <div className="flex flex-wrap items-end justify-between gap-3.5">
      <div className="min-w-0 flex-[1_1_260px]">
        <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.13em] text-muted-foreground">
          Monthly activity reporting
        </span>

        <h1 className="mt-2.5 text-[21px] font-bold leading-[1.14] tracking-tight text-foreground md:text-2xl lg:text-[30px]">
          {heading}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-semibold uppercase leading-none tracking-[0.05em]',
              hasData
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400',
            )}
          >
            <span
              className={cn(
                'size-1.5 rounded-full',
                hasData ? 'bg-emerald-500' : 'bg-amber-500',
              )}
            />
            {hasData ? 'Generated' : 'No data'}
          </span>
          <span className="text-[11.5px] font-medium leading-[1.4] text-muted-foreground">
            {note}
          </span>
        </div>
      </div>

      {/* Filters and export as one group, right-aligned against the heading —
          they wrap to full width together once the row runs out of room. */}
      <div className="flex min-w-0 flex-[0_1_auto] flex-wrap items-center gap-2 max-[639px]:flex-1">
        {/* An authority reads across clubs and narrows from here; a coordinator
            has exactly one, so the control never appears for them. */}
        {clubs.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                CONTROL,
                'min-w-0 flex-1 sm:w-[188px] sm:flex-none',
              )}
            >
              <Compass
                className="size-3.5 shrink-0 text-muted-foreground"
                strokeWidth={1.9}
              />
              <span className="min-w-0 flex-1 truncate text-left">
                {club?.name ?? 'All clubs'}
              </span>
              <ChevronDown
                className="size-3 shrink-0 text-muted-foreground"
                strokeWidth={2.4}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[230px]">
              <DropdownMenuItem onClick={() => onClubChange(undefined)}>
                <span className="flex-1 text-[12.5px] font-semibold">
                  All clubs
                </span>
                {clubId === undefined && (
                  <Check className="size-3.5 text-primary" strokeWidth={2.6} />
                )}
              </DropdownMenuItem>
              {clubs.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => onClubChange(option.id)}
                >
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">
                    {option.name}
                  </span>
                  {option.note && (
                    <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
                      {option.note}
                    </span>
                  )}
                  {clubId === option.id && (
                    <Check
                      className="size-3.5 text-primary"
                      strokeWidth={2.6}
                    />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(CONTROL, 'min-w-0 flex-1 sm:w-[172px] sm:flex-none')}
          >
            <CalendarDays
              className="size-3.5 shrink-0 text-muted-foreground"
              strokeWidth={1.9}
            />
            <span className="min-w-0 flex-1 truncate text-left">
              {month?.label ?? 'Pick a month'}
            </span>
            <ChevronDown
              className="size-3 shrink-0 text-muted-foreground"
              strokeWidth={2.4}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            {months.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => onMonthChange(option.id)}
              >
                <span className="flex-1 text-[12.5px] font-semibold">
                  {option.label}
                </span>
                {/* Says which months are worth opening before one is. */}
                {option.empty && (
                  <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.05em] text-amber-700 dark:text-amber-500">
                    No sheet
                  </span>
                )}
                {monthId === option.id && (
                  <Check className="size-3.5 text-primary" strokeWidth={2.6} />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {onExport && (
          <button
            type="button"
            onClick={onExport}
            disabled={!hasData}
            className={cn(
              CONTROL,
              'w-auto justify-center hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 max-[639px]:flex-1',
            )}
          >
            <Download className="size-3.5 shrink-0" strokeWidth={1.9} />
            Export sheet
          </button>
        )}
      </div>
    </div>
  );
}
