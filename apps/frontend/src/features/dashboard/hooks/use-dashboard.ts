import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { DashboardQuery } from 'shared';

import { clubMetricsService } from '../services/club-metrics.service';
import { dashboardService } from '../services/dashboard.service';

/** Query keys for the dashboard domain. */
export const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  learner: () => [...DASHBOARD_KEYS.all, 'learner'] as const,
  metrics: (clubId: string | undefined, range: string) =>
    [...DASHBOARD_KEYS.all, 'metrics', { clubId, range }] as const,
  sheet: (clubId: string | undefined, month: string) =>
    [...DASHBOARD_KEYS.all, 'sheet', { clubId, month }] as const,
};

export function useLearnerDashboard() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.learner(),
    queryFn: dashboardService.getLearnerDashboard,
  });
}

/**
 * The club reporting board. `clubId` is optional only for an authority — the
 * API refuses anyone else without one, so the caller waits until it knows which
 * club is theirs.
 */
export function useClubMetrics({
  clubId,
  range,
  enabled = true,
}: {
  clubId?: string;
  range: DashboardQuery['range'];
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: DASHBOARD_KEYS.metrics(clubId, range),
    queryFn: () => clubMetricsService.getClubMetrics({ clubId, range }),
    // The board should not blank out while a new range loads.
    placeholderData: keepPreviousData,
    enabled,
  });
}
