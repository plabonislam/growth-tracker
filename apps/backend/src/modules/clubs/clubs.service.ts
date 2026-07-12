import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateClub, UpdateClub, UpdateMembershipStatus } from 'shared';
import { ClubsRepository } from './clubs.repository';

interface Caller {
  userId: string;
  isAuthority: boolean;
}

@Injectable()
export class ClubsService {
  constructor(private readonly repo: ClubsRepository) {}

  findAll() {
    return this.repo.findAllActive();
  }

  async findById(id: string) {
    const club = await this.repo.findById(id);
    if (!club) throw new NotFoundException('Club not found');
    return club;
  }

  async create(dto: CreateClub) {
    const coordinatorId = dto.coordinatorEmail
      ? await this.resolveCoordinatorIdByEmail(dto.coordinatorEmail)
      : undefined;

    return this.repo.insert({
      name: dto.name,
      coordinatorId: coordinatorId!,
    });
  }

  async update(id: string, dto: UpdateClub) {
    if (dto.coordinatorId) {
      await this.assertNotAuthority(dto.coordinatorId);
    }
    return this.repo.updateById(id, dto);
  }

  async archive(id: string) {
    // TODO: T5 — NotificationsService.create({ type: 'membership_changed', ... })
    return this.repo.archiveById(id);
  }

  async findMembers(clubId: string, caller: Caller) {
    await this.hasClubRole(clubId, caller);
    return this.repo.findMembersByClubId(clubId);
  }

  async updateMembershipStatus(
    clubId: string,
    userId: string,
    dto: UpdateMembershipStatus,
    caller: Caller,
  ) {
    await this.hasClubRole(clubId, caller);

    const membership = await this.repo.findMembership(clubId, userId);
    if (!membership) throw new NotFoundException('Membership not found');

    const updated = await this.repo.updateMembership(clubId, userId, {
      status: dto.status,
      droppedReason: dto.droppedReason,
    });

    // TODO: T5 — NotificationsService.create({ type: 'membership_changed', ... })
    return updated;
  }

  private async hasClubRole(clubId: string, caller: Caller) {
    if (caller.isAuthority) return;
    if (await this.repo.findCoordinatorMatch(clubId, caller.userId)) return;
    if (await this.repo.findMentorMatch(clubId, caller.userId)) return;
    throw new ForbiddenException();
  }

  private async assertNotAuthority(coordinatorId: string) {
    const found = await this.repo.findAuthorityUser(coordinatorId);
    if (found)
      throw new BadRequestException('Authority users cannot be coordinators');
  }

  private async resolveCoordinatorIdByEmail(email: string) {
    const user = await this.repo.findUserByEmail(email);
    if (!user) throw new NotFoundException('Coordinator not found');
    if (user.isAuthority) {
      throw new BadRequestException('Authority users cannot be coordinators');
    }
    return user.id;
  }
}
