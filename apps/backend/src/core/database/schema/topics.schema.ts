import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { EnrollmentStatus } from 'shared';
import { usersTable } from './users.schema';
import { clubsTable } from './clubs.schema';

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  EnrollmentStatus.pending,
  EnrollmentStatus.approved,
  EnrollmentStatus.rejected,
] as [string, ...string[]]);

export const topicsTable = pgTable('topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  clubId: uuid('club_id')
    .references(() => clubsTable.id)
    .notNull(),
  name: text('name').notNull(),
  certificationRequired: boolean('certification_required').default(false),
  archived: boolean('archived').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const topicMentorsTable = pgTable('topic_mentors', {
  topicId: uuid('topic_id').references(() => topicsTable.id),
  userId: uuid('user_id').references(() => usersTable.id),
});

export const topicEnrollmentsTable = pgTable(
  'topic_enrollments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    topicId: uuid('topic_id')
      .references(() => topicsTable.id)
      .notNull(),
    userId: uuid('user_id')
      .references(() => usersTable.id)
      .notNull(),
    status: enrollmentStatusEnum('status').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.topicId, t.userId)],
);
