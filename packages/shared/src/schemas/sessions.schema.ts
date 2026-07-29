import { z } from 'zod';
import { sessionTypeSchema } from '../enums';

/** Matches what a coordinator can realistically type about one meeting. */
export const SESSION_OBJECTIVE_LENGTH = { min: 3, max: 200 } as const;
export const SESSION_FACILITATOR_LENGTH = { min: 2, max: 120 } as const;

/**
 * What a mentor, coordinator or authority submits to log a session that has
 * already happened — `POST /clubs/:clubId/sessions`. The club comes from the
 * path and the caller from the token, so neither is in the body.
 */
export const CreateSessionSchema = z.object({
  date: z.string({ required_error: 'Pick the date the session was held' }).date(
    // `z.string().date()` rejects a timestamp, which is right: a session is
    // recorded against a day, not a moment.
    'Pick the date the session was held',
  ),
  type: sessionTypeSchema,
  objective: z
    .string({ required_error: 'Say what the session was about' })
    .trim()
    .min(SESSION_OBJECTIVE_LENGTH.min, 'Say what the session was about')
    .max(
      SESSION_OBJECTIVE_LENGTH.max,
      `Keep this to ${SESSION_OBJECTIVE_LENGTH.max} characters or fewer`,
    ),
  facilitator: z
    .string({ required_error: 'Name who ran the session' })
    .trim()
    .min(SESSION_FACILITATOR_LENGTH.min, 'Name who ran the session')
    .max(
      SESSION_FACILITATOR_LENGTH.max,
      `Keep this to ${SESSION_FACILITATOR_LENGTH.max} characters or fewer`,
    ),
  /**
   * Heads counted, if anyone has counted them. Optional by design: attendance
   * is gathered after the session — from a third party or from the facilitator
   * — so a session is logged first and counted later. Null is "not counted
   * yet", which is not the claim 0 makes.
   */
  participantCount: z
    .number({ invalid_type_error: 'Attendance must be a number' })
    .int('Attendance must be a whole number')
    .min(0, 'Attendance cannot be negative')
    .nullable()
    .optional(),
});

export const SessionResponseSchema = z.object({
  id: z.string().uuid(),
  clubId: z.string().uuid(),
  date: z.string(),
  type: sessionTypeSchema,
  objective: z.string(),
  facilitator: z.string(),
  /** Null until the headcount is collected — see `CreateSessionSchema`. */
  participantCount: z.number().nullable(),
  createdAt: z.string(),
});

export type CreateSession = z.infer<typeof CreateSessionSchema>;
export type SessionResponse = z.infer<typeof SessionResponseSchema>;
