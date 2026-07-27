import { Injectable } from '@nestjs/common';
import { and, between, count, eq, type SQL } from 'drizzle-orm';
import {
  CertificationStatus,
  MembershipStatus,
  ModuleProgressStatus,
} from 'shared';

import { DatabaseService } from '../../core/database/database.service';
import {
  clubMembershipsTable,
  clubsTable,
} from '../../core/database/schema/clubs.schema';
import { courseModulesTable } from '../../core/database/schema/course-modules.schema';
import {
  certificationsTable,
  moduleProgressTable,
} from '../../core/database/schema/progress.schema';
import { sessionsTable } from '../../core/database/schema/sessions.schema';
import {
  topicMentorsTable,
  topicsTable,
} from '../../core/database/schema/topics.schema';

/** A half-open period the metrics are counted over. */
export interface Window {
  from: Date;
  to: Date;
}

/**
 * Club reporting counts. Every metric is a `COUNT` run twice — once over the
 * period asked for and once over the one before it — so the service can say
 * both where a club stands and which way it is moving. Nothing is cached: the
 * board is read fresh on every load (A9).
 *
 * `clubId` of `null` counts across every club, which is the authority's view.
 */
@Injectable()
export class ClubMetricsRepository {
  constructor(private readonly db: DatabaseService) {}

  /** Members in a given state right now, regardless of when they got there. */
  async countMembersByStatus(clubId: string | null, status: MembershipStatus) {
    const [row] = await this.db.db
      .select({ count: count() })
      .from(clubMembershipsTable)
      .where(
        this.and(
          eq(clubMembershipsTable.status, status),
          clubId ? eq(clubMembershipsTable.clubId, clubId) : undefined,
        ),
      );
    return row?.count ?? 0;
  }

  /** Applications that arrived in the window and are now active — joiners. */
  async countJoiners(clubId: string | null, window: Window) {
    const [row] = await this.db.db
      .select({ count: count() })
      .from(clubMembershipsTable)
      .where(
        this.and(
          eq(clubMembershipsTable.status, MembershipStatus.active),
          between(clubMembershipsTable.createdAt, window.from, window.to),
          clubId ? eq(clubMembershipsTable.clubId, clubId) : undefined,
        ),
      );
    return row?.count ?? 0;
  }

  /** Memberships whose status was moved to `status` inside the window. */
  async countStatusChanges(
    clubId: string | null,
    status: MembershipStatus,
    window: Window,
  ) {
    const [row] = await this.db.db
      .select({ count: count() })
      .from(clubMembershipsTable)
      .where(
        this.and(
          eq(clubMembershipsTable.status, status),
          between(clubMembershipsTable.updatedAt, window.from, window.to),
          clubId ? eq(clubMembershipsTable.clubId, clubId) : undefined,
        ),
      );
    return row?.count ?? 0;
  }

  async countSessions(clubId: string | null, window: Window) {
    // `sessions.date` is a calendar date, so the window is compared as one.
    const from = window.from.toISOString().slice(0, 10);
    const to = window.to.toISOString().slice(0, 10);
    const [row] = await this.db.db
      .select({ count: count() })
      .from(sessionsTable)
      .where(
        this.and(
          between(sessionsTable.date, from, to),
          clubId ? eq(sessionsTable.clubId, clubId) : undefined,
        ),
      );
    return row?.count ?? 0;
  }

  /** Modules any learner completed in the window, scoped through the topic. */
  async countModulesCompleted(clubId: string | null, window: Window) {
    const [row] = await this.db.db
      .select({ count: count() })
      .from(moduleProgressTable)
      .innerJoin(
        courseModulesTable,
        eq(moduleProgressTable.moduleId, courseModulesTable.id),
      )
      .innerJoin(topicsTable, eq(courseModulesTable.topicId, topicsTable.id))
      .where(
        this.and(
          eq(moduleProgressTable.status, ModuleProgressStatus.completed),
          between(moduleProgressTable.updatedAt, window.from, window.to),
          clubId ? eq(topicsTable.clubId, clubId) : undefined,
        ),
      );
    return row?.count ?? 0;
  }

  async countCertifications(clubId: string | null, window: Window) {
    const [row] = await this.db.db
      .select({ count: count() })
      .from(certificationsTable)
      .innerJoin(topicsTable, eq(certificationsTable.topicId, topicsTable.id))
      .where(
        this.and(
          eq(certificationsTable.status, CertificationStatus.obtained),
          between(certificationsTable.obtainedAt, window.from, window.to),
          clubId ? eq(topicsTable.clubId, clubId) : undefined,
        ),
      );
    return row?.count ?? 0;
  }

  /** Coordinating the club, or mentoring one of its topics — see T6. */
  async hasClubRole(clubId: string, userId: string) {
    const [coordinator] = await this.db.db
      .select({ id: clubsTable.id })
      .from(clubsTable)
      .where(
        and(eq(clubsTable.id, clubId), eq(clubsTable.coordinatorId, userId)),
      );
    if (coordinator) return true;

    const [mentor] = await this.db.db
      .select({ topicId: topicMentorsTable.topicId })
      .from(topicMentorsTable)
      .innerJoin(topicsTable, eq(topicMentorsTable.topicId, topicsTable.id))
      .where(
        and(
          eq(topicsTable.clubId, clubId),
          eq(topicMentorsTable.userId, userId),
        ),
      );
    return Boolean(mentor);
  }

  /** `and()` that tolerates the club filter being absent for an authority. */
  private and(...parts: (SQL | undefined)[]) {
    const present = parts.filter((part): part is SQL => part !== undefined);
    return present.length === 1 ? present[0] : and(...present);
  }
}
