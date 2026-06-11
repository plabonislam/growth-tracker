import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_ROLE_KEY } from '../decorators/require-role.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.getAllAndOverride<string>(
      REQUIRE_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRole) return true;

    const { user } = context.switchToHttp().getRequest();
    if (requiredRole === 'authority' && !user?.is_authority) {
      throw new ForbiddenException();
    }

    return true;
  }
}
