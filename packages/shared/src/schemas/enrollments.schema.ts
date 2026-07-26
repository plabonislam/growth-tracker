import { z } from 'zod';

export const ApproveEnrollmentSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

/**
 * The reason's bounds, published so the form's hint can read them instead of
 * restating the numbers and drifting from them.
 */
export const TOPIC_ENROLLMENT_REASON_LENGTH = { min: 40, max: 1000 } as const;

/**
 * What to write, rather than how long to make it — a character count is no help
 * to someone who has not worked out what to say yet.
 */
const REASON_MESSAGE =
  'Tell your mentor what you want to build with this topic';

/**
 * Payload a learner submits to request enrollment in a topic. The learner's
 * identity and the topic come from the route and the JWT, so the request itself
 * carries only what they wrote.
 */
export const EnrollTopicSchema = z.object({
  reason: z
    .string({
      required_error: REASON_MESSAGE,
      invalid_type_error: REASON_MESSAGE,
    })
    .trim()
    .min(TOPIC_ENROLLMENT_REASON_LENGTH.min, REASON_MESSAGE)
    .max(
      TOPIC_ENROLLMENT_REASON_LENGTH.max,
      `Please keep this to ${TOPIC_ENROLLMENT_REASON_LENGTH.max} characters or fewer`,
    ),
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
export type EnrollTopic = z.infer<typeof EnrollTopicSchema>;
export type ClubEnrollmentResponse = z.infer<
  typeof ClubEnrollmentResponseSchema
>;
export type TopicEnrollmentResponse = z.infer<
  typeof TopicEnrollmentResponseSchema
>;
