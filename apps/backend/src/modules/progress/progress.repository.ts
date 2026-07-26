import { Injectable } from '@nestjs/common';
import { and, asc, count, eq, inArray } from 'drizzle-orm';
import { EnrollmentStatus, ModuleProgressStatus } from 'shared';

import { DatabaseService } from '../../core/database/database.service';
import { courseModulesTable } from '../../core/database/schema/course-modules.schema';
import { moduleProgressTable } from '../../core/database/schema/progress.schema';
import {
  topicEnrollmentsTable,
  topicMentorsTable,
  topicsTable,
} from '../../core/database/schema/topics.schema';
import { usersTable } from '../../core/database/schema/users.schema';

/**
 * Module progress reads and writes. A learner's standing spans the curriculum,
 * their enrollment, and the mentor who signs work off, so this queries those
 * tables directly rather than importing the modules that own them.
 */
@Injectable()
export class ProgressRepository {
  constructor(private readonly db: DatabaseService) {}

  async findModuleById(moduleId: string) {
    const [row] = await this.db.db
      .select()
      .from(courseModulesTable)
      .where(eq(courseModulesTable.id, moduleId));
    return row ?? null;
  }

  async findTopicById(topicId: string) {
    const [row] = await this.db.db
      .select()
      .from(topicsTable)
      .where(eq(topicsTable.id, topicId));
    return row ?? null;
  }

  /** The learner's approved place in a topic — what progress hangs off. */
  async findApprovedEnrollment(topicId: string, userId: string) {
    const [row] = await this.db.db
      .select()
      .from(topicEnrollmentsTable)
      .where(
        and(
          eq(topicEnrollmentsTable.topicId, topicId),
          eq(topicEnrollmentsTable.userId, userId),
          eq(topicEnrollmentsTable.status, EnrollmentStatus.approved),
        ),
      );
    return row ?? null;
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

  /**
   * The topic's curriculum with this learner's standing attached. A left join,
   * so a module they have never opened comes back without a progress row —
   * the service reads that as `to_do` rather than writing rows on first sight.
   */
  findModulesWithProgress(topicId: string, learnerId: string) {
    return this.db.db
      .select({
        id: courseModulesTable.id,
        title: courseModulesTable.title,
        weight: courseModulesTable.weight,
        order: courseModulesTable.order,
        status: moduleProgressTable.status,
      })
      .from(courseModulesTable)
      .leftJoin(
        moduleProgressTable,
        and(
          eq(moduleProgressTable.moduleId, courseModulesTable.id),
          eq(moduleProgressTable.learnerId, learnerId),
        ),
      )
      .where(eq(courseModulesTable.topicId, topicId))
      .orderBy(asc(courseModulesTable.order));
  }

  /**
   * Submitted work narrowed to the topics this reviewer mentors. `null` sees
   * every submission, which is the authority's view.
   */
  private pendingVisibleTo(reviewerId: string | null) {
    const isSubmitted = eq(
      moduleProgressTable.status,
      ModuleProgressStatus.pending_confirmation,
    );
    if (!reviewerId) return isSubmitted;

    const mentoredTopics = this.db.db
      .select({ topicId: topicMentorsTable.topicId })
      .from(topicMentorsTable)
      .where(eq(topicMentorsTable.userId, reviewerId));

    return and(
      isSubmitted,
      inArray(courseModulesTable.topicId, mentoredTopics),
    );
  }

  /** Everything waiting on this mentor, the longest-waiting first. */
  findPendingReviews(limit: number, offset: number, reviewerId: string | null) {
    return this.db.db
      .select({
        moduleId: moduleProgressTable.moduleId,
        learnerId: moduleProgressTable.learnerId,
        moduleTitle: courseModulesTable.title,
        weight: courseModulesTable.weight,
        topicId: courseModulesTable.topicId,
        topicName: topicsTable.name,
        learnerName: usersTable.name,
        learnerEmail: usersTable.email,
        submittedAt: moduleProgressTable.updatedAt,
      })
      .from(moduleProgressTable)
      .innerJoin(
        courseModulesTable,
        eq(moduleProgressTable.moduleId, courseModulesTable.id),
      )
      .innerJoin(topicsTable, eq(courseModulesTable.topicId, topicsTable.id))
      .innerJoin(usersTable, eq(moduleProgressTable.learnerId, usersTable.id))
      .where(this.pendingVisibleTo(reviewerId))
      .orderBy(asc(moduleProgressTable.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  async countPendingReviews(reviewerId: string | null) {
    const [row] = await this.db.db
      .select({ count: count() })
      .from(moduleProgressTable)
      .innerJoin(
        courseModulesTable,
        eq(moduleProgressTable.moduleId, courseModulesTable.id),
      )
      .where(this.pendingVisibleTo(reviewerId));
    return row?.count ?? 0;
  }

  async findProgress(moduleId: string, learnerId: string) {
    const [row] = await this.db.db
      .select()
      .from(moduleProgressTable)
      .where(
        and(
          eq(moduleProgressTable.moduleId, moduleId),
          eq(moduleProgressTable.learnerId, learnerId),
        ),
      );
    return row ?? null;
  }

  /**
   * Writes where a learner stands on one module. Upserted on the
   * (module, learner) unique index, so the first move creates the row and
   * every later one moves it.
   */
  async upsertProgress(
    moduleId: string,
    learnerId: string,
    status: ModuleProgressStatus,
  ) {
    const [row] = await this.db.db
      .insert(moduleProgressTable)
      .values({ moduleId, learnerId, status })
      .onConflictDoUpdate({
        target: [moduleProgressTable.moduleId, moduleProgressTable.learnerId],
        set: { status, updatedAt: new Date() },
      })
      .returning();
    return row;
  }
}
