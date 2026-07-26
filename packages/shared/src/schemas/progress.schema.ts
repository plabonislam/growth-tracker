import { z } from 'zod';

import { moduleProgressStatusSchema } from '../enums';

/**
 * What a learner may set on their own module. `completed` is absent on purpose:
 * finishing is the mentor's word, which is what `pending_confirmation` asks
 * for — see `MentorModuleProgressSchema`.
 */
export const UpdateModuleProgressSchema = z.object({
  status: z.enum(['to_do', 'in_progress', 'pending_confirmation']),
});

/**
 * The mentor's answer to a submitted module: `completed` accepts the work,
 * `to_do` sends it back to be done again.
 */
export const MentorModuleProgressSchema = z.object({
  status: z.enum(['completed', 'to_do']),
});

export const CreateSubmissionSchema = z.object({
  content: z.string().min(1),
});

/**
 * A learner's standing in one topic: how far along they are, and where each
 * module sits. A module the learner has never touched has no progress row, and
 * reads as `to_do`.
 */
export const TopicProgressResponseSchema = z.object({
  /** Share of the curriculum's weight already completed, 0–100. */
  progress: z.number().min(0).max(100),
  /**
   * When the learner's enrollment was approved into existence — the one date
   * their journey through a topic actually has on record.
   */
  startedAt: z.string().nullable(),
  modules: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      status: moduleProgressStatusSchema,
      weight: z.number(),
      order: z.number(),
    }),
  ),
});

export const ModuleProgressResponseSchema = z.object({
  moduleId: z.string().uuid(),
  learnerId: z.string().uuid(),
  status: moduleProgressStatusSchema,
  updatedAt: z.string(),
});

export type UpdateModuleProgress = z.infer<typeof UpdateModuleProgressSchema>;
export type MentorModuleProgress = z.infer<typeof MentorModuleProgressSchema>;
export type CreateSubmission = z.infer<typeof CreateSubmissionSchema>;
export type TopicProgressResponse = z.infer<typeof TopicProgressResponseSchema>;
export type ModuleProgressResponse = z.infer<
  typeof ModuleProgressResponseSchema
>;
