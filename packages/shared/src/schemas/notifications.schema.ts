import { z } from 'zod';
import { notificationTypeSchema } from '../enums';

export const NotificationResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: notificationTypeSchema,
  payload: z.record(z.unknown()),
  read: z.boolean(),
  createdAt: z.string(),
});

export const NotificationsListResponseSchema = z.object({
  notifications: z.array(NotificationResponseSchema),
  unreadCount: z.number(),
});

export type NotificationResponse = z.infer<typeof NotificationResponseSchema>;
export type NotificationsListResponse = z.infer<
  typeof NotificationsListResponseSchema
>;
