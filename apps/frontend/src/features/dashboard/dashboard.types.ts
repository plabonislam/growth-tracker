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

/** "Your Active Journey" summary card. */
export interface JourneySummary {
  clubName: string;
  /** Display date, e.g. "12 Jan 2026". */
  memberSince: string;
  cohortBadge: string;
  progressPct: number;
  /** Names rendered as stacked initials avatars. */
  memberNames: string[];
  extraMembers: number;
  membersNote: string;
}

export interface LearnerStats {
  completedTopics: number;
  earnedCertificates: number;
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
  journey: JourneySummary;
  stats: LearnerStats;
  activeTopic: ActiveTopic;
  learningPath: LearningPath;
  deadlines: AgendaItem[];
  events: AgendaItem[];
}
