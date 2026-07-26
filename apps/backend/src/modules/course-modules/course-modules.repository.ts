import { Injectable } from '@nestjs/common';
import { asc, eq, ne, and, sql, inArray } from 'drizzle-orm';
import { DatabaseService } from '../../core/database/database.service';
import {
  courseModulesTable,
  moduleResourcesTable,
} from '../../core/database/schema/course-modules.schema';
import {
  topicMentorsTable,
  topicsTable,
} from '../../core/database/schema/topics.schema';

@Injectable()
export class CourseModulesRepository {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Modules with their resources attached. Two queries rather than a join —
   * a join would fan each module out per resource and need regrouping anyway.
   */
  async findByTopic(topicId: string) {
    const modules = await this.db.db
      .select()
      .from(courseModulesTable)
      .where(eq(courseModulesTable.topicId, topicId))
      .orderBy(asc(courseModulesTable.order));

    if (modules.length === 0) return [];

    const resources = await this.db.db
      .select()
      .from(moduleResourcesTable)
      .where(
        inArray(
          moduleResourcesTable.moduleId,
          modules.map((m) => m.id),
        ),
      );

    const byModule = new Map<string, typeof resources>();
    for (const resource of resources) {
      const bucket = byModule.get(resource.moduleId);
      if (bucket) bucket.push(resource);
      else byModule.set(resource.moduleId, [resource]);
    }

    return modules.map((module) => ({
      ...module,
      resources: byModule.get(module.id) ?? [],
    }));
  }

  async findById(id: string) {
    const [row] = await this.db.db
      .select()
      .from(courseModulesTable)
      .where(eq(courseModulesTable.id, id));
    return row ?? null;
  }

  async insert(data: {
    topicId: string;
    title: string;
    body?: string;
    weight: number;
    estTime?: number;
    order: number;
  }) {
    const [row] = await this.db.db
      .insert(courseModulesTable)
      .values(data)
      .returning();
    return row;
  }

  async updateById(id: string, data: Record<string, unknown>) {
    const [row] = await this.db.db
      .update(courseModulesTable)
      .set(data)
      .where(eq(courseModulesTable.id, id))
      .returning();
    return row;
  }

  /**
   * A module owns its resources — they are created through it and mean nothing
   * without it — so both go in one transaction. The resource rows also hold a
   * foreign key to the module, which would otherwise refuse the delete.
   *
   * The topic's remaining modules are renumbered in the same transaction: the
   * position a deleted module held would otherwise stay empty, leaving a
   * curriculum of three reading "Module 01, Module 03". Positions are 0-based,
   * matching what `insert` and `updateOrder` write.
   */
  async deleteById(id: string, topicId: string) {
    await this.db.db.transaction(async (tx) => {
      await tx
        .delete(moduleResourcesTable)
        .where(eq(moduleResourcesTable.moduleId, id));
      await tx.delete(courseModulesTable).where(eq(courseModulesTable.id, id));
      await tx.execute(sql`
        WITH ranked AS (
          SELECT id,
                 row_number() OVER (
                   ORDER BY ${courseModulesTable.order}, ${courseModulesTable.createdAt}, id
                 ) - 1 AS new_order
          FROM ${courseModulesTable}
          WHERE ${courseModulesTable.topicId} = ${topicId}
        )
        UPDATE ${courseModulesTable} AS m
        SET ${sql.identifier('order')} = ranked.new_order
        FROM ranked
        WHERE m.id = ranked.id
          AND m.${sql.identifier('order')} IS DISTINCT FROM ranked.new_order
      `);
    });
  }

  /** A topic's readiness — module weights are frozen once it is published. */
  async findTopicStatus(topicId: string): Promise<string | null> {
    const [row] = await this.db.db
      .select({ status: topicsTable.status })
      .from(topicsTable)
      .where(eq(topicsTable.id, topicId));
    return row?.status ?? null;
  }

  async getWeightSum(topicId: string): Promise<number> {
    const [row] = await this.db.db
      .select({
        total: sql<number>`coalesce(sum(${courseModulesTable.weight}), 0)`,
      })
      .from(courseModulesTable)
      .where(eq(courseModulesTable.topicId, topicId));
    return Number(row?.total ?? 0);
  }

  async getWeightSumExcluding(
    topicId: string,
    excludeId: string,
  ): Promise<number> {
    const [row] = await this.db.db
      .select({
        total: sql<number>`coalesce(sum(${courseModulesTable.weight}), 0)`,
      })
      .from(courseModulesTable)
      .where(
        and(
          eq(courseModulesTable.topicId, topicId),
          ne(courseModulesTable.id, excludeId),
        ),
      );
    return Number(row?.total ?? 0);
  }

  async findTopicMentor(topicId: string, userId: string) {
    const [row] = await this.db.db
      .select()
      .from(topicMentorsTable)
      .where(
        and(
          eq(topicMentorsTable.topicId, topicId),
          eq(topicMentorsTable.userId, userId),
        ),
      );
    return row ?? null;
  }

  async findModulesByIds(ids: string[]) {
    if (ids.length === 0) return [];
    return this.db.db
      .select()
      .from(courseModulesTable)
      .where(inArray(courseModulesTable.id, ids));
  }

  async updateOrder(id: string, order: number) {
    await this.db.db
      .update(courseModulesTable)
      .set({ order })
      .where(eq(courseModulesTable.id, id));
  }

  async insertResource(data: { moduleId: string; title: string; url: string }) {
    const [row] = await this.db.db
      .insert(moduleResourcesTable)
      .values(data)
      .returning();
    return row;
  }

  async findResourceById(id: string) {
    const [row] = await this.db.db
      .select()
      .from(moduleResourcesTable)
      .where(eq(moduleResourcesTable.id, id));
    return row ?? null;
  }

  async deleteResource(id: string) {
    await this.db.db
      .delete(moduleResourcesTable)
      .where(eq(moduleResourcesTable.id, id));
  }
}
