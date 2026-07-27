import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClubMetricsRepository, type Window } from '../club-metrics.repository';
import { ClubMetricsService } from '../club-metrics.service';

const mockRepo = {
  countMembersByStatus: jest.fn(),
  countJoiners: jest.fn(),
  countStatusChanges: jest.fn(),
  countSessions: jest.fn(),
  countModulesCompleted: jest.fn(),
  countCertifications: jest.fn(),
  hasClubRole: jest.fn(),
};

const coordinator = { userId: 'uid-coord', isAuthority: false };
const authority = { userId: 'uid-authority', isAuthority: true };

/** The windows a counting call was made with, in the order they were made. */
const windowsPassed = () =>
  mockRepo.countJoiners.mock.calls as [string | null, Window][];

/** Every count answers 0 unless a test says otherwise. */
const givenZeroes = () => {
  mockRepo.countMembersByStatus.mockResolvedValue(0);
  mockRepo.countJoiners.mockResolvedValue(0);
  mockRepo.countStatusChanges.mockResolvedValue(0);
  mockRepo.countSessions.mockResolvedValue(0);
  mockRepo.countModulesCompleted.mockResolvedValue(0);
  mockRepo.countCertifications.mockResolvedValue(0);
  mockRepo.hasClubRole.mockResolvedValue(true);
};

describe('ClubMetricsService', () => {
  let service: ClubMetricsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ClubMetricsService,
        { provide: ClubMetricsRepository, useValue: mockRepo },
      ],
    }).compile();
    service = moduleRef.get<ClubMetricsService>(ClubMetricsService);
  });

  describe('metrics', () => {
    it('returns all eight cards', async () => {
      givenZeroes();

      const result = await service.getDashboard(
        { range: '1m', clubId: 'club-1' },
        coordinator,
      );

      expect(Object.keys(result).sort()).toEqual(
        [
          'activeMembers',
          'certificationsObtained',
          'droppedOut',
          'modulesCompleted',
          'newJoiners',
          'onBreak',
          'sessionsHeld',
          'totalMembers',
        ].sort(),
      );
    });

    it('reports zero counts and zero deltas for a club with no activity', async () => {
      givenZeroes();

      const result = await service.getDashboard(
        { range: '1m', clubId: 'club-1' },
        coordinator,
      );

      Object.values(result).forEach((metric) => {
        expect(metric).toEqual({ value: 0, delta: 0 });
      });
    });

    it('sets delta to this period minus the one before it', async () => {
      givenZeroes();
      // 3 joiners this period against 1 in the previous one.
      mockRepo.countJoiners.mockResolvedValueOnce(3).mockResolvedValueOnce(1);

      const result = await service.getDashboard(
        { range: '1m', clubId: 'club-1' },
        coordinator,
      );

      expect(result.newJoiners).toEqual({ value: 3, delta: 2 });
    });

    it('reports a fall as a negative delta', async () => {
      givenZeroes();
      mockRepo.countModulesCompleted
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(9);

      const result = await service.getDashboard(
        { range: '7d', clubId: 'club-1' },
        coordinator,
      );

      expect(result.modulesCompleted).toEqual({ value: 4, delta: -5 });
    });

    it('leaves point-in-time counts without a direction', async () => {
      givenZeroes();
      mockRepo.countMembersByStatus.mockResolvedValueOnce(24); // active
      mockRepo.countMembersByStatus.mockResolvedValueOnce(2); // on break

      const result = await service.getDashboard(
        { range: '1m', clubId: 'club-1' },
        coordinator,
      );

      expect(result.totalMembers).toEqual({ value: 24, delta: 0 });
      expect(result.onBreak).toEqual({ value: 2, delta: 0 });
    });

    it('measures the previous window immediately before the current one', async () => {
      givenZeroes();

      await service.getDashboard(
        { range: '7d', clubId: 'club-1' },
        coordinator,
      );

      const [[, currentWindow], [, previousWindow]] = windowsPassed();
      expect(previousWindow.to).toEqual(currentWindow.from);
      const span = currentWindow.to.getTime() - currentWindow.from.getTime();
      expect(previousWindow.to.getTime() - previousWindow.from.getTime()).toBe(
        span,
      );
      expect(Math.round(span / (24 * 60 * 60 * 1000))).toBe(7);
    });

    it('widens the window for a longer range', async () => {
      givenZeroes();

      await service.getDashboard(
        { range: '6m', clubId: 'club-1' },
        coordinator,
      );

      const [[, window]] = windowsPassed();
      const days = Math.round(
        (window.to.getTime() - window.from.getTime()) / (24 * 60 * 60 * 1000),
      );
      expect(days).toBe(180);
    });
  });

  describe('scoping', () => {
    it('lets an authority read every club at once', async () => {
      givenZeroes();

      await service.getDashboard({ range: '1m' }, authority);

      expect(mockRepo.hasClubRole).not.toHaveBeenCalled();
      expect(mockRepo.countJoiners).toHaveBeenCalledWith(
        null,
        expect.anything(),
      );
    });

    it('narrows an authority to one club when they name one', async () => {
      givenZeroes();

      await service.getDashboard({ range: '1m', clubId: 'club-9' }, authority);

      expect(mockRepo.countJoiners).toHaveBeenCalledWith(
        'club-9',
        expect.anything(),
      );
    });

    it('gives a coordinator their own club', async () => {
      givenZeroes();

      await service.getDashboard(
        { range: '1m', clubId: 'club-1' },
        coordinator,
      );

      expect(mockRepo.hasClubRole).toHaveBeenCalledWith('club-1', 'uid-coord');
      expect(mockRepo.countJoiners).toHaveBeenCalledWith(
        'club-1',
        expect.anything(),
      );
    });

    it('throws 403 for a club the caller has no role in', async () => {
      givenZeroes();
      mockRepo.hasClubRole.mockResolvedValue(false);

      await expect(
        service.getDashboard({ range: '1m', clubId: 'club-2' }, coordinator),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRepo.countJoiners).not.toHaveBeenCalled();
    });

    it('throws 400 when someone other than an authority names no club', async () => {
      givenZeroes();

      await expect(
        service.getDashboard({ range: '1m' }, coordinator),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.countJoiners).not.toHaveBeenCalled();
    });
  });
});
