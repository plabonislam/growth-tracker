import { useQuery } from '@tanstack/react-query';

import { usersService } from '../services/users.service';

export const USERS_KEYS = {
  list: ['users', 'list'] as const,
};

/** Fetched once and filtered client-side — same pattern as the global SearchCommand index. */
export function useUsers() {
  return useQuery({
    queryKey: USERS_KEYS.list,
    queryFn: usersService.getUsers,
    staleTime: 5 * 60 * 1000,
  });
}
