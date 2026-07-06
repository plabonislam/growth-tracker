import { CirclePlay, FileText, type LucideIcon } from 'lucide-react';

import type { ModuleStatus, ResourceKind } from './topics.types';

/** Module status → chip label + literal Tailwind classes (kept literal for JIT). */
export const MODULE_STATUS_META: Record<
  ModuleStatus,
  { label: string; chip: string; border: string }
> = {
  completed: {
    label: 'Completed',
    chip: 'bg-emerald-500/10 text-emerald-600',
    border: 'border-l-emerald-500',
  },
  in_progress: {
    label: 'In Progress',
    chip: 'bg-amber-500/15 text-amber-700',
    border: 'border-l-amber-500',
  },
  todo: {
    label: 'To Do',
    chip: 'bg-muted text-muted-foreground',
    border: 'border-l-border',
  },
};

/** Resource kind → icon + action link label. */
export const RESOURCE_KIND_META: Record<
  ResourceKind,
  { icon: LucideIcon; action: string }
> = {
  video: { icon: CirclePlay, action: 'Watch' },
  doc: { icon: FileText, action: 'View' },
};
