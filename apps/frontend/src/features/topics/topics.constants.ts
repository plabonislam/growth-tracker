import {
  Check,
  CircleDashed,
  CirclePlay,
  Clock,
  FileText,
  type LucideIcon,
} from 'lucide-react';

import type { ModuleStatus, ResourceKind } from './topics.types';

/**
 * Module status → the pill at the top of its card and the line at the bottom.
 * The pill names the state; the note says where the learner stands in it, in
 * the same colour, so a card reads the same from either end. Classes are kept
 * literal for the JIT compiler.
 */
export const MODULE_STATUS_META: Record<
  ModuleStatus,
  {
    label: string;
    chip: string;
    note: string;
    noteClass: string;
    icon: LucideIcon;
  }
> = {
  completed: {
    label: 'Completed',
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400',
    note: 'Approved by your mentor',
    noteClass: 'text-emerald-700 dark:text-emerald-400',
    icon: Check,
  },
  in_progress: {
    label: 'In Progress',
    chip: 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400',
    note: 'In progress',
    noteClass: 'text-amber-800 dark:text-amber-400',
    icon: Clock,
  },
  pending_confirmation: {
    label: 'In Review',
    chip: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-400',
    note: 'Sent to your mentor for review',
    noteClass: 'text-amber-800 dark:text-amber-400',
    icon: Clock,
  },
  to_do: {
    label: 'To Do',
    chip: 'border-border bg-muted text-muted-foreground',
    note: 'Not started yet',
    noteClass: 'text-muted-foreground',
    icon: CircleDashed,
  },
};

/**
 * Placeholder target date on the progress card. Nothing records when a topic is
 * due — no deadline is set at enrollment and no pace is tracked — so this is
 * static until something does. `startedAt` beside it is real, off the
 * enrollment.
 */
export const PLACEHOLDER_EST_COMPLETION = 'Aug 28, 2026';

/**
 * The mentor card's stats. Only the name is real — nothing rates a mentor,
 * times their replies, or tracks whether they are online, so the rest is static
 * until something does.
 */
export const PLACEHOLDER_MENTOR_STATS = {
  role: 'Topic Mentor',
  online: true,
  rating: 4.9,
  avgResponseTime: '~2h',
} as const;

/**
 * What a learner may move a module to themselves, in the order the menu offers
 * them. Completing is the mentor's word, so it isn't here — `pending_confirmation`
 * is how a learner asks for it.
 */
export const LEARNER_MODULE_TRANSITIONS = [
  { status: 'to_do', label: 'To do', dot: 'bg-muted-foreground' },
  { status: 'in_progress', label: 'In progress', dot: 'bg-amber-500' },
  {
    status: 'pending_confirmation',
    label: 'Request done',
    dot: 'bg-primary',
  },
] as const satisfies readonly {
  status: ModuleStatus;
  label: string;
  dot: string;
}[];

/** Resource kind → icon, action link label, and the name mentors pick by. */
export const RESOURCE_KIND_META: Record<
  ResourceKind,
  { icon: LucideIcon; action: string; label: string }
> = {
  video: { icon: CirclePlay, action: 'Watch', label: 'Video' },
  doc: { icon: FileText, action: 'View', label: 'Document' },
};

/** Ordered for the resource type picker. */
export const RESOURCE_KINDS = [
  'video',
  'doc',
] as const satisfies ResourceKind[];
