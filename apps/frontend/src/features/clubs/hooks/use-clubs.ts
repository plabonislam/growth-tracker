import { useMutation, useQuery } from '@tanstack/react-query';
import type { JoinClub } from 'shared';

import { clubsService } from '../services/clubs.service';

/** Query keys for the clubs domain. */
export const CLUBS_KEYS = {
  all: ['clubs'] as const,
  list: () => [...CLUBS_KEYS.all, 'list'] as const,
  detail: (id: string) => [...CLUBS_KEYS.all, 'detail', id] as const,
  joinInfo: (id: string) => [...CLUBS_KEYS.all, 'join-info', id] as const,
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

export function useClubJoinInfo(id: string) {
  return useQuery({
    queryKey: CLUBS_KEYS.joinInfo(id),
    queryFn: () => clubsService.getClubJoinInfo(id),
    enabled: Boolean(id),
  });
}

export function useSubmitJoinApplication(clubId: string) {
  return useMutation({
    mutationFn: (payload: JoinClub) =>
      clubsService.submitJoinApplication(clubId, payload),
  });
}
