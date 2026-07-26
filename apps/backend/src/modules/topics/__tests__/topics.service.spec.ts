import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TopicsRepository } from '../topics.repository';
import { TopicsService } from '../topics.service';

const mockRepo = {
  findByClub: jest.fn(),
  findById: jest.fn(),
  insert: jest.fn(),
  updateById: jest.fn(),
  archiveById: jest.fn(),
  findCoordinatorMatch: jest.fn(),
  findTopicMentor: jest.fn(),
  insertMentor: jest.fn(),
  insertWithMentor: jest.fn(),
  deleteMentor: jest.fn(),
  updateStatus: jest.fn(),
  getModuleWeightSum: jest.fn(),
  getModuleCount: jest.fn(),
};

const coordinator = { userId: 'uid-coord', isAuthority: false };
const mentor = { userId: 'uid-mentor', isAuthority: false };
const outsider = { userId: 'uid-outsider', isAuthority: false };
const authority = { userId: 'uid-auth', isAuthority: true };

const topic = {
  id: 'topic-1',
  clubId: 'club-1',
  name: 'React Basics',
  certificationRequired: false,
  archived: false,
  createdAt: new Date(),
};

describe('TopicsService', () => {
  let service: TopicsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicsService,
        { provide: TopicsRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get<TopicsService>(TopicsService);
  });

  describe('findByClub', () => {
    it('returns only non-archived topics', async () => {
      const active1 = { ...topic, id: 'topic-1' };
      const active2 = { ...topic, id: 'topic-2' };
      // repository filters archived at DB level; service delegates directly
      mockRepo.findByClub.mockResolvedValue([active1, active2]);

      const result = await service.findByClub('club-1', authority);

      expect(mockRepo.findByClub).toHaveBeenCalledWith('club-1');
      expect(result).toHaveLength(2);
      expect(result).not.toContainEqual(
        expect.objectContaining({ archived: true }),
      );
    });

    // A draft is curriculum still being written — see `TopicsService.findByClub`.
    const draft = {
      ...topic,
      id: 'topic-draft',
      status: 'draft',
      mentor: { id: mentor.userId, name: 'Mentor', avatarUrl: null },
    };
    const published = { ...topic, id: 'topic-live', status: 'published' };

    it('hides drafts from a learner', async () => {
      mockRepo.findByClub.mockResolvedValue([draft, published]);
      mockRepo.findCoordinatorMatch.mockResolvedValue(null);

      const result = await service.findByClub('club-1', outsider);

      expect(result.map((t) => t.id)).toEqual(['topic-live']);
    });

    it('shows a mentor their own draft', async () => {
      mockRepo.findByClub.mockResolvedValue([draft, published]);
      mockRepo.findCoordinatorMatch.mockResolvedValue(null);

      const result = await service.findByClub('club-1', mentor);

      expect(result.map((t) => t.id)).toEqual(['topic-draft', 'topic-live']);
    });

    it('shows the club coordinator every draft', async () => {
      mockRepo.findByClub.mockResolvedValue([draft, published]);
      mockRepo.findCoordinatorMatch.mockResolvedValue({ id: 'club-1' });

      const result = await service.findByClub('club-1', coordinator);

      expect(result).toHaveLength(2);
    });
  });

  describe('publish', () => {
    const draft = { ...topic, status: 'draft' };

    it('publishes when the curriculum totals 100%', async () => {
      mockRepo.findById.mockResolvedValue(draft);
      mockRepo.findTopicMentor.mockResolvedValue({ topicId: 'topic-1' });
      mockRepo.getModuleCount.mockResolvedValue(3);
      mockRepo.getModuleWeightSum.mockResolvedValue(100);
      mockRepo.updateStatus.mockResolvedValue({
        ...draft,
        status: 'published',
      });

      await service.publish('topic-1', mentor);

      expect(mockRepo.updateStatus).toHaveBeenCalledWith(
        'topic-1',
        'published',
      );
    });

    it('refuses a curriculum that does not total 100%', async () => {
      mockRepo.findById.mockResolvedValue(draft);
      mockRepo.findTopicMentor.mockResolvedValue({ topicId: 'topic-1' });
      mockRepo.getModuleCount.mockResolvedValue(2);
      mockRepo.getModuleWeightSum.mockResolvedValue(85);

      await expect(service.publish('topic-1', mentor)).rejects.toThrow(
        /currently total 85%/,
      );
      expect(mockRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('refuses a topic with no modules', async () => {
      mockRepo.findById.mockResolvedValue(draft);
      mockRepo.findTopicMentor.mockResolvedValue({ topicId: 'topic-1' });
      mockRepo.getModuleCount.mockResolvedValue(0);

      await expect(service.publish('topic-1', mentor)).rejects.toThrow(
        /at least one module/,
      );
    });

    // The mentor decides when a topic is ready — nobody else, authority included.
    it.each([
      ['an authority', () => authority],
      ['the club coordinator', () => coordinator],
    ])('refuses %s', async (_label, callerOf) => {
      mockRepo.findById.mockResolvedValue(draft);
      mockRepo.findTopicMentor.mockResolvedValue(null);

      await expect(service.publish('topic-1', callerOf())).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('unpublish', () => {
    it('returns a published topic to draft', async () => {
      mockRepo.findById.mockResolvedValue({ ...topic, status: 'published' });
      mockRepo.findTopicMentor.mockResolvedValue({ topicId: 'topic-1' });
      mockRepo.updateStatus.mockResolvedValue({ ...topic, status: 'draft' });

      await service.unpublish('topic-1', mentor);

      expect(mockRepo.updateStatus).toHaveBeenCalledWith('topic-1', 'draft');
    });

    it('refuses anyone but the mentor', async () => {
      mockRepo.findById.mockResolvedValue({ ...topic, status: 'published' });
      mockRepo.findTopicMentor.mockResolvedValue(null);

      await expect(service.unpublish('topic-1', authority)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findById', () => {
    it('returns topic for valid id', async () => {
      mockRepo.findById.mockResolvedValue(topic);

      const result = await service.findById('topic-1');

      expect(result).toEqual(topic);
    });

    it('throws 404 for unknown id', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById('no-such-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('inserts topic and assigns the mentor atomically', async () => {
      // Caller is the club coordinator; the mentor is a different, eligible user.
      mockRepo.findCoordinatorMatch.mockImplementation((_clubId, userId) =>
        Promise.resolve(
          userId === coordinator.userId ? { id: 'club-1' } : null,
        ),
      );
      mockRepo.insertWithMentor.mockResolvedValue(topic);

      const result = await service.create(
        'club-1',
        {
          name: 'React Basics',
          description: 'Hooks, state, and the render cycle.',
          certificationRequired: false,
          mentorId: mentor.userId,
        },
        coordinator,
      );

      // Topic + mentor are written together in one transactional call.
      expect(mockRepo.insertWithMentor).toHaveBeenCalledWith(
        expect.objectContaining({ certificationRequired: false }),
        mentor.userId,
      );
      expect(mockRepo.insert).not.toHaveBeenCalled();
      expect(result).toEqual(topic);
    });

    it('throws 403 when caller is not Coordinator of parent club and not Authority', async () => {
      mockRepo.findCoordinatorMatch.mockResolvedValue(null);

      await expect(
        service.create(
          'club-1',
          {
            name: 'React Basics',
            description: 'Hooks, state, and the render cycle.',
            certificationRequired: false,
            mentorId: mentor.userId,
          },
          outsider,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRepo.insert).not.toHaveBeenCalled();
    });

    it('rejects a mentor who is the club coordinator (no orphan topic created)', async () => {
      // Every lookup matches — caller is authority-authorized, but the chosen
      // mentor resolves to the club coordinator.
      mockRepo.findCoordinatorMatch.mockResolvedValue({ id: 'club-1' });

      await expect(
        service.create(
          'club-1',
          {
            name: 'React Basics',
            description: 'Hooks, state, and the render cycle.',
            certificationRequired: false,
            mentorId: coordinator.userId,
          },
          authority,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.insertWithMentor).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('modifies topic fields', async () => {
      mockRepo.findById.mockResolvedValue(topic);
      mockRepo.findCoordinatorMatch.mockResolvedValue({ id: 'club-1' });
      mockRepo.updateById.mockResolvedValue({ ...topic, name: 'Updated' });

      const result = await service.update(
        'topic-1',
        { name: 'Updated' },
        coordinator,
      );

      expect(mockRepo.updateById).toHaveBeenCalled();
      expect(result.name).toBe('Updated');
    });

    it('throws 403 when caller has no topic-level role', async () => {
      mockRepo.findById.mockResolvedValue(topic);
      mockRepo.findCoordinatorMatch.mockResolvedValue(null);
      mockRepo.findTopicMentor.mockResolvedValue(null);

      await expect(
        service.update('topic-1', { name: 'Updated' }, outsider),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows update when caller is a Mentor of the topic', async () => {
      mockRepo.findById.mockResolvedValue(topic);
      mockRepo.findCoordinatorMatch.mockResolvedValue(null);
      mockRepo.findTopicMentor.mockResolvedValue({
        topicId: 'topic-1',
        userId: 'uid-mentor',
      });
      mockRepo.updateById.mockResolvedValue({
        ...topic,
        name: 'Updated by mentor',
      });

      const result = await service.update(
        'topic-1',
        { name: 'Updated by mentor' },
        mentor,
      );

      expect(mockRepo.findTopicMentor).toHaveBeenCalledWith(
        'topic-1',
        mentor.userId,
      );
      expect(result.name).toBe('Updated by mentor');
    });
  });

  describe('archive', () => {
    it('sets archived = true', async () => {
      mockRepo.findById.mockResolvedValue(topic);
      mockRepo.findCoordinatorMatch.mockResolvedValue({ id: 'club-1' });
      mockRepo.archiveById.mockResolvedValue({ ...topic, archived: true });

      const result = await service.archive('topic-1', coordinator);

      expect(mockRepo.archiveById).toHaveBeenCalledWith('topic-1');
      expect(result.archived).toBe(true);
    });

    it('throws 403 for Mentor caller', async () => {
      mockRepo.findById.mockResolvedValue(topic);
      mockRepo.findCoordinatorMatch.mockResolvedValue(null);

      await expect(service.archive('topic-1', mentor)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('assignMentor', () => {
    it('creates topic_mentor row', async () => {
      mockRepo.findById.mockResolvedValue(topic);
      mockRepo.findCoordinatorMatch
        .mockResolvedValueOnce({ id: 'club-1' }) // caller is coordinator
        .mockResolvedValueOnce(null); // assignee is not coordinator
      mockRepo.insertMentor.mockResolvedValue(undefined);

      await service.assignMentor('topic-1', 'uid-mentor', coordinator);

      expect(mockRepo.insertMentor).toHaveBeenCalledWith(
        'topic-1',
        'uid-mentor',
      );
    });

    it('is idempotent — silently succeeds on duplicate', async () => {
      mockRepo.findById.mockResolvedValue(topic);
      mockRepo.findCoordinatorMatch
        .mockResolvedValueOnce({ id: 'club-1' })
        .mockResolvedValueOnce(null);
      mockRepo.insertMentor.mockResolvedValue(undefined); // onConflictDoNothing

      await expect(
        service.assignMentor('topic-1', 'uid-mentor', coordinator),
      ).resolves.not.toThrow();
    });

    it('throws 400 when assignee is coordinator of parent club', async () => {
      mockRepo.findById.mockResolvedValue(topic);
      mockRepo.findCoordinatorMatch
        .mockResolvedValueOnce({ id: 'club-1' }) // caller check
        .mockResolvedValueOnce({ id: 'club-1' }); // assignee IS coordinator

      await expect(
        service.assignMentor('topic-1', 'uid-coord', coordinator),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.insertMentor).not.toHaveBeenCalled();
    });

    it('throws 403 when caller is not Coordinator/Authority', async () => {
      mockRepo.findById.mockResolvedValue(topic);
      mockRepo.findCoordinatorMatch.mockResolvedValue(null);

      await expect(
        service.assignMentor('topic-1', 'uid-mentor', outsider),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeMentor', () => {
    it('deletes topic_mentor row', async () => {
      mockRepo.findById.mockResolvedValue(topic);
      mockRepo.findCoordinatorMatch.mockResolvedValue({ id: 'club-1' });
      mockRepo.findTopicMentor.mockResolvedValue({
        topicId: 'topic-1',
        userId: 'uid-mentor',
      });
      mockRepo.deleteMentor.mockResolvedValue([{}]);

      await service.removeMentor('topic-1', 'uid-mentor', coordinator);

      expect(mockRepo.deleteMentor).toHaveBeenCalledWith(
        'topic-1',
        'uid-mentor',
      );
    });

    it('throws 404 when assignment not found', async () => {
      mockRepo.findById.mockResolvedValue(topic);
      mockRepo.findCoordinatorMatch.mockResolvedValue({ id: 'club-1' });
      mockRepo.findTopicMentor.mockResolvedValue(null);

      await expect(
        service.removeMentor('topic-1', 'uid-mentor', coordinator),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // regression guard — authority bypasses all role checks
  describe('authority bypass', () => {
    it('authority can create a topic', async () => {
      // Mentor is eligible (not the coordinator). Authority skips the role
      // authorization check, but the mentor-eligibility check still runs.
      mockRepo.findCoordinatorMatch.mockResolvedValue(null);
      mockRepo.insertWithMentor.mockResolvedValue(topic);

      const result = await service.create(
        'club-1',
        {
          name: 'React Basics',
          description: 'Hooks, state, and the render cycle.',
          certificationRequired: false,
          mentorId: mentor.userId,
        },
        authority,
      );

      // Only consulted for the mentor check, never to authorize the authority.
      expect(mockRepo.findCoordinatorMatch).toHaveBeenCalledTimes(1);
      expect(mockRepo.findCoordinatorMatch).toHaveBeenCalledWith(
        'club-1',
        mentor.userId,
      );
      expect(mockRepo.insertWithMentor).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'React Basics' }),
        mentor.userId,
      );
      expect(result).toEqual(topic);
    });

    it('authority can archive a topic', async () => {
      mockRepo.findById.mockResolvedValue(topic);
      mockRepo.archiveById.mockResolvedValue({ ...topic, archived: true });

      const result = await service.archive('topic-1', authority);

      expect(result.archived).toBe(true);
    });
  });
});
