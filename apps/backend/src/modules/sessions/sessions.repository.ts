import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { DatabaseService } from '../../core/database/database.service';
import { clubsTable } from '../../core/database/schema/clubs.schema';
import { sessionsTable } from '../../core/database/schema/sessions.schema';
import {
  topicMentorsTable,
  topicsTable,
} from '../../core/database/schema/topics.schema';

/** A session as it goes in — the club and the day it belongs to, plus the log. */
export interface NewSession {
  clubId: string;
  date: string;
  type: string;
  objective: string;
  facilitator: string;
  /** Null when nobody has been counted yet. */
  participantCount: number | null;
}

@Injectable()
export class SessionsRepository {
  constructor(private readonly db: DatabaseService) {}

  async insert(session: NewSession) {
    const [row] = await this.db.db
      .insert(sessionsTable)
      .values(session)
      .returning();
    return row;
  }

  async findClub(clubId: string) {
    const [row] = await this.db.db
      .select({ id: clubsTable.id, archived: clubsTable.archived })
      .from(clubsTable)
      .where(eq(clubsTable.id, clubId));
    return row ?? null;
  }

  /** Whether this caller coordinates the club. */
  async isCoordinator(clubId: string, userId: string) {
    const [row] = await this.db.db
      .select({ id: clubsTable.id })
      .from(clubsTable)
      .where(
        and(eq(clubsTable.id, clubId), eq(clubsTable.coordinatorId, userId)),
      );
    return Boolean(row);
  }

  /** Whether this caller mentors a topic in the club — see T6. */
  async isMentor(clubId: string, userId: string) {
    const [row] = await this.db.db
      .select({ topicId: topicMentorsTable.topicId })
      .from(topicMentorsTable)
      .innerJoin(topicsTable, eq(topicMentorsTable.topicId, topicsTable.id))
      .where(
        and(
          eq(topicsTable.clubId, clubId),
          eq(topicMentorsTable.userId, userId),
        ),
      );
    return Boolean(row);
  }
}
