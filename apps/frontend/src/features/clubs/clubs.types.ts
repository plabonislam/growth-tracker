import type { EnrollmentStatus, TopicStatus } from 'shared';

/** Membership state for the current user relative to a club. */
export type MembershipStatus =
  | 'active'
  | 'on_break'
  | 'dropped_out'
  | 'pending'
  | 'rejected';

/** Accent tone applied to a club's icon + top border. */
export type ClubTone = 'primary' | 'indigo' | 'amber' | 'rose' | 'violet';

/** Icon key resolved to a lucide icon in `clubs.constants.ts`. */
export type ClubIconKey =
  | 'engineering'
  | 'data'
  | 'ai'
  | 'leadership'
  | 'security'
  | 'design';

export interface Club {
  id: string;
  name: string;
  description: string;
  iconKey: ClubIconKey;
  tone: ClubTone;
  topics: number;
  members: number;
  /** `null` when the user has not joined the club yet. */
  membership: MembershipStatus | null;
}

/** Icon key for a topic, resolved in `clubs.constants.ts`. */
export type TopicIconKey = 'analytics' | 'neural' | 'pipeline';

export type MentorRole = 'Lead Mentor' | 'Expert' | 'Specialist';

export interface Mentor {
  /** User id — compared against the caller to decide mentor-only affordances. */
  id: string;
  name: string;
  /** Presentation-only badge; absent for mentors sourced from the API. */
  role?: MentorRole;
}

export interface Topic {
  id: string;
  title: string;
  /** What the topic covers, as its coordinator wrote it. Null on older topics. */
  description: string | null;
  /** Drafts reach only their mentor, the coordinator, and an authority. */
  status: TopicStatus;
  /** Whether members must certify to complete it — prefills the edit form. */
  certificationRequired: boolean;
  iconKey: TopicIconKey;
  tone: ClubTone;
  /** How many modules the curriculum holds. */
  modules?: number;
  /** Its modules' estimates added up; 0 when none carry one. */
  estTimeMinutes?: number;
  /** Absent until the list endpoint exposes the assigned mentor. */
  mentor?: Mentor;
  /**
   * Where the caller stands with this topic — `null` when they have never
   * applied. Approved topics show "Open", a pending request says so, and
   * anything else offers "Enroll".
   */
  enrollmentStatus: EnrollmentStatus | null;
}

/**
 * What the topic card's action does, decided by the caller's role: everyone
 * who administers the topic — authority, the club's coordinator, and its own
 * mentor — manages its modules; everyone else enrolls or opens.
 */
export type TopicAction = 'manage-modules' | 'open' | 'enroll';

export interface ClubDetail {
  id: string;
  name: string;
  /** Short club description shown under the hero title. */
  description: string;
  tone: ClubTone;
  topicsCount: number;
  membersLabel: string;
  sessionsCount: number;
  mentorsCount: number;
  /** `null` until an authority assigns a coordinator to the club. */
  coordinatorName: string | null;
  /** Compared against the caller to unlock coordinator-only affordances. */
  coordinatorId: string | null;
  /**
   * The caller's own standing in this club — `null` when they have never
   * applied. Only an `active` member may enroll in the club's topics.
   */
  membership: MembershipStatus | null;
  expectationsIntro: string;
  expectations: string[];
  mentorshipFocus: string;
  topics: Topic[];
}

/** Data shown on the club joining form (left identity + rules panels). */
export interface ClubJoinInfo {
  id: string;
  name: string;
  iconKey: TopicIconKey;
  tone: ClubTone;
  topicsLabel: string;
  membersLabel: string;
  coordinators: string[];
  rules: string[];
}
