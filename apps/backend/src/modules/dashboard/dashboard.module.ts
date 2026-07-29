import { Module } from '@nestjs/common';
import { ActivitySheetRepository } from './activity-sheet.repository';
import { ActivitySheetService } from './activity-sheet.service';
import { ClubMetricsRepository } from './club-metrics.repository';
import { ClubMetricsService } from './club-metrics.service';
import { DashboardController } from './dashboard.controller';
import { DashboardRepository } from './dashboard.repository';
import { DashboardService } from './dashboard.service';

/**
 * Three dashboards, one module: `GET /dashboard/me` is a learner's own
 * standing, `GET /dashboard` is the club reporting board, and
 * `GET /dashboard/activity-sheet` is that club's month written up in full.
 * Different audiences, same domain.
 */
@Module({
  controllers: [DashboardController],
  providers: [
    DashboardService,
    DashboardRepository,
    ClubMetricsService,
    ClubMetricsRepository,
    ActivitySheetService,
    ActivitySheetRepository,
  ],
})
export class DashboardModule {}
