import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { NotificationType } from 'shared';
import { usersTable } from './users.schema';

export const notificationTypeEnum = pgEnum('notification_type', [
  NotificationType.enrollment_approved,
  NotificationType.enrollment_rejected,
  NotificationType.membership_changed,
  NotificationType.task_completed,
  NotificationType.session_reminder,
  NotificationType.certification_updated,
  NotificationType.new_module,
] as [string, ...string[]]);

export const notificationsTable = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => usersTable.id)
    .notNull(),
  type: notificationTypeEnum('type').notNull(),
  payload: jsonb('payload').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
