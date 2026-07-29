import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { CreateSession, SessionResponse } from 'shared';

import { SessionsRepository } from './sessions.repository';

interface Caller {
  userId: string;
  isAuthority: boolean;
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(private readonly repo: SessionsRepository) {}

  /**
   * Logs a session the club has already held. Whoever runs the club may write
   * one: its mentors, its coordinator, and an authority.
   *
   * The headcount is optional — attendance is collected after the fact, so a
   * session is logged on the day and counted later. It is stored as null rather
   * than 0 so the activity sheet can tell "not counted yet" from "nobody came".
   */
  async create(
    clubId: string,
    dto: CreateSession,
    caller: Caller,
  ): Promise<SessionResponse> {
    this.logger.log(`create() clubId=${clubId} userId=${caller.userId}`);

    const club = await this.repo.findClub(clubId);
    if (!club) throw new NotFoundException('Club not found');
    if (club.archived) {
      throw new BadRequestException('This club is no longer active');
    }

    // A session cannot be held in the future — the log records what happened,
    // not what is planned. Compared as calendar days, since that is what a
    // session carries.
    const today = new Date().toISOString().slice(0, 10);
    if (dto.date > today) {
      throw new BadRequestException(
        'A session cannot be logged before it happens',
      );
    }

    await this.assertClubRole(clubId, caller);

    const row = await this.repo.insert({
      clubId,
      date: dto.date,
      type: dto.type,
      objective: dto.objective,
      facilitator: dto.facilitator,
      // `undefined` from an omitted field and `null` from a cleared one mean
      // the same thing here: nobody has counted yet.
      participantCount: dto.participantCount ?? null,
    });

    this.logger.log(`create() succeeded id=${row.id}`);

    return {
      id: row.id,
      clubId: row.clubId,
      date: row.date,
      type: row.type as SessionResponse['type'],
      objective: row.objective,
      facilitator: row.facilitator,
      participantCount: row.participantCount,
      createdAt: (row.createdAt ?? new Date()).toISOString(),
    };
  }

  /** Coordinating the club, mentoring one of its topics, or an authority. */
  private async assertClubRole(clubId: string, caller: Caller) {
    if (caller.isAuthority) return;
    if (await this.repo.isCoordinator(clubId, caller.userId)) return;
    if (await this.repo.isMentor(clubId, caller.userId)) return;
    throw new ForbiddenException();
  }
}
