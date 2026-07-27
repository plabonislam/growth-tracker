import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ActivitySheetQuerySchema,
  DashboardQuerySchema,
  type ActivitySheetQuery,
  type DashboardQuery,
} from 'shared';

import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ZodQuery } from '../../core/decorators/zod-query.decorator';
import { ActivitySheetService } from './activity-sheet.service';
import { ClubMetricsService } from './club-metrics.service';
import { DashboardService } from './dashboard.service';

interface CallerUser {
  userId: string;
  isAuthority: boolean;
  email: string;
}

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly clubMetricsService: ClubMetricsService,
    private readonly activitySheetService: ActivitySheetService,
  ) {}

  // Declared before the metric board so "me" is never read as a query-less
  // report — they are different screens for different roles.
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({
    summary: 'The caller’s own learner dashboard — club, topic, and progress',
  })
  getMine(@CurrentUser() caller: CallerUser) {
    return this.dashboardService.getLearnerDashboard(caller);
  }

  // Ahead of the bare `@Get()` for the same reason as "me": a named report is
  // not the query-less board.
  @ApiBearerAuth()
  @Get('activity-sheet')
  @ApiOperation({
    summary:
      'A club’s monthly activity sheet — figures, session log and roster ' +
      '(Authority all clubs, Coordinator / Mentor their own)',
  })
  getActivitySheet(
    @ZodQuery(ActivitySheetQuerySchema) query: ActivitySheetQuery,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.activitySheetService.getSheet(query, caller);
  }

  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary:
      'Club reporting metrics (Authority all clubs, Coordinator / Mentor their own)',
  })
  getMetrics(
    @ZodQuery(DashboardQuerySchema) query: DashboardQuery,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.clubMetricsService.getDashboard(query, caller);
  }
}
