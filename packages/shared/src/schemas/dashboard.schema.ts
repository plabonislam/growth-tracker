import { z } from 'zod';

const MetricSchema = z.object({
  value: z.number(),
  delta: z.number(),
});

export const DashboardQuerySchema = z.object({
  range: z.enum(['7d', '1m', '6m']).default('1m'),
  clubId: z.string().uuid().optional(),
});

export const DashboardResponseSchema = z.object({
  totalMembers: MetricSchema,
  activeMembers: MetricSchema,
  onBreak: MetricSchema,
  newJoiners: MetricSchema,
  droppedOut: MetricSchema,
  sessionsHeld: MetricSchema,
  modulesCompleted: MetricSchema,
  certificationsObtained: MetricSchema,
});

export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
