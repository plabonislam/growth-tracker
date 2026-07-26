import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { EnrollmentStatus, TopicStatus } from 'shared';
import { usersTable } from './users.schema';
import { clubsTable } from './clubs.schema';

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  EnrollmentStatus.pending,
  EnrollmentStatus.approved,
  EnrollmentStatus.rejected,
] as [string, ...string[]]);

export const topicStatusEnum = pgEnum('topic_status', [
  TopicStatus.draft,
  TopicStatus.published,
] as [string, ...string[]]);

export const topicsTable = pgTable('topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  clubId: uuid('club_id')
    .references(() => clubsTable.id)
    .notNull(),
  name: text('name').notNull(),
  // Nullable for topics written before descriptions existed; the create
  // contract requires one from every new topic.
  description: text('description'),
  certificationRequired: boolean('certification_required').default(false),
  // Every topic starts as a draft, including the ones written before this
  // column existed — none of them had a mentor publish it.
  status: topicStatusEnum('status').notNull().default(TopicStatus.draft),
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
    /**
     * Why the learner wants the topic, as they wrote it on the request — the
     * mentor reviews on this. Nullable for rows written before it was asked for.
     */
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.topicId, t.userId)],
);
