import { Injectable } from '@nestjs/common';
import { asc, eq, ne, and, sql, inArray } from 'drizzle-orm';
import { DatabaseService } from '../../core/database/database.service';
import {
  courseModulesTable,
  moduleResourcesTable,
} from '../../core/database/schema/course-modules.schema';
import { topicMentorsTable } from '../../core/database/schema/topics.schema';

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

  async deleteById(id: string) {
    await this.db.db
      .delete(courseModulesTable)
      .where(eq(courseModulesTable.id, id));
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
