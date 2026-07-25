import { Test, TestingModule } from '@nestjs/testing';
import { TopicsController } from '../topics.controller';
import { TopicsService } from '../topics.service';

const mockTopicsService = {
  findByClub: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  archive: jest.fn(),
  assignMentor: jest.fn(),
  removeMentor: jest.fn(),
};

const caller = {
  userId: 'uid-coord',
  isAuthority: false,
  email: 'c@dsinnovators.com',
};

const topic = {
  id: 'topic-1',
  clubId: 'club-1',
  name: 'React Basics',
  certificationRequired: false,
  archived: false,
  createdAt: new Date(),
};

describe('TopicsController', () => {
  let controller: TopicsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopicsController],
      providers: [{ provide: TopicsService, useValue: mockTopicsService }],
    }).compile();
    controller = module.get<TopicsController>(TopicsController);
  });

  it('GET /clubs/:clubId/topics delegates to findByClub', async () => {
    mockTopicsService.findByClub.mockResolvedValue([topic]);

    const result = await controller.findByClub('club-1');

    expect(mockTopicsService.findByClub).toHaveBeenCalledWith('club-1');
    expect(result).toEqual([topic]);
  });

  it('POST /clubs/:clubId/topics delegates to create with caller context', async () => {
    mockTopicsService.create.mockResolvedValue(topic);
    const dto = {
      name: 'React Basics',
      description: 'Hooks, state, and the render cycle.',
      certificationRequired: false,
      mentorId: '11111111-1111-1111-1111-111111111111',
    };

    const result = await controller.create('club-1', dto, caller);

    expect(mockTopicsService.create).toHaveBeenCalledWith(
      'club-1',
      dto,
      caller,
    );
    expect(result).toEqual(topic);
  });

  it('POST /topics/:id/mentors delegates to assignMentor', async () => {
    mockTopicsService.assignMentor.mockResolvedValue(undefined);
    const dto = { userId: 'uid-mentor' };

    await controller.assignMentor('topic-1', dto, caller);

    expect(mockTopicsService.assignMentor).toHaveBeenCalledWith(
      'topic-1',
      'uid-mentor',
      caller,
    );
  });

  it('DELETE /topics/:id/mentors/:userId delegates to removeMentor', async () => {
    mockTopicsService.removeMentor.mockResolvedValue(undefined);

    await controller.removeMentor('topic-1', 'uid-mentor', caller);

    expect(mockTopicsService.removeMentor).toHaveBeenCalledWith(
      'topic-1',
      'uid-mentor',
      caller,
    );
  });
});
