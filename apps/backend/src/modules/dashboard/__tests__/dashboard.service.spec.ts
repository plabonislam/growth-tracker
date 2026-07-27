import { Test, TestingModule } from '@nestjs/testing';
import { DashboardRepository } from '../dashboard.repository';
import { DashboardService } from '../dashboard.service';

const mockRepo = {
  findActiveClub: jest.fn(),
  findClubMemberNames: jest.fn(),
  countClubMembers: jest.fn(),
  getClubModuleTotals: jest.fn(),
  findActiveTopic: jest.fn(),
  findTopicModuleProgress: jest.fn(),
  findTopicCertification: jest.fn(),
  findCompletedTopics: jest.fn(),
  countCertificates: jest.fn(),
  findLatestCertificateTopic: jest.fn(),
  sumCompletedModuleMinutes: jest.fn(),
  findUpcomingSessions: jest.fn(),
};

const learner = { userId: 'uid-learner', isAuthority: false };

const club = {
  id: 'club-1',
  name: 'JS Club',
  description: 'A club for the web',
  memberSince: new Date('2026-01-12T09:00:00.000Z'),
};

const topic = {
  id: 'topic-1',
  title: 'Vue.js',
  description: 'A progressive framework',
  startedAt: new Date('2026-06-02T09:00:00.000Z'),
  certificationRequired: false,
};

/** A learner with nothing yet — the state every account starts in. */
const givenNothing = () => {
  mockRepo.findActiveClub.mockResolvedValue(null);
  mockRepo.findActiveTopic.mockResolvedValue(null);
  mockRepo.findCompletedTopics.mockResolvedValue([]);
  mockRepo.countCertificates.mockResolvedValue(0);
  mockRepo.findLatestCertificateTopic.mockResolvedValue(null);
  mockRepo.sumCompletedModuleMinutes.mockResolvedValue(0);
  mockRepo.findTopicCertification.mockResolvedValue(null);
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: DashboardRepository, useValue: mockRepo },
      ],
    }).compile();
    service = moduleRef.get<DashboardService>(DashboardService);
  });

  describe('a learner who has joined nothing', () => {
    it('answers with empty state rather than an error', async () => {
      givenNothing();

      const result = await service.getLearnerDashboard(learner);

      expect(result.club).toBeNull();
      expect(result.activeTopic).toBeNull();
      expect(result.events).toEqual([]);
      expect(result.stats).toEqual({
        completedTopics: 0,
        completedTopicClubs: 0,
        earnedCertificates: 0,
        latestCertificateTopic: null,
        learningMinutes: 0,
      });
    });

    it('does not go looking for sessions with no club to look in', async () => {
      givenNothing();

      await service.getLearnerDashboard(learner);

      expect(mockRepo.findUpcomingSessions).not.toHaveBeenCalled();
    });
  });

  describe('club', () => {
    beforeEach(() => {
      givenNothing();
      mockRepo.findActiveClub.mockResolvedValue(club);
      mockRepo.findClubMemberNames.mockResolvedValue([
        { name: 'Ada Lovelace' },
        { name: 'Grace Hopper' },
      ]);
      mockRepo.countClubMembers.mockResolvedValue(12);
      mockRepo.findUpcomingSessions.mockResolvedValue([]);
    });

    it('measures progress as modules completed over modules published', async () => {
      mockRepo.getClubModuleTotals.mockResolvedValue({
        total: 8,
        completed: 2,
      });

      const result = await service.getLearnerDashboard(learner);

      expect(result.club?.progressPct).toBe(25);
      expect(result.club?.memberCount).toBe(12);
      expect(result.club?.memberNames).toEqual([
        'Ada Lovelace',
        'Grace Hopper',
      ]);
    });

    it('reports 0% rather than dividing by a club with nothing published', async () => {
      mockRepo.getClubModuleTotals.mockResolvedValue({
        total: 0,
        completed: 0,
      });

      const result = await service.getLearnerDashboard(learner);

      expect(result.club?.progressPct).toBe(0);
    });

    it('carries the membership date through as the joining date', async () => {
      mockRepo.getClubModuleTotals.mockResolvedValue({
        total: 4,
        completed: 4,
      });

      const result = await service.getLearnerDashboard(learner);

      expect(result.club?.memberSince).toBe(club.memberSince.toISOString());
      expect(result.club?.progressPct).toBe(100);
    });
  });

  describe('active topic', () => {
    beforeEach(() => {
      givenNothing();
      mockRepo.findActiveTopic.mockResolvedValue(topic);
    });

    it('weighs progress by module weight, and says which module they are on', async () => {
      mockRepo.findTopicModuleProgress.mockResolvedValue([
        { id: 'm1', weight: 40, status: 'completed' },
        { id: 'm2', weight: 60, status: 'in_progress' },
      ]);

      const result = await service.getLearnerDashboard(learner);

      expect(result.activeTopic?.progressPct).toBe(40);
      expect(result.activeTopic?.moduleIndex).toBe(2);
      expect(result.activeTopic?.moduleCount).toBe(2);
    });

    it('points at the first module before anything has been done', async () => {
      mockRepo.findTopicModuleProgress.mockResolvedValue([
        { id: 'm1', weight: 50, status: null },
        { id: 'm2', weight: 50, status: null },
      ]);

      const result = await service.getLearnerDashboard(learner);

      expect(result.activeTopic?.moduleIndex).toBe(1);
      expect(result.activeTopic?.progressPct).toBe(0);
    });

    it('stays on the last module once every one is done', async () => {
      mockRepo.findTopicModuleProgress.mockResolvedValue([
        { id: 'm1', weight: 50, status: 'completed' },
        { id: 'm2', weight: 50, status: 'completed' },
      ]);

      const result = await service.getLearnerDashboard(learner);

      expect(result.activeTopic?.moduleIndex).toBe(2);
      expect(result.activeTopic?.progressPct).toBe(100);
      // What separates "on the last module" from "finished it".
      expect(result.activeTopic?.completedModules).toBe(2);
    });

    it('reports a topic that asks for no certificate as asking for none', async () => {
      mockRepo.findTopicModuleProgress.mockResolvedValue([
        { id: 'm1', weight: 100, status: 'completed' },
      ]);

      const result = await service.getLearnerDashboard(learner);

      expect(result.activeTopic?.certificationRequired).toBe(false);
      expect(result.activeTopic?.certificationStatus).toBeNull();
    });

    it('carries the certificate standing of a topic that certifies', async () => {
      mockRepo.findActiveTopic.mockResolvedValue({
        ...topic,
        certificationRequired: true,
      });
      mockRepo.findTopicCertification.mockResolvedValue('pending');
      mockRepo.findTopicModuleProgress.mockResolvedValue([
        { id: 'm1', weight: 100, status: 'completed' },
      ]);

      const result = await service.getLearnerDashboard(learner);

      expect(result.activeTopic?.certificationRequired).toBe(true);
      expect(result.activeTopic?.certificationStatus).toBe('pending');
    });

    it('treats a topic predating the column as needing no certificate', async () => {
      mockRepo.findActiveTopic.mockResolvedValue({
        ...topic,
        certificationRequired: null,
      });
      mockRepo.findTopicModuleProgress.mockResolvedValue([]);

      const result = await service.getLearnerDashboard(learner);

      expect(result.activeTopic?.certificationRequired).toBe(false);
    });

    it('handles a topic whose curriculum has not been written yet', async () => {
      mockRepo.findTopicModuleProgress.mockResolvedValue([]);

      const result = await service.getLearnerDashboard(learner);

      expect(result.activeTopic?.moduleCount).toBe(0);
      expect(result.activeTopic?.moduleIndex).toBe(0);
      expect(result.activeTopic?.progressPct).toBe(0);
    });
  });

  describe('stats', () => {
    it('counts finished topics and the clubs they came from', async () => {
      givenNothing();
      mockRepo.findCompletedTopics.mockResolvedValue([
        { topicId: 't1', clubId: 'club-1' },
        { topicId: 't2', clubId: 'club-1' },
        { topicId: 't3', clubId: 'club-2' },
      ]);
      mockRepo.countCertificates.mockResolvedValue(2);
      mockRepo.findLatestCertificateTopic.mockResolvedValue('Deep Learning I');
      mockRepo.sumCompletedModuleMinutes.mockResolvedValue(180);

      const result = await service.getLearnerDashboard(learner);

      expect(result.stats).toEqual({
        completedTopics: 3,
        completedTopicClubs: 2,
        earnedCertificates: 2,
        latestCertificateTopic: 'Deep Learning I',
        learningMinutes: 180,
      });
    });
  });

  describe('events', () => {
    it('returns the club’s upcoming sessions', async () => {
      givenNothing();
      mockRepo.findActiveClub.mockResolvedValue(club);
      mockRepo.findClubMemberNames.mockResolvedValue([]);
      mockRepo.countClubMembers.mockResolvedValue(1);
      mockRepo.getClubModuleTotals.mockResolvedValue({
        total: 0,
        completed: 0,
      });
      mockRepo.findUpcomingSessions.mockResolvedValue([
        {
          id: 'ses-1',
          title: 'AI Ethics Workshop',
          date: '2026-08-12',
          type: 'weekly',
        },
      ]);

      const result = await service.getLearnerDashboard(learner);

      expect(mockRepo.findUpcomingSessions).toHaveBeenCalledWith(
        'club-1',
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        expect.any(Number),
      );
      expect(result.events).toEqual([
        {
          id: 'ses-1',
          title: 'AI Ethics Workshop',
          date: '2026-08-12',
          type: 'weekly',
        },
      ]);
    });
  });
});
