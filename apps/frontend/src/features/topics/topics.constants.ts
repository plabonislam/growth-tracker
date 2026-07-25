import { CirclePlay, FileText, type LucideIcon } from 'lucide-react';

import type { ModuleStatus, ResourceKind } from './topics.types';

/** Module status → chip label + literal Tailwind classes (kept literal for JIT). */
export const MODULE_STATUS_META: Record<
  ModuleStatus,
  { label: string; chip: string }
> = {
  completed: {
    label: 'Completed',
    chip: 'bg-emerald-500/10 text-emerald-600',
  },
  in_progress: {
    label: 'In Progress',
    chip: 'bg-amber-500/15 text-amber-700',
  },
  todo: {
    label: 'To Do',
    chip: 'bg-muted text-muted-foreground',
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
