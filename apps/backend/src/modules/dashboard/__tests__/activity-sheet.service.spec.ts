import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ActivitySheetRepository } from '../activity-sheet.repository';
import { ActivitySheetService } from '../activity-sheet.service';
import { ClubMetricsRepository, type Window } from '../club-metrics.repository';

/** The window a counting call was made with, typed back off the mock. */
const windowOf = (mock: jest.Mock, call: number): Window => {
  const calls = mock.mock.calls as [string | null, Window][];
  return calls[call][1];
};

const sheetRepo = {
  findClubName: jest.fn(),
  findSessions: jest.fn(),
  findRoster: jest.fn(),
  findMentorPairs: jest.fn(),
};

const metricsRepo = {
  countMembersByStatus: jest.fn(),
  countSessions: jest.fn(),
  countJoiners: jest.fn(),
  countStatusChanges: jest.fn(),
  countCertifications: jest.fn(),
  hasClubRole: jest.fn(),
};

const authority = { userId: 'uid-authority', isAuthority: true };
const coordinator = { userId: 'uid-coord', isAuthority: false };
const CLUB = 'club-1';

/** A club with nothing recorded — every count zero, every list empty. */
const givenNothing = () => {
  // Mirrors the repository: a sheet spanning every club has no one name.
  sheetRepo.findClubName.mockImplementation((clubId: string | null) =>
    Promise.resolve(clubId ? 'DBA Club' : null),
  );
  sheetRepo.findSessions.mockResolvedValue([]);
  sheetRepo.findRoster.mockResolvedValue([]);
  sheetRepo.findMentorPairs.mockResolvedValue([]);
  metricsRepo.countMembersByStatus.mockResolvedValue(0);
  metricsRepo.countSessions.mockResolvedValue(0);
  metricsRepo.countJoiners.mockResolvedValue(0);
  metricsRepo.countStatusChanges.mockResolvedValue(0);
  metricsRepo.countCertifications.mockResolvedValue(0);
  metricsRepo.hasClubRole.mockResolvedValue(true);
};

const session = (over: Partial<Record<string, unknown>> = {}) => ({
  id: 'sess-1',
  date: '2025-12-10',
  type: 'weekly',
  objective: 'Undo Management in Oracle',
  facilitator: 'Nahid Hasan Lovon',
  attendance: 6,
  clubName: 'DBA Club',
  ...over,
});

describe('ActivitySheetService', () => {
  let service: ActivitySheetService;

  beforeEach(async () => {
    jest.clearAllMocks();
    givenNothing();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitySheetService,
        { provide: ActivitySheetRepository, useValue: sheetRepo },
        { provide: ClubMetricsRepository, useValue: metricsRepo },
      ],
    }).compile();
    service = moduleRef.get<ActivitySheetService>(ActivitySheetService);
  });

  describe('the month it covers', () => {
    it('reads the month as calendar boundaries, not a rolling range', async () => {
      await service.getSheet({ clubId: CLUB, month: '2025-12' }, authority);

      // The session log compares against `sessions.date`, which is a date.
      expect(sheetRepo.findSessions).toHaveBeenCalledWith(
        CLUB,
        '2025-12-01',
        '2025-12-31',
      );

      const current = windowOf(metricsRepo.countJoiners, 0);
      expect(current.from.toISOString()).toBe('2025-12-01T00:00:00.000Z');
      // Closed on the last millisecond, so December and January can never
      // count the same membership twice.
      expect(current.to.toISOString()).toBe('2025-12-31T23:59:59.999Z');
    });

    it('compares January against the December before it', async () => {
      await service.getSheet({ clubId: CLUB, month: '2026-01' }, authority);

      const previous = windowOf(metricsRepo.countSessions, 1);
      expect(previous.from.toISOString()).toBe('2025-12-01T00:00:00.000Z');
    });

    it('handles a short month without spilling into the next', async () => {
      await service.getSheet({ clubId: CLUB, month: '2026-02' }, authority);

      expect(sheetRepo.findSessions).toHaveBeenCalledWith(
        CLUB,
        '2026-02-01',
        '2026-02-28',
      );
    });

    it('defaults to the month in progress when none is named', async () => {
      const result = await service.getSheet({ clubId: CLUB }, authority);

      const now = new Date();
      const expected = `${now.getUTCFullYear()}-${String(
        now.getUTCMonth() + 1,
      ).padStart(2, '0')}`;
      expect(result.month).toBe(expected);
    });
  });

  describe('attendance', () => {
    it('averages only the sessions that were actually counted', async () => {
      sheetRepo.findSessions.mockResolvedValue([
        session({ id: 's1', attendance: 6 }),
        session({ id: 's2', attendance: 10 }),
        // Logged, but nobody has been counted yet.
        session({ id: 's3', attendance: null }),
      ]);

      const result = await service.getSheet(
        { clubId: CLUB, month: '2025-12' },
        authority,
      );

      // 8, not 5.33 — the uncounted session is absent from the average
      // rather than folded in as a zero.
      expect(result.stats.avgAttendance).toBe(8);
      expect(result.stats.countedSessions).toBe(2);
    });

    it('reports no average at all when nothing has been counted', async () => {
      sheetRepo.findSessions.mockResolvedValue([
        session({ id: 's1', attendance: null }),
      ]);

      const result = await service.getSheet(
        { clubId: CLUB, month: '2025-12' },
        authority,
      );

      expect(result.stats.avgAttendance).toBeNull();
      expect(result.stats.countedSessions).toBe(0);
    });

    it('carries a missing headcount through as null, never as 0', async () => {
      sheetRepo.findSessions.mockResolvedValue([session({ attendance: null })]);

      const result = await service.getSheet(
        { clubId: CLUB, month: '2025-12' },
        authority,
      );

      expect(result.sessions[0].attendance).toBeNull();
    });
  });

  describe('roster', () => {
    it('names each member by what they do in the club', async () => {
      sheetRepo.findRoster.mockResolvedValue([
        {
          userId: 'u-coord',
          name: 'Nahid Hasan Lovon',
          status: 'active',
          clubId: CLUB,
          clubName: 'DBA Club',
          coordinatorId: 'u-coord',
        },
        {
          userId: 'u-mentor',
          name: 'Saidur Rahman',
          status: 'active',
          clubId: CLUB,
          clubName: 'DBA Club',
          coordinatorId: 'u-coord',
        },
        {
          userId: 'u-member',
          name: 'Shamim Sarker',
          status: 'on_break',
          clubId: CLUB,
          clubName: 'DBA Club',
          coordinatorId: 'u-coord',
        },
      ]);
      sheetRepo.findMentorPairs.mockResolvedValue([
        { clubId: CLUB, userId: 'u-mentor' },
      ]);

      const result = await service.getSheet(
        { clubId: CLUB, month: '2025-12' },
        authority,
      );

      expect(result.roster.map((m) => m.role)).toEqual([
        'coordinator',
        'mentor',
        'member',
      ]);
      expect(result.roster[2].status).toBe('on_break');
    });

    it('reads someone who both coordinates and mentors as the coordinator', async () => {
      sheetRepo.findRoster.mockResolvedValue([
        {
          userId: 'u-both',
          name: 'Nahid Hasan Lovon',
          status: 'active',
          clubId: CLUB,
          clubName: 'DBA Club',
          coordinatorId: 'u-both',
        },
      ]);
      sheetRepo.findMentorPairs.mockResolvedValue([
        { clubId: CLUB, userId: 'u-both' },
      ]);

      const result = await service.getSheet(
        { clubId: CLUB, month: '2025-12' },
        authority,
      );

      expect(result.roster[0].role).toBe('coordinator');
    });

    it('does not promote a member on a mentor pair from another club', async () => {
      sheetRepo.findRoster.mockResolvedValue([
        {
          userId: 'u-1',
          name: 'Shamim Sarker',
          status: 'active',
          clubId: CLUB,
          clubName: 'DBA Club',
          coordinatorId: 'u-coord',
        },
      ]);
      sheetRepo.findMentorPairs.mockResolvedValue([
        { clubId: 'club-other', userId: 'u-1' },
      ]);

      const result = await service.getSheet(
        { clubId: CLUB, month: '2025-12' },
        authority,
      );

      expect(result.roster[0].role).toBe('member');
    });
  });

  describe('figures', () => {
    it('carries each count against the same count a month earlier', async () => {
      metricsRepo.countSessions
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(3);

      const result = await service.getSheet(
        { clubId: CLUB, month: '2025-12' },
        authority,
      );

      expect(result.stats.sessionsHeld).toEqual({ value: 4, delta: 1 });
    });

    it('answers an empty month with zeroes rather than an error', async () => {
      const result = await service.getSheet(
        { clubId: CLUB, month: '2025-10' },
        authority,
      );

      expect(result.sessions).toEqual([]);
      expect(result.roster).toEqual([]);
      expect(result.stats.sessionsHeld).toEqual({ value: 0, delta: 0 });
      expect(result.stats.avgAttendance).toBeNull();
    });
  });

  describe('who may read what', () => {
    it('lets an authority read every club at once', async () => {
      const result = await service.getSheet({ month: '2025-12' }, authority);

      expect(result.clubId).toBeNull();
      expect(result.clubName).toBe('All clubs');
      expect(sheetRepo.findSessions).toHaveBeenCalledWith(
        null,
        '2025-12-01',
        '2025-12-31',
      );
    });

    it('refuses anyone else a sheet that names no club', async () => {
      await expect(
        service.getSheet({ month: '2025-12' }, coordinator),
      ).rejects.toThrow(BadRequestException);
    });

    it('refuses a club the caller has no role in', async () => {
      metricsRepo.hasClubRole.mockResolvedValue(false);

      await expect(
        service.getSheet({ clubId: CLUB, month: '2025-12' }, coordinator),
      ).rejects.toThrow(ForbiddenException);
    });

    it('serves a coordinator the club they run', async () => {
      const result = await service.getSheet(
        { clubId: CLUB, month: '2025-12' },
        coordinator,
      );

      expect(metricsRepo.hasClubRole).toHaveBeenCalledWith(
        CLUB,
        coordinator.userId,
      );
      expect(result.clubId).toBe(CLUB);
    });
  });
});
