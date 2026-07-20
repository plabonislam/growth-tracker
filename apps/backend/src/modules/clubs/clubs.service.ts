import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateClub,
  JoinClub,
  UpdateClub,
  UpdateMembershipStatus,
} from 'shared';
import { ClubsRepository } from './clubs.repository';

interface Caller {
  userId: string;
  isAuthority: boolean;
}

@Injectable()
export class ClubsService {
  private readonly logger = new Logger(ClubsService.name);

  constructor(private readonly repo: ClubsRepository) {}

  async findAll(caller: Caller) {
    const clubs = await this.repo.findAllActive();
    const memberships = await this.repo.findMembershipsByUserId(caller.userId);

    const membershipMap = new Map(memberships.map((m) => [m.clubId, m.status]));

    return clubs.map((club) => ({
      ...club,
      membershipStatus: membershipMap.get(club.id) ?? null,
    }));
  }

  async findById(id: string) {
    const club = await this.repo.findById(id);
    if (!club) throw new NotFoundException('Club not found');
    return club;
  }

  async checkNameAvailable(name: string) {
    const existing = await this.repo.findByName(name);
    return { available: !existing };
  }

  async create(dto: CreateClub) {
    this.logger.log(
      `create() name="${dto.name}" coordinatorEmail=${dto.coordinatorEmail ?? '(none)'}`,
    );

    try {
      await this.assertNameAvailable(dto.name);

      const coordinatorId = dto.coordinatorEmail
        ? await this.resolveCoordinatorIdByEmail(dto.coordinatorEmail)
        : undefined;

      const club = await this.repo.insert({
        name: dto.name,
        coordinatorId,
        description: dto.description,
      });

      this.logger.log(`create() succeeded id=${club.id}`);
      return club;
    } catch (error) {
      this.logger.error(
        `create() failed for name="${dto.name}": ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
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

  async submitJoinApplication(clubId: string, userId: string, dto: JoinClub) {
    this.logger.log(
      `submitJoinApplication() clubId=${clubId} userId=${userId}`,
    );

    try {
      const club = await this.repo.findById(clubId);
      if (!club) throw new NotFoundException('Club not found');
      if (club.archived) {
        throw new BadRequestException('This club is no longer active');
      }

      const existing = await this.repo.findMembership(clubId, userId);
      if (existing) {
        throw new ConflictException(
          'You have already applied to or joined this club',
        );
      }

      const membership = await this.repo.createMembership(clubId, userId, {
        expectation: dto.expectation,
      });

      this.logger.log(`submitJoinApplication() succeeded id=${membership.id}`);
      return membership;
    } catch (error) {
      this.logger.error(
        `submitJoinApplication() failed for clubId=${clubId} userId=${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
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

  private async assertNameAvailable(name: string) {
    const existing = await this.repo.findByName(name);
    if (existing)
      throw new ConflictException('A club with this name already exists');
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
