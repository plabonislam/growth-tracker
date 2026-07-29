import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { CourseModulesModule } from './modules/course-modules/course-modules.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { ProgressModule } from './modules/progress/progress.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { TopicsModule } from './modules/topics/topics.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    CoreModule,
    UserModule,
    AuthModule,
    ClubsModule,
    TopicsModule,
    CourseModulesModule,
    EnrollmentsModule,
    ProgressModule,
    DashboardModule,
    SessionsModule,
  ],
})
export class AppModule {}
