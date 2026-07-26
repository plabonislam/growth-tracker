import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

interface CallerUser {
  userId: string;
  isAuthority: boolean;
  email: string;
}

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({
    summary: 'The caller’s own learner dashboard — club, topic, and progress',
  })
  getMine(@CurrentUser() caller: CallerUser) {
    return this.dashboardService.getLearnerDashboard(caller);
  }
}
