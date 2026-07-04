import { useQuery } from '@tanstack/react-query';

import { clubsService } from '../services/clubs.service';

/** Query keys for the clubs domain. */
export const CLUBS_KEYS = {
  all: ['clubs'] as const,
  list: () => [...CLUBS_KEYS.all, 'list'] as const,
  detail: (id: string) => [...CLUBS_KEYS.all, 'detail', id] as const,
};

export function useClubs() {
  return useQuery({
    queryKey: CLUBS_KEYS.list(),
    queryFn: clubsService.getClubs,
  });
}

export function useClubDetail(id: string) {
  return useQuery({
    queryKey: CLUBS_KEYS.detail(id),
    queryFn: () => clubsService.getClubDetail(id),
    enabled: Boolean(id),
  });
}
