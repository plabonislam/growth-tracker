import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from '../progress.controller';
import { ProgressService } from '../progress.service';

const mockService = {
  getTopicProgress: jest.fn(),
  setOwnProgress: jest.fn(),
  decideModuleProgress: jest.fn(),
  getPendingReviews: jest.fn(),
};

const caller = {
  userId: 'uid-learner',
  isAuthority: false,
  email: 'learner@dsinnovators.com',
};

describe('ProgressController', () => {
  let controller: ProgressController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [{ provide: ProgressService, useValue: mockService }],
    }).compile();
    controller = moduleRef.get<ProgressController>(ProgressController);
  });

  it('GET /topics/:topicId/progress asks for the caller’s own progress', async () => {
    const progress = { progress: 40, modules: [] };
    mockService.getTopicProgress.mockResolvedValue(progress);

    const result = await controller.getTopicProgress('topic-1', caller);

    expect(mockService.getTopicProgress).toHaveBeenCalledWith(
      'topic-1',
      caller,
    );
    expect(result).toEqual(progress);
  });

  it('PATCH /modules/:moduleId/progress passes the learner’s new status', async () => {
    mockService.setOwnProgress.mockResolvedValue({ status: 'in_progress' });
    const dto = { status: 'in_progress' as const };

    const result = await controller.setOwnProgress('mod-1', dto, caller);

    expect(mockService.setOwnProgress).toHaveBeenCalledWith(
      'mod-1',
      dto,
      caller,
    );
    expect(result).toEqual({ status: 'in_progress' });
  });

  it('GET /modules/progress/pending parses paging and passes the reviewer', async () => {
    mockService.getPendingReviews.mockResolvedValue({ data: [], total: 0 });

    await controller.getPendingReviews(caller, '25', '50');

    expect(mockService.getPendingReviews).toHaveBeenCalledWith(25, 50, caller);
  });

  it('GET /modules/progress/pending falls back to the first page', async () => {
    mockService.getPendingReviews.mockResolvedValue({ data: [], total: 0 });

    await controller.getPendingReviews(caller);

    expect(mockService.getPendingReviews).toHaveBeenCalledWith(10, 0, caller);
  });

  it('PATCH /modules/:moduleId/progress/:learnerId passes the mentor’s decision', async () => {
    mockService.decideModuleProgress.mockResolvedValue({ status: 'completed' });
    const dto = { status: 'completed' as const };

    const result = await controller.decideModuleProgress(
      'mod-1',
      'uid-learner',
      dto,
      caller,
    );

    expect(mockService.decideModuleProgress).toHaveBeenCalledWith(
      'mod-1',
      'uid-learner',
      dto,
      caller,
    );
    expect(result).toEqual({ status: 'completed' });
  });
});
