import { z } from 'zod';
import { sessionTypeSchema } from '../enums';

export const CreateSessionSchema = z.object({
  date: z.string().date(),
  type: sessionTypeSchema,
  objective: z.string().min(1),
  facilitator: z.string().min(1),
  participantCount: z.number().int().min(1),
});

export const SessionResponseSchema = z.object({
  id: z.string().uuid(),
  clubId: z.string().uuid(),
  date: z.string(),
  type: sessionTypeSchema,
  objective: z.string(),
  facilitator: z.string(),
  participantCount: z.number(),
  createdAt: z.string(),
});

export type CreateSession = z.infer<typeof CreateSessionSchema>;
export type SessionResponse = z.infer<typeof SessionResponseSchema>;
