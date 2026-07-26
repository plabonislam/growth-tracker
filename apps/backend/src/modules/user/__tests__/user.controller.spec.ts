import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { REQUIRE_ROLE_KEY } from '../../../core/decorators/require-role.decorator';
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';

const mockUserService = {
  findAll: jest.fn(),
};

const mockUsers = [
  {
    id: 'uuid-1',
    name: 'Alice',
    email: 'alice@dsinnovators.com',
    avatarUrl: null,
  },
  { id: 'uuid-2', name: 'Bob', email: 'bob@dsinnovators.com', avatarUrl: null },
];

const makeGuardContext = (isAuthority: boolean) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user: { is_authority: isAuthority } }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  }) as unknown as import('@nestjs/common').ExecutionContext;

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('GET /users', () => {
    it('returns user list for Authority user', async () => {
      mockUserService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('returns 403 for non-Authority user via PermissionsGuard', () => {
      // Verify @RequireRole('authority') metadata is applied to the handler

      const handler = UserController.prototype.findAll;
      const roles = Reflect.getMetadata(REQUIRE_ROLE_KEY, handler) as string[];
      expect(roles).toContain('authority');

      // Verify PermissionsGuard enforces the role
      // (mock reflector to return string — consistent with core guard tests)
      const mockReflector = {
        getAllAndOverride: jest.fn().mockReturnValue('authority'),
      } as unknown as Reflector;
      const guard = new PermissionsGuard(mockReflector);

      expect(() => guard.canActivate(makeGuardContext(false))).toThrow(
        ForbiddenException,
      );
    });
  });
});
