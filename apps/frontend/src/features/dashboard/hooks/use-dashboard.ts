import { useQuery } from '@tanstack/react-query';

import { dashboardService } from '../services/dashboard.service';

/** Query keys for the dashboard domain. */
export const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  learner: () => [...DASHBOARD_KEYS.all, 'learner'] as const,
};

export function useLearnerDashboard() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.learner(),
    queryFn: dashboardService.getLearnerDashboard,
  });
}
