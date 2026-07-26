import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsController } from '../enrollments.controller';
import { EnrollmentsService } from '../enrollments.service';

const mockService = {
  applyToTopic: jest.fn(),
  findMyEnrollments: jest.fn(),
  decideTopicEnrollment: jest.fn(),
  getPendingTopicEnrollments: jest.fn(),
};

const caller = {
  userId: 'uid-learner',
  isAuthority: false,
  email: 'learner@dsinnovators.com',
};

const enrollment = {
  id: 'enr-1',
  topicId: 'topic-1',
  userId: 'uid-learner',
  status: 'pending',
};

describe('EnrollmentsController', () => {
  let controller: EnrollmentsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentsController],
      providers: [{ provide: EnrollmentsService, useValue: mockService }],
    }).compile();
    controller = module.get<EnrollmentsController>(EnrollmentsController);
  });

  it('POST /topics/:topicId/enroll passes the body and the caller', async () => {
    mockService.applyToTopic.mockResolvedValue(enrollment);
    const dto = { reason: 'I want to rebuild our reporting pipeline.' };

    const result = await controller.enroll('topic-1', dto, caller);

    expect(mockService.applyToTopic).toHaveBeenCalledWith(
      'topic-1',
      dto,
      caller,
    );
    expect(result).toEqual(enrollment);
  });

  it('GET /topics/enrollments/mine asks only for the caller’s own', async () => {
    const rows = [{ topicId: 'topic-1', status: 'approved' }];
    mockService.findMyEnrollments.mockResolvedValue(rows);

    const result = await controller.findMine(caller);

    expect(mockService.findMyEnrollments).toHaveBeenCalledWith(caller);
    expect(result).toEqual(rows);
  });

  it('PATCH /topics/:topicId/enrollments/:userId passes the decision', async () => {
    const decided = { ...enrollment, status: 'approved' };
    mockService.decideTopicEnrollment.mockResolvedValue(decided);
    const dto = { action: 'approve' as const };

    const result = await controller.decide(
      'topic-1',
      'uid-learner',
      dto,
      caller,
    );

    expect(mockService.decideTopicEnrollment).toHaveBeenCalledWith(
      'topic-1',
      'uid-learner',
      dto,
      caller,
    );
    expect(result).toEqual(decided);
  });

  it('GET /topics/enrollments/pending parses paging off the query string', async () => {
    mockService.getPendingTopicEnrollments.mockResolvedValue({
      data: [],
      total: 0,
    });

    await controller.getPending('25', '50');

    expect(mockService.getPendingTopicEnrollments).toHaveBeenCalledWith(25, 50);
  });

  it('GET /topics/enrollments/pending falls back to the first page', async () => {
    mockService.getPendingTopicEnrollments.mockResolvedValue({
      data: [],
      total: 0,
    });

    await controller.getPending();

    expect(mockService.getPendingTopicEnrollments).toHaveBeenCalledWith(10, 0);
  });
});
