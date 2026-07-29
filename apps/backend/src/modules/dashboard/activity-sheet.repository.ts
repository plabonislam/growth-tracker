import { Injectable } from '@nestjs/common';
import { and, asc, between, eq, inArray, type SQL } from 'drizzle-orm';
import { MembershipStatus } from 'shared';

import { DatabaseService } from '../../core/database/database.service';
import {
  clubMembershipsTable,
  clubsTable,
} from '../../core/database/schema/clubs.schema';
import { sessionsTable } from '../../core/database/schema/sessions.schema';
import {
  topicMentorsTable,
  topicsTable,
} from '../../core/database/schema/topics.schema';
import { usersTable } from '../../core/database/schema/users.schema';

/** The rows on a roster. Applicants and leavers do not stand on one. */
const ON_ROSTER = [MembershipStatus.active, MembershipStatus.on_break];

/**
 * The reads behind a club's activity sheet that the metric board does not
 * already answer: the sessions themselves, and the people. Every count the
 * sheet needs is a `ClubMetricsRepository` count over a month-shaped window, so
 * none of them are repeated here.
 *
 * `clubId` of `null` reads across every club, which is the authority's view.
 */
@Injectable()
export class ActivitySheetRepository {
  constructor(private readonly db: DatabaseService) {}

  /** The club a sheet is headed with. Null id means it covers all of them. */
  async findClubName(clubId: string | null) {
    if (!clubId) return null;
    const [row] = await this.db.db
      .select({ name: clubsTable.name })
      .from(clubsTable)
      .where(eq(clubsTable.id, clubId));
    return row?.name ?? null;
  }

  /**
   * Every session held in the month, oldest first — the log is read as a diary,
   * so it runs forward rather than newest-first like a feed.
   *
   * `from`/`to` are calendar dates because `sessions.date` is one; both ends are
   * inclusive, which is exactly a month when passed its first and last day.
   */
  findSessions(clubId: string | null, from: string, to: string) {
    return this.db.db
      .select({
        id: sessionsTable.id,
        date: sessionsTable.date,
        type: sessionsTable.type,
        objective: sessionsTable.objective,
        facilitator: sessionsTable.facilitator,
        attendance: sessionsTable.participantCount,
        clubName: clubsTable.name,
      })
      .from(sessionsTable)
      .innerJoin(clubsTable, eq(sessionsTable.clubId, clubsTable.id))
      .where(
        this.and(
          between(sessionsTable.date, from, to),
          clubId ? eq(sessionsTable.clubId, clubId) : undefined,
        ),
      )
      .orderBy(asc(sessionsTable.date));
  }

  /**
   * Who stands on the roster, with the club they stand in and who coordinates
   * it — enough for the caller to name each person's role without a query per
   * member. Ordered by name so the list is stable between loads.
   */
  findRoster(clubId: string | null) {
    return this.db.db
      .select({
        userId: usersTable.id,
        name: usersTable.name,
        status: clubMembershipsTable.status,
        clubId: clubMembershipsTable.clubId,
        clubName: clubsTable.name,
        coordinatorId: clubsTable.coordinatorId,
      })
      .from(clubMembershipsTable)
      .innerJoin(usersTable, eq(clubMembershipsTable.userId, usersTable.id))
      .innerJoin(clubsTable, eq(clubMembershipsTable.clubId, clubsTable.id))
      .where(
        this.and(
          inArray(clubMembershipsTable.status, ON_ROSTER),
          eq(clubsTable.archived, false),
          clubId ? eq(clubMembershipsTable.clubId, clubId) : undefined,
        ),
      )
      .orderBy(asc(usersTable.name));
  }

  /**
   * Who mentors a topic in these clubs. A mentor holds the role through a
   * topic, so this is the (club, user) pairs that mentoring implies — one read
   * for the whole roster rather than one per member.
   */
  async findMentorPairs(clubId: string | null) {
    return this.db.db
      .selectDistinct({
        clubId: topicsTable.clubId,
        userId: topicMentorsTable.userId,
      })
      .from(topicMentorsTable)
      .innerJoin(topicsTable, eq(topicMentorsTable.topicId, topicsTable.id))
      .where(clubId ? eq(topicsTable.clubId, clubId) : undefined);
  }

  /** `and()` that tolerates the club filter being absent for an authority. */
  private and(...parts: (SQL | undefined)[]) {
    const present = parts.filter((part): part is SQL => part !== undefined);
    return present.length === 1 ? present[0] : and(...present);
  }
}
