import { useQuery } from '@tanstack/react-query';

import { topicsService } from '../services/topics.service';

/** Query keys for the topics domain. */
export const TOPICS_KEYS = {
  all: ['topics'] as const,
  detail: (id: string) => [...TOPICS_KEYS.all, 'detail', id] as const,
  modules: (id: string) => [...TOPICS_KEYS.all, 'modules', id] as const,
  enrolled: (id: string) => [...TOPICS_KEYS.all, 'enrolled', id] as const,
};

export function useEnrolledTopic(id: string) {
  return useQuery({
    queryKey: TOPICS_KEYS.enrolled(id),
    queryFn: () => topicsService.getEnrolledTopic(id),
    enabled: Boolean(id),
  });
}

/** Topic identity + mentor — decides which view the topic page renders. */
export function useTopic(id: string) {
  return useQuery({
    queryKey: TOPICS_KEYS.detail(id),
    queryFn: () => topicsService.getTopic(id),
    enabled: Boolean(id),
  });
}

export function useTopicModules(id: string) {
  return useQuery({
    queryKey: TOPICS_KEYS.modules(id),
    queryFn: () => topicsService.getTopicModules(id),
    enabled: Boolean(id),
  });
}
