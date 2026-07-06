import { useQuery } from '@tanstack/react-query';

import { topicsService } from '../services/topics.service';

/** Query keys for the topics domain. */
export const TOPICS_KEYS = {
  all: ['topics'] as const,
  enrolled: (id: string) => [...TOPICS_KEYS.all, 'enrolled', id] as const,
};

export function useEnrolledTopic(id: string) {
  return useQuery({
    queryKey: TOPICS_KEYS.enrolled(id),
    queryFn: () => topicsService.getEnrolledTopic(id),
    enabled: Boolean(id),
  });
}
