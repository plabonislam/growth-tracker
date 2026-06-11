import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { topicsTable } from './topics.schema';

export const courseModulesTable = pgTable('course_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  topicId: uuid('topic_id')
    .references(() => topicsTable.id)
    .notNull(),
  title: text('title').notNull(),
  body: text('body'),
  weight: integer('weight').notNull(),
  estTime: integer('est_time'),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const moduleResourcesTable = pgTable('module_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id')
    .references(() => courseModulesTable.id)
    .notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
});
