import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { SessionType } from 'shared';
import { clubsTable } from './clubs.schema';

export const sessionTypeEnum = pgEnum('session_type', [
  SessionType.weekly,
  SessionType.monthly,
] as [string, ...string[]]);

export const sessionsTable = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clubId: uuid('club_id')
    .references(() => clubsTable.id)
    .notNull(),
  date: date('date').notNull(),
  type: sessionTypeEnum('type').notNull(),
  objective: text('objective').notNull(),
  facilitator: text('facilitator').notNull(),
  /**
   * Heads counted. Nullable because attendance is gathered after the session —
   * from a third party or from the facilitator — so a session is legitimately
   * logged before anyone has been counted. Null is "not counted yet", which is
   * not the same claim as 0.
   */
  participantCount: integer('participant_count'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
