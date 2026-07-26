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
  todo: {
    label: 'To Do',
    chip: 'border-border bg-muted text-muted-foreground',
    note: 'Not started yet',
    noteClass: 'text-muted-foreground',
    icon: CircleDashed,
  },
};

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
