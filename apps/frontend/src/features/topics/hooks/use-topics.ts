import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateModule, CreateResource } from 'shared';

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

/**
 * Creates a module, then attaches its resources — the API only accepts
 * resources once the module has an id, so they go in a follow-up pass.
 * A failed resource never rolls back the module; the caller reports it.
 */
export function useCreateModule(topicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      module,
      resources,
    }: {
      module: CreateModule;
      resources: CreateResource[];
    }) => {
      const created = await topicsService.createModule(topicId, module);

      let failedResources = 0;
      for (const resource of resources) {
        try {
          await topicsService.addModuleResource(created.id, resource);
        } catch {
          failedResources += 1;
        }
      }

      return { module: created, failedResources };
    },
    // Settled rather than success: a create the API rejected over the weight
    // budget means our copy of the curriculum is stale, so refetch either way.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TOPICS_KEYS.modules(topicId) });
    },
  });
}
