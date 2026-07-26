import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  REQUIRED_TOPIC_WEIGHT,
  TopicStatus,
  type CreateTopic,
  type UpdateTopic,
} from 'shared';
import { TopicsRepository } from './topics.repository';

interface Caller {
  userId: string;
  isAuthority: boolean;
}

@Injectable()
export class TopicsService {
  constructor(private readonly repo: TopicsRepository) {}

  /**
   * A club's topics as this caller may see them. Drafts are curriculum still
   * being written, so they stay with the people writing it: an authority, the
   * club's coordinator, and each draft's own mentor.
   */
  async findByClub(clubId: string, caller: Caller) {
    const topics = await this.repo.findByClub(clubId);
    if (caller.isAuthority) return topics;

    const isCoordinator = await this.repo.findCoordinatorMatch(
      clubId,
      caller.userId,
    );
    if (isCoordinator) return topics;

    return topics.filter(
      (topic) =>
        topic.status === TopicStatus.published ||
        topic.mentor?.id === caller.userId,
    );
  }

  async findById(id: string) {
    const topic = await this.repo.findById(id);
    if (!topic) throw new NotFoundException('Topic not found');
    return topic;
  }

  async create(clubId: string, dto: CreateTopic, caller: Caller) {
    await this.assertCoordinatorOrAuthority(clubId, caller);
    // Validate the mentor before creating the topic so we never leave an
    // orphaned, mentor-less topic behind if the mentor is ineligible.
    await this.assertNotClubCoordinator(clubId, dto.mentorId);

    // Topic + mentor are written in one transaction — a failed mentor
    // assignment must not leave a mentor-less topic behind.
    return this.repo.insertWithMentor(
      {
        clubId,
        name: dto.name,
        description: dto.description,
        certificationRequired: dto.certificationRequired ?? false,
      },
      dto.mentorId,
    );
  }

  async update(id: string, dto: UpdateTopic, caller: Caller) {
    const topic = await this.findById(id);
    await this.assertTopicRole(topic.clubId, id, caller);
    return this.repo.updateById(id, dto);
  }

  async archive(id: string, caller: Caller) {
    const topic = await this.findById(id);
    await this.assertCoordinatorOrAuthority(topic.clubId, caller);
    return this.repo.archiveById(id);
  }

  async assignMentor(topicId: string, userId: string, caller: Caller) {
    const topic = await this.findById(topicId);
    await this.assertCoordinatorOrAuthority(topic.clubId, caller);
    await this.assertNotClubCoordinator(topic.clubId, userId);
    await this.repo.insertMentor(topicId, userId);
  }

  async removeMentor(topicId: string, userId: string, caller: Caller) {
    const topic = await this.findById(topicId);
    await this.assertCoordinatorOrAuthority(topic.clubId, caller);

    const assignment = await this.repo.findTopicMentor(topicId, userId);
    if (!assignment) throw new NotFoundException('Mentor assignment not found');

    await this.repo.deleteMentor(topicId, userId);
  }

  /**
   * Makes a topic visible to learners. The mentor alone decides this — they
   * author the curriculum, so they are the one who knows it is ready — and the
   * weights must add up first: a published topic whose modules total 85% would
   * leave every learner's progress unable to reach 100.
   */
  async publish(id: string, caller: Caller) {
    const topic = await this.findById(id);
    await this.assertTopicMentor(id, caller);

    if (topic.status === TopicStatus.published) return topic;

    const moduleCount = await this.repo.getModuleCount(id);
    if (moduleCount === 0) {
      throw new BadRequestException(
        'Add at least one module before publishing this topic',
      );
    }

    const weight = await this.repo.getModuleWeightSum(id);
    if (weight !== REQUIRED_TOPIC_WEIGHT) {
      throw new BadRequestException(
        `Module weights must total ${REQUIRED_TOPIC_WEIGHT}% before publishing — they currently total ${weight}%`,
      );
    }

    return this.repo.updateStatus(id, TopicStatus.published);
  }

  /**
   * Returns a topic to draft so its mentor can restructure the curriculum —
   * module weights can't be changed while a topic is published, since that
   * would break the 100% the published state promises.
   */
  async unpublish(id: string, caller: Caller) {
    const topic = await this.findById(id);
    await this.assertTopicMentor(id, caller);

    if (topic.status === TopicStatus.draft) return topic;
    return this.repo.updateStatus(id, TopicStatus.draft);
  }

  /** Publishing is the mentor's call alone — not a coordinator's or an authority's. */
  private async assertTopicMentor(topicId: string, caller: Caller) {
    const match = await this.repo.findTopicMentor(topicId, caller.userId);
    if (!match) {
      throw new ForbiddenException(
        'Only this topic’s mentor can publish or unpublish it',
      );
    }
  }

  private async assertNotClubCoordinator(clubId: string, userId: string) {
    const isCoordinator = await this.repo.findCoordinatorMatch(clubId, userId);
    if (isCoordinator) {
      throw new BadRequestException(
        'Club coordinator cannot be assigned as mentor',
      );
    }
  }

  private async assertCoordinatorOrAuthority(clubId: string, caller: Caller) {
    if (caller.isAuthority) return;
    const match = await this.repo.findCoordinatorMatch(clubId, caller.userId);
    if (!match) throw new ForbiddenException();
  }

  private async assertTopicRole(
    clubId: string,
    topicId: string,
    caller: Caller,
  ) {
    if (caller.isAuthority) return;
    if (await this.repo.findCoordinatorMatch(clubId, caller.userId)) return;
    if (await this.repo.findTopicMentor(topicId, caller.userId)) return;
    throw new ForbiddenException();
  }
}
