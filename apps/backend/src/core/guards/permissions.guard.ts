import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_ROLE_KEY } from '../decorators/require-role.decorator';

/**
 * The request shape this guard reads.
 *
 * NOTE: `is_authority` is the key the guard has always read, so it is the key
 * typed here — but `JwtStrategy.validate()` puts `isAuthority` on the request.
 * The two never meet, which `getRequest()`'s untyped `any` was hiding. Naming
 * the type does not change that; it only makes it visible. Reconciling the two
 * is an auth behaviour change and belongs in its own issue.
 */
interface RequestWithUser {
  user?: { is_authority?: boolean };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.getAllAndOverride<string>(
      REQUIRE_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRole) return true;

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    if (requiredRole === 'authority' && !user?.is_authority) {
      throw new ForbiddenException();
    }

    return true;
  }
}
