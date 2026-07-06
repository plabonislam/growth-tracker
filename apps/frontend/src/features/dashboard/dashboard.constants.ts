import {
  ClipboardList,
  FileText,
  Podcast,
  Users,
  type LucideIcon,
} from 'lucide-react';

import type {
  AgendaIconKey,
  AgendaTone,
  LearningPathStatus,
} from './dashboard.types';

/** Agenda icon key → lucide icon. */
export const AGENDA_ICONS: Record<AgendaIconKey, LucideIcon> = {
  quiz: ClipboardList,
  doc: FileText,
  workshop: Users,
  podcast: Podcast,
};

/** Agenda tone → literal Tailwind classes (kept literal for the JIT compiler). */
export const AGENDA_TONE: Record<AgendaTone, { tile: string; when: string }> = {
  error: {
    tile: 'bg-destructive/10 text-destructive',
    when: 'text-destructive',
  },
  neutral: {
    tile: 'bg-muted text-muted-foreground',
    when: 'text-muted-foreground',
  },
  info: {
    tile: 'bg-primary/10 text-primary',
    when: 'text-primary',
  },
  amber: {
    tile: 'bg-amber-500/10 text-amber-600',
    when: 'text-muted-foreground',
  },
};

/** Learning-path step status → badge label + literal Tailwind classes. */
export const LEARNING_PATH_STATUS: Record<
  LearningPathStatus,
  { label: string; badge: string }
> = {
  completed: {
    label: 'Completed',
    badge: 'bg-emerald-500/10 text-emerald-700',
  },
  active: {
    label: 'Active',
    badge: 'bg-primary text-primary-foreground',
  },
  upcoming: {
    label: 'Upcoming',
    badge: 'bg-muted text-muted-foreground',
  },
  locked: {
    label: 'Locked',
    badge: 'bg-muted text-muted-foreground',
  },
};
