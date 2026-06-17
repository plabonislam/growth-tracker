import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DatabaseService } from '../../core/database/database.service';
import { clubsTable } from '../../core/database/schema/clubs.schema';
import {
  topicMentorsTable,
  topicsTable,
} from '../../core/database/schema/topics.schema';

@Injectable()
export class TopicsRepository {
  constructor(private readonly db: DatabaseService) {}

  findByClub(clubId: string) {
    return this.db.db
      .select()
      .from(topicsTable)
      .where(
        and(eq(topicsTable.clubId, clubId), eq(topicsTable.archived, false)),
      );
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
