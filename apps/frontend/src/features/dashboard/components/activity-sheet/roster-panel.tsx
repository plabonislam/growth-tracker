import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ROSTER_PAGE_SIZE, initialsOf } from '../../activity-sheet.constants';
import type { RosterMember, RosterTab } from '../../activity-sheet.types';

const TABS: { key: RosterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'break', label: 'On break' },
];

/**
 * Who is in the club, and who has paused. Filtering, searching and paging all
 * happen here on a roster the sheet already holds — a club is tens of people,
 * not thousands, so a round trip per keystroke would buy nothing.
 */
export function RosterPanel({
  members,
  joined,
  dropped,
}: {
  members: RosterMember[];
  /** Membership movement in the month the sheet covers. */
  joined: number;
  dropped: number;
}) {
  const [tab, setTab] = useState<RosterTab>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const onBreakCount = members.filter((m) => m.onBreak).length;
  const counts: Record<RosterTab, number> = {
    all: members.length,
    active: members.length - onBreakCount,
    break: onBreakCount,
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return members
      .filter((m) =>
        tab === 'all' ? true : tab === 'break' ? m.onBreak : !m.onBreak,
      )
      .filter((m) => !needle || m.name.toLowerCase().includes(needle));
  }, [members, tab, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROSTER_PAGE_SIZE));
  // Filtering can strip the page out from under the reader, so the page is
  // clamped on render rather than reset by an effect.
  const current = Math.min(page, totalPages);
  const start = (current - 1) * ROSTER_PAGE_SIZE;
  const visible = filtered.slice(start, start + ROSTER_PAGE_SIZE);

  const reset = (next: () => void) => {
    next();
    setPage(1);
  };

  return (
    <Card className="gap-0 rounded-[14px] p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <h2 className="text-[15px] font-bold leading-none tracking-tight text-foreground">
          Roster
        </h2>
        <span className="rounded-full bg-muted px-2.5 py-1.5 text-[10.5px] font-semibold leading-none text-muted-foreground">
          {members.length} total · {onBreakCount} on break
        </span>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
        <div className="flex gap-[3px] rounded-xl border bg-muted p-1">
          {TABS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => reset(() => setTab(option.key))}
              className={cn(
                'rounded-[9px] px-3 py-1.5 text-[12.5px] font-semibold transition-colors',
                tab === option.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label} {counts[option.key]}
            </button>
          ))}
        </div>

        <div className="relative min-w-[180px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={2}
          />
          <Input
            value={query}
            onChange={(e) => reset(() => setQuery(e.target.value))}
            placeholder="Search members"
            aria-label="Search members by name"
            className="h-10 rounded-[10px] pl-9 text-[12.5px]"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 rounded-[10px] border border-dashed py-8 text-center text-[12.5px] text-muted-foreground">
          {query.trim()
            ? `No member matches “${query.trim()}”.`
            : 'Nobody in this slice of the roster.'}
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-2.5 min-[560px]:grid-cols-2 xl:grid-cols-3">
          {visible.map((member) => (
            <li
              key={member.id}
              className={cn(
                'flex items-center gap-2.5 rounded-[11px] border p-2.5',
                member.onBreak
                  ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20'
                  : 'bg-muted/30',
              )}
            >
              <span
                className={cn(
                  'inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold',
                  member.onBreak
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                    : 'bg-primary/10 text-primary',
                )}
              >
                {initialsOf(member.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold leading-tight text-foreground">
                  {member.name}
                </span>
                <span className="block truncate text-[11px] leading-tight text-muted-foreground">
                  {member.onBreak ? 'On break' : member.role}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t pt-3.5">
        <span className="text-[11.5px] leading-none text-muted-foreground">
          {filtered.length === 0
            ? 'No members to show'
            : `Showing ${start + 1}–${Math.min(
                start + ROSTER_PAGE_SIZE,
                filtered.length,
              )} of ${filtered.length}`}
          {' · '}
          {joined} joined · {dropped} dropped out this month
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <PageButton
              label="Previous page"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft className="size-3.5" strokeWidth={2.4} />
            </PageButton>
            <span className="px-1 text-[11.5px] font-semibold text-muted-foreground">
              {current} / {totalPages}
            </span>
            <PageButton
              label="Next page"
              disabled={current === totalPages}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight className="size-3.5" strokeWidth={2.4} />
            </PageButton>
          </div>
        )}
      </div>
    </Card>
  );
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-lg border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
