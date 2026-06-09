import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;
  public readonly db: ReturnType<typeof drizzle>;

  constructor(private readonly config: ConfigService) {
    const url = config.getOrThrow<string>('DATABASE_URL');
    this.pool = new Pool({ connectionString: url });
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
