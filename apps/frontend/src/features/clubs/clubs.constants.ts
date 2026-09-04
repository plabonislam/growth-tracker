import {
  Brain,
  BrainCircuit,
  Database,
  LineChart,
  Palette,
  Shield,
  Terminal,
  Users,
  type LucideIcon,
} from 'lucide-react';

import type {
  ClubIconKey,
  ClubTone,
  MembershipStatus,
  MentorRole,
  TopicIconKey,
} from './clubs.types';

/** Icon key → lucide icon. */
export const CLUB_ICONS: Record<ClubIconKey, LucideIcon> = {
  engineering: Terminal,
  data: LineChart,
  ai: Brain,
  leadership: Users,
  security: Shield,
  design: Palette,
};

/** Topic icon key → lucide icon. */
export const TOPIC_ICONS: Record<TopicIconKey, LucideIcon> = {
  analytics: LineChart,
  neural: BrainCircuit,
  pipeline: Database,
};

/** Mentor role → badge classes. */
export const MENTOR_ROLE_META: Record<MentorRole, string> = {
  'Lead Mentor': 'bg-primary/10 text-primary',
  Expert: 'bg-muted text-muted-foreground',
  Specialist: 'bg-muted text-muted-foreground',
};

/** Tone → literal Tailwind classes (kept literal so the JIT compiler sees them). */
export const CLUB_TONE: Record<
  ClubTone,
  { text: string; bgSoft: string; borderTop: string }
> = {
  primary: {
    text: 'text-primary',
    bgSoft: 'bg-primary/10',
    borderTop: 'border-t-primary',
  },
  indigo: {
    text: 'text-indigo-600',
    bgSoft: 'bg-indigo-500/10',
    borderTop: 'border-t-indigo-500',
  },
  amber: {
    text: 'text-amber-600',
    bgSoft: 'bg-amber-500/10',
    borderTop: 'border-t-amber-500',
  },
  rose: {
    text: 'text-rose-600',
    bgSoft: 'bg-rose-500/10',
    borderTop: 'border-t-rose-500',
  },
  violet: {
    text: 'text-violet-600',
    bgSoft: 'bg-violet-500/10',
    borderTop: 'border-t-violet-500',
  },
};

/** Membership status → badge label + classes. */
export const MEMBERSHIP_META: Record<
  MembershipStatus,
  { label: string; className: string }
> = {
  active: { label: 'Active', className: 'bg-primary/10 text-primary' },
  on_break: { label: 'On Break', className: 'bg-amber-100 text-amber-700' },
  dropped_out: {
    label: 'Dropped Out',
    className: 'bg-destructive/10 text-destructive',
  },
  pending: {
    label: 'Pending Review',
    className: 'bg-amber-100 text-amber-700',
  },
  rejected: { label: 'Rejected', className: 'bg-muted text-muted-foreground' },
};

/** Shown when membership is missing (null / undefined / empty). */
export const NOT_ENROLLED_META = {
  label: 'Not Enrolled',
  className: 'bg-muted text-muted-foreground',
};

/**
 * Shown in place of the membership badge on the club a caller coordinates.
 * They run that club rather than take part in it, so "Active" — or worse,
 * "Not Enrolled" — describes the wrong relationship entirely.
 */
export const COORDINATOR_META = {
  label: 'Coordinator',
  className: 'bg-primary/10 text-primary',
};

/**
 * Why a club's topics carry no enroll action, keyed by where the caller stands
 * with the club — `none` for someone who has never applied. `active` has no
 * entry: nothing is in their way, so there is nothing to explain.
 */
export const TOPIC_ACCESS_NOTE: Record<
  Exclude<MembershipStatus, 'active'> | 'none',
  string
> = {
  none: 'Join this club to enroll in its topics.',
  pending:
    'Your application is under review. You can enroll in topics once a coordinator approves it.',
  on_break:
    'Your membership is on break. Enrolling in topics resumes when your membership does.',
  dropped_out:
    'You have left this club, so its topics are no longer open to enroll in.',
  rejected:
    'Your application to this club was not approved, so its topics are not open to enroll in.',
};

/**
 * What a learner confirms before an enrollment request can be sent. One flat
 * list: each line is agreed to the same way, so each reads the same way.
 */
export const TOPIC_ENROLLMENT_TERMS = [
  'I acknowledge the time commitment of approximately 5–8 hours per week.',
  'I confirm that I have access to the necessary cloud environment resources.',
  'I have read the requirements and am ready to commit to this topic’s learning schedule.',
];

/** The weekly load, shown as a topic-summary fact beside modules and time. */
export const TOPIC_ENROLLMENT_WEEKLY_COMMITMENT = '5–8 hrs / week';

/** Closes the header, under the topic's own description. */
export const TOPIC_ENROLLMENT_REVIEW_INTRO =
  'Your mentor reviews each request before granting access to the topic modules.';

/** The footer strip — how long the wait is, said once at the bottom. */
export const TOPIC_ENROLLMENT_REVIEW_NOTE =
  'Mentor review typically takes 1–2 business days.';
