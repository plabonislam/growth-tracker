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
  name: string;
  /** Presentation-only badge; absent for mentors sourced from the API. */
  role?: MentorRole;
}

export interface Topic {
  id: string;
  title: string;
  iconKey: TopicIconKey;
  tone: ClubTone;
  /** Curriculum stats aren't returned by the topics list endpoint yet. */
  modules?: number;
  hours?: number;
  /** Absent until the list endpoint exposes the assigned mentor. */
  mentor?: Mentor;
  /** Enrolled topics show "Open"; otherwise "Enroll". */
  enrolled: boolean;
}

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
