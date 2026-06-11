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
  participantCount: integer('participant_count').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
