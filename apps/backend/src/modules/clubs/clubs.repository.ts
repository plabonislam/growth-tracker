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
        description: clubsTable.description,
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

  async insert(data: {
    name: string;
    coordinatorId?: string;
    description?: string;
  }) {
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

  /** Case-insensitive — matches the `clubs_name_lower_unique` index. */
  async findByName(name: string) {
    const [row] = await this.db.db
      .select()
      .from(clubsTable)
      .where(eq(sql`lower(${clubsTable.name})`, name.toLowerCase()));
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

  findMembershipsByUserId(userId: string) {
    return this.db.db
      .select({
        clubId: clubMembershipsTable.clubId,
        status: clubMembershipsTable.status,
      })
      .from(clubMembershipsTable)
      .where(eq(clubMembershipsTable.userId, userId));
  }

  async createMembership(
    clubId: string,
    userId: string,
    data: { expectation?: string },
  ) {
    const [row] = await this.db.db
      .insert(clubMembershipsTable)
      .values({
        clubId,
        userId,
        status: 'pending',
        expectation: data.expectation,
      })
      .returning();
    return row;
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

  async findPendingClubEnrollments(limit: number = 10, offset: number = 0) {
    const rows = await this.db.db
      .select({
        id: clubMembershipsTable.id,
        userId: clubMembershipsTable.userId,
        clubId: clubMembershipsTable.clubId,
        userName: usersTable.name,
        userEmail: usersTable.email,
        clubName: clubsTable.name,
        status: clubMembershipsTable.status,
        createdAt: clubMembershipsTable.createdAt,
      })
      .from(clubMembershipsTable)
      .innerJoin(usersTable, eq(clubMembershipsTable.userId, usersTable.id))
      .innerJoin(clubsTable, eq(clubMembershipsTable.clubId, clubsTable.id))
      .where(eq(clubMembershipsTable.status, 'pending'))
      .orderBy((t) => t.createdAt)
      .limit(limit)
      .offset(offset);
    return rows;
  }

  async countPendingClubEnrollments() {
    const [result] = await this.db.db
      .select({ count: count() })
      .from(clubMembershipsTable)
      .where(eq(clubMembershipsTable.status, 'pending'));
    return result?.count ?? 0;
  }
}
