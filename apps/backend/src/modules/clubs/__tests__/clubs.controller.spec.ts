import { Test, TestingModule } from '@nestjs/testing';
import { ClubsController } from '../clubs.controller';
import { ClubsService } from '../clubs.service';

const mockClubsService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  checkNameAvailable: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  archive: jest.fn(),
  findMembers: jest.fn(),
  updateMembershipStatus: jest.fn(),
};

const club = {
  id: 'club-1',
  name: 'Frontend Club',
  coordinatorId: 'uid-coord',
  archived: false,
  createdAt: new Date(),
};

const caller = {
  userId: 'uid-coord',
  isAuthority: false,
  email: 'c@dsinnovators.com',
};

describe('ClubsController', () => {
  let controller: ClubsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClubsController],
      providers: [{ provide: ClubsService, useValue: mockClubsService }],
    }).compile();
    controller = module.get<ClubsController>(ClubsController);
  });

  it('GET /clubs calls findAll and returns result', async () => {
    mockClubsService.findAll.mockResolvedValue([club]);

    const result = await controller.findAll();

    expect(mockClubsService.findAll).toHaveBeenCalled();
    expect(result).toEqual([club]);
  });

  it('GET /clubs/:id calls findById with route param', async () => {
    mockClubsService.findById.mockResolvedValue(club);

    const result = await controller.findOne('club-1');

    expect(mockClubsService.findById).toHaveBeenCalledWith('club-1');
    expect(result).toEqual(club);
  });

  it('GET /clubs/check-name calls checkNameAvailable with query param', async () => {
    mockClubsService.checkNameAvailable.mockResolvedValue({
      available: false,
    });

    const result = await controller.checkName('Frontend Club');

    expect(mockClubsService.checkNameAvailable).toHaveBeenCalledWith(
      'Frontend Club',
    );
    expect(result).toEqual({ available: false });
  });

  it('POST /clubs calls create with validated body', async () => {
    mockClubsService.create.mockResolvedValue(club);
    const dto = {
      name: 'Frontend Club',
      coordinatorEmail: 'coord@example.com',
    };

    const result = await controller.create(dto);

    expect(mockClubsService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(club);
  });

  it('PATCH /clubs/:id/members/:userId calls updateMembershipStatus', async () => {
    const updated = { ...club, status: 'on_break' };
    mockClubsService.updateMembershipStatus.mockResolvedValue(updated);
    const dto = { status: 'on_break' as const };

    const result = await controller.updateMemberStatus(
      'club-1',
      'uid-user1',
      dto,
      caller,
    );

    expect(mockClubsService.updateMembershipStatus).toHaveBeenCalledWith(
      'club-1',
      'uid-user1',
      dto,
      caller,
    );
    expect(result).toEqual(updated);
  });
});
