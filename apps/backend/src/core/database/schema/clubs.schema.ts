import { sql } from 'drizzle-orm';
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { MembershipStatus } from 'shared';
import { usersTable } from './users.schema';

export const membershipStatusEnum = pgEnum('membership_status', [
  MembershipStatus.pending,
  MembershipStatus.active,
  MembershipStatus.on_break,
  MembershipStatus.dropped_out,
  MembershipStatus.rejected,
] as [string, ...string[]]);

export const clubsTable = pgTable(
  'clubs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    coordinatorId: uuid('coordinator_id')
      .references(() => usersTable.id)
      .notNull(),
    archived: boolean('archived').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  // Case-insensitive uniqueness — "Innovation Lab" and "innovation lab" collide.
  (t) => [uniqueIndex('clubs_name_lower_unique').on(sql`lower(${t.name})`)],
);

export const clubMembershipsTable = pgTable(
  'club_memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clubId: uuid('club_id')
      .references(() => clubsTable.id)
      .notNull(),
    userId: uuid('user_id')
      .references(() => usersTable.id)
      .notNull(),
    status: membershipStatusEnum('status').notNull(),
    droppedReason: text('dropped_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.clubId, t.userId)],
);
