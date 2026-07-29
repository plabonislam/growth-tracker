import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../../core/database/database.service';
import { AuthService } from '../auth.service';

const TEST_SECRET = 'test-secret';

const mockUser = {
  id: 'uuid-1',
  name: 'Alice',
  email: 'alice@dsinnovators.com',
  avatarUrl: 'https://example.com/avatar.png',
  isAuthority: false,
  createdAt: new Date(),
};

const mockGoogleProfile = {
  email: 'alice@dsinnovators.com',
  name: 'Alice',
  avatarUrl: 'https://example.com/avatar.png',
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let mockDb: { select: jest.Mock; insert: jest.Mock; update: jest.Mock };

  beforeEach(async () => {
    mockDb = {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: TEST_SECRET,
          signOptions: { expiresIn: '4h' },
        }),
      ],
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: { db: mockDb } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('upsertUser', () => {
    it('creates new user on first Google login', async () => {
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(selectChain);
      const insertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.insert.mockReturnValue(insertChain);

      const result = await service.upsertUser(mockGoogleProfile);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('updates and returns existing user on repeat login', async () => {
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValue(selectChain);
      const updatedUser = { ...mockUser, name: 'Alice Updated' };
      const updateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedUser]),
      };
      mockDb.update.mockReturnValue(updateChain);

      const result = await service.upsertUser({
        ...mockGoogleProfile,
        name: 'Alice Updated',
      });

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });
  });

  describe('generateTokens', () => {
    it('returns accessToken and refreshToken', () => {
      const { accessToken, refreshToken } = service.generateTokens(mockUser);

      expect(typeof accessToken).toBe('string');
      expect(accessToken.length).toBeGreaterThan(0);
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.length).toBeGreaterThan(0);
    });

    it('accessToken payload carries userId, email, isAuthority', () => {
      const userWithAuthority = { ...mockUser, isAuthority: true };
      const { accessToken } = service.generateTokens(userWithAuthority);

      const decoded = jwtService.decode(accessToken) as Record<string, unknown>;

      expect(decoded['sub']).toBe(mockUser.id);
      expect(decoded['email']).toBe(mockUser.email);
      expect(decoded['isAuthority']).toBe(true);
    });
  });

  describe('refreshAccessToken', () => {
    it('returns new accessToken for valid refresh token', () => {
      const { refreshToken } = service.generateTokens(mockUser);
      const { accessToken } = service.refreshAccessToken(refreshToken);

      expect(typeof accessToken).toBe('string');
      expect(accessToken.length).toBeGreaterThan(0);
    });

    it('throws UnauthorizedException for expired or tampered token', () => {
      expect(() => service.refreshAccessToken('tampered.token.here')).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getMe', () => {
    /**
     * `getMe` runs three selects at once: the profile, then one row each to
     * ask whether this user coordinates a club or mentors a topic. They are
     * answered in call order.
     */
    const givenSelects = (
      profileRows: unknown[],
      coordinatorRows: unknown[],
      mentorRows: unknown[],
    ) => {
      // The profile query ends at `where`; each role probe adds `limit`.
      const probe = (rows: unknown[]) => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(rows),
        }),
      });

      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockResolvedValue(profileRows),
        })
        .mockReturnValueOnce(probe(coordinatorRows))
        .mockReturnValueOnce(probe(mentorRows));
    };

    it('returns the profile with no roles for a plain learner', async () => {
      givenSelects([mockUser], [], []);

      const result = await service.getMe('uuid-1');

      expect(result).toEqual({
        ...mockUser,
        roles: { isAuthority: false, isCoordinator: false, isMentor: false },
      });
    });

    it('reports coordinating and mentoring from the join tables', async () => {
      givenSelects([mockUser], [{ id: 'club-1' }], [{ topicId: 'topic-1' }]);

      const result = await service.getMe('uuid-1');

      expect(result.roles).toEqual({
        isAuthority: false,
        isCoordinator: true,
        isMentor: true,
      });
    });

    it('throws NotFoundException when user not found', async () => {
      givenSelects([], [], []);

      await expect(service.getMe('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
