import { Injectable } from '@nestjs/common';
import { and, count, eq, sql } from 'drizzle-orm';

import { DatabaseService } from '../../core/database/database.service';
import {
  clubMembershipsTable,
  clubsTable,
} from '../../core/database/schema/clubs.schema';
import {
  topicMentorsTable,
  topicsTable,
} from '../../core/database/schema/topics.schema';
import { usersTable } from '../../core/database/schema/users.schema';

@Injectable()
export class ClubsRepository {
  constructor(private readonly db: DatabaseService) {}

  findAllActive() {
    return this.db.db
      .select({
        id: clubsTable.id,
        name: clubsTable.name,
        coordinatorId: clubsTable.coordinatorId,
        archived: clubsTable.archived,
        createdAt: clubsTable.createdAt,
        topicCount: sql<number>`cast(count(distinct case when ${topicsTable.archived} = false then ${topicsTable.id} end) as int)`,
        memberCount: sql<number>`cast(count(distinct ${clubMembershipsTable.id}) as int)`,
      })
      .from(clubsTable)
      .leftJoin(topicsTable, eq(topicsTable.clubId, clubsTable.id))
      .leftJoin(
        clubMembershipsTable,
        eq(clubMembershipsTable.clubId, clubsTable.id),
      )
      .where(eq(clubsTable.archived, false))
      .groupBy(clubsTable.id);
  }

  async findById(id: string) {
    const [[row], [topicRow], [memberRow]] = await Promise.all([
      this.db.db.select().from(clubsTable).where(eq(clubsTable.id, id)),
      this.db.db
        .select({ count: count() })
        .from(topicsTable)
        .where(
          and(eq(topicsTable.clubId, id), eq(topicsTable.archived, false)),
        ),
      this.db.db
        .select({ count: count() })
        .from(clubMembershipsTable)
        .where(eq(clubMembershipsTable.clubId, id)),
    ]);
    if (!row) return null;
    return { ...row, topicCount: topicRow.count, memberCount: memberRow.count };
  }

  async insert(data: { name: string; coordinatorId: string }) {
    const [row] = await this.db.db.insert(clubsTable).values(data).returning();
    return row;
  }

  async updateById(id: string, data: Record<string, unknown>) {
    const [row] = await this.db.db
      .update(clubsTable)
      .set(data)
      .where(eq(clubsTable.id, id))
      .returning();
    return row;
  }

  async archiveById(id: string) {
    const [row] = await this.db.db
      .update(clubsTable)
      .set({ archived: true })
      .where(eq(clubsTable.id, id))
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

  async findMentorMatch(clubId: string, userId: string) {
    const [row] = await this.db.db
      .select()
      .from(topicMentorsTable)
      .innerJoin(topicsTable, eq(topicMentorsTable.topicId, topicsTable.id))
      .where(
        and(
          eq(topicsTable.clubId, clubId),
          eq(topicMentorsTable.userId, userId),
        ),
      );
    return row ?? null;
  }

  async findAuthorityUser(userId: string) {
    const [row] = await this.db.db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, userId), eq(usersTable.isAuthority, true)));
    return row ?? null;
  }

  async findUserByEmail(email: string) {
    const [row] = await this.db.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    return row ?? null;
  }

  findMembersByClubId(clubId: string) {
    return this.db.db
      .select()
      .from(clubMembershipsTable)
      .where(eq(clubMembershipsTable.clubId, clubId));
  }

  async findMembership(clubId: string, userId: string) {
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

  async updateMembership(
    clubId: string,
    userId: string,
    data: { status: string; droppedReason?: string },
  ) {
    const [row] = await this.db.db
      .update(clubMembershipsTable)
      .set(data)
      .where(
        and(
          eq(clubMembershipsTable.clubId, clubId),
          eq(clubMembershipsTable.userId, userId),
        ),
      )
      .returning();
    return row;
  }
}
