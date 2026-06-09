import { z } from 'zod';

export const ApproveEnrollmentSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

export const ClubEnrollmentResponseSchema = z.object({
  id: z.string().uuid(),
  clubId: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.string(),
  droppedReason: z.string().nullable(),
  createdAt: z.string(),
});

export const TopicEnrollmentResponseSchema = z.object({
  id: z.string().uuid(),
  topicId: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.string(),
  createdAt: z.string(),
});

export type ApproveEnrollment = z.infer<typeof ApproveEnrollmentSchema>;
export type ClubEnrollmentResponse = z.infer<
  typeof ClubEnrollmentResponseSchema
>;
export type TopicEnrollmentResponse = z.infer<
  typeof TopicEnrollmentResponseSchema
>;
