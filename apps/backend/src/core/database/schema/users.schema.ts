import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  avatarUrl: text('avatar_url'),
  isAuthority: boolean('is_authority').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
