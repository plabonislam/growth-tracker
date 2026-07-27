import { CalendarClock, TriangleAlert } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CADENCE_BADGE } from '../../activity-sheet.constants';
import type { SessionLogRow } from '../../activity-sheet.types';

/**
 * Every session the club held this month. Wide enough, it is a table — five
 * columns that scan down. Below that it becomes one card per session, because a
 * five-column table on a phone is a horizontal scroll nobody performs.
 *
 * Attendance is the one column that can be empty: heads are counted after the
 * session, so a freshly logged session has none yet. It says "not recorded"
 * rather than 0, which would read as a session nobody came to.
 */
export function SessionLog({ sessions }: { sessions: SessionLogRow[] }) {
  const uncounted = sessions.filter((s) => s.attendance === null).length;

  return (
    <Card className="gap-0 rounded-[14px] p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <h2 className="text-[15px] font-bold leading-none tracking-tight text-foreground">
          Session log
        </h2>
        <span className="rounded-full bg-muted px-2.5 py-1.5 text-[10.5px] font-semibold leading-none text-muted-foreground">
          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}{' '}
          logged
        </span>
      </div>

      {/* Only ever about attendance — a session cannot be logged without a
          facilitator, so there is no such thing as a missing one. */}
      {uncounted > 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11.5px] font-medium leading-relaxed text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400">
          <TriangleAlert
            className="mt-px size-3.5 shrink-0"
            strokeWidth={2.2}
          />
          <span>
            {uncounted} {uncounted === 1 ? 'session has' : 'sessions have'} no
            headcount yet. Average attendance is worked out from the sessions
            that have one.
          </span>
        </p>
      )}

      {sessions.length === 0 ? (
        <p className="mt-4 rounded-[10px] border border-dashed py-8 text-center text-[12.5px] text-muted-foreground">
          No sessions were logged this month.
        </p>
      ) : (
        <>
          <div className="mt-4 hidden lg:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  {['Date', 'Cadence', 'Objective', 'Facilitator'].map(
                    (head) => (
                      <th
                        key={head}
                        className="px-2 pb-2.5 text-left text-[9.5px] font-semibold uppercase leading-none tracking-[0.1em] text-muted-foreground"
                      >
                        {head}
                      </th>
                    ),
                  )}
                  <th className="px-2 pb-2.5 text-right text-[9.5px] font-semibold uppercase leading-none tracking-[0.1em] text-muted-foreground">
                    Attendance
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b last:border-0">
                    <td className="px-2 py-3 align-top">
                      <span className="block text-[12.5px] font-semibold leading-tight text-foreground">
                        {session.day}
                      </span>
                      <span className="block text-[11px] leading-tight text-muted-foreground">
                        {session.weekday}
                      </span>
                    </td>
                    <td className="px-2 py-3 align-top">
                      <CadenceBadge cadence={session.cadence} />
                    </td>
                    <td className="px-2 py-3 align-top text-[12.5px] leading-snug text-foreground">
                      {session.objective}
                    </td>
                    <td className="px-2 py-3 align-top text-[12.5px] leading-snug text-muted-foreground">
                      {session.facilitator}
                    </td>
                    <td className="px-2 py-3 text-right align-top">
                      <Attendance session={session} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-4 space-y-2.5 lg:hidden">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="rounded-[11px] border bg-muted/30 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <CalendarClock
                    className="size-3.5 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <span className="text-[12.5px] font-semibold leading-none text-foreground">
                    {session.day}
                  </span>
                  <CadenceBadge cadence={session.cadence} />
                </div>

                <p className="mt-2 text-[12.5px] font-medium leading-snug text-foreground">
                  {session.objective}
                </p>

                <div className="mt-2.5 flex flex-wrap items-end justify-between gap-2">
                  <span className="text-[11.5px] leading-tight text-muted-foreground">
                    Facilitator: {session.facilitator}
                  </span>
                  <Attendance session={session} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

function CadenceBadge({ cadence }: { cadence: SessionLogRow['cadence'] }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md border px-2 py-1 text-[9.5px] font-semibold uppercase leading-none tracking-[0.1em]',
        CADENCE_BADGE[cadence],
      )}
    >
      {cadence}
    </span>
  );
}

function Attendance({ session }: { session: SessionLogRow }) {
  if (session.attendance === null) {
    return (
      <span className="inline-block text-right">
        <span className="block text-[13px] font-bold leading-none text-amber-600 dark:text-amber-500">
          —
        </span>
        <span className="mt-1 block text-[10.5px] leading-none text-amber-700/80 dark:text-amber-500/80">
          not recorded
        </span>
      </span>
    );
  }

  return (
    <span className="inline-block text-right">
      <span className="block text-[13px] font-bold leading-none text-foreground">
        {session.attendance}
      </span>
      <span className="mt-1 block text-[10.5px] leading-none text-muted-foreground">
        of {session.activeMembers} active
      </span>
    </span>
  );
}
