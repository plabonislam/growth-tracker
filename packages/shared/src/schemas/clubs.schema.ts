import { z } from 'zod';

export const CreateClubSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  /** Backend resolves this to a user id — see ClubsService.create(). */
  coordinatorEmail: z.string().email().optional(),
});

export const UpdateClubSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  coordinatorId: z.string().uuid().optional(),
});

export const UpdateMembershipStatusSchema = z.object({
  status: z.enum(['active', 'on_break', 'dropped_out']),
  droppedReason: z.string().optional(),
});

export const ClubResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  coordinatorId: z.string().uuid(),
  archived: z.boolean(),
  createdAt: z.string(),
});

/** Payload a member submits to apply for a club. */
export const JoinClubSchema = z.object({
  memberId: z.string().min(1, 'Your ID is required').max(32, 'ID is too long'),
  expectation: z
    .string()
    .min(10, 'Please share at least a sentence about why you want to join')
    .max(1000, 'Please keep this under 1000 characters'),
  acceptedRules: z.boolean().refine((v) => v === true, {
    message: 'You must accept the club rules to apply',
  }),
});

export type CreateClub = z.infer<typeof CreateClubSchema>;
export type UpdateClub = z.infer<typeof UpdateClubSchema>;
export type UpdateMembershipStatus = z.infer<
  typeof UpdateMembershipStatusSchema
>;
export type ClubResponse = z.infer<typeof ClubResponseSchema>;
export type JoinClub = z.infer<typeof JoinClubSchema>;
