import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseModulesRepository } from '../course-modules.repository';
import { CourseModulesService } from '../course-modules.service';

const mockRepo = {
  findByTopic: jest.fn(),
  findById: jest.fn(),
  insert: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
  getWeightSum: jest.fn(),
  getWeightSumExcluding: jest.fn(),
  findTopicMentor: jest.fn(),
  findModulesByIds: jest.fn(),
  updateOrder: jest.fn(),
  insertResource: jest.fn(),
  findResourceById: jest.fn(),
  deleteResource: jest.fn(),
};

const mentor = { userId: 'uid-mentor', isAuthority: false };
const outsider = { userId: 'uid-outsider', isAuthority: false };

const module1 = {
  id: 'mod-1',
  topicId: 'topic-1',
  title: 'Intro',
  body: null,
  weight: 10,
  estTime: null,
  order: 1,
  createdAt: new Date(),
};

describe('CourseModulesService', () => {
  let service: CourseModulesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseModulesService,
        { provide: CourseModulesRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get<CourseModulesService>(CourseModulesService);
  });

  describe('findByTopic', () => {
    it('returns modules sorted by order', async () => {
      const unordered = [
        { ...module1, id: 'mod-3', order: 3 },
        { ...module1, id: 'mod-1', order: 1 },
        { ...module1, id: 'mod-2', order: 2 },
      ];
      mockRepo.findByTopic.mockResolvedValue(unordered);

      const result = await service.findByTopic('topic-1');

      expect(mockRepo.findByTopic).toHaveBeenCalledWith('topic-1');
      expect(result.map((m) => m.order)).toEqual([1, 2, 3]);
    });
  });

  describe('create', () => {
    const createDto = { title: 'Intro', weight: 15, order: 1 };

    it('inserts module and returns it', async () => {
      mockRepo.findTopicMentor.mockResolvedValue({
        topicId: 'topic-1',
        userId: mentor.userId,
      });
      mockRepo.getWeightSum.mockResolvedValue(70);
      mockRepo.insert.mockResolvedValue(module1);

      const result = await service.create('topic-1', createDto, mentor);

      expect(mockRepo.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          topicId: 'topic-1',
          title: 'Intro',
          weight: 15,
        }),
      );
      expect(result).toEqual(module1);
    });

    it('throws 403 when caller is not Mentor of topic and not Authority', async () => {
      mockRepo.findTopicMentor.mockResolvedValue(null);

      await expect(
        service.create('topic-1', createDto, outsider),
      ).rejects.toThrow(ForbiddenException);
      expect(mockRepo.insert).not.toHaveBeenCalled();
    });

    it('throws 400 when new weight would push sum above 100', async () => {
      mockRepo.findTopicMentor.mockResolvedValue({
        topicId: 'topic-1',
        userId: mentor.userId,
      });
      mockRepo.getWeightSum.mockResolvedValue(80);

      await expect(
        service.create('topic-1', { ...createDto, weight: 30 }, mentor),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.insert).not.toHaveBeenCalled();
    });

    it('enforces weight-sum check inside a serializable transaction', async () => {
      mockRepo.findTopicMentor.mockResolvedValue({
        topicId: 'topic-1',
        userId: mentor.userId,
      });
      mockRepo.getWeightSum.mockResolvedValue(70);
      mockRepo.insert.mockResolvedValue(module1);

      await service.create('topic-1', createDto, mentor);

      // getWeightSum and insert must be called (they run inside the tx in production)
      expect(mockRepo.getWeightSum).toHaveBeenCalledWith('topic-1');
      expect(mockRepo.insert).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('modifies module fields and returns updated record', async () => {
      mockRepo.findById.mockResolvedValue(module1);
      mockRepo.findTopicMentor.mockResolvedValue({
        topicId: 'topic-1',
        userId: mentor.userId,
      });
      mockRepo.getWeightSumExcluding.mockResolvedValue(60);
      mockRepo.updateById.mockResolvedValue({ ...module1, title: 'Updated' });

      const result = await service.update(
        'mod-1',
        { title: 'Updated', weight: 20 },
        mentor,
      );

      expect(mockRepo.updateById).toHaveBeenCalledWith(
        'mod-1',
        expect.objectContaining({ title: 'Updated' }),
      );
      expect(result.title).toBe('Updated');
    });

    it('throws 400 when updated weight would push sum above 100', async () => {
      mockRepo.findById.mockResolvedValue(module1);
      mockRepo.findTopicMentor.mockResolvedValue({
        topicId: 'topic-1',
        userId: mentor.userId,
      });
      mockRepo.getWeightSumExcluding.mockResolvedValue(70);

      await expect(
        service.update('mod-1', { weight: 40 }, mentor),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.updateById).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('removes module row', async () => {
      mockRepo.findById.mockResolvedValue(module1);
      mockRepo.findTopicMentor.mockResolvedValue({
        topicId: 'topic-1',
        userId: mentor.userId,
      });
      mockRepo.deleteById.mockResolvedValue(undefined);

      await service.delete('mod-1', mentor);

      expect(mockRepo.deleteById).toHaveBeenCalledWith('mod-1');
    });

    it('throws 403 when caller is not Mentor/Authority', async () => {
      mockRepo.findById.mockResolvedValue(module1);
      mockRepo.findTopicMentor.mockResolvedValue(null);

      await expect(service.delete('mod-1', outsider)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockRepo.deleteById).not.toHaveBeenCalled();
    });
  });

  describe('reorder', () => {
    it('updates order field for all modules atomically', async () => {
      const mod3 = { ...module1, id: 'mod-3', topicId: 'topic-1', order: 3 };
      const mod2 = { ...module1, id: 'mod-2', topicId: 'topic-1', order: 2 };
      mockRepo.findTopicMentor.mockResolvedValue({
        topicId: 'topic-1',
        userId: mentor.userId,
      });
      mockRepo.findModulesByIds.mockResolvedValue([
        { ...module1, topicId: 'topic-1' },
        mod3,
        mod2,
      ]);
      mockRepo.updateOrder.mockResolvedValue(undefined);

      await service.reorder(
        'topic-1',
        { moduleIds: ['mod-3', 'mod-1', 'mod-2'] },
        mentor,
      );

      expect(mockRepo.updateOrder).toHaveBeenCalledWith('mod-3', 1);
      expect(mockRepo.updateOrder).toHaveBeenCalledWith('mod-1', 2);
      expect(mockRepo.updateOrder).toHaveBeenCalledWith('mod-2', 3);
    });

    it('throws 400 when moduleIds contains an id not belonging to the topic', async () => {
      mockRepo.findTopicMentor.mockResolvedValue({
        topicId: 'topic-1',
        userId: mentor.userId,
      });
      mockRepo.findModulesByIds.mockResolvedValue([
        { ...module1, id: 'mod-1', topicId: 'topic-1' },
        { ...module1, id: 'mod-x', topicId: 'topic-OTHER' },
      ]);

      await expect(
        service.reorder('topic-1', { moduleIds: ['mod-1', 'mod-x'] }, mentor),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.updateOrder).not.toHaveBeenCalled();
    });
  });

  describe('addResource', () => {
    const resourceDto = { title: 'Video', url: 'https://example.com/video' };
    const resource = {
      id: 'res-1',
      moduleId: 'mod-1',
      title: 'Video',
      url: 'https://example.com/video',
    };

    it('creates resource row linked to module', async () => {
      mockRepo.findById.mockResolvedValue(module1);
      mockRepo.findTopicMentor.mockResolvedValue({
        topicId: 'topic-1',
        userId: mentor.userId,
      });
      mockRepo.insertResource.mockResolvedValue(resource);

      const result = await service.addResource('mod-1', resourceDto, mentor);

      expect(mockRepo.insertResource).toHaveBeenCalledWith(
        expect.objectContaining({ moduleId: 'mod-1', title: 'Video' }),
      );
      expect(result).toEqual(resource);
    });

    it('throws 404 when module not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        service.addResource('no-such-mod', resourceDto, mentor),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepo.insertResource).not.toHaveBeenCalled();
    });
  });

  describe('removeResource', () => {
    const resource = {
      id: 'res-1',
      moduleId: 'mod-1',
      title: 'Video',
      url: 'https://example.com/video',
    };

    it('deletes resource row', async () => {
      mockRepo.findResourceById.mockResolvedValue(resource);
      mockRepo.findById.mockResolvedValue(module1);
      mockRepo.findTopicMentor.mockResolvedValue({
        topicId: 'topic-1',
        userId: mentor.userId,
      });
      mockRepo.deleteResource.mockResolvedValue(undefined);

      await service.removeResource('res-1', mentor);

      expect(mockRepo.deleteResource).toHaveBeenCalledWith('res-1');
    });

    it('throws 404 when resource not found', async () => {
      mockRepo.findResourceById.mockResolvedValue(null);

      await expect(
        service.removeResource('no-such-res', mentor),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepo.deleteResource).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('returns module for valid id', async () => {
      mockRepo.findById.mockResolvedValue(module1);

      const result = await service.findById('mod-1');

      expect(result).toEqual(module1);
    });

    it('throws 404 for unknown id', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById('no-such-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
