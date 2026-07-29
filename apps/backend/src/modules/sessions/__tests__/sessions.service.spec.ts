import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SessionsRepository } from '../sessions.repository';
import { SessionsService } from '../sessions.service';

const mockRepo = {
  insert: jest.fn(),
  findClub: jest.fn(),
  isCoordinator: jest.fn(),
  isMentor: jest.fn(),
};

const CLUB = 'club-1';
const mentor = { userId: 'uid-mentor', isAuthority: false };
const coordinator = { userId: 'uid-coord', isAuthority: false };
const authority = { userId: 'uid-authority', isAuthority: true };
const outsider = { userId: 'uid-outsider', isAuthority: false };

/** Yesterday, so a test is never tripped by the clock rolling over. */
const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

const dto = {
  date: yesterday,
  type: 'weekly' as const,
  objective: 'Undo Management in Oracle',
  facilitator: 'Nahid Hasan Lovon',
  participantCount: 6,
};

describe('SessionsService', () => {
  let service: SessionsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRepo.findClub.mockResolvedValue({ id: CLUB, archived: false });
    mockRepo.isCoordinator.mockResolvedValue(false);
    mockRepo.isMentor.mockResolvedValue(false);
    mockRepo.insert.mockImplementation((row: Record<string, unknown>) =>
      Promise.resolve({
        id: 'sess-1',
        createdAt: new Date('2026-07-28T10:00:00.000Z'),
        ...row,
      }),
    );

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: SessionsRepository, useValue: mockRepo },
      ],
    }).compile();
    service = moduleRef.get<SessionsService>(SessionsService);
  });

  describe('who may log one', () => {
    it('lets a mentor of one of the club’s topics log a session', async () => {
      mockRepo.isMentor.mockResolvedValue(true);

      const result = await service.create(CLUB, dto, mentor);

      expect(result.id).toBe('sess-1');
      expect(mockRepo.insert).toHaveBeenCalled();
    });

    it('lets the club’s coordinator log one', async () => {
      mockRepo.isCoordinator.mockResolvedValue(true);

      await expect(
        service.create(CLUB, dto, coordinator),
      ).resolves.toBeTruthy();
    });

    it('lets an authority log one without holding a club role', async () => {
      await service.create(CLUB, dto, authority);

      // Short-circuited before either lookup — an authority answers for
      // every club by definition.
      expect(mockRepo.isCoordinator).not.toHaveBeenCalled();
      expect(mockRepo.isMentor).not.toHaveBeenCalled();
    });

    it('refuses someone with no role in the club', async () => {
      await expect(service.create(CLUB, dto, outsider)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockRepo.insert).not.toHaveBeenCalled();
    });
  });

  describe('the club it is logged against', () => {
    it('refuses a club that does not exist', async () => {
      mockRepo.findClub.mockResolvedValue(null);

      await expect(service.create(CLUB, dto, authority)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('refuses an archived club', async () => {
      mockRepo.findClub.mockResolvedValue({ id: CLUB, archived: true });

      await expect(service.create(CLUB, dto, authority)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('attendance', () => {
    it('stores a headcount that was taken', async () => {
      await service.create(CLUB, dto, authority);

      expect(mockRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({ participantCount: 6 }),
      );
    });

    it('stores null when the field was left empty', async () => {
      await service.create(
        CLUB,
        { ...dto, participantCount: undefined },
        authority,
      );

      // Null, not 0 — nobody has counted, which is not the same as nobody came.
      expect(mockRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({ participantCount: null }),
      );
    });

    it('keeps a genuine zero as zero', async () => {
      await service.create(CLUB, { ...dto, participantCount: 0 }, authority);

      expect(mockRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({ participantCount: 0 }),
      );
    });
  });

  describe('when it was held', () => {
    it('refuses a session dated in the future', async () => {
      const tomorrow = new Date(Date.now() + 86_400_000)
        .toISOString()
        .slice(0, 10);

      await expect(
        service.create(CLUB, { ...dto, date: tomorrow }, authority),
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts one held today', async () => {
      const today = new Date().toISOString().slice(0, 10);

      await expect(
        service.create(CLUB, { ...dto, date: today }, authority),
      ).resolves.toBeTruthy();
    });
  });
});
