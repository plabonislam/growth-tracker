import { Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
import type { TopicListItem } from 'shared';
import { DatabaseService } from '../../core/database/database.service';
import { clubsTable } from '../../core/database/schema/clubs.schema';
import { courseModulesTable } from '../../core/database/schema/course-modules.schema';
import { usersTable } from '../../core/database/schema/users.schema';
import {
  topicMentorsTable,
  topicsTable,
} from '../../core/database/schema/topics.schema';

@Injectable()
export class TopicsRepository {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Active topics for a club, enriched with the module count and the assigned
   * mentor. Modules are counted in-query; mentors are resolved in a second
   * query and attached in memory (a topic keeps its first-assigned mentor).
   */
  async findByClub(clubId: string): Promise<TopicListItem[]> {
    const rows = await this.db.db
      .select({
        id: topicsTable.id,
        clubId: topicsTable.clubId,
        name: topicsTable.name,
        certificationRequired: topicsTable.certificationRequired,
        archived: topicsTable.archived,
        createdAt: topicsTable.createdAt,
        moduleCount: sql<number>`cast(count(distinct ${courseModulesTable.id}) as int)`,
      })
      .from(topicsTable)
      .leftJoin(
        courseModulesTable,
        eq(courseModulesTable.topicId, topicsTable.id),
      )
      .where(
        and(eq(topicsTable.clubId, clubId), eq(topicsTable.archived, false)),
      )
      .groupBy(topicsTable.id);

    if (rows.length === 0) return [];

    const mentorRows = await this.db.db
      .select({
        topicId: topicMentorsTable.topicId,
        id: usersTable.id,
        name: usersTable.name,
        avatarUrl: usersTable.avatarUrl,
      })
      .from(topicMentorsTable)
      .innerJoin(usersTable, eq(usersTable.id, topicMentorsTable.userId))
      .where(
        inArray(
          topicMentorsTable.topicId,
          rows.map((r) => r.id),
        ),
      );

    // First mentor wins when a topic has more than one assigned.
    const mentorByTopic = new Map<string, TopicListItem['mentor']>();
    for (const m of mentorRows) {
      if (m.topicId && !mentorByTopic.has(m.topicId)) {
        mentorByTopic.set(m.topicId, {
          id: m.id,
          name: m.name,
          avatarUrl: m.avatarUrl,
        });
      }
    }

    return rows.map((row) => ({
      ...row,
      certificationRequired: row.certificationRequired ?? false,
      archived: row.archived ?? false,
      createdAt: (row.createdAt ?? new Date()).toISOString(),
      mentor: mentorByTopic.get(row.id) ?? null,
    }));
  }

  async findById(id: string) {
    const [row] = await this.db.db
      .select()
      .from(topicsTable)
      .where(eq(topicsTable.id, id));
    return row ?? null;
  }

  async insert(data: {
    clubId: string;
    name: string;
    certificationRequired: boolean;
  }) {
    const [row] = await this.db.db.insert(topicsTable).values(data).returning();
    return row;
  }

  /**
   * Create a topic and assign its mentor in a single transaction so a failed
   * mentor assignment (e.g. an invalid `mentorId`) never leaves an orphaned,
   * mentor-less topic behind.
   */
  async insertWithMentor(
    data: { clubId: string; name: string; certificationRequired: boolean },
    mentorId: string,
  ) {
    return this.db.db.transaction(async (tx) => {
      const [row] = await tx.insert(topicsTable).values(data).returning();
      await tx
        .insert(topicMentorsTable)
        .values({ topicId: row.id, userId: mentorId })
        .onConflictDoNothing();
      return row;
    });
  }

  async updateById(id: string, data: Record<string, unknown>) {
    const [row] = await this.db.db
      .update(topicsTable)
      .set(data)
      .where(eq(topicsTable.id, id))
      .returning();
    return row;
  }

  async archiveById(id: string) {
    const [row] = await this.db.db
      .update(topicsTable)
      .set({ archived: true })
      .where(eq(topicsTable.id, id))
      .returning();
    return row;
  }

  async findCoordinatorMatch(clubId: string, userId: string) {
    const [row] = await this.db.db
      .select()
      .from(clubsTable)
      .where(
        and(eq(clubsTable.id, clubId), eq(clubsTable.coordinatorId, userId)),
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

  async insertMentor(topicId: string, userId: string) {
    await this.db.db
      .insert(topicMentorsTable)
      .values({ topicId, userId })
      .onConflictDoNothing();
  }

  async deleteMentor(topicId: string, userId: string) {
    const result = await this.db.db
      .delete(topicMentorsTable)
      .where(
        and(
          eq(topicMentorsTable.topicId, topicId),
          eq(topicMentorsTable.userId, userId),
        ),
      )
      .returning();
    return result;
  }
}
