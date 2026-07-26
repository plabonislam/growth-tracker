import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ModuleProgressStatus,
  type MentorModuleProgress,
  type TopicProgressResponse,
  type UpdateModuleProgress,
} from 'shared';

import { ProgressRepository } from './progress.repository';

interface Caller {
  userId: string;
  isAuthority: boolean;
}

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(private readonly repo: ProgressRepository) {}

  /**
   * How far the caller has got through a topic. Percentage is measured against
   * the curriculum's own total rather than a flat 100, so a topic whose weights
   * don't yet add up still reports something a learner can read.
   */
  async getTopicProgress(
    topicId: string,
    caller: Caller,
  ): Promise<TopicProgressResponse> {
    const enrollment = await this.assertEnrolled(topicId, caller);

    const rows = await this.repo.findModulesWithProgress(
      topicId,
      caller.userId,
    );

    const modules = rows.map((row) => ({
      id: row.id,
      title: row.title,
      weight: row.weight,
      order: row.order,
      // No row yet means the learner has not touched it.
      status: (row.status ??
        ModuleProgressStatus.to_do) as ModuleProgressStatus,
    }));

    const totalWeight = modules.reduce((sum, m) => sum + m.weight, 0);
    const doneWeight = modules
      .filter((m) => m.status === ModuleProgressStatus.completed)
      .reduce((sum, m) => sum + m.weight, 0);

    return {
      progress:
        totalWeight === 0 ? 0 : Math.round((doneWeight / totalWeight) * 100),
      startedAt: enrollment.createdAt?.toISOString() ?? null,
      modules,
    };
  }

  /**
   * The learner moving their own module along. They may start it, put it back,
   * or send it for review; only the mentor can call it finished, so a module
   * they have already had approved is left alone.
   */
  async setOwnProgress(
    moduleId: string,
    dto: UpdateModuleProgress,
    caller: Caller,
  ) {
    this.logger.log(
      `setOwnProgress() moduleId=${moduleId} userId=${caller.userId} status=${dto.status}`,
    );

    try {
      const module = await this.repo.findModuleById(moduleId);
      if (!module) throw new NotFoundException('Module not found');

      await this.assertEnrolled(module.topicId, caller);

      const current = await this.repo.findProgress(moduleId, caller.userId);
      if (current?.status === ModuleProgressStatus.completed) {
        throw new ConflictException(
          'Your mentor has approved this module — ask them to reopen it',
        );
      }

      return await this.repo.upsertProgress(
        moduleId,
        caller.userId,
        dto.status,
      );
    } catch (error) {
      this.logger.error(
        `setOwnProgress() failed for moduleId=${moduleId} userId=${caller.userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * The modules waiting on this reviewer: submissions from the topics they
   * mentor, or all of them for an authority. Anyone else reviews nothing and
   * gets an empty queue rather than a closed door.
   */
  async getPendingReviews(
    limit: number = 10,
    offset: number = 0,
    caller: Caller,
  ) {
    const reviewerId = caller.isAuthority ? null : caller.userId;
    const [reviews, total] = await Promise.all([
      this.repo.findPendingReviews(limit, offset, reviewerId),
      this.repo.countPendingReviews(reviewerId),
    ]);

    return {
      data: reviews.map((review) => ({
        moduleId: review.moduleId,
        learnerId: review.learnerId,
        learner: { name: review.learnerName, email: review.learnerEmail },
        moduleTitle: review.moduleTitle,
        topicId: review.topicId,
        topicName: review.topicName,
        weight: review.weight,
        submittedAt: review.submittedAt,
      })),
      total,
    };
  }

  /**
   * The mentor's answer to submitted work — approve it, or send it back. Only
   * a module actually waiting on them can be answered, so an approval can't
   * arrive for something the learner never submitted.
   */
  async decideModuleProgress(
    moduleId: string,
    learnerId: string,
    dto: MentorModuleProgress,
    caller: Caller,
  ) {
    this.logger.log(
      `decideModuleProgress() moduleId=${moduleId} learnerId=${learnerId} status=${dto.status} caller=${caller.userId}`,
    );

    try {
      const module = await this.repo.findModuleById(moduleId);
      if (!module) throw new NotFoundException('Module not found');

      await this.assertTopicMentor(module.topicId, caller);

      const current = await this.repo.findProgress(moduleId, learnerId);
      if (!current)
        throw new NotFoundException(
          'This learner has no progress on that module',
        );
      if (current.status !== ModuleProgressStatus.pending_confirmation) {
        throw new ConflictException('This module is not waiting for review');
      }

      // TODO: T5 — NotificationsService.create({ type: 'task_completed', userId: learnerId, ... })
      return await this.repo.upsertProgress(moduleId, learnerId, dto.status);
    } catch (error) {
      this.logger.error(
        `decideModuleProgress() failed for moduleId=${moduleId} learnerId=${learnerId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Progress belongs to a learner the topic has taken on — nobody else. Returns
   * the enrollment, since when it was made is when they started.
   */
  private async assertEnrolled(topicId: string, caller: Caller) {
    const enrollment = await this.repo.findApprovedEnrollment(
      topicId,
      caller.userId,
    );
    if (!enrollment) {
      throw new ForbiddenException(
        'Enroll in this topic before working through it',
      );
    }
    return enrollment;
  }

  private async assertTopicMentor(topicId: string, caller: Caller) {
    if (caller.isAuthority) return;
    const match = await this.repo.findTopicMentor(topicId, caller.userId);
    if (!match) {
      throw new ForbiddenException(
        'Only this topic’s mentor can review its modules',
      );
    }
  }
}
