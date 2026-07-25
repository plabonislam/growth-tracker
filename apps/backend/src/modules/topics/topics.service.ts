import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateTopic, UpdateTopic } from 'shared';
import { TopicsRepository } from './topics.repository';

interface Caller {
  userId: string;
  isAuthority: boolean;
}

@Injectable()
export class TopicsService {
  constructor(private readonly repo: TopicsRepository) {}

  findByClub(clubId: string) {
    return this.repo.findByClub(clubId);
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
