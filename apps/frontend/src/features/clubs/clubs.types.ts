/** Membership state for the current user relative to a club. */
export type MembershipStatus = 'active' | 'on_break' | 'dropped_out';

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
  role: MentorRole;
}

export interface Topic {
  id: string;
  title: string;
  iconKey: TopicIconKey;
  tone: ClubTone;
  modules: number;
  hours: number;
  mentor: Mentor;
  /** Enrolled topics show "Open"; otherwise "Enroll". */
  enrolled: boolean;
}

export interface ClubDetail {
  id: string;
  name: string;
  tone: ClubTone;
  topicsCount: number;
  membersLabel: string;
  expectationsIntro: string;
  expectations: string[];
  mentorshipFocus: string;
  topics: Topic[];
}
