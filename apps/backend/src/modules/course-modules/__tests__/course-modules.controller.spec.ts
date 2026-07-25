import { Test, TestingModule } from '@nestjs/testing';
import { CourseModulesController } from '../course-modules.controller';
import { CourseModulesService } from '../course-modules.service';

const mockService = {
  findByTopic: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  reorder: jest.fn(),
  addResource: jest.fn(),
  removeResource: jest.fn(),
};

const caller = {
  userId: 'uid-mentor',
  isAuthority: false,
  email: 'm@dsinnovators.com',
};

const mod = {
  id: 'mod-1',
  topicId: 'topic-1',
  title: 'Intro',
  body: null,
  weight: 10,
  estTime: null,
  order: 1,
  createdAt: new Date(),
};

describe('CourseModulesController', () => {
  let controller: CourseModulesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseModulesController],
      providers: [{ provide: CourseModulesService, useValue: mockService }],
    }).compile();
    controller = module.get<CourseModulesController>(CourseModulesController);
  });

  it('GET /topics/:topicId/modules delegates to findByTopic', async () => {
    mockService.findByTopic.mockResolvedValue([mod]);

    const result = await controller.findByTopic('topic-1');

    expect(mockService.findByTopic).toHaveBeenCalledWith('topic-1');
    expect(result).toEqual([mod]);
  });

  it('POST /topics/:topicId/modules delegates to create with caller', async () => {
    mockService.create.mockResolvedValue(mod);
    const dto = {
      title: 'Intro',
      body: 'What the module covers',
      weight: 10,
      estTime: 90,
      order: 1,
    };

    const result = await controller.create('topic-1', dto, caller);

    expect(mockService.create).toHaveBeenCalledWith('topic-1', dto, caller);
    expect(result).toEqual(mod);
  });

  it('PATCH /topics/:topicId/modules/reorder delegates to reorder', async () => {
    mockService.reorder.mockResolvedValue(undefined);
    const dto = { moduleIds: ['mod-1', 'mod-2'] };

    await controller.reorder('topic-1', dto, caller);

    expect(mockService.reorder).toHaveBeenCalledWith('topic-1', dto, caller);
  });

  it('POST /modules/:id/resources delegates to addResource', async () => {
    const resource = {
      id: 'res-1',
      moduleId: 'mod-1',
      title: 'Video',
      url: 'https://example.com',
    };
    mockService.addResource.mockResolvedValue(resource);
    const dto = {
      title: 'Video',
      url: 'https://example.com',
      kind: 'video' as const,
    };

    const result = await controller.addResource('mod-1', dto, caller);

    expect(mockService.addResource).toHaveBeenCalledWith('mod-1', dto, caller);
    expect(result).toEqual(resource);
  });
});
