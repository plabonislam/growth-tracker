import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsRepository } from '../enrollments.repository';
import { EnrollmentsService } from '../enrollments.service';

const mockRepo = {
  findTopicById: jest.fn(),
  findClubMembership: jest.fn(),
  findEnrollment: jest.fn(),
  findApprovedEnrollmentElsewhere: jest.fn(),
  findEnrollmentsByUserId: jest.fn(),
  insertEnrollment: jest.fn(),
  decidePendingEnrollment: jest.fn(),
  findTopicMentor: jest.fn(),
  findClubCoordinatorMatch: jest.fn(),
  findPendingEnrollments: jest.fn(),
  countPendingEnrollments: jest.fn(),
};

const learner = { userId: 'uid-learner', isAuthority: false };
const mentor = { userId: 'uid-mentor', isAuthority: false };
const coordinator = { userId: 'uid-coord', isAuthority: false };
const outsider = { userId: 'uid-outsider', isAuthority: false };
const authority = { userId: 'uid-authority', isAuthority: true };

const topic = {
  id: 'topic-1',
  clubId: 'club-1',
  name: 'Data Engineering',
  status: 'published',
  archived: false,
};

const activeMembership = {
  clubId: 'club-1',
  userId: 'uid-learner',
  status: 'active',
};

const application = { reason: 'I want to rebuild our reporting pipeline.' };

const enrollment = {
  id: 'enr-1',
  topicId: 'topic-1',
  userId: 'uid-learner',
  status: 'pending',
  reason: application.reason,
  createdAt: new Date(),
};

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        { provide: EnrollmentsRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get<EnrollmentsService>(EnrollmentsService);
  });

  describe('applyToTopic', () => {
    /** The happy path's preconditions, for tests that break exactly one. */
    const givenEligible = () => {
      mockRepo.findTopicById.mockResolvedValue(topic);
      mockRepo.findClubMembership.mockResolvedValue(activeMembership);
      mockRepo.findEnrollment.mockResolvedValue(null);
      mockRepo.findApprovedEnrollmentElsewhere.mockResolvedValue(null);
    };

    it('creates a pending enrollment carrying the learner’s reason', async () => {
      givenEligible();
      mockRepo.insertEnrollment.mockResolvedValue(enrollment);

      const result = await service.applyToTopic(
        'topic-1',
        application,
        learner,
      );

      expect(mockRepo.insertEnrollment).toHaveBeenCalledWith(
        'topic-1',
        'uid-learner',
        application.reason,
      );
      expect(result.status).toBe('pending');
    });

    it('throws 404 when the topic does not exist', async () => {
      mockRepo.findTopicById.mockResolvedValue(null);

      await expect(
        service.applyToTopic('no-such-topic', application, learner),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepo.insertEnrollment).not.toHaveBeenCalled();
    });

    it('throws 404 when the topic is archived', async () => {
      mockRepo.findTopicById.mockResolvedValue({ ...topic, archived: true });

      await expect(
        service.applyToTopic('topic-1', application, learner),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws 400 for a draft topic — nothing is published to enroll in', async () => {
      mockRepo.findTopicById.mockResolvedValue({ ...topic, status: 'draft' });

      await expect(
        service.applyToTopic('topic-1', application, learner),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.insertEnrollment).not.toHaveBeenCalled();
    });

    it('throws 400 when the learner has no membership in the parent club', async () => {
      mockRepo.findTopicById.mockResolvedValue(topic);
      mockRepo.findClubMembership.mockResolvedValue(null);

      await expect(
        service.applyToTopic('topic-1', application, learner),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.insertEnrollment).not.toHaveBeenCalled();
    });

    it('throws 400 when the parent-club membership is only pending', async () => {
      mockRepo.findTopicById.mockResolvedValue(topic);
      mockRepo.findClubMembership.mockResolvedValue({
        ...activeMembership,
        status: 'pending',
      });

      await expect(
        service.applyToTopic('topic-1', application, learner),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 409 when a request for this topic is already in flight', async () => {
      givenEligible();
      mockRepo.findEnrollment.mockResolvedValue(enrollment);

      await expect(
        service.applyToTopic('topic-1', application, learner),
      ).rejects.toThrow(ConflictException);
      expect(mockRepo.insertEnrollment).not.toHaveBeenCalled();
    });

    it('throws 400 when the learner is already approved in another topic', async () => {
      givenEligible();
      mockRepo.findApprovedEnrollmentElsewhere.mockResolvedValue({
        ...enrollment,
        topicId: 'topic-2',
        status: 'approved',
      });

      await expect(
        service.applyToTopic('topic-1', application, learner),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.insertEnrollment).not.toHaveBeenCalled();
    });
  });

  describe('decideTopicEnrollment', () => {
    it('approves a pending request when the caller is the topic’s mentor', async () => {
      mockRepo.findTopicMentor.mockResolvedValue({
        topicId: 'topic-1',
        userId: 'uid-mentor',
      });
      mockRepo.decidePendingEnrollment.mockResolvedValue({
        ...enrollment,
        status: 'approved',
      });

      const result = await service.decideTopicEnrollment(
        'topic-1',
        'uid-learner',
        { action: 'approve' },
        mentor,
      );

      expect(mockRepo.decidePendingEnrollment).toHaveBeenCalledWith(
        'topic-1',
        'uid-learner',
        'approved',
      );
      expect(result.status).toBe('approved');
    });

    it('rejects a pending request', async () => {
      mockRepo.findTopicMentor.mockResolvedValue({ topicId: 'topic-1' });
      mockRepo.decidePendingEnrollment.mockResolvedValue({
        ...enrollment,
        status: 'rejected',
      });

      const result = await service.decideTopicEnrollment(
        'topic-1',
        'uid-learner',
        { action: 'reject' },
        mentor,
      );

      expect(mockRepo.decidePendingEnrollment).toHaveBeenCalledWith(
        'topic-1',
        'uid-learner',
        'rejected',
      );
      expect(result.status).toBe('rejected');
    });

    it('lets an authority decide without a mentor assignment', async () => {
      mockRepo.decidePendingEnrollment.mockResolvedValue({
        ...enrollment,
        status: 'approved',
      });

      await service.decideTopicEnrollment(
        'topic-1',
        'uid-learner',
        { action: 'approve' },
        authority,
      );

      expect(mockRepo.findTopicMentor).not.toHaveBeenCalled();
      expect(mockRepo.decidePendingEnrollment).toHaveBeenCalled();
    });

    it('lets the club’s coordinator decide a topic they do not mentor', async () => {
      mockRepo.findTopicMentor.mockResolvedValue(null);
      mockRepo.findTopicById.mockResolvedValue(topic);
      mockRepo.findClubCoordinatorMatch.mockResolvedValue({ id: 'club-1' });
      mockRepo.decidePendingEnrollment.mockResolvedValue({
        ...enrollment,
        status: 'approved',
      });

      const result = await service.decideTopicEnrollment(
        'topic-1',
        'uid-learner',
        { action: 'approve' },
        coordinator,
      );

      expect(mockRepo.findClubCoordinatorMatch).toHaveBeenCalledWith(
        'club-1',
        'uid-coord',
      );
      expect(result.status).toBe('approved');
    });

    it('throws 403 when the caller neither mentors the topic nor runs its club', async () => {
      mockRepo.findTopicMentor.mockResolvedValue(null);
      mockRepo.findTopicById.mockResolvedValue(topic);
      mockRepo.findClubCoordinatorMatch.mockResolvedValue(null);

      await expect(
        service.decideTopicEnrollment(
          'topic-1',
          'uid-learner',
          { action: 'approve' },
          outsider,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRepo.decidePendingEnrollment).not.toHaveBeenCalled();
    });

    it('throws 404 when no request exists to decide', async () => {
      mockRepo.findTopicMentor.mockResolvedValue({ topicId: 'topic-1' });
      mockRepo.decidePendingEnrollment.mockResolvedValue(null);
      mockRepo.findEnrollment.mockResolvedValue(null);

      await expect(
        service.decideTopicEnrollment(
          'topic-1',
          'uid-learner',
          { action: 'approve' },
          mentor,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws 409 when another reviewer already decided it', async () => {
      mockRepo.findTopicMentor.mockResolvedValue({ topicId: 'topic-1' });
      // The update matched nothing because the row is no longer pending.
      mockRepo.decidePendingEnrollment.mockResolvedValue(null);
      mockRepo.findEnrollment.mockResolvedValue({
        ...enrollment,
        status: 'approved',
      });

      await expect(
        service.decideTopicEnrollment(
          'topic-1',
          'uid-learner',
          { action: 'reject' },
          mentor,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findMyEnrollments', () => {
    it('returns the caller’s own enrollments', async () => {
      const rows = [{ topicId: 'topic-1', status: 'approved' }];
      mockRepo.findEnrollmentsByUserId.mockResolvedValue(rows);

      const result = await service.findMyEnrollments(learner);

      expect(mockRepo.findEnrollmentsByUserId).toHaveBeenCalledWith(
        'uid-learner',
      );
      expect(result).toEqual(rows);
    });
  });

  describe('getPendingTopicEnrollments', () => {
    it('returns requester, topic, and total for the review queue', async () => {
      mockRepo.findPendingEnrollments.mockResolvedValue([
        {
          id: 'enr-1',
          userId: 'uid-learner',
          topicId: 'topic-1',
          userName: 'Ada Lovelace',
          userEmail: 'ada@dsinnovators.com',
          topicName: 'Data Engineering',
          status: 'pending',
          reason: application.reason,
          createdAt: enrollment.createdAt,
        },
      ]);
      mockRepo.countPendingEnrollments.mockResolvedValue(1);

      const result = await service.getPendingTopicEnrollments(10, 0, mentor);

      expect(result.total).toBe(1);
      expect(result.data[0]).toEqual({
        id: 'enr-1',
        userId: 'uid-learner',
        topicId: 'topic-1',
        requester: { name: 'Ada Lovelace', email: 'ada@dsinnovators.com' },
        target: 'Data Engineering',
        reason: application.reason,
        status: 'pending',
        createdAt: enrollment.createdAt,
      });
    });

    it('scopes the queue to a mentor or coordinator by their own id', async () => {
      mockRepo.findPendingEnrollments.mockResolvedValue([]);
      mockRepo.countPendingEnrollments.mockResolvedValue(0);

      await service.getPendingTopicEnrollments(10, 0, mentor);

      expect(mockRepo.findPendingEnrollments).toHaveBeenCalledWith(
        10,
        0,
        'uid-mentor',
      );
      expect(mockRepo.countPendingEnrollments).toHaveBeenCalledWith(
        'uid-mentor',
      );
    });

    it('leaves the queue unscoped for an authority', async () => {
      mockRepo.findPendingEnrollments.mockResolvedValue([]);
      mockRepo.countPendingEnrollments.mockResolvedValue(0);

      await service.getPendingTopicEnrollments(10, 0, authority);

      expect(mockRepo.findPendingEnrollments).toHaveBeenCalledWith(10, 0, null);
      expect(mockRepo.countPendingEnrollments).toHaveBeenCalledWith(null);
    });
  });
});
