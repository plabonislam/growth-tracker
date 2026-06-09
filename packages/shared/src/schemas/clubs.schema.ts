import { z } from 'zod';

export const CreateClubSchema = z.object({
  name: z.string().min(1),
  coordinatorId: z.string().uuid().optional(),
});

export const UpdateClubSchema = z.object({
  name: z.string().min(1).optional(),
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

export type CreateClub = z.infer<typeof CreateClubSchema>;
export type UpdateClub = z.infer<typeof UpdateClubSchema>;
export type UpdateMembershipStatus = z.infer<
  typeof UpdateMembershipStatusSchema
>;
export type ClubResponse = z.infer<typeof ClubResponseSchema>;
