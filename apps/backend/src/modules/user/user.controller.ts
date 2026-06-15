import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserResponse } from 'shared';
import { RequireRole } from '../../core/decorators/require-role.decorator';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RequireRole('authority')
  @ApiOperation({ summary: 'List all users (Authority only)' })
  findAll(): Promise<UserResponse[]> {
    return this.userService.findAll();
  }
}
