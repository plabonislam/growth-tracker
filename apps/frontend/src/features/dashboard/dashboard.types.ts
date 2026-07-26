/** Icon key for an agenda row, resolved in `dashboard.constants.ts`. */
export type AgendaIconKey = 'quiz' | 'doc' | 'workshop' | 'podcast';

/** Accent tone for an agenda row's icon tile + timestamp. */
export type AgendaTone = 'error' | 'neutral' | 'info' | 'amber';

export interface AgendaItem {
  id: string;
  title: string;
  when: string;
  iconKey: AgendaIconKey;
  tone: AgendaTone;
}

/** The club the learner is currently working through. */
export interface JourneySummary {
  clubName: string;
  /** What the club covers, clamped to two lines on the card. */
  description: string;
  /** Display date, e.g. "12 Jan 2026". */
  memberSince: string;
  /** Standing in the cohort — shown by the page title, not on the card. */
  cohortBadge: string;
  progressPct: number;
  /** Names rendered as stacked initials avatars. */
  memberNames: string[];
  extraMembers: number;
  membersNote: string;
}

/** One figure on the dashboard's top row, with the line that qualifies it. */
export interface LearnerMetric {
  value: number;
  /** Suffix set beside the figure, e.g. "%" or "h". Omitted for a plain count. */
  unit?: string;
  /** What the figure is drawn from, e.g. "Across 3 clubs". */
  note: string;
}

export interface LearnerStats {
  completedTopics: LearnerMetric;
  earnedCertificates: LearnerMetric;
  clubProgress: LearnerMetric;
  learningTime: LearnerMetric;
}

export interface ActiveTopic {
  id: string;
  title: string;
  description: string;
  /** Display date, e.g. "02 Jun 2026". */
  startedOn: string;
  moduleLabel: string;
  progressPct: number;
}

export type LearningPathStatus = 'completed' | 'active' | 'upcoming' | 'locked';

export interface LearningPathStep {
  id: string;
  /** Shown inside the outline circle for upcoming/locked steps. */
  order: number;
  title: string;
  meta: string;
  status: LearningPathStatus;
}

export interface LearningPath {
  subtitle: string;
  steps: LearningPathStep[];
}

export interface LearnerDashboard {
  /** The line under the greeting — what to pick up today. */
  nudge: string;
  journey: JourneySummary;
  stats: LearnerStats;
  activeTopic: ActiveTopic;
  learningPath: LearningPath;
  deadlines: AgendaItem[];
  events: AgendaItem[];
}
