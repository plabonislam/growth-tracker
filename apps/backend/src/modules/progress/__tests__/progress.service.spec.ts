import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProgressRepository } from '../progress.repository';
import { ProgressService } from '../progress.service';

const mockRepo = {
  findModuleById: jest.fn(),
  findTopicById: jest.fn(),
  findApprovedEnrollment: jest.fn(),
  findTopicMentor: jest.fn(),
  findModulesWithProgress: jest.fn(),
  findProgress: jest.fn(),
  upsertProgress: jest.fn(),
  findPendingReviews: jest.fn(),
  countPendingReviews: jest.fn(),
};

const learner = { userId: 'uid-learner', isAuthority: false };
const mentor = { userId: 'uid-mentor', isAuthority: false };
const outsider = { userId: 'uid-outsider', isAuthority: false };

const module1 = {
  id: 'mod-1',
  topicId: 'topic-1',
  title: 'Intro',
  weight: 40,
  order: 0,
};
const enrolledOn = new Date('2026-06-12T09:00:00.000Z');
const enrollment = {
  id: 'enr-1',
  topicId: 'topic-1',
  userId: 'uid-learner',
  status: 'approved',
  createdAt: enrolledOn,
};

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: ProgressRepository, useValue: mockRepo },
      ],
    }).compile();
    service = moduleRef.get<ProgressService>(ProgressService);
  });

  describe('getTopicProgress', () => {
    it('reads an untouched module as to_do rather than as missing', async () => {
      mockRepo.findApprovedEnrollment.mockResolvedValue(enrollment);
      mockRepo.findModulesWithProgress.mockResolvedValue([
        { id: 'mod-1', title: 'Intro', weight: 40, order: 0, status: null },
      ]);

      const result = await service.getTopicProgress('topic-1', learner);

      expect(result.modules[0].status).toBe('to_do');
      expect(result.progress).toBe(0);
    });

    it('measures progress by the weight completed, not the module count', async () => {
      mockRepo.findApprovedEnrollment.mockResolvedValue(enrollment);
      mockRepo.findModulesWithProgress.mockResolvedValue([
        {
          id: 'mod-1',
          title: 'Intro',
          weight: 40,
          order: 0,
          status: 'completed',
        },
        {
          id: 'mod-2',
          title: 'Deep dive',
          weight: 60,
          order: 1,
          status: 'in_progress',
        },
      ]);

      const result = await service.getTopicProgress('topic-1', learner);

      expect(result.progress).toBe(40);
    });

    it('measures against the curriculum’s own total when weights don’t reach 100', async () => {
      mockRepo.findApprovedEnrollment.mockResolvedValue(enrollment);
      mockRepo.findModulesWithProgress.mockResolvedValue([
        {
          id: 'mod-1',
          title: 'Intro',
          weight: 20,
          order: 0,
          status: 'completed',
        },
        {
          id: 'mod-2',
          title: 'Deep dive',
          weight: 20,
          order: 1,
          status: 'to_do',
        },
      ]);

      const result = await service.getTopicProgress('topic-1', learner);

      expect(result.progress).toBe(50);
    });

    it('reports 0 rather than dividing by a weightless curriculum', async () => {
      mockRepo.findApprovedEnrollment.mockResolvedValue(enrollment);
      mockRepo.findModulesWithProgress.mockResolvedValue([]);

      const result = await service.getTopicProgress('topic-1', learner);

      expect(result.progress).toBe(0);
      expect(result.modules).toEqual([]);
    });

    it('dates the start from the enrollment, which is when it began', async () => {
      mockRepo.findApprovedEnrollment.mockResolvedValue(enrollment);
      mockRepo.findModulesWithProgress.mockResolvedValue([]);

      const result = await service.getTopicProgress('topic-1', learner);

      expect(result.startedAt).toBe(enrolledOn.toISOString());
    });

    it('returns a null start rather than inventing one', async () => {
      mockRepo.findApprovedEnrollment.mockResolvedValue({
        ...enrollment,
        createdAt: null,
      });
      mockRepo.findModulesWithProgress.mockResolvedValue([]);

      const result = await service.getTopicProgress('topic-1', learner);

      expect(result.startedAt).toBeNull();
    });

    it('throws 403 for someone with no approved enrollment', async () => {
      mockRepo.findApprovedEnrollment.mockResolvedValue(null);

      await expect(
        service.getTopicProgress('topic-1', outsider),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('setOwnProgress', () => {
    it('records the learner’s own move', async () => {
      mockRepo.findModuleById.mockResolvedValue(module1);
      mockRepo.findApprovedEnrollment.mockResolvedValue(enrollment);
      mockRepo.findProgress.mockResolvedValue(null);
      mockRepo.upsertProgress.mockResolvedValue({
        moduleId: 'mod-1',
        learnerId: 'uid-learner',
        status: 'in_progress',
      });

      const result = await service.setOwnProgress(
        'mod-1',
        { status: 'in_progress' },
        learner,
      );

      expect(mockRepo.upsertProgress).toHaveBeenCalledWith(
        'mod-1',
        'uid-learner',
        'in_progress',
      );
      expect(result.status).toBe('in_progress');
    });

    it('throws 404 when the module does not exist', async () => {
      mockRepo.findModuleById.mockResolvedValue(null);

      await expect(
        service.setOwnProgress('no-such', { status: 'in_progress' }, learner),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepo.upsertProgress).not.toHaveBeenCalled();
    });

    it('throws 403 when the caller is not enrolled in the module’s topic', async () => {
      mockRepo.findModuleById.mockResolvedValue(module1);
      mockRepo.findApprovedEnrollment.mockResolvedValue(null);

      await expect(
        service.setOwnProgress('mod-1', { status: 'in_progress' }, outsider),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRepo.upsertProgress).not.toHaveBeenCalled();
    });

    it('refuses to move a module the mentor has already approved', async () => {
      mockRepo.findModuleById.mockResolvedValue(module1);
      mockRepo.findApprovedEnrollment.mockResolvedValue(enrollment);
      mockRepo.findProgress.mockResolvedValue({ status: 'completed' });

      await expect(
        service.setOwnProgress('mod-1', { status: 'to_do' }, learner),
      ).rejects.toThrow(ConflictException);
      expect(mockRepo.upsertProgress).not.toHaveBeenCalled();
    });
  });

  describe('getPendingReviews', () => {
    beforeEach(() => {
      mockRepo.findPendingReviews.mockResolvedValue([]);
      mockRepo.countPendingReviews.mockResolvedValue(0);
    });

    it('scopes the queue to the mentor’s own id', async () => {
      await service.getPendingReviews(10, 0, mentor);

      expect(mockRepo.findPendingReviews).toHaveBeenCalledWith(
        10,
        0,
        'uid-mentor',
      );
      expect(mockRepo.countPendingReviews).toHaveBeenCalledWith('uid-mentor');
    });

    it('leaves the queue unscoped for an authority', async () => {
      await service.getPendingReviews(10, 0, {
        userId: 'uid-authority',
        isAuthority: true,
      });

      expect(mockRepo.findPendingReviews).toHaveBeenCalledWith(10, 0, null);
      expect(mockRepo.countPendingReviews).toHaveBeenCalledWith(null);
    });

    it('returns the learner, the module, and what approving is worth', async () => {
      const submittedAt = new Date('2026-07-20T10:30:00.000Z');
      mockRepo.findPendingReviews.mockResolvedValue([
        {
          moduleId: 'mod-1',
          learnerId: 'uid-learner',
          moduleTitle: 'Intro',
          weight: 40,
          topicId: 'topic-1',
          topicName: 'Data Engineering',
          learnerName: 'Ada Lovelace',
          learnerEmail: 'ada@dsinnovators.com',
          submittedAt,
        },
      ]);
      mockRepo.countPendingReviews.mockResolvedValue(1);

      const result = await service.getPendingReviews(10, 0, mentor);

      expect(result.total).toBe(1);
      expect(result.data[0]).toEqual({
        moduleId: 'mod-1',
        learnerId: 'uid-learner',
        learner: { name: 'Ada Lovelace', email: 'ada@dsinnovators.com' },
        moduleTitle: 'Intro',
        topicId: 'topic-1',
        topicName: 'Data Engineering',
        weight: 40,
        submittedAt,
      });
    });
  });

  describe('decideModuleProgress', () => {
    const givenSubmitted = () => {
      mockRepo.findModuleById.mockResolvedValue(module1);
      mockRepo.findTopicMentor.mockResolvedValue({ topicId: 'topic-1' });
      mockRepo.findProgress.mockResolvedValue({
        status: 'pending_confirmation',
      });
    };

    it('completes a module the learner submitted', async () => {
      givenSubmitted();
      mockRepo.upsertProgress.mockResolvedValue({ status: 'completed' });

      const result = await service.decideModuleProgress(
        'mod-1',
        'uid-learner',
        { status: 'completed' },
        mentor,
      );

      expect(mockRepo.upsertProgress).toHaveBeenCalledWith(
        'mod-1',
        'uid-learner',
        'completed',
      );
      expect(result.status).toBe('completed');
    });

    it('sends work back to to_do', async () => {
      givenSubmitted();
      mockRepo.upsertProgress.mockResolvedValue({ status: 'to_do' });

      await service.decideModuleProgress(
        'mod-1',
        'uid-learner',
        { status: 'to_do' },
        mentor,
      );

      expect(mockRepo.upsertProgress).toHaveBeenCalledWith(
        'mod-1',
        'uid-learner',
        'to_do',
      );
    });

    it('throws 403 when the caller does not mentor the topic', async () => {
      mockRepo.findModuleById.mockResolvedValue(module1);
      mockRepo.findTopicMentor.mockResolvedValue(null);

      await expect(
        service.decideModuleProgress(
          'mod-1',
          'uid-learner',
          { status: 'completed' },
          outsider,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws 409 for a module that was never submitted for review', async () => {
      mockRepo.findModuleById.mockResolvedValue(module1);
      mockRepo.findTopicMentor.mockResolvedValue({ topicId: 'topic-1' });
      mockRepo.findProgress.mockResolvedValue({ status: 'in_progress' });

      await expect(
        service.decideModuleProgress(
          'mod-1',
          'uid-learner',
          { status: 'completed' },
          mentor,
        ),
      ).rejects.toThrow(ConflictException);
      expect(mockRepo.upsertProgress).not.toHaveBeenCalled();
    });

    it('throws 404 when the learner has no progress on the module', async () => {
      mockRepo.findModuleById.mockResolvedValue(module1);
      mockRepo.findTopicMentor.mockResolvedValue({ topicId: 'topic-1' });
      mockRepo.findProgress.mockResolvedValue(null);

      await expect(
        service.decideModuleProgress(
          'mod-1',
          'uid-learner',
          { status: 'completed' },
          mentor,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
