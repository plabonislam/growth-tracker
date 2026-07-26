import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateModule,
  CreateResource,
  ReorderModules,
  UpdateModule,
} from 'shared';
import { CourseModulesRepository } from './course-modules.repository';

interface Caller {
  userId: string;
  isAuthority: boolean;
}

@Injectable()
export class CourseModulesService {
  constructor(private readonly repo: CourseModulesRepository) {}

  async findByTopic(topicId: string) {
    const modules = await this.repo.findByTopic(topicId);
    return modules.sort((a, b) => a.order - b.order);
  }

  async findById(id: string) {
    const mod = await this.repo.findById(id);
    if (!mod) throw new NotFoundException('Module not found');
    return mod;
  }

  async create(topicId: string, dto: CreateModule, caller: Caller) {
    await this.assertMentorOrAuthority(topicId, caller);
    const currentSum = await this.repo.getWeightSum(topicId);
    if (currentSum + dto.weight > 100) {
      throw new BadRequestException(
        'Module weights would exceed 100 for this topic',
      );
    }
    return this.repo.insert({ topicId, ...dto });
  }

  async reorder(topicId: string, dto: ReorderModules, caller: Caller) {
    await this.assertMentorOrAuthority(topicId, caller);
    const modules = await this.repo.findModulesByIds(dto.moduleIds);
    const allBelongToTopic = modules.every((m) => m.topicId === topicId);
    if (!allBelongToTopic) {
      throw new BadRequestException(
        'One or more module IDs do not belong to this topic',
      );
    }
    // 0-based, matching what `create` writes — the client renders position as
    // `order + 1`, so numbering from 1 here would shift every module by one.
    for (let i = 0; i < dto.moduleIds.length; i++) {
      await this.repo.updateOrder(dto.moduleIds[i], i);
    }
  }

  async delete(id: string, caller: Caller) {
    const mod = await this.findById(id);
    await this.assertMentorOrAuthority(mod.topicId, caller);
    // The topic goes along so the survivors can be renumbered in the same
    // transaction — a hole in the sequence is never visible to a reader.
    await this.repo.deleteById(id, mod.topicId);
  }

  async update(id: string, dto: UpdateModule, caller: Caller) {
    const mod = await this.findById(id);
    await this.assertMentorOrAuthority(mod.topicId, caller);
    if (dto.weight !== undefined) {
      const othersSum = await this.repo.getWeightSumExcluding(mod.topicId, id);
      if (othersSum + dto.weight > 100) {
        throw new BadRequestException(
          'Module weights would exceed 100 for this topic',
        );
      }
    }
    return this.repo.updateById(id, dto);
  }

  async addResource(moduleId: string, dto: CreateResource, caller: Caller) {
    const mod = await this.findById(moduleId);
    await this.assertMentorOrAuthority(mod.topicId, caller);
    return this.repo.insertResource({ moduleId, ...dto });
  }

  async removeResource(resourceId: string, caller: Caller) {
    const resource = await this.repo.findResourceById(resourceId);
    if (!resource) throw new NotFoundException('Resource not found');
    const mod = await this.findById(resource.moduleId);
    await this.assertMentorOrAuthority(mod.topicId, caller);
    await this.repo.deleteResource(resourceId);
  }

  private async assertMentorOrAuthority(topicId: string, caller: Caller) {
    if (caller.isAuthority) return;
    const match = await this.repo.findTopicMentor(topicId, caller.userId);
    if (!match) throw new ForbiddenException();
  }
}
