import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ClubJoinErrorCode,
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
      if (!club) {
        throw new NotFoundException({
          code: ClubJoinErrorCode.CLUB_NOT_FOUND,
          message:
            'We couldn’t find that club. It may have been removed — pick it again from Explore Clubs.',
        });
      }
      if (club.archived) {
        throw new BadRequestException({
          code: ClubJoinErrorCode.CLUB_ARCHIVED,
          message: `${club.name} has been closed and isn’t accepting members. Explore Clubs lists the ones still open.`,
        });
      }

      // One row per (club, user) ever exists, so every past outcome lands
      // here. Each says something different about what the person should do
      // next, and only a coordinator can move any of them.
      const existing = await this.repo.findMembership(clubId, userId);
      if (existing) {
        throw new ConflictException(
          this.describeExistingMembership(existing.status, club.name),
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
        throw new ConflictException({
          code: ClubJoinErrorCode.ACTIVE_IN_OTHER_CLUB,
          message: `You can be in one club at a time, and you’re currently an active member of ${elsewhere.clubName}. To move to ${club.name}, ask ${elsewhere.clubName}’s coordinator to end your membership there first.`,
        });
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
          // Read by a coordinator, not by the learner — so it says what the
          // learner did (joining elsewhere is allowed while paused or after
          // leaving), why it blocks this, and who can unblock it.
          throw new ConflictException({
            code: ClubJoinErrorCode.ACTIVE_IN_OTHER_CLUB,
            message: `This learner is now an active member of ${elsewhere.clubName}, and a learner can be in one club at a time. Their membership of ${elsewhere.clubName} has to be ended before you can activate them here — that club’s coordinator can do it.`,
          });
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

  /**
   * Why a second application is refused, in the terms of the membership that
   * already exists. Every branch names the club and names who can act on it —
   * a coordinator in each case, since none of these are the learner's to
   * change from here.
   */
  private describeExistingMembership(
    // `string`, not `MembershipStatus`: the Drizzle column is widened to string
    // at `clubs.schema.ts` (`as [string, ...string[]]`), so a `default` here is
    // the boundary check rather than dead code.
    status: string,
    clubName: string,
  ): { code: ClubJoinErrorCode; message: string } {
    switch (status) {
      case MembershipStatus.pending:
        return {
          code: ClubJoinErrorCode.APPLICATION_PENDING,
          message: `Your application to ${clubName} is already in. Its coordinator reviews it — reviews usually take 3–5 business days, and you’ll be notified when it’s decided.`,
        };
      case MembershipStatus.active:
        return {
          code: ClubJoinErrorCode.ALREADY_MEMBER,
          message: `You’re already a member of ${clubName}. Open the club to see its topics.`,
        };
      case MembershipStatus.on_break:
        return {
          code: ClubJoinErrorCode.MEMBERSHIP_ON_BREAK,
          // A break doesn't hold the one-club slot, so this has to say what is
          // still open to them — otherwise "paused" reads as "stuck".
          message: `Your membership of ${clubName} is paused, not ended, and a new application won’t restart it — its coordinator reactivates you. While you’re on a break you can apply to a different club.`,
        };
      case MembershipStatus.dropped_out:
        return {
          code: ClubJoinErrorCode.MEMBERSHIP_ENDED,
          message: `You previously left ${clubName}. Only its coordinator can bring you back in — applying again won’t reopen it.`,
        };
      case MembershipStatus.rejected:
        return {
          code: ClubJoinErrorCode.APPLICATION_REJECTED,
          message: `Your earlier application to ${clubName} wasn’t accepted, and it can’t be re-submitted here. Contact its coordinator if your situation has changed.`,
        };
      default:
        return {
          code: ClubJoinErrorCode.ALREADY_MEMBER,
          message: `You already have a membership record with ${clubName}, so this application can’t be sent. Its coordinator can tell you where it stands.`,
        };
    }
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
