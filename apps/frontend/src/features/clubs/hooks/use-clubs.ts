import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateClub, CreateTopic, JoinClub, UpdateClub } from 'shared';

import { clubsService } from '../services/clubs.service';

/** Query keys for the clubs domain. */
export const CLUBS_KEYS = {
  all: ['clubs'] as const,
  list: () => [...CLUBS_KEYS.all, 'list'] as const,
  detail: (id: string) => [...CLUBS_KEYS.all, 'detail', id] as const,
  joinInfo: (id: string) => [...CLUBS_KEYS.all, 'join-info', id] as const,
  topics: (id: string) => [...CLUBS_KEYS.all, 'topics', id] as const,
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

/** Live topics for a club — `GET /clubs/:clubId/topics`. */
export function useClubTopics(clubId: string) {
  return useQuery({
    queryKey: CLUBS_KEYS.topics(clubId),
    queryFn: () => clubsService.getTopicsByClub(clubId),
    enabled: Boolean(clubId),
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: JoinClub) =>
      clubsService.submitJoinApplication(clubId, payload),
    onSuccess: () => {
      // The application leaves the caller `pending` in this club, which both
      // the club card's badge and the club page's topic actions read from.
      queryClient.invalidateQueries({ queryKey: CLUBS_KEYS.detail(clubId) });
      queryClient.invalidateQueries({ queryKey: CLUBS_KEYS.list() });
    },
  });
}

export function useCreateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClub) => clubsService.createClub(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLUBS_KEYS.list() });
    },
  });
}

export function useUpdateClub(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateClub) =>
      clubsService.updateClub(clubId, payload),
    onSuccess: () => {
      // The edited name and description are on the card and on the club page.
      queryClient.invalidateQueries({ queryKey: CLUBS_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: CLUBS_KEYS.detail(clubId) });
    },
  });
}

export function useCreateTopic(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTopic) =>
      clubsService.createTopic(clubId, payload),
    onSuccess: () => {
      // Refresh the club's live topics list so the new topic appears.
      queryClient.invalidateQueries({ queryKey: CLUBS_KEYS.topics(clubId) });
      queryClient.invalidateQueries({ queryKey: CLUBS_KEYS.detail(clubId) });
    },
  });
}

/** What an edit submits: the whole form, plus who the mentor was before it. */
export interface UpdateTopicVars {
  topicId: string;
  values: CreateTopic;
  /** The mentor the topic already had, so an unchanged pick skips the swap. */
  previousMentorId?: string;
}

/**
 * Saves a topic edit. The form is the create form, but the API splits it: the
 * text fields go through `PATCH /topics/:id` while the mentor lives in a join
 * table reached by its own endpoints. Reassigning is therefore remove-then-add
 * and is not atomic with the patch — a failure partway leaves the fields saved
 * and the mentor unchanged, which the caller surfaces as a failed save.
 */
export function useUpdateTopic(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      topicId,
      values,
      previousMentorId,
    }: UpdateTopicVars) => {
      const topic = await clubsService.updateTopic(topicId, {
        name: values.name,
        description: values.description,
        certificationRequired: values.certificationRequired,
      });

      if (values.mentorId !== previousMentorId) {
        // Ordered remove-then-add: the join table would otherwise hold both,
        // and the list would render whichever row came back first.
        if (previousMentorId) {
          await clubsService.removeTopicMentor(topicId, previousMentorId);
        }
        await clubsService.assignTopicMentor(topicId, values.mentorId);
      }

      return topic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLUBS_KEYS.topics(clubId) });
      queryClient.invalidateQueries({ queryKey: CLUBS_KEYS.detail(clubId) });
    },
  });
}

/** On-blur uniqueness check for the club name field. */
export function useCheckClubName() {
  return useMutation({
    mutationFn: (name: string) => clubsService.checkClubNameAvailable(name),
  });
}
