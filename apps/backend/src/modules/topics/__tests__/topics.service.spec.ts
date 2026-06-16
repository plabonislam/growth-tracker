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
  deleteMentor: jest.fn(),
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

      const result = await service.findByClub('club-1');

      expect(mockRepo.findByClub).toHaveBeenCalledWith('club-1');
      expect(result).toHaveLength(2);
      expect(result).not.toContainEqual(
        expect.objectContaining({ archived: true }),
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
    it('inserts topic with certificationRequired defaulting to false', async () => {
      mockRepo.findCoordinatorMatch.mockResolvedValue({ id: 'club-1' });
      mockRepo.insert.mockResolvedValue(topic);

      const result = await service.create(
        'club-1',
        { name: 'React Basics', certificationRequired: false },
        coordinator,
      );

      expect(mockRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({ certificationRequired: false }),
      );
      expect(result).toEqual(topic);
    });

    it('throws 403 when caller is not Coordinator of parent club and not Authority', async () => {
      mockRepo.findCoordinatorMatch.mockResolvedValue(null);

      await expect(
        service.create(
          'club-1',
          { name: 'React Basics', certificationRequired: false },
          outsider,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRepo.insert).not.toHaveBeenCalled();
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
      mockRepo.insert.mockResolvedValue(topic);

      const result = await service.create(
        'club-1',
        { name: 'React Basics', certificationRequired: false },
        authority,
      );

      expect(mockRepo.findCoordinatorMatch).not.toHaveBeenCalled();
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
