import { z } from 'zod';

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().nullable(),
  isAuthority: z.boolean(),
  createdAt: z.string(),
});

export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
