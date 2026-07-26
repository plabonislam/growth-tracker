import { Injectable } from '@nestjs/common';
import { and, count, eq, inArray, ne, or } from 'drizzle-orm';
import { EnrollmentStatus } from 'shared';

import { DatabaseService } from '../../core/database/database.service';
import {
  clubMembershipsTable,
  clubsTable,
} from '../../core/database/schema/clubs.schema';
import {
  topicEnrollmentsTable,
  topicMentorsTable,
  topicsTable,
} from '../../core/database/schema/topics.schema';
import { usersTable } from '../../core/database/schema/users.schema';

/**
 * Enrollment reads and writes. The tables it touches belong to other modules,
 * which it queries directly rather than importing them — an enrollment is a
 * relationship between a learner, a topic, and the club above it, so it would
 * otherwise depend on almost everything.
 */
@Injectable()
export class EnrollmentsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findTopicById(topicId: string) {
    const [row] = await this.db.db
      .select()
      .from(topicsTable)
      .where(eq(topicsTable.id, topicId));
    return row ?? null;
  }

  /** The caller's membership in the topic's parent club, whatever its state. */
  async findClubMembership(clubId: string, userId: string) {
    const [row] = await this.db.db
      .select()
      .from(clubMembershipsTable)
      .where(
        and(
          eq(clubMembershipsTable.clubId, clubId),
          eq(clubMembershipsTable.userId, userId),
        ),
      );
    return row ?? null;
  }

  async findEnrollment(topicId: string, userId: string) {
    const [row] = await this.db.db
      .select()
      .from(topicEnrollmentsTable)
      .where(
        and(
          eq(topicEnrollmentsTable.topicId, topicId),
          eq(topicEnrollmentsTable.userId, userId),
        ),
      );
    return row ?? null;
  }

  /**
   * An approved enrollment the caller holds in some *other* topic — the one
   * thing that stands between them and a second topic at the same time.
   */
  async findApprovedEnrollmentElsewhere(topicId: string, userId: string) {
    const [row] = await this.db.db
      .select()
      .from(topicEnrollmentsTable)
      .where(
        and(
          eq(topicEnrollmentsTable.userId, userId),
          eq(topicEnrollmentsTable.status, EnrollmentStatus.approved),
          ne(topicEnrollmentsTable.topicId, topicId),
        ),
      );
    return row ?? null;
  }

  findEnrollmentsByUserId(userId: string) {
    return this.db.db
      .select({
        topicId: topicEnrollmentsTable.topicId,
        status: topicEnrollmentsTable.status,
      })
      .from(topicEnrollmentsTable)
      .where(eq(topicEnrollmentsTable.userId, userId));
  }

  async insertEnrollment(topicId: string, userId: string, reason: string) {
    const [row] = await this.db.db
      .insert(topicEnrollmentsTable)
      .values({
        topicId,
        userId,
        status: EnrollmentStatus.pending,
        reason,
      })
      .returning();
    return row;
  }

  /**
   * Settles a request, but only while it is still pending: two mentors acting
   * on the same request at once means the second update matches no row, which
   * the service reads as "already decided" rather than overwriting the first.
   */
  async decidePendingEnrollment(
    topicId: string,
    userId: string,
    status: EnrollmentStatus,
  ) {
    const rows = await this.db.db
      .update(topicEnrollmentsTable)
      .set({ status })
      .where(
        and(
          eq(topicEnrollmentsTable.topicId, topicId),
          eq(topicEnrollmentsTable.userId, userId),
          eq(topicEnrollmentsTable.status, EnrollmentStatus.pending),
        ),
      )
      .returning();
    return rows[0] ?? null;
  }

  async findTopicMentor(topicId: string, userId: string) {
    const [row] = await this.db.db
      .select()
      .from(topicMentorsTable)
      .where(
        and(
          eq(topicMentorsTable.topicId, topicId),
          eq(topicMentorsTable.userId, userId),
        ),
      );
    return row ?? null;
  }

  /** The club a topic belongs to, when this user is the one coordinating it. */
  async findClubCoordinatorMatch(clubId: string, userId: string) {
    const [row] = await this.db.db
      .select()
      .from(clubsTable)
      .where(
        and(eq(clubsTable.id, clubId), eq(clubsTable.coordinatorId, userId)),
      );
    return row ?? null;
  }

  /**
   * Pending requests, narrowed to what this reviewer is responsible for: the
   * topics they mentor, plus every topic in a club they coordinate. `null`
   * reviews everything, which is the authority's view.
   */
  private pendingVisibleTo(reviewerId: string | null) {
    const isPending = eq(
      topicEnrollmentsTable.status,
      EnrollmentStatus.pending,
    );
    if (!reviewerId) return isPending;

    const mentoredTopics = this.db.db
      .select({ topicId: topicMentorsTable.topicId })
      .from(topicMentorsTable)
      .where(eq(topicMentorsTable.userId, reviewerId));

    return and(
      isPending,
      or(
        eq(clubsTable.coordinatorId, reviewerId),
        inArray(topicEnrollmentsTable.topicId, mentoredTopics),
      ),
    );
  }

  /** Every learner still waiting on this reviewer, oldest request first. */
  findPendingEnrollments(
    limit: number,
    offset: number,
    reviewerId: string | null,
  ) {
    return (
      this.db.db
        .select({
          id: topicEnrollmentsTable.id,
          userId: topicEnrollmentsTable.userId,
          topicId: topicEnrollmentsTable.topicId,
          userName: usersTable.name,
          userEmail: usersTable.email,
          topicName: topicsTable.name,
          status: topicEnrollmentsTable.status,
          reason: topicEnrollmentsTable.reason,
          createdAt: topicEnrollmentsTable.createdAt,
        })
        .from(topicEnrollmentsTable)
        .innerJoin(usersTable, eq(topicEnrollmentsTable.userId, usersTable.id))
        .innerJoin(
          topicsTable,
          eq(topicEnrollmentsTable.topicId, topicsTable.id),
        )
        // Joined for the coordinator half of the scope, so it is part of the
        // query whether or not the reviewer is one.
        .innerJoin(clubsTable, eq(topicsTable.clubId, clubsTable.id))
        .where(this.pendingVisibleTo(reviewerId))
        .orderBy(topicEnrollmentsTable.createdAt)
        .limit(limit)
        .offset(offset)
    );
  }

  async countPendingEnrollments(reviewerId: string | null) {
    const [row] = await this.db.db
      .select({ count: count() })
      .from(topicEnrollmentsTable)
      .innerJoin(topicsTable, eq(topicEnrollmentsTable.topicId, topicsTable.id))
      .innerJoin(clubsTable, eq(topicsTable.clubId, clubsTable.id))
      .where(this.pendingVisibleTo(reviewerId));
    return row?.count ?? 0;
  }
}
