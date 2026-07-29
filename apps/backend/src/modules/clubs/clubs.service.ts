import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  MembershipStatus,
  type CreateClub,
  type JoinClub,
  type UpdateClub,
  type UpdateMembershipStatus,
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
    const [clubs, memberships, mentoredClubIds] = await Promise.all([
      this.repo.findAllActive(),
      this.repo.findMembershipsByUserId(caller.userId),
      this.repo.findMentoredClubIds(caller.userId),
    ]);

    const membershipMap = new Map(memberships.map((m) => [m.clubId, m.status]));
    const mentored = new Set(mentoredClubIds);

    return clubs.map((club) => ({
      ...club,
      membershipStatus: membershipMap.get(club.id) ?? null,
      // Roles are club-scoped, so they belong on the club rather than on the
      // account — this is what tells a screen which club is the caller's to run.
      role:
        club.coordinatorId === caller.userId
          ? 'coordinator'
          : mentored.has(club.id)
            ? 'mentor'
            : null,
    }));
  }

  /**
   * A club as this caller sees it. The caller's own membership rides along:
   * the club page shows its curriculum to anyone, but enrolling in a topic is
   * a member's action, so the page has to know where the caller stands.
   */
  async findById(id: string, caller: Caller) {
    const club = await this.repo.findById(id);
    if (!club) throw new NotFoundException('Club not found');

    const membership = await this.repo.findMembership(id, caller.userId);
    return { ...club, membershipStatus: membership?.status ?? null };
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

      // A learner belongs to one club at a time. Caught here so the answer
      // comes back now rather than after a coordinator has read the
      // application — the approval path refuses it too, which is what actually
      // holds the rule.
      const elsewhere = await this.repo.findActiveMembershipElsewhere(
        clubId,
        userId,
      );
      if (elsewhere) {
        throw new BadRequestException(
          `You are already an active member of ${elsewhere.clubName}. Leave that club before joining another.`,
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
    this.logger.log(
      `updateMembershipStatus() clubId=${clubId} userId=${userId} status=${dto.status} caller=${caller.userId}`,
    );

    try {
      await this.hasClubRole(clubId, caller);

      const membership = await this.repo.findMembership(clubId, userId);
      if (!membership) throw new NotFoundException('Membership not found');

      // Where the one-club rule is actually kept: a membership only becomes
      // active here, so two pending applications can't both be approved into
      // two active memberships.
      if (dto.status === MembershipStatus.active) {
        const elsewhere = await this.repo.findActiveMembershipElsewhere(
          clubId,
          userId,
        );
        if (elsewhere) {
          throw new ConflictException(
            `This learner is already an active member of ${elsewhere.clubName}`,
          );
        }
      }

      const updated = await this.repo.updateMembership(clubId, userId, {
        status: dto.status,
        droppedReason: dto.droppedReason,
      });

      this.logger.log(
        `updateMembershipStatus() succeeded clubId=${clubId} userId=${userId} ${membership.status} -> ${dto.status}`,
      );

      // TODO: T5 — NotificationsService.create({ type: 'membership_changed', ... })
      return updated;
    } catch (error) {
      this.logger.error(
        `updateMembershipStatus() failed for clubId=${clubId} userId=${userId} status=${dto.status}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * The applications this caller answers for — the clubs they coordinate, plus
   * every club for an authority. Mentors are deliberately not here: joining a
   * club is settled by the club's coordinator, and a mentor's queue is the
   * enrollment requests for their own topics.
   */
  async getPendingClubEnrollments(
    limit: number = 10,
    offset: number = 0,
    caller: Caller,
  ) {
    const reviewerId = caller.isAuthority ? null : caller.userId;
    const [enrollments, total] = await Promise.all([
      this.repo.findPendingClubEnrollments(limit, offset, reviewerId),
      this.repo.countPendingClubEnrollments(reviewerId),
    ]);

    return {
      data: enrollments.map((enrollment) => ({
        id: enrollment.id,
        userId: enrollment.userId,
        clubId: enrollment.clubId,
        requester: {
          name: enrollment.userName,
          email: enrollment.userEmail,
        },
        target: enrollment.clubName,
        status: enrollment.status,
        createdAt: enrollment.createdAt,
      })),
      total,
    };
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
