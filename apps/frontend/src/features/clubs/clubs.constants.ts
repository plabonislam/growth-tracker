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
};

/** Shown when membership is missing (null / undefined / empty). */
export const NOT_ENROLLED_META = {
  label: 'Not Enrolled',
  className: 'bg-muted text-muted-foreground',
};
