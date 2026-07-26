import { Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ApproveEnrollment, EnrollTopic } from 'shared';
import { ApproveEnrollmentSchema, EnrollTopicSchema } from 'shared';

import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { RequireRole } from '../../core/decorators/require-role.decorator';
import { ZodBody } from '../../core/decorators/zod-body.decorator';
import { EnrollmentsService } from './enrollments.service';

interface CallerUser {
  userId: string;
  isAuthority: boolean;
  email: string;
}

@ApiTags('Enrollments')
@Controller()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // Declared before `topics/:topicId/...` routes so "enrollments" is never read
  // as a topic id.
  @ApiBearerAuth()
  @RequireRole('authority')
  @Get('topics/enrollments/pending')
  @ApiOperation({
    summary: 'Get pending topic enrollment requests (Authority only)',
  })
  getPending(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.enrollmentsService.getPendingTopicEnrollments(
      limit ? parseInt(limit) : 10,
      offset ? parseInt(offset) : 0,
    );
  }

  @ApiBearerAuth()
  @Get('topics/enrollments/mine')
  @ApiOperation({
    summary: 'The caller’s enrollment status for every topic they applied to',
  })
  findMine(@CurrentUser() caller: CallerUser) {
    return this.enrollmentsService.findMyEnrollments(caller);
  }

  @ApiBearerAuth()
  @Post('topics/:topicId/enroll')
  @ApiOperation({ summary: 'Request enrollment in a topic (club member)' })
  enroll(
    @Param('topicId') topicId: string,
    @ZodBody(EnrollTopicSchema) dto: EnrollTopic,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.enrollmentsService.applyToTopic(topicId, dto, caller);
  }

  @ApiBearerAuth()
  @Patch('topics/:topicId/enrollments/:userId')
  @ApiOperation({
    summary: 'Approve or reject an enrollment request (Mentor / Authority)',
  })
  decide(
    @Param('topicId') topicId: string,
    @Param('userId') userId: string,
    @ZodBody(ApproveEnrollmentSchema) dto: ApproveEnrollment,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.enrollmentsService.decideTopicEnrollment(
      topicId,
      userId,
      dto,
      caller,
    );
  }
}
