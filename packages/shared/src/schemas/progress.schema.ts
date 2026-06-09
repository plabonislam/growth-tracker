import { z } from 'zod';

// TODO: T10 adds MentorModuleProgressSchema (completed | to_do transitions for Mentor approval)
export const UpdateModuleProgressSchema = z.object({
  status: z.enum(['to_do', 'in_progress', 'pending_confirmation']),
});

export const CreateSubmissionSchema = z.object({
  content: z.string().min(1),
});

export const TopicProgressResponseSchema = z.object({
  progress: z.number().min(0).max(100),
  modules: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      status: z.string(),
      weight: z.number(),
      order: z.number(),
    }),
  ),
});

export type UpdateModuleProgress = z.infer<typeof UpdateModuleProgressSchema>;
export type CreateSubmission = z.infer<typeof CreateSubmissionSchema>;
export type TopicProgressResponse = z.infer<typeof TopicProgressResponseSchema>;
