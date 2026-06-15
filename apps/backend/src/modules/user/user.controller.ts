import { Controller, Get } from '@nestjs/common';
import { UserResponse } from 'shared';
import { RequireRole } from '../../core/decorators/require-role.decorator';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RequireRole('authority')
  findAll(): Promise<UserResponse[]> {
    return this.userService.findAll();
  }
}
