import { pgEnum, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { CertificationStatus, ModuleProgressStatus } from 'shared';
import { usersTable } from './users.schema';
import { courseModulesTable } from './course-modules.schema';
import { topicsTable } from './topics.schema';

export const moduleProgressStatusEnum = pgEnum('module_progress_status', [
  ModuleProgressStatus.to_do,
  ModuleProgressStatus.in_progress,
  ModuleProgressStatus.pending_confirmation,
  ModuleProgressStatus.completed,
] as [string, ...string[]]);

export const certificationStatusEnum = pgEnum('certification_status', [
  CertificationStatus.not_required,
  CertificationStatus.pending,
  CertificationStatus.obtained,
] as [string, ...string[]]);

export const moduleProgressTable = pgTable(
  'module_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    moduleId: uuid('module_id')
      .references(() => courseModulesTable.id)
      .notNull(),
    learnerId: uuid('learner_id')
      .references(() => usersTable.id)
      .notNull(),
    status: moduleProgressStatusEnum('status').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.moduleId, t.learnerId)],
);

export const certificationsTable = pgTable(
  'certifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    topicId: uuid('topic_id')
      .references(() => topicsTable.id)
      .notNull(),
    userId: uuid('user_id')
      .references(() => usersTable.id)
      .notNull(),
    status: certificationStatusEnum('status').notNull(),
    obtainedAt: timestamp('obtained_at', { withTimezone: true }),
  },
  (t) => [unique().on(t.topicId, t.userId)],
);
