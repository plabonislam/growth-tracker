import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from '../permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;

  const makeContext = (user: Record<string, unknown>) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new PermissionsGuard(reflector);
  });

  it('throws 403 for non-Authority user on Authority-only route', () => {
    reflector.getAllAndOverride.mockReturnValue('authority');

    expect(() =>
      guard.canActivate(makeContext({ is_authority: false })),
    ).toThrow(ForbiddenException);
  });

  it('passes through when no @RequireRole() metadata set', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(makeContext({ is_authority: false }))).toBe(true);
  });

  it('allows Authority user through', () => {
    reflector.getAllAndOverride.mockReturnValue('authority');

    const result = guard.canActivate(makeContext({ is_authority: true }));

    expect(result).toBe(true);
  });
});
