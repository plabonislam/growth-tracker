import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { TaskSubmissionStatus } from 'shared';
import { usersTable } from './users.schema';
export const taskInputTypeEnum = pgEnum('task_input_type', ['text']);

import { courseModulesTable } from './course-modules.schema';

export const taskSubmissionStatusEnum = pgEnum('task_submission_status', [
  TaskSubmissionStatus.not_started,
  TaskSubmissionStatus.submitted,
  TaskSubmissionStatus.completed,
] as [string, ...string[]]);

export const tasksTable = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id')
    .references(() => courseModulesTable.id)
    .notNull(),
  statement: text('statement').notNull(),
  inputType: taskInputTypeEnum('input_type').default('text'),
  mandatory: boolean('mandatory').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const taskSubmissionsTable = pgTable(
  'task_submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id')
      .references(() => tasksTable.id)
      .notNull(),
    learnerId: uuid('learner_id')
      .references(() => usersTable.id)
      .notNull(),
    content: text('content').notNull(),
    status: taskSubmissionStatusEnum('status').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.taskId, t.learnerId)],
);
