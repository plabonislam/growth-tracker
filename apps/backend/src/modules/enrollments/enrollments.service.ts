import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  EnrollmentStatus,
  MembershipStatus,
  TopicStatus,
  type ApproveEnrollment,
  type EnrollTopic,
} from 'shared';

import { EnrollmentsRepository } from './enrollments.repository';

interface Caller {
  userId: string;
  isAuthority: boolean;
}

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);

  constructor(private readonly repo: EnrollmentsRepository) {}

  /**
   * A learner's request to join a topic. Four things have to hold before the
   * mentor is asked: the topic is published, the learner belongs to the club it
   * sits in, they are not already mid-request or enrolled here, and they are
   * not part-way through another topic.
   */
  async applyToTopic(topicId: string, dto: EnrollTopic, caller: Caller) {
    this.logger.log(
      `applyToTopic() topicId=${topicId} userId=${caller.userId}`,
    );

    try {
      const topic = await this.repo.findTopicById(topicId);
      if (!topic || topic.archived)
        throw new NotFoundException('Topic not found');
      if (topic.status !== TopicStatus.published) {
        throw new BadRequestException(
          'This topic is not open for enrollment yet',
        );
      }

      const membership = await this.repo.findClubMembership(
        topic.clubId,
        caller.userId,
      );
      if (membership?.status !== MembershipStatus.active) {
        throw new BadRequestException(
          'Join this club before enrolling in its topics',
        );
      }

      const existing = await this.repo.findEnrollment(topicId, caller.userId);
      if (existing) {
        throw new ConflictException(
          existing.status === EnrollmentStatus.pending
            ? 'You have already requested to enroll in this topic'
            : 'You have already enrolled in this topic',
        );
      }

      const elsewhere = await this.repo.findApprovedEnrollmentElsewhere(
        topicId,
        caller.userId,
      );
      if (elsewhere) {
        throw new BadRequestException(
          'Finish or leave your current topic before enrolling in another',
        );
      }

      const enrollment = await this.repo.insertEnrollment(
        topicId,
        caller.userId,
        dto.reason,
      );

      this.logger.log(`applyToTopic() succeeded id=${enrollment.id}`);
      return enrollment;
    } catch (error) {
      this.logger.error(
        `applyToTopic() failed for topicId=${topicId} userId=${caller.userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /** Where the caller stands with every topic they have ever requested. */
  findMyEnrollments(caller: Caller) {
    return this.repo.findEnrollmentsByUserId(caller.userId);
  }

  /**
   * The mentor's decision on a request. Only the topic's own mentor — or an
   * authority — makes it, and only while it is still pending.
   */
  async decideTopicEnrollment(
    topicId: string,
    userId: string,
    dto: ApproveEnrollment,
    caller: Caller,
  ) {
    this.logger.log(
      `decideTopicEnrollment() topicId=${topicId} userId=${userId} action=${dto.action} caller=${caller.userId}`,
    );

    try {
      await this.assertTopicMentorOrAuthority(topicId, caller);

      const status =
        dto.action === 'approve'
          ? EnrollmentStatus.approved
          : EnrollmentStatus.rejected;

      const updated = await this.repo.decidePendingEnrollment(
        topicId,
        userId,
        status,
      );

      if (!updated) {
        // Nothing was pending. Either the request never existed, or another
        // reviewer settled it between this call and the update.
        const existing = await this.repo.findEnrollment(topicId, userId);
        if (!existing) throw new NotFoundException('Enrollment not found');
        throw new ConflictException('This request has already been decided');
      }

      this.logger.log(
        `decideTopicEnrollment() succeeded topicId=${topicId} userId=${userId} -> ${status}`,
      );

      // TODO: T5 — NotificationsService.create({ type: dto.action === 'approve'
      // ? 'enrollment_approved' : 'enrollment_rejected', userId, payload: { topicName } })
      return updated;
    } catch (error) {
      this.logger.error(
        `decideTopicEnrollment() failed for topicId=${topicId} userId=${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async getPendingTopicEnrollments(limit: number = 10, offset: number = 0) {
    const [enrollments, total] = await Promise.all([
      this.repo.findPendingEnrollments(limit, offset),
      this.repo.countPendingEnrollments(),
    ]);

    return {
      data: enrollments.map((enrollment) => ({
        id: enrollment.id,
        userId: enrollment.userId,
        topicId: enrollment.topicId,
        requester: {
          name: enrollment.userName,
          email: enrollment.userEmail,
        },
        target: enrollment.topicName,
        reason: enrollment.reason,
        status: enrollment.status,
        createdAt: enrollment.createdAt,
      })),
      total,
    };
  }

  /**
   * Deciding is the mentor's call — they author the curriculum and take the
   * learner on. An authority stands in when there is no one else to ask.
   */
  private async assertTopicMentorOrAuthority(topicId: string, caller: Caller) {
    if (caller.isAuthority) return;
    const match = await this.repo.findTopicMentor(topicId, caller.userId);
    if (!match) {
      throw new ForbiddenException(
        'Only this topic’s mentor can decide its enrollment requests',
      );
    }
  }
}
