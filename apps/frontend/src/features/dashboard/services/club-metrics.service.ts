import type { DashboardQuery, DashboardResponse } from 'shared';

import { httpClient } from '@/services/http/client';

/**
 * Club reporting metrics — `GET /dashboard?clubId=&range=`. An authority may
 * omit the club to read every one at once; a coordinator or mentor names theirs.
 */
export const clubMetricsService = {
  getClubMetrics: ({
    clubId,
    range,
  }: {
    clubId?: string;
    range: DashboardQuery['range'];
  }): Promise<DashboardResponse> =>
    httpClient
      .get<DashboardResponse>('/dashboard', { params: { clubId, range } })
      .then((r) => r.data),
};
