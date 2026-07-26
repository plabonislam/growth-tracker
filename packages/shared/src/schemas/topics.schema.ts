import { z } from 'zod';

const MAX_TOPIC_NAME_LENGTH = 100;

/**
 * The description's bounds, published so the form's counter can read them
 * instead of restating the numbers and drifting from them.
 */
export const TOPIC_DESCRIPTION_LENGTH = { min: 10, max: 1000 } as const;

export const CreateTopicSchema = z.object({
  name: z
    .string({
      required_error: 'Topic name is required',
      invalid_type_error: 'Topic name must be text',
    })
    .trim()
    .min(1, 'Topic name must contain at least 1 character(s)')
    .max(
      MAX_TOPIC_NAME_LENGTH,
      `Topic name must be ${MAX_TOPIC_NAME_LENGTH} characters or fewer`,
    ),
  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be text',
    })
    .trim()
    .min(
      TOPIC_DESCRIPTION_LENGTH.min,
      `Description must be at least ${TOPIC_DESCRIPTION_LENGTH.min} characters`,
    )
    .max(
      TOPIC_DESCRIPTION_LENGTH.max,
      `Description must be ${TOPIC_DESCRIPTION_LENGTH.max} characters or fewer`,
    ),
  certificationRequired: z
    .boolean({ invalid_type_error: 'Certification must be yes or no' })
    .default(false),
  /** A topic must be created with a mentor — the backend assigns them atomically. */
  mentorId: z
    .string({
      // Nothing picked and nothing valid picked are the same to a coordinator
      // staring at the dropdown, so both say the same thing.
      required_error: 'Select a mentor',
      invalid_type_error: 'Select a mentor',
    })
    .uuid('Select a mentor'),
});

/**
 * Wire contract for `PATCH /topics/:id`. The same rules and wording as creating
 * one — picked from `CreateTopicSchema` so an edit can never accept what a
 * create would reject — each optional, since a patch carries only what changed.
 * The mentor moves through `AssignMentorSchema` instead.
 */
export const UpdateTopicSchema = CreateTopicSchema.pick({
  name: true,
  description: true,
  certificationRequired: true,
}).partial();

export const AssignMentorSchema = z.object({
  userId: z
    .string({
      required_error: 'Select a mentor',
      invalid_type_error: 'Select a mentor',
    })
    .uuid('Select a mentor'),
});

export const TopicResponseSchema = z.object({
  id: z.string().uuid(),
  clubId: z.string().uuid(),
  name: z.string(),
  /** Null for topics created before descriptions existed. */
  description: z.string().nullable(),
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
/**
 * What a form holds before parsing — `certificationRequired` is still optional
 * here, since its default has yet to be applied. `useForm` needs this as its
 * field type, with `CreateTopic` as the transformed submit type.
 */
export type CreateTopicInput = z.input<typeof CreateTopicSchema>;
export type UpdateTopic = z.infer<typeof UpdateTopicSchema>;
export type AssignMentor = z.infer<typeof AssignMentorSchema>;
export type TopicResponse = z.infer<typeof TopicResponseSchema>;
export type TopicMentor = z.infer<typeof TopicMentorSchema>;
export type TopicListItem = z.infer<typeof TopicListItemSchema>;
