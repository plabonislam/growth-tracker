import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index';
import { clubsTable, topicsTable, usersTable } from './schema/index';
import { FAKE_CLUBS } from './seed-data/clubs';
import { FAKE_TOPICS } from './seed-data/topics';
import { FAKE_USERS } from './seed-data/users';

export async function seed(
  db: NodePgDatabase<typeof schema>,
  authorityEmail?: string,
): Promise<void> {
  // seed users — existing rows are left untouched so a real account that has
  // already logged in keeps its name, avatar and is_authority flag
  const users = FAKE_USERS.map((u) => ({
    ...u,
    avatarUrl: null as string | null,
  }));

  await db.insert(usersTable).values(users).onConflictDoNothing();

  const authorityCount = users.filter((u) => u.isAuthority).length;
  console.log(
    `seed: inserted ${users.length} users (${authorityCount} authority, ${users.length - authorityCount} members)`,
  );

  // promote SEED_EMAIL independently of FAKE_USERS, so it works for a real
  // Google account that was never part of the sample data
  if (authorityEmail) {
    const [promoted] = await db
      .update(usersTable)
      .set({ isAuthority: true })
      .where(eq(usersTable.email, authorityEmail))
      .returning({ id: usersTable.id });

    if (promoted) {
      console.log(`seed: promoted ${authorityEmail} to authority`);
    } else {
      // No row yet — create one so seeding before the first login also works.
      // AuthService.upsertUser fills in name/avatarUrl on that login and leaves
      // is_authority alone.
      await db.insert(usersTable).values({
        name: authorityEmail.split('@')[0],
        email: authorityEmail,
        isAuthority: true,
      });
      console.log(`seed: created ${authorityEmail} as authority`);
    }
  }

  // seed clubs
  for (const club of FAKE_CLUBS) {
    const [coordinator] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, club.coordinatorEmail))
      .limit(1);

    if (!coordinator) {
      console.warn(
        `seed: coordinator not found for club "${club.name}" — skipping`,
      );
      continue;
    }

    await db
      .insert(clubsTable)
      .values({ name: club.name, coordinatorId: coordinator.id })
      .onConflictDoNothing();
  }

  console.log(`seed: inserted ${FAKE_CLUBS.length} clubs`);

  // seed topics
  let topicCount = 0;
  for (const topic of FAKE_TOPICS) {
    const [club] = await db
      .select({ id: clubsTable.id })
      .from(clubsTable)
      .where(eq(clubsTable.name, topic.clubName))
      .limit(1);

    if (!club) {
      console.warn(
        `seed: club "${topic.clubName}" not found — skipping topic "${topic.name}"`,
      );
      continue;
    }

    await db
      .insert(topicsTable)
      .values({
        clubId: club.id,
        name: topic.name,
        certificationRequired: topic.certificationRequired,
      })
      .onConflictDoNothing();

    topicCount++;
  }

  console.log(`seed: inserted ${topicCount} topics`);
}

// standalone entrypoint — only runs when executed directly via db:seed script
if (require.main === module) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool, { schema });
  seed(db, process.env.SEED_EMAIL)
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
