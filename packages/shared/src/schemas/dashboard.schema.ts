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

/**
 * The learner's own dashboard — `GET /dashboard/me`. Distinct from the metric
 * board above, which reports on a club to whoever runs it. Everything here is
 * about one person, and every field is derived from what is recorded: no field
 * exists that the database cannot answer.
 *
 * `club` and `activeTopic` are null for a learner who has not joined or has not
 * been approved into a topic yet, which the page renders as its own state.
 */
export const LearnerDashboardResponseSchema = z.object({
  club: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string().nullable(),
      /** When the membership was created. */
      memberSince: z.string(),
      /** Modules completed across the club's published topics, 0–100. */
      progressPct: z.number().min(0).max(100),
      /** A few other active members, for the avatar stack. */
      memberNames: z.array(z.string()),
      /** Everyone active in the club, the sample above included. */
      memberCount: z.number().int().nonnegative(),
    })
    .nullable(),
  activeTopic: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      description: z.string().nullable(),
      /** When the enrollment was approved into existence. */
      startedAt: z.string(),
      /** 1-based position of the module being worked on. */
      moduleIndex: z.number().int().nonnegative(),
      moduleCount: z.number().int().nonnegative(),
      progressPct: z.number().min(0).max(100),
    })
    .nullable(),
  stats: z.object({
    /** Topics whose every module the learner has completed. */
    completedTopics: z.number().int().nonnegative(),
    /** How many clubs those topics came from. */
    completedTopicClubs: z.number().int().nonnegative(),
    earnedCertificates: z.number().int().nonnegative(),
    /** Topic of the most recently obtained certificate. */
    latestCertificateTopic: z.string().nullable(),
    /** Estimated minutes on the modules completed — the only time recorded. */
    learningMinutes: z.number().int().nonnegative(),
  }),
  /** Sessions still to come in the learner's club. */
  events: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      date: z.string(),
      type: z.string(),
    }),
  ),
});

export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
export type LearnerDashboardResponse = z.infer<
  typeof LearnerDashboardResponseSchema
>;
