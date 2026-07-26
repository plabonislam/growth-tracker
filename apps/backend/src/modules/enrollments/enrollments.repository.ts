import { Injectable } from '@nestjs/common';
import { and, count, eq, ne } from 'drizzle-orm';
import { EnrollmentStatus } from 'shared';

import { DatabaseService } from '../../core/database/database.service';
import { clubMembershipsTable } from '../../core/database/schema/clubs.schema';
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

  /** Every learner still waiting on a decision, oldest request first. */
  findPendingEnrollments(limit: number, offset: number) {
    return this.db.db
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
      .innerJoin(topicsTable, eq(topicEnrollmentsTable.topicId, topicsTable.id))
      .where(eq(topicEnrollmentsTable.status, EnrollmentStatus.pending))
      .orderBy(topicEnrollmentsTable.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async countPendingEnrollments() {
    const [row] = await this.db.db
      .select({ count: count() })
      .from(topicEnrollmentsTable)
      .where(eq(topicEnrollmentsTable.status, EnrollmentStatus.pending));
    return row?.count ?? 0;
  }
}
