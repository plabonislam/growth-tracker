import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClubsRepository } from '../clubs.repository';
import { ClubsService } from '../clubs.service';

const mockRepo = {
  findAllActive: jest.fn(),
  findById: jest.fn(),
  insert: jest.fn(),
  updateById: jest.fn(),
  archiveById: jest.fn(),
  findCoordinatorMatch: jest.fn(),
  findMentorMatch: jest.fn(),
  findAuthorityUser: jest.fn(),
  findMembersByClubId: jest.fn(),
  findMembership: jest.fn(),
  updateMembership: jest.fn(),
};

// const authority = { userId: 'uid-authority', isAuthority: true };
const coordinator = { userId: 'uid-coord', isAuthority: false };
const outsider = { userId: 'uid-outsider', isAuthority: false };

const club = {
  id: 'club-1',
  name: 'Frontend Club',
  coordinatorId: 'uid-coord',
  archived: false,
  createdAt: new Date(),
};

const membership = {
  id: 'mem-1',
  clubId: 'club-1',
  userId: 'uid-user1',
  status: 'active',
  droppedReason: null,
  createdAt: new Date(),
};

describe('ClubsService', () => {
  let service: ClubsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClubsService,
        { provide: ClubsRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get<ClubsService>(ClubsService);
  });

  describe('findAll', () => {
    it('returns only non-archived clubs', async () => {
      mockRepo.findAllActive.mockResolvedValue([club]);

      const result = await service.findAll();

      expect(mockRepo.findAllActive).toHaveBeenCalled();
      expect(result).toEqual([club]);
    });
  });

  describe('findById', () => {
    it('returns club for valid id', async () => {
      mockRepo.findById.mockResolvedValue(club);

      const result = await service.findById('club-1');

      expect(result).toEqual(club);
    });

    it('throws 404 for unknown id', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById('no-such-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('inserts club and returns it', async () => {
      mockRepo.findAuthorityUser.mockResolvedValue(null);
      mockRepo.insert.mockResolvedValue(club);

      const result = await service.create({
        name: 'Frontend Club',
        coordinatorId: 'uid-coord',
      });

      expect(mockRepo.insert).toHaveBeenCalled();
      expect(result).toEqual(club);
    });

    it('throws 400 when coordinator is an Authority user', async () => {
      mockRepo.findAuthorityUser.mockResolvedValue({
        id: 'uid-coord',
        isAuthority: true,
      });

      await expect(
        service.create({ name: 'Club', coordinatorId: 'uid-coord' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.insert).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('changes club fields', async () => {
      mockRepo.findAuthorityUser.mockResolvedValue(null);
      mockRepo.updateById.mockResolvedValue({ ...club, name: 'Renamed' });

      const result = await service.update('club-1', {
        name: 'Renamed',
        coordinatorId: 'uid-coord',
      });

      expect(mockRepo.updateById).toHaveBeenCalled();
      expect(result.name).toBe('Renamed');
    });

    it('throws 400 when new coordinator is an Authority user', async () => {
      mockRepo.findAuthorityUser.mockResolvedValue({
        id: 'uid-coord',
        isAuthority: true,
      });

      await expect(
        service.update('club-1', { coordinatorId: 'uid-coord' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.updateById).not.toHaveBeenCalled();
    });
  });

  describe('archive', () => {
    it('sets archived = true without hard-deleting', async () => {
      mockRepo.archiveById.mockResolvedValue({ ...club, archived: true });

      const result = await service.archive('club-1');

      expect(mockRepo.archiveById).toHaveBeenCalledWith('club-1');
      expect(result.archived).toBe(true);
    });
  });

  describe('findMembers', () => {
    it('returns all memberships when caller is Coordinator', async () => {
      mockRepo.findCoordinatorMatch.mockResolvedValue(club);
      mockRepo.findMembersByClubId.mockResolvedValue([membership]);

      const result = await service.findMembers('club-1', coordinator);

      expect(result).toEqual([membership]);
    });

    it('throws 403 when caller has no club role', async () => {
      mockRepo.findCoordinatorMatch.mockResolvedValue(null);
      mockRepo.findMentorMatch.mockResolvedValue(null);

      await expect(service.findMembers('club-1', outsider)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateMembershipStatus', () => {
    it('updates status for existing member', async () => {
      mockRepo.findCoordinatorMatch.mockResolvedValue(club);
      mockRepo.findMembership.mockResolvedValue(membership);
      mockRepo.updateMembership.mockResolvedValue({
        ...membership,
        status: 'on_break',
      });

      const result = await service.updateMembershipStatus(
        'club-1',
        'uid-user1',
        { status: 'on_break' },
        coordinator,
      );

      expect(mockRepo.updateMembership).toHaveBeenCalled();
      expect(result.status).toBe('on_break');
    });

    it('throws 404 when membership not found', async () => {
      mockRepo.findCoordinatorMatch.mockResolvedValue(club);
      mockRepo.findMembership.mockResolvedValue(null);

      await expect(
        service.updateMembershipStatus(
          'club-1',
          'uid-user1',
          { status: 'active' },
          coordinator,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws 403 when caller has no club role', async () => {
      mockRepo.findCoordinatorMatch.mockResolvedValue(null);
      mockRepo.findMentorMatch.mockResolvedValue(null);

      await expect(
        service.updateMembershipStatus(
          'club-1',
          'uid-user1',
          { status: 'active' },
          outsider,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
