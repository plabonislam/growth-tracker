import { Module } from '@nestjs/common';
import { CourseModulesController } from './course-modules.controller';
import { CourseModulesRepository } from './course-modules.repository';
import { CourseModulesService } from './course-modules.service';

@Module({
  controllers: [CourseModulesController],
  providers: [CourseModulesService, CourseModulesRepository],
})
export class CourseModulesModule {}
