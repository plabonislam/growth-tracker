import { Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSessionSchema, type CreateSession } from 'shared';

import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ZodBody } from '../../core/decorators/zod-body.decorator';
import { SessionsService } from './sessions.service';

interface CallerUser {
  userId: string;
  isAuthority: boolean;
  email: string;
}

@ApiTags('Sessions')
@Controller()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @ApiBearerAuth()
  @Post('clubs/:clubId/sessions')
  @ApiOperation({
    summary: 'Log a session the club held (Mentor / Coordinator / Authority)',
  })
  create(
    @Param('clubId') clubId: string,
    @ZodBody(CreateSessionSchema) dto: CreateSession,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.sessionsService.create(clubId, dto, caller);
  }
}
