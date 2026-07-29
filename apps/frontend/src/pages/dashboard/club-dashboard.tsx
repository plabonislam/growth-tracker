import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useClubs } from '@/features/clubs/hooks/use-clubs';
import {
  monthId,
  recentMonths,
} from '@/features/dashboard/activity-sheet.constants';
import { downloadSheet } from '@/features/dashboard/activity-sheet.export';
import { EmptySheet } from '@/features/dashboard/components/activity-sheet/empty-sheet';
import { RosterPanel } from '@/features/dashboard/components/activity-sheet/roster-panel';
import { SessionLog } from '@/features/dashboard/components/activity-sheet/session-log';
import { SheetMetrics } from '@/features/dashboard/components/activity-sheet/sheet-metrics';
import {
  SheetToolbar,
  type ClubOption,
} from '@/features/dashboard/components/activity-sheet/sheet-toolbar';
import { useActivitySheet } from '@/features/dashboard/hooks/use-activity-sheet';
import { usePendingEnrollmentsCount } from '@/features/enrollments/hooks/use-enrollments';

/**
 * What a coordinator, mentor or authority sees at `/dashboard`: the club's
 * activity sheet for a month — the figures, the sessions held, and the roster
 * behind them.
 *
 * The club is theirs, not chosen — `GET /clubs` marks which one each caller
 * coordinates or mentors. An authority answers for all of them, so they pick.
 */
export function ClubDashboard() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: clubs = [], isLoading: clubsLoading } = useClubs();

  const months = useMemo(() => recentMonths(), []);
  const [month, setMonth] = useState(() => monthId(new Date()));

  const isAuthority = user?.roles?.isAuthority === true;
  const myClubs = useMemo(() => clubs.filter((c) => c.role !== null), [clubs]);

  // An authority starts across every club and narrows from there; everyone
  // else has exactly the clubs they run.
  const [selectedClubId, setSelectedClubId] = useState<string | undefined>(
    undefined,
  );
  const clubId = isAuthority ? selectedClubId : (myClubs[0]?.id ?? undefined);
  const club = clubs.find((c) => c.id === clubId);
  const clubName = club?.name ?? (isAuthority ? 'All clubs' : 'Your club');

  const clubOptions = useMemo<ClubOption[]>(
    () =>
      (isAuthority ? clubs : myClubs).map((option) => ({
        id: option.id,
        name: option.name,
        note: `${option.members} ${option.members === 1 ? 'member' : 'members'}`,
      })),
    [isAuthority, clubs, myClubs],
  );

  // The API refuses a non-authority who names no club, so the sheet waits
  // until `GET /clubs` has said which club is theirs.
  const { sheet, isLoading, isError } = useActivitySheet({
    clubId,
    month,
    enabled: isAuthority || Boolean(clubId),
  });

  const { total: pendingRequests } = usePendingEnrollmentsCount({
    enabled: true,
  });

  // Nothing to report on: not an authority, and running no club.
  const hasNoClub = !isAuthority && !clubsLoading && myClubs.length === 0;

  // A month with no sessions, no roster movement and no members is a month
  // with no sheet — reported as such rather than as five zeroes.
  const isEmptyMonth =
    sheet !== null &&
    sheet.sessions.length === 0 &&
    sheet.roster.length === 0 &&
    sheet.joined === 0 &&
    sheet.dropped === 0;

  return (
    <div className="pb-16">
      <main className="mx-auto max-w-[1560px] space-y-4 px-4 py-6 md:space-y-5 md:px-6 md:py-8 lg:space-y-6">
        {hasNoClub ? (
          <Card className="items-start gap-2 rounded-[14px] border-dashed p-5">
            <h2 className="text-base font-bold text-foreground">
              No club to report on
            </h2>
            <p className="max-w-md text-[12.5px] leading-relaxed text-muted-foreground">
              You don’t coordinate a club or mentor a topic yet. An authority
              assigns both.
            </p>
          </Card>
        ) : (
          <>
            <SheetToolbar
              heading={sheet?.clubName ?? clubName}
              note={
                sheet?.generatedNote ??
                'How this club is running, and what is waiting on you.'
              }
              hasData={sheet !== null && !isEmptyMonth}
              clubs={clubOptions}
              clubId={clubId}
              onClubChange={setSelectedClubId}
              months={months}
              monthId={month}
              onMonthChange={setMonth}
              onExport={sheet ? () => downloadSheet(sheet) : undefined}
            />

            {/* The queue comes before the figures: it is the part only this
                person can clear. */}
            <Card className="flex-row flex-wrap items-center justify-between gap-3 rounded-[14px] p-4 md:p-5">
              <div className="min-w-0">
                <h2 className="text-[15px] font-bold leading-tight text-foreground">
                  {pendingRequests > 0
                    ? `${pendingRequests} ${pendingRequests === 1 ? 'request' : 'requests'} waiting on you`
                    : 'Nothing waiting on you'}
                </h2>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                  {pendingRequests > 0
                    ? 'Applications to join, and topics learners want to enroll in.'
                    : 'Every application and enrollment request has been answered.'}
                </p>
              </div>
              {pendingRequests > 0 && (
                <Button
                  onClick={() => navigate('/pending-enrollments')}
                  className="shrink-0 rounded-[10px]"
                >
                  Review requests
                </Button>
              )}
            </Card>

            {isError && (
              <p className="py-8 text-center text-sm text-destructive">
                Couldn’t load this sheet. Please try again.
              </p>
            )}

            {/* Mirrors the loaded shape: metric strip, then the two panels. */}
            {isLoading && (
              <div className="space-y-4 md:space-y-5 lg:space-y-6">
                <div className="grid grid-cols-1 gap-3 min-[560px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-28 animate-pulse rounded-xl bg-muted"
                    />
                  ))}
                </div>
                <div className="h-64 animate-pulse rounded-xl bg-muted" />
                <div className="h-64 animate-pulse rounded-xl bg-muted" />
              </div>
            )}

            {sheet &&
              (isEmptyMonth ? (
                <EmptySheet
                  clubName={sheet.clubName}
                  monthLabel={sheet.monthLabel}
                />
              ) : (
                <>
                  <SheetMetrics metrics={sheet.metrics} />
                  <SessionLog sessions={sheet.sessions} />
                  <RosterPanel
                    members={sheet.roster}
                    joined={sheet.joined}
                    dropped={sheet.dropped}
                  />
                </>
              ))}
          </>
        )}
      </main>
    </div>
  );
}
