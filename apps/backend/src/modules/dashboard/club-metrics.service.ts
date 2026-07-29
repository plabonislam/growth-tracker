import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  MembershipStatus,
  type DashboardQuery,
  type DashboardResponse,
} from 'shared';

import { ClubMetricsRepository, type Window } from './club-metrics.repository';

interface Caller {
  userId: string;
  isAuthority: boolean;
}

/** How many days each range covers. The previous period is the same length. */
const RANGE_DAYS: Record<DashboardQuery['range'], number> = {
  '7d': 7,
  '1m': 30,
  '6m': 180,
};

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ClubMetricsService {
  constructor(private readonly repo: ClubMetricsRepository) {}

  /**
   * The club reporting board: eight counts, each against the period asked for
   * and the one immediately before it, so every card carries a direction as
   * well as a number.
   *
   * An authority may leave `clubId` off to read every club at once. Everyone
   * else answers for one club and must have a role in it.
   */
  async getDashboard(
    query: DashboardQuery,
    caller: Caller,
  ): Promise<DashboardResponse> {
    const clubId = await this.resolveScope(query.clubId, caller);
    const { current, previous } = this.windowsFor(query.range);

    const [
      totalMembers,
      onBreak,
      activeCurrent,
      activePrevious,
      joinersCurrent,
      joinersPrevious,
      droppedCurrent,
      droppedPrevious,
      sessionsCurrent,
      sessionsPrevious,
      modulesCurrent,
      modulesPrevious,
      certsCurrent,
      certsPrevious,
    ] = await Promise.all([
      // Point-in-time counts: where the club stands, not what moved.
      this.repo.countMembersByStatus(clubId, MembershipStatus.active),
      this.repo.countMembersByStatus(clubId, MembershipStatus.on_break),
      this.repo.countStatusChanges(clubId, MembershipStatus.active, current),
      this.repo.countStatusChanges(clubId, MembershipStatus.active, previous),
      this.repo.countJoiners(clubId, current),
      this.repo.countJoiners(clubId, previous),
      this.repo.countStatusChanges(
        clubId,
        MembershipStatus.dropped_out,
        current,
      ),
      this.repo.countStatusChanges(
        clubId,
        MembershipStatus.dropped_out,
        previous,
      ),
      this.repo.countSessions(clubId, current),
      this.repo.countSessions(clubId, previous),
      this.repo.countModulesCompleted(clubId, current),
      this.repo.countModulesCompleted(clubId, previous),
      this.repo.countCertifications(clubId, current),
      this.repo.countCertifications(clubId, previous),
    ]);

    return {
      // A snapshot has nothing to compare against, so its delta is 0.
      totalMembers: { value: totalMembers, delta: 0 },
      onBreak: { value: onBreak, delta: 0 },
      activeMembers: this.metric(activeCurrent, activePrevious),
      newJoiners: this.metric(joinersCurrent, joinersPrevious),
      droppedOut: this.metric(droppedCurrent, droppedPrevious),
      sessionsHeld: this.metric(sessionsCurrent, sessionsPrevious),
      modulesCompleted: this.metric(modulesCurrent, modulesPrevious),
      certificationsObtained: this.metric(certsCurrent, certsPrevious),
    };
  }

  private metric(current: number, previous: number) {
    return { value: current, delta: current - previous };
  }

  /**
   * Which club the numbers cover. `null` means every club, which only an
   * authority may ask for — anyone else names one club and has to answer for it.
   */
  private async resolveScope(
    clubId: string | undefined,
    caller: Caller,
  ): Promise<string | null> {
    if (caller.isAuthority) return clubId ?? null;

    if (!clubId) {
      throw new BadRequestException('Name the club you want figures for');
    }

    const allowed = await this.repo.hasClubRole(clubId, caller.userId);
    if (!allowed) throw new ForbiddenException();

    return clubId;
  }

  /** The period asked for, and the one of equal length before it. */
  private windowsFor(range: DashboardQuery['range']): {
    current: Window;
    previous: Window;
  } {
    const days = RANGE_DAYS[range];
    const now = new Date();
    const currentFrom = new Date(now.getTime() - days * DAY_MS);
    const previousFrom = new Date(now.getTime() - 2 * days * DAY_MS);

    return {
      current: { from: currentFrom, to: now },
      previous: { from: previousFrom, to: currentFrom },
    };
  }
}
