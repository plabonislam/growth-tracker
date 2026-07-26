import { ArrowUpRight, Clock, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MODULE_STATUS_META, RESOURCE_KIND_META } from '../topics.constants';
import type { ModuleStatus, ResourceKind } from '../topics.types';

/** A resource as the card needs it, whoever is looking at it. */
export type ModuleCardResource = {
  id: string;
  kind: ResourceKind;
  label: string;
  /** Omitted → the action badge is hidden. */
  url?: string;
  /** Learner progress. Mentors have none, so it stays undefined. */
  done?: boolean;
};

/**
 * The card's view of a module. `TopicModule` satisfies it as-is; the mentor's
 * `CurriculumModule` is mapped onto it in `mentor-topic-view`.
 */
export type ModuleCardModule = {
  id: string;
  /** 1-based, rendered as "Module 01". */
  order: number;
  title: string;
  weightPct: number;
  /** Preformatted, e.g. "2h 30m". Empty hides the chip. */
  estTime: string;
  resources: ModuleCardResource[];
  /** Learner progress. Omitted for a mentor, who is authoring, not learning. */
  status?: ModuleStatus;
  /** Mentor-authored learning content, shown under the title when present. */
  description?: string | null;
};

function ResourceRow({ resource }: { resource: ModuleCardResource }) {
  const meta = RESOURCE_KIND_META[resource.kind];
  const Icon = meta.icon;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon
          className={cn(
            'size-4 shrink-0',
            resource.done ? 'text-emerald-500' : 'text-primary',
          )}
        />
        <span
          className={cn(
            'truncate text-sm text-muted-foreground',
            !resource.done && 'font-medium',
          )}
        >
          {resource.label}
        </span>
      </div>
      {resource.url && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-20 shrink-0 items-center justify-center gap-0.5 rounded-full border border-primary/25 py-1 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5"
        >
          {meta.action}
          <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
        </a>
      )}
    </div>
  );
}

/** Chip geometry shared by the weight and duration pills in the card header. */
const CHIP =
  'text-[9.5px] font-semibold uppercase tracking-[0.05em] text-foreground/75';

/**
 * Generic over the module so `onMarkDone` hands the caller back its own type
 * rather than the card's narrowed view of it.
 */
export function ModuleCard<T extends ModuleCardModule>({
  module,
  emptyResourcesLabel,
  weightBar = false,
  onMarkDone,
  onEdit,
  onDelete,
}: {
  module: T;
  /** Shown in place of the resource list when there are none. */
  emptyResourcesLabel?: string;
  /**
   * Renders the module's share of the topic budget as a bar under the title.
   * Mentor-only: to a learner a filled bar reads as progress, which it isn't.
   */
  weightBar?: boolean;
  onMarkDone?: (module: T) => void;
  /** Omitted for anyone but the topic's mentor — hides the edit control. */
  onEdit?: (module: T) => void;
  /** Omitted for anyone but the topic's mentor — hides the delete control. */
  onDelete?: (module: T) => void;
}) {
  const meta = module.status ? MODULE_STATUS_META[module.status] : null;

  return (
    <Card className="h-full w-full max-w-[800px] gap-0 rounded-[14px] p-[18px] shadow-sm transition-[box-shadow,border-color] duration-150 hover:border-input hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-[7px]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
            Module {String(module.order).padStart(2, '0')}
          </span>
          {meta && (
            <span
              className={cn(
                'rounded-md px-[7px] py-[5px] text-[9.5px] font-semibold uppercase tracking-[0.05em]',
                meta.chip,
              )}
            >
              {meta.label}
            </span>
          )}
          <span className={cn(CHIP, 'rounded-md bg-muted px-[7px] py-[5px]')}>
            Weight: {module.weightPct}%
          </span>
        </div>
        {(module.estTime || onEdit || onDelete) && (
          <div className="flex items-center gap-[5px]">
            {module.estTime && (
              <span
                className={cn(
                  CHIP,
                  'inline-flex items-center gap-[5px] rounded-full bg-muted px-2 py-1.5',
                )}
              >
                <Clock className="size-[11px]" strokeWidth={2} />
                {module.estTime}
              </span>
            )}
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Edit ${module.title}`}
                title="Edit module"
                className="size-8 rounded-[9px] text-muted-foreground duration-150 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                onClick={() => onEdit(module)}
              >
                <Pencil className="size-3.5" strokeWidth={2} />
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Delete ${module.title}`}
                title="Delete module"
                className="size-8 rounded-[9px] text-muted-foreground/70 duration-150 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDelete(module)}
              >
                <Trash2 className="size-3.5" strokeWidth={2} />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-[13px]">
        <h4 className="font-serif text-[17px] font-bold leading-[1.2] text-foreground">
          {module.title}
        </h4>

        {module.description && (
          <p className="mt-[5px] line-clamp-2 text-[12.5px] leading-[1.45] text-muted-foreground">
            {module.description}
          </p>
        )}
      </div>

      {weightBar && (
        <div
          className="mt-3 h-1 overflow-hidden rounded-full bg-muted"
          role="presentation"
        >
          <div
            className="h-full rounded-full bg-primary/40"
            // Clamped so a malformed weight can't overflow the track.
            style={{
              width: `${Math.min(100, Math.max(0, module.weightPct))}%`,
            }}
          />
        </div>
      )}

      <div className="mt-3.5 flex-1 space-y-3">
        {module.resources.length === 0
          ? emptyResourcesLabel && (
              <p className="text-[12.5px] text-muted-foreground">
                {emptyResourcesLabel}
              </p>
            )
          : module.resources.map((resource) => (
              <ResourceRow key={resource.id} resource={resource} />
            ))}
      </div>

      {module.status === 'in_progress' && (
        <Button
          variant="outline"
          className="mt-4 w-fit self-end border-primary/40 px-6 text-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => onMarkDone?.(module)}
        >
          Mark as Done
        </Button>
      )}
    </Card>
  );
}
