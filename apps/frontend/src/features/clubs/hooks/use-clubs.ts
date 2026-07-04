import { useQuery } from '@tanstack/react-query';

import { clubsService } from '../services/clubs.service';

/** Query keys for the clubs domain. */
export const CLUBS_KEYS = {
  all: ['clubs'] as const,
  list: () => [...CLUBS_KEYS.all, 'list'] as const,
};

export function useClubs() {
  return useQuery({
    queryKey: CLUBS_KEYS.list(),
    queryFn: clubsService.getClubs,
  });
}
