import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateSession } from 'shared';

import { DASHBOARD_KEYS } from '@/features/dashboard/hooks/use-dashboard';
import { sessionsService } from '../services/sessions.service';

/**
 * Logs a session against a club. The activity sheet counts sessions, averages
 * their attendance and dates itself from them, so every sheet is dropped on
 * success rather than trying to work out which month the new one landed in.
 */
export function useLogSession(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (session: CreateSession) =>
      sessionsService.logSession({ clubId, session }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
    },
  });
}
