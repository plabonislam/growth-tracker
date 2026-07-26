import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { MentorModuleProgress, UpdateModuleProgress } from 'shared';
import { MentorModuleProgressSchema, UpdateModuleProgressSchema } from 'shared';

import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ZodBody } from '../../core/decorators/zod-body.decorator';
import { ProgressService } from './progress.service';

interface CallerUser {
  userId: string;
  isAuthority: boolean;
  email: string;
}

@ApiTags('Progress')
@Controller()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @ApiBearerAuth()
  @Get('topics/:topicId/progress')
  @ApiOperation({
    summary: 'The caller’s progress through a topic (enrolled learner)',
  })
  getTopicProgress(
    @Param('topicId') topicId: string,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.progressService.getTopicProgress(topicId, caller);
  }

  // Declared before `modules/:moduleId/...` so "progress" is never read as an id.
  @ApiBearerAuth()
  @Get('modules/progress/pending')
  @ApiOperation({
    summary: 'Modules submitted for this reviewer (Mentor / Authority)',
  })
  getPendingReviews(
    @CurrentUser() caller: CallerUser,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.progressService.getPendingReviews(
      limit ? parseInt(limit) : 10,
      offset ? parseInt(offset) : 0,
      caller,
    );
  }

  @ApiBearerAuth()
  @Patch('modules/:moduleId/progress')
  @ApiOperation({
    summary: 'Move your own module along (enrolled learner)',
  })
  setOwnProgress(
    @Param('moduleId') moduleId: string,
    @ZodBody(UpdateModuleProgressSchema) dto: UpdateModuleProgress,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.progressService.setOwnProgress(moduleId, dto, caller);
  }

  @ApiBearerAuth()
  @Patch('modules/:moduleId/progress/:learnerId')
  @ApiOperation({
    summary: 'Approve or return a submitted module (Mentor / Authority)',
  })
  decideModuleProgress(
    @Param('moduleId') moduleId: string,
    @Param('learnerId') learnerId: string,
    @ZodBody(MentorModuleProgressSchema) dto: MentorModuleProgress,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.progressService.decideModuleProgress(
      moduleId,
      learnerId,
      dto,
      caller,
    );
  }
}
