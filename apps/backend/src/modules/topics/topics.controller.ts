import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AssignMentor, CreateTopic, UpdateTopic } from 'shared';
import {
  AssignMentorSchema,
  CreateTopicSchema,
  UpdateTopicSchema,
} from 'shared';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { Public } from '../../core/decorators/public.decorator';
import { ZodBody } from '../../core/decorators/zod-body.decorator';
import { TopicsService } from './topics.service';

interface CallerUser {
  userId: string;
  isAuthority: boolean;
  email: string;
}

@ApiTags('Topics')
@Controller()
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  // Authenticated rather than public: what comes back depends on the caller.
  // Drafts belong to the people writing them, so the list has to know who asks.
  @ApiBearerAuth()
  @Get('clubs/:clubId/topics')
  @ApiOperation({
    summary: 'List active topics for a club — drafts only for their authors',
  })
  findByClub(
    @Param('clubId') clubId: string,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.topicsService.findByClub(clubId, caller);
  }

  @Public()
  @Get('topics/:id')
  @ApiOperation({ summary: 'Get a topic by id (public)' })
  findById(@Param('id') id: string) {
    return this.topicsService.findById(id);
  }

  @ApiBearerAuth()
  @Post('clubs/:clubId/topics')
  @ApiOperation({ summary: 'Create a topic (Coordinator / Authority)' })
  create(
    @Param('clubId') clubId: string,
    @ZodBody(CreateTopicSchema) dto: CreateTopic,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.topicsService.create(clubId, dto, caller);
  }

  @ApiBearerAuth()
  @Patch('topics/:id')
  @ApiOperation({
    summary: 'Update a topic (Coordinator / Mentor / Authority)',
  })
  update(
    @Param('id') id: string,
    @ZodBody(UpdateTopicSchema) dto: UpdateTopic,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.topicsService.update(id, dto, caller);
  }

  @ApiBearerAuth()
  @Post('topics/:id/publish')
  @ApiOperation({
    summary: 'Publish a topic (Mentor only, weights must be 100%)',
  })
  publish(@Param('id') id: string, @CurrentUser() caller: CallerUser) {
    return this.topicsService.publish(id, caller);
  }

  @ApiBearerAuth()
  @Post('topics/:id/unpublish')
  @ApiOperation({ summary: 'Return a topic to draft (Mentor only)' })
  unpublish(@Param('id') id: string, @CurrentUser() caller: CallerUser) {
    return this.topicsService.unpublish(id, caller);
  }

  @ApiBearerAuth()
  @Delete('topics/:id')
  @ApiOperation({ summary: 'Archive a topic (Coordinator / Authority)' })
  archive(@Param('id') id: string, @CurrentUser() caller: CallerUser) {
    return this.topicsService.archive(id, caller);
  }

  @ApiBearerAuth()
  @Post('topics/:id/mentors')
  @ApiOperation({
    summary: 'Assign a mentor to a topic (Coordinator / Authority)',
  })
  assignMentor(
    @Param('id') topicId: string,
    @ZodBody(AssignMentorSchema) dto: AssignMentor,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.topicsService.assignMentor(topicId, dto.userId, caller);
  }

  @ApiBearerAuth()
  @Delete('topics/:id/mentors/:userId')
  @ApiOperation({
    summary: 'Remove a mentor from a topic (Coordinator / Authority)',
  })
  removeMentor(
    @Param('id') topicId: string,
    @Param('userId') userId: string,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.topicsService.removeMentor(topicId, userId, caller);
  }
}
