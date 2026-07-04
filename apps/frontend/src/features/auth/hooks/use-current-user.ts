import { useQuery } from '@tanstack/react-query';

import { currentUserService } from '../services/current-user.service';

export const AUTH_KEYS = {
  currentUser: ['auth', 'current-user'] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_KEYS.currentUser,
    queryFn: currentUserService.getCurrentUser,
    staleTime: Infinity,
  });
}
