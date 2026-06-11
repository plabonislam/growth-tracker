import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { QueryResult } from 'pg';
import { Pool } from 'pg';
import * as schema from './schema/index';
import { usersTable } from './schema/index';

export async function seed(
  db: NodePgDatabase<typeof schema>,
  email: string,
): Promise<void> {
  const result = await db
    .update(usersTable)
    .set({ isAuthority: true })
    .where(eq(usersTable.email, email));

  const rowCount: number | undefined | null = Array.isArray(result)
    ? (result[0] as QueryResult | undefined | null)?.rowCount
    : (result as QueryResult | undefined | null)?.rowCount;

  if (!rowCount) {
    console.error(`seed: no user found with email ${email}`);
  }
}

// standalone entrypoint — only runs when executed directly via db:seed script
if (require.main === module) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool, { schema });
  seed(db, process.env.SEED_EMAIL!)
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
