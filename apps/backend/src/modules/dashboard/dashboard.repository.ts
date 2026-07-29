import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, gte, isNotNull, sql } from 'drizzle-orm';
import {
  CertificationStatus,
  EnrollmentStatus,
  MembershipStatus,
  ModuleProgressStatus,
  TopicStatus,
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
  topicEnrollmentsTable,
  topicsTable,
} from '../../core/database/schema/topics.schema';
import { usersTable } from '../../core/database/schema/users.schema';

/**
 * Reads for one learner's dashboard. Every figure is a fresh aggregation — the
 * page is a snapshot of where someone stands, so it is answered from the tables
 * rather than from anything stored alongside them.
 */
@Injectable()
export class DashboardRepository {
  constructor(private readonly db: DatabaseService) {}

  /** The club the learner is actually in — at most one may be active. */
  async findActiveClub(userId: string) {
    const [row] = await this.db.db
      .select({
        id: clubsTable.id,
        name: clubsTable.name,
        description: clubsTable.description,
        memberSince: clubMembershipsTable.createdAt,
      })
      .from(clubMembershipsTable)
      .innerJoin(clubsTable, eq(clubMembershipsTable.clubId, clubsTable.id))
      .where(
        and(
          eq(clubMembershipsTable.userId, userId),
          eq(clubMembershipsTable.status, MembershipStatus.active),
          eq(clubsTable.archived, false),
        ),
      )
      .orderBy(asc(clubMembershipsTable.createdAt))
      .limit(1);
    return row ?? null;
  }

  /** A few club-mates for the avatar stack, longest-standing first. */
  findClubMemberNames(clubId: string, limit: number) {
    return this.db.db
      .select({ name: usersTable.name })
      .from(clubMembershipsTable)
      .innerJoin(usersTable, eq(clubMembershipsTable.userId, usersTable.id))
      .where(
        and(
          eq(clubMembershipsTable.clubId, clubId),
          eq(clubMembershipsTable.status, MembershipStatus.active),
        ),
      )
      .orderBy(asc(clubMembershipsTable.createdAt))
      .limit(limit);
  }

  async countClubMembers(clubId: string) {
    const [row] = await this.db.db
      .select({ count: count() })
      .from(clubMembershipsTable)
      .where(
        and(
          eq(clubMembershipsTable.clubId, clubId),
          eq(clubMembershipsTable.status, MembershipStatus.active),
        ),
      );
    return row?.count ?? 0;
  }

  /**
   * How much of a club's published curriculum this learner has finished —
   * modules completed over modules published. Progress rows are joined in, so
   * modules never started simply don't count toward the numerator.
   */
  async getClubModuleTotals(clubId: string, userId: string) {
    const [row] = await this.db.db
      .select({
        total: count(courseModulesTable.id),
        completed: sql<number>`cast(count(case when ${moduleProgressTable.status} = ${ModuleProgressStatus.completed} then 1 end) as int)`,
      })
      .from(courseModulesTable)
      .innerJoin(topicsTable, eq(courseModulesTable.topicId, topicsTable.id))
      .leftJoin(
        moduleProgressTable,
        and(
          eq(moduleProgressTable.moduleId, courseModulesTable.id),
          eq(moduleProgressTable.learnerId, userId),
        ),
      )
      .where(
        and(
          eq(topicsTable.clubId, clubId),
          eq(topicsTable.archived, false),
          eq(topicsTable.status, TopicStatus.published),
        ),
      );
    return { total: row?.total ?? 0, completed: Number(row?.completed ?? 0) };
  }

  /** The topic the learner has been approved into — at most one at a time. */
  async findActiveTopic(userId: string) {
    const [row] = await this.db.db
      .select({
        id: topicsTable.id,
        title: topicsTable.name,
        description: topicsTable.description,
        startedAt: topicEnrollmentsTable.createdAt,
        certificationRequired: topicsTable.certificationRequired,
      })
      .from(topicEnrollmentsTable)
      .innerJoin(topicsTable, eq(topicEnrollmentsTable.topicId, topicsTable.id))
      .where(
        and(
          eq(topicEnrollmentsTable.userId, userId),
          eq(topicEnrollmentsTable.status, EnrollmentStatus.approved),
          eq(topicsTable.archived, false),
        ),
      )
      .orderBy(desc(topicEnrollmentsTable.createdAt))
      .limit(1);
    return row ?? null;
  }

  /**
   * A topic's modules with this learner's standing on each, in curriculum
   * order — enough to weigh progress and to say which module they are on.
   */
  findTopicModuleProgress(topicId: string, userId: string) {
    return this.db.db
      .select({
        id: courseModulesTable.id,
        weight: courseModulesTable.weight,
        status: moduleProgressTable.status,
      })
      .from(courseModulesTable)
      .leftJoin(
        moduleProgressTable,
        and(
          eq(moduleProgressTable.moduleId, courseModulesTable.id),
          eq(moduleProgressTable.learnerId, userId),
        ),
      )
      .where(eq(courseModulesTable.topicId, topicId))
      .orderBy(asc(courseModulesTable.order));
  }

  /**
   * Topics the learner has finished outright: every module carrying a completed
   * row, and at least one module to finish. Grouped in-query so a learner with
   * many topics still costs one round trip.
   */
  async findCompletedTopics(userId: string) {
    return this.db.db
      .select({
        topicId: topicsTable.id,
        clubId: topicsTable.clubId,
      })
      .from(topicsTable)
      .innerJoin(
        courseModulesTable,
        eq(courseModulesTable.topicId, topicsTable.id),
      )
      .leftJoin(
        moduleProgressTable,
        and(
          eq(moduleProgressTable.moduleId, courseModulesTable.id),
          eq(moduleProgressTable.learnerId, userId),
        ),
      )
      .groupBy(topicsTable.id, topicsTable.clubId)
      .having(
        sql`count(${courseModulesTable.id}) > 0 and count(${courseModulesTable.id}) = count(case when ${moduleProgressTable.status} = ${ModuleProgressStatus.completed} then 1 end)`,
      );
  }

  /**
   * Where the learner stands on one topic's certificate. Null when no row has
   * been raised yet — which is the normal state until the modules are done.
   */
  async findTopicCertification(topicId: string, userId: string) {
    const [row] = await this.db.db
      .select({ status: certificationsTable.status })
      .from(certificationsTable)
      .where(
        and(
          eq(certificationsTable.topicId, topicId),
          eq(certificationsTable.userId, userId),
        ),
      )
      .limit(1);
    return row?.status ?? null;
  }

  async countCertificates(userId: string) {
    const [row] = await this.db.db
      .select({ count: count() })
      .from(certificationsTable)
      .where(
        and(
          eq(certificationsTable.userId, userId),
          eq(certificationsTable.status, CertificationStatus.obtained),
        ),
      );
    return row?.count ?? 0;
  }

  /** The topic behind the most recent certificate, for the metric's note. */
  async findLatestCertificateTopic(userId: string) {
    const [row] = await this.db.db
      .select({ title: topicsTable.name })
      .from(certificationsTable)
      .innerJoin(topicsTable, eq(certificationsTable.topicId, topicsTable.id))
      .where(
        and(
          eq(certificationsTable.userId, userId),
          eq(certificationsTable.status, CertificationStatus.obtained),
          isNotNull(certificationsTable.obtainedAt),
        ),
      )
      .orderBy(desc(certificationsTable.obtainedAt))
      .limit(1);
    return row?.title ?? null;
  }

  /**
   * Time spent, as far as anything records it: the estimates on the modules the
   * learner has completed. Nothing clocks real study time.
   */
  async sumCompletedModuleMinutes(userId: string) {
    const [row] = await this.db.db
      .select({
        minutes: sql<number>`cast(coalesce(sum(${courseModulesTable.estTime}), 0) as int)`,
      })
      .from(moduleProgressTable)
      .innerJoin(
        courseModulesTable,
        eq(moduleProgressTable.moduleId, courseModulesTable.id),
      )
      .where(
        and(
          eq(moduleProgressTable.learnerId, userId),
          eq(moduleProgressTable.status, ModuleProgressStatus.completed),
        ),
      );
    return Number(row?.minutes ?? 0);
  }

  /** Sessions in the learner's club that have not happened yet. */
  findUpcomingSessions(clubId: string, from: string, limit: number) {
    return this.db.db
      .select({
        id: sessionsTable.id,
        title: sessionsTable.objective,
        date: sessionsTable.date,
        type: sessionsTable.type,
      })
      .from(sessionsTable)
      .where(
        and(eq(sessionsTable.clubId, clubId), gte(sessionsTable.date, from)),
      )
      .orderBy(asc(sessionsTable.date))
      .limit(limit);
  }
}
