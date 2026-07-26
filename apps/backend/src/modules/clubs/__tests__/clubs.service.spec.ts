import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClubsRepository } from '../clubs.repository';
import { ClubsService } from '../clubs.service';

const mockRepo = {
  findAllActive: jest.fn(),
  findMembershipsByUserId: jest.fn(),
  findById: jest.fn(),
  insert: jest.fn(),
  updateById: jest.fn(),
  archiveById: jest.fn(),
  findCoordinatorMatch: jest.fn(),
  findMentorMatch: jest.fn(),
  findAuthorityUser: jest.fn(),
  findUserByEmail: jest.fn(),
  findByName: jest.fn(),
  findMembersByClubId: jest.fn(),
  findMembership: jest.fn(),
  createMembership: jest.fn(),
  updateMembership: jest.fn(),
  findPendingClubEnrollments: jest.fn(),
  countPendingClubEnrollments: jest.fn(),
};

const caller = { userId: 'uid-user1', isAuthority: false };
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
    it('returns non-archived clubs with user membership status', async () => {
      mockRepo.findAllActive.mockResolvedValue([club]);
      mockRepo.findMembershipsByUserId.mockResolvedValue([
        { clubId: 'club-1', status: 'active' },
      ]);

      const result = await service.findAll(caller);

      expect(mockRepo.findAllActive).toHaveBeenCalled();
      expect(mockRepo.findMembershipsByUserId).toHaveBeenCalledWith(
        'uid-user1',
      );
      expect(result).toEqual([{ ...club, membershipStatus: 'active' }]);
    });

    it('sets membershipStatus to null when no membership exists', async () => {
      mockRepo.findAllActive.mockResolvedValue([club]);
      mockRepo.findMembershipsByUserId.mockResolvedValue([]);

      const result = await service.findAll(caller);

      expect(result).toEqual([{ ...club, membershipStatus: null }]);
    });
  });

  describe('findById', () => {
    it('returns the club with the caller’s membership status', async () => {
      mockRepo.findById.mockResolvedValue(club);
      mockRepo.findMembership.mockResolvedValue(membership);

      const result = await service.findById('club-1', caller);

      expect(mockRepo.findMembership).toHaveBeenCalledWith(
        'club-1',
        'uid-user1',
      );
      expect(result).toEqual({ ...club, membershipStatus: 'active' });
    });

    it('sets membershipStatus to null when the caller has not joined', async () => {
      mockRepo.findById.mockResolvedValue(club);
      mockRepo.findMembership.mockResolvedValue(null);

      const result = await service.findById('club-1', outsider);

      expect(result).toEqual({ ...club, membershipStatus: null });
    });

    it('reports a pending application as pending, not as membership', async () => {
      mockRepo.findById.mockResolvedValue(club);
      mockRepo.findMembership.mockResolvedValue({
        ...membership,
        status: 'pending',
      });

      const result = await service.findById('club-1', caller);

      expect(result.membershipStatus).toBe('pending');
    });

    it('throws 404 for unknown id', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById('no-such-id', caller)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.findMembership).not.toHaveBeenCalled();
    });
  });

  describe('checkNameAvailable', () => {
    it('reports available when no club has the name', async () => {
      mockRepo.findByName.mockResolvedValue(null);

      const result = await service.checkNameAvailable('Frontend Club');

      expect(mockRepo.findByName).toHaveBeenCalledWith('Frontend Club');
      expect(result).toEqual({ available: true });
    });

    it('reports unavailable when a club already has the name', async () => {
      mockRepo.findByName.mockResolvedValue(club);

      const result = await service.checkNameAvailable('Frontend Club');

      expect(result).toEqual({ available: false });
    });
  });

  describe('create', () => {
    it('resolves coordinatorEmail to a user id, inserts club, and returns it', async () => {
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.findUserByEmail.mockResolvedValue({
        id: 'uid-coord',
        isAuthority: false,
      });
      mockRepo.insert.mockResolvedValue(club);

      const result = await service.create({
        name: 'Frontend Club',
        coordinatorEmail: 'coord@example.com',
        description: 'A club for frontend enthusiasts to learn and grow',
      });

      expect(mockRepo.findUserByEmail).toHaveBeenCalledWith(
        'coord@example.com',
      );
      expect(mockRepo.insert).toHaveBeenCalledWith({
        name: 'Frontend Club',
        coordinatorId: 'uid-coord',
        description: 'A club for frontend enthusiasts to learn and grow',
      });
      expect(result).toEqual(club);
    });

    it('passes description through to the repository', async () => {
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.findUserByEmail.mockResolvedValue({
        id: 'uid-coord',
        isAuthority: false,
      });
      mockRepo.insert.mockResolvedValue(club);

      await service.create({
        name: 'Frontend Club',
        coordinatorEmail: 'coord@example.com',
        description: 'A club for frontend enthusiasts',
      });

      expect(mockRepo.insert).toHaveBeenCalledWith({
        name: 'Frontend Club',
        coordinatorId: 'uid-coord',
        description: 'A club for frontend enthusiasts',
      });
    });

    it('throws 409 when the name is already taken', async () => {
      mockRepo.findByName.mockResolvedValue(club);

      await expect(
        service.create({
          name: 'Frontend Club',
          coordinatorEmail: 'coord@example.com',
          description: 'A club for frontend enthusiasts to learn and grow',
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockRepo.findUserByEmail).not.toHaveBeenCalled();
      expect(mockRepo.insert).not.toHaveBeenCalled();
    });

    it('throws 404 when coordinatorEmail matches no user', async () => {
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'Club',
          coordinatorEmail: 'nobody@example.com',
          description: 'A club for frontend enthusiasts to learn and grow',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepo.insert).not.toHaveBeenCalled();
    });

    it('throws 400 when coordinator is an Authority user', async () => {
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.findUserByEmail.mockResolvedValue({
        id: 'uid-coord',
        isAuthority: true,
      });

      await expect(
        service.create({
          name: 'Club',
          coordinatorEmail: 'coord@example.com',
          description: 'A club for frontend enthusiasts to learn and grow',
        }),
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

  describe('submitJoinApplication', () => {
    const application = {
      memberId: 'DSI-1',
      expectation: 'I want to learn frontend engineering.',
    };

    it('creates a pending membership and returns it', async () => {
      mockRepo.findById.mockResolvedValue(club);
      mockRepo.findMembership.mockResolvedValue(null);
      mockRepo.createMembership.mockResolvedValue({
        ...membership,
        status: 'pending',
        expectation: application.expectation,
      });

      const result = await service.submitJoinApplication(
        'club-1',
        'uid-user1',
        application,
      );

      expect(mockRepo.createMembership).toHaveBeenCalledWith(
        'club-1',
        'uid-user1',
        { expectation: application.expectation },
      );
      expect(result.status).toBe('pending');
    });

    it('throws 404 when the club does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        service.submitJoinApplication('no-such-club', 'uid-user1', application),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepo.createMembership).not.toHaveBeenCalled();
    });

    it('throws 400 when the club is archived', async () => {
      mockRepo.findById.mockResolvedValue({ ...club, archived: true });

      await expect(
        service.submitJoinApplication('club-1', 'uid-user1', application),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.createMembership).not.toHaveBeenCalled();
    });

    it('throws 409 when the caller already has a membership', async () => {
      mockRepo.findById.mockResolvedValue(club);
      mockRepo.findMembership.mockResolvedValue(membership);

      await expect(
        service.submitJoinApplication('club-1', 'uid-user1', application),
      ).rejects.toThrow(ConflictException);
      expect(mockRepo.createMembership).not.toHaveBeenCalled();
    });
  });

  describe('getPendingClubEnrollments', () => {
    beforeEach(() => {
      mockRepo.findPendingClubEnrollments.mockResolvedValue([]);
      mockRepo.countPendingClubEnrollments.mockResolvedValue(0);
    });

    it('scopes the queue to the clubs the caller coordinates', async () => {
      await service.getPendingClubEnrollments(10, 0, coordinator);

      expect(mockRepo.findPendingClubEnrollments).toHaveBeenCalledWith(
        10,
        0,
        'uid-coord',
      );
      expect(mockRepo.countPendingClubEnrollments).toHaveBeenCalledWith(
        'uid-coord',
      );
    });

    it('leaves the queue unscoped for an authority', async () => {
      await service.getPendingClubEnrollments(10, 0, {
        userId: 'uid-authority',
        isAuthority: true,
      });

      expect(mockRepo.findPendingClubEnrollments).toHaveBeenCalledWith(
        10,
        0,
        null,
      );
      expect(mockRepo.countPendingClubEnrollments).toHaveBeenCalledWith(null);
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
