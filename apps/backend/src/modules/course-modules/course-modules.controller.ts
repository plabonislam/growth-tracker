import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  CreateModule,
  CreateResource,
  ReorderModules,
  UpdateModule,
} from 'shared';
import {
  CreateModuleSchema,
  CreateResourceSchema,
  ReorderModulesSchema,
  UpdateModuleSchema,
} from 'shared';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ZodBody } from '../../core/decorators/zod-body.decorator';
import { CourseModulesService } from './course-modules.service';

interface CallerUser {
  userId: string;
  isAuthority: boolean;
  email: string;
}

@ApiTags('Course Modules')
@ApiBearerAuth()
@Controller()
export class CourseModulesController {
  constructor(private readonly courseModulesService: CourseModulesService) {}

  @Get('topics/:topicId/modules')
  @ApiOperation({ summary: 'List modules for a topic' })
  findByTopic(@Param('topicId') topicId: string) {
    return this.courseModulesService.findByTopic(topicId);
  }

  @Post('topics/:topicId/modules')
  @ApiOperation({ summary: 'Create a module (Mentor / Authority)' })
  create(
    @Param('topicId') topicId: string,
    @ZodBody(CreateModuleSchema) dto: CreateModule,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.courseModulesService.create(topicId, dto, caller);
  }

  @Patch('topics/:topicId/modules/:id')
  @ApiOperation({ summary: 'Update a module (Mentor / Authority)' })
  update(
    @Param('topicId') _topicId: string,
    @Param('id') id: string,
    @ZodBody(UpdateModuleSchema) dto: UpdateModule,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.courseModulesService.update(id, dto, caller);
  }

  @Delete('modules/:id')
  @ApiOperation({ summary: 'Delete a module (Mentor / Authority)' })
  delete(@Param('id') id: string, @CurrentUser() caller: CallerUser) {
    return this.courseModulesService.delete(id, caller);
  }

  @Patch('topics/:topicId/modules/reorder')
  @ApiOperation({ summary: 'Reorder modules (Mentor / Authority)' })
  reorder(
    @Param('topicId') topicId: string,
    @ZodBody(ReorderModulesSchema) dto: ReorderModules,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.courseModulesService.reorder(topicId, dto, caller);
  }

  @Post('modules/:id/resources')
  @ApiOperation({ summary: 'Add resource to module (Mentor / Authority)' })
  addResource(
    @Param('id') moduleId: string,
    @ZodBody(CreateResourceSchema) dto: CreateResource,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.courseModulesService.addResource(moduleId, dto, caller);
  }

  @Delete('modules/:id/resources/:resourceId')
  @ApiOperation({ summary: 'Remove resource from module (Mentor / Authority)' })
  removeResource(
    @Param('resourceId') resourceId: string,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.courseModulesService.removeResource(resourceId, caller);
  }
}
