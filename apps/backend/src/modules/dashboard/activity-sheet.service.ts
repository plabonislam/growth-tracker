import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  MembershipStatus,
  SessionType,
  type ActivityRosterMember,
  type ActivitySession,
  type ActivitySheetQuery,
  type ActivitySheetResponse,
} from 'shared';

import { ActivitySheetRepository } from './activity-sheet.repository';
import { ClubMetricsRepository, type Window } from './club-metrics.repository';

interface Caller {
  userId: string;
  isAuthority: boolean;
}

/** A calendar month, as both a timestamp range and a pair of dates. */
interface MonthWindow extends Window {
  /** `2025-12-01` — `sessions.date` is a date, so it compares as one. */
  fromDay: string;
  toDay: string;
}

@Injectable()
export class ActivitySheetService {
  constructor(
    private readonly repo: ActivitySheetRepository,
    private readonly metrics: ClubMetricsRepository,
  ) {}

  /**
   * One club's activity sheet for one calendar month: the figures, the sessions
   * logged in it, and the roster behind them.
   *
   * A month with nothing in it is a real answer, not an error — the sheet comes
   * back with zeroes and empty lists, and the page reports it as a month
   * nothing was recorded in.
   */
  async getSheet(
    query: ActivitySheetQuery,
    caller: Caller,
  ): Promise<ActivitySheetResponse> {
    const clubId = await this.resolveScope(query.clubId, caller);
    const month = query.month ?? currentMonth();
    const current = monthWindow(month);
    const previous = monthWindow(monthBefore(month));

    const [
      clubName,
      sessions,
      rosterRows,
      mentorPairs,
      activeMembers,
      onBreak,
      sessionsCurrent,
      sessionsPrevious,
      joinedCurrent,
      joinedPrevious,
      droppedCurrent,
      droppedPrevious,
      certsCurrent,
      certsPrevious,
    ] = await Promise.all([
      this.repo.findClubName(clubId),
      this.repo.findSessions(clubId, current.fromDay, current.toDay),
      this.repo.findRoster(clubId),
      this.repo.findMentorPairs(clubId),
      // Point-in-time counts: where the club stands, not what moved.
      this.metrics.countMembersByStatus(clubId, MembershipStatus.active),
      this.metrics.countMembersByStatus(clubId, MembershipStatus.on_break),
      this.metrics.countSessions(clubId, current),
      this.metrics.countSessions(clubId, previous),
      this.metrics.countJoiners(clubId, current),
      this.metrics.countJoiners(clubId, previous),
      this.metrics.countStatusChanges(
        clubId,
        MembershipStatus.dropped_out,
        current,
      ),
      this.metrics.countStatusChanges(
        clubId,
        MembershipStatus.dropped_out,
        previous,
      ),
      this.metrics.countCertifications(clubId, current),
      this.metrics.countCertifications(clubId, previous),
    ]);

    // Only the sessions that were actually counted feed the average — the rest
    // have not been answered yet, and averaging them in as 0 would invent an
    // absence nobody recorded.
    const counted = sessions.filter((s) => s.attendance !== null);
    const attendanceTotal = counted.reduce(
      (sum, s) => sum + (s.attendance ?? 0),
      0,
    );

    return {
      clubId,
      clubName: clubName ?? 'All clubs',
      month,
      stats: {
        sessionsHeld: metric(sessionsCurrent, sessionsPrevious),
        avgAttendance:
          counted.length === 0
            ? null
            : Math.round(attendanceTotal / counted.length),
        countedSessions: counted.length,
        activeMembers,
        onBreak,
        joined: metric(joinedCurrent, joinedPrevious),
        dropped: metric(droppedCurrent, droppedPrevious),
        certifications: metric(certsCurrent, certsPrevious),
      },
      sessions: sessions.map(toSession),
      roster: toRoster(rosterRows, mentorPairs),
    };
  }

  /**
   * Which club the sheet covers. `null` means every club, which only an
   * authority may ask for — anyone else names one club and has to answer for it.
   */
  private async resolveScope(
    clubId: string | undefined,
    caller: Caller,
  ): Promise<string | null> {
    if (caller.isAuthority) return clubId ?? null;

    if (!clubId) {
      throw new BadRequestException('Name the club you want a sheet for');
    }

    const allowed = await this.metrics.hasClubRole(clubId, caller.userId);
    if (!allowed) throw new ForbiddenException();

    return clubId;
  }
}

function metric(current: number, previous: number) {
  return { value: current, delta: current - previous };
}

function toSession(row: {
  id: string;
  date: string;
  type: string;
  objective: string;
  facilitator: string;
  attendance: number | null;
  clubName: string;
}): ActivitySession {
  return {
    id: row.id,
    date: row.date,
    // The column is a text enum in Drizzle; the contract narrows it back.
    type:
      row.type === SessionType.monthly
        ? SessionType.monthly
        : SessionType.weekly,
    objective: row.objective,
    facilitator: row.facilitator,
    attendance: row.attendance,
    clubName: row.clubName,
  };
}

/**
 * Roster rows plus the club's coordinator and its mentors, resolved into one
 * role each. Coordinator outranks mentor: someone who runs the club and happens
 * to mentor a topic in it is read as its coordinator.
 */
function toRoster(
  rows: {
    userId: string;
    name: string;
    status: string;
    clubId: string;
    clubName: string;
    coordinatorId: string | null;
  }[],
  // A topic can carry a mentor slot with nobody in it; such a pair matches no
  // member, so it is kept rather than special-cased.
  mentorPairs: { clubId: string; userId: string | null }[],
): ActivityRosterMember[] {
  const mentors = new Set(
    mentorPairs.map((pair) => `${pair.clubId}:${pair.userId}`),
  );

  return rows.map((row) => ({
    userId: row.userId,
    name: row.name,
    role:
      row.coordinatorId === row.userId
        ? 'coordinator'
        : mentors.has(`${row.clubId}:${row.userId}`)
          ? 'mentor'
          : 'member',
    status:
      row.status === MembershipStatus.on_break
        ? 'on_break'
        : ('active' as const),
    clubName: row.clubName,
  }));
}

/** `2025-12` for the month in progress, in the server's own calendar. */
function currentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** `2025-01` → `2024-12`. */
function monthBefore(month: string): string {
  const [year, index] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, index - 2, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * The month as a window. Built in UTC so the boundary does not drift with the
 * server's time zone, and closed on the last millisecond of the month so two
 * consecutive months can never count the same row twice.
 */
function monthWindow(month: string): MonthWindow {
  const [year, index] = month.split('-').map(Number);
  const from = new Date(Date.UTC(year, index - 1, 1));
  const to = new Date(Date.UTC(year, index, 1) - 1);

  return {
    from,
    to,
    fromDay: from.toISOString().slice(0, 10),
    toDay: to.toISOString().slice(0, 10),
  };
}
