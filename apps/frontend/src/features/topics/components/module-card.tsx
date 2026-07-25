import { ArrowUpRight, Clock, Pencil } from 'lucide-react';

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

/**
 * Generic over the module so `onMarkDone` hands the caller back its own type
 * rather than the card's narrowed view of it.
 */
export function ModuleCard<T extends ModuleCardModule>({
  module,
  emptyResourcesLabel,
  onMarkDone,
  onEdit,
}: {
  module: T;
  /** Shown in place of the resource list when there are none. */
  emptyResourcesLabel?: string;
  onMarkDone?: (module: T) => void;
  /** Omitted for anyone but the topic's mentor — hides the edit control. */
  onEdit?: (module: T) => void;
}) {
  const meta = module.status ? MODULE_STATUS_META[module.status] : null;

  return (
    <Card className="h-full w-full max-w-[800px] gap-4 rounded-lg p-6 transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-bold uppercase text-muted-foreground">
          Module {String(module.order).padStart(2, '0')}
        </span>
        {meta && (
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
              meta.chip,
            )}
          >
            {meta.label}
          </span>
        )}
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
          Weight: {module.weightPct}%
        </span>
        {(module.estTime || onEdit) && (
          <div className="ml-auto flex items-center gap-1.5">
            {module.estTime && (
              <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                <Clock className="size-3" />
                {module.estTime}
              </span>
            )}
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Edit ${module.title}`}
                title="Edit module"
                className="size-7 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                onClick={() => onEdit(module)}
              >
                <Pencil className="size-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
      <div>
        <h4 className="font-serif text-xl font-semibold leading-tight">
          {module.title}
        </h4>

        {module.description && (
          <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {module.description}
          </p>
        )}
      </div>

      <div className="flex-1 space-y-4 pt-1">
        {module.resources.length === 0
          ? emptyResourcesLabel && (
              <p className="text-sm text-muted-foreground">
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
          className="mt-2 w-fit self-end border-primary/40 px-6 text-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => onMarkDone?.(module)}
        >
          Mark as Done
        </Button>
      )}
    </Card>
  );
}
