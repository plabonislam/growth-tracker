import { z } from 'zod';

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().nullable(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;
