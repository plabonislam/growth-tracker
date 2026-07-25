import { z } from 'zod';

export const CreateTopicSchema = z.object({
  name: z.string().min(1),
  certificationRequired: z.boolean().default(false),
  /** A topic must be created with a mentor — the backend assigns them atomically. */
  mentorId: z.string().uuid('Select a mentor'),
});

export const UpdateTopicSchema = z.object({
  name: z.string().min(1).optional(),
  certificationRequired: z.boolean().optional(),
});

export const AssignMentorSchema = z.object({
  userId: z.string().uuid(),
});

export const TopicResponseSchema = z.object({
  id: z.string().uuid(),
  clubId: z.string().uuid(),
  name: z.string(),
  certificationRequired: z.boolean(),
  archived: z.boolean(),
  createdAt: z.string(),
});

/** The topic's assigned mentor, as surfaced on list/detail views. */
export const TopicMentorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});

/** A topic enriched for list rendering — includes mentor and module count. */
export const TopicListItemSchema = TopicResponseSchema.extend({
  moduleCount: z.number().int().nonnegative(),
  mentor: TopicMentorSchema.nullable(),
});

export type CreateTopic = z.infer<typeof CreateTopicSchema>;
export type UpdateTopic = z.infer<typeof UpdateTopicSchema>;
export type AssignMentor = z.infer<typeof AssignMentorSchema>;
export type TopicResponse = z.infer<typeof TopicResponseSchema>;
export type TopicMentor = z.infer<typeof TopicMentorSchema>;
export type TopicListItem = z.infer<typeof TopicListItemSchema>;
