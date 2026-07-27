import { z } from 'zod';

import { certificationStatusSchema, sessionTypeSchema } from '../enums';

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
      /**
       * Modules finished. Distinct from `moduleIndex`, which stops at the last
       * module — only this says whether the topic is actually done.
       */
      completedModules: z.number().int().nonnegative(),
      progressPct: z.number().min(0).max(100),
      /** Whether finishing the modules is the end of the topic or not. */
      certificationRequired: z.boolean(),
      /** The learner's standing on that certificate; null until one exists. */
      certificationStatus: certificationStatusSchema.nullable(),
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

/** `2025-12` — a calendar month, which is what a sheet covers. */
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * The club activity sheet — `GET /dashboard/activity-sheet`. One club, one
 * calendar month. `clubId` may be left off only by an authority, who reads
 * every club at once; `month` defaults to the month in progress.
 */
export const ActivitySheetQuerySchema = z.object({
  clubId: z.string().uuid().optional(),
  month: z
    .string()
    .regex(MONTH_PATTERN, 'Month must look like 2025-12')
    .optional(),
});

/** A count for the month, against the same count for the month before it. */
const SheetMetricSchema = z.object({
  value: z.number(),
  /** Null for a point-in-time count, which has nothing to compare against. */
  delta: z.number().nullable(),
});

const ActivitySessionSchema = z.object({
  id: z.string().uuid(),
  /** `2025-12-10` — sessions carry a date, not a timestamp. */
  date: z.string(),
  type: sessionTypeSchema,
  objective: z.string(),
  /** Always present: a session cannot be logged without one. */
  facilitator: z.string(),
  /**
   * Heads counted, or null when the count has not been collected yet. Null is
   * not 0 — one is an unanswered question, the other is a session nobody
   * attended.
   */
  attendance: z.number().int().nonnegative().nullable(),
  /** Which club held it — the only attribution in an all-clubs sheet. */
  clubName: z.string(),
});

const RosterMemberSchema = z.object({
  userId: z.string().uuid(),
  name: z.string(),
  /** What they do in this club. Roles are club-scoped, not account-wide. */
  role: z.enum(['coordinator', 'mentor', 'member']),
  /** Only these two stand on a roster: applicants and leavers are not on it. */
  status: z.enum(['active', 'on_break']),
  clubName: z.string(),
});

export const ActivitySheetResponseSchema = z.object({
  /** Null when the sheet covers every club, which only an authority may ask. */
  clubId: z.string().uuid().nullable(),
  clubName: z.string(),
  /** Echoed back so the page can tell which month it is looking at. */
  month: z.string(),
  stats: z.object({
    sessionsHeld: SheetMetricSchema,
    /**
     * Mean headcount across the sessions that carry one. Null when none of
     * them do — an average of nothing is not 0.
     */
    avgAttendance: z.number().nullable(),
    /** How many sessions that average was taken from, so it can be qualified. */
    countedSessions: z.number().int().nonnegative(),
    /** Where the club stands now, not what moved during the month. */
    activeMembers: z.number().int().nonnegative(),
    onBreak: z.number().int().nonnegative(),
    joined: SheetMetricSchema,
    dropped: SheetMetricSchema,
    certifications: SheetMetricSchema,
  }),
  sessions: z.array(ActivitySessionSchema),
  roster: z.array(RosterMemberSchema),
});

export type ActivitySheetQuery = z.infer<typeof ActivitySheetQuerySchema>;
export type ActivitySheetResponse = z.infer<typeof ActivitySheetResponseSchema>;
export type ActivitySession = z.infer<typeof ActivitySessionSchema>;
export type ActivityRosterMember = z.infer<typeof RosterMemberSchema>;

export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
export type LearnerDashboardResponse = z.infer<
  typeof LearnerDashboardResponseSchema
>;
