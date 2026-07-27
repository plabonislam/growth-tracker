import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { activitySheetService } from '../services/activity-sheet.service';
import { DASHBOARD_KEYS } from './use-dashboard';

/**
 * The club activity sheet for one club and one month.
 *
 * `clubId` is optional only for an authority — the API refuses anyone else
 * without one, so a coordinator's page waits until it knows which club is
 * theirs.
 */
export function useActivitySheet({
  clubId,
  month,
  enabled = true,
}: {
  clubId?: string;
  month: string;
  enabled?: boolean;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: DASHBOARD_KEYS.sheet(clubId, month),
    queryFn: () => activitySheetService.getActivitySheet({ clubId, month }),
    // Changing month should not blank the sheet out while the next one loads.
    placeholderData: keepPreviousData,
    enabled,
  });

  return { sheet: data ?? null, isLoading, isError };
}
