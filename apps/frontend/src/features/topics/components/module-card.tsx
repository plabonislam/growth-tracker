import { ArrowUpRight, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MODULE_STATUS_META, RESOURCE_KIND_META } from '../topics.constants';
import type { ModuleResource, TopicModule } from '../topics.types';

function ResourceRow({ resource }: { resource: ModuleResource }) {
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

export function ModuleCard({
  module,
  onMarkDone,
}: {
  module: TopicModule;
  onMarkDone?: (module: TopicModule) => void;
}) {
  const meta = MODULE_STATUS_META[module.status];

  return (
    <Card className="h-full gap-4 rounded-lg p-6 transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-bold uppercase text-muted-foreground">
          Module {String(module.order).padStart(2, '0')}
        </span>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase',
            meta.chip,
          )}
        >
          {meta.label}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
          Weight: {module.weightPct}%
        </span>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
          <Clock className="size-3" />
          {module.estTime}
        </span>
      </div>

      <h4 className="font-serif text-xl font-semibold leading-tight">
        {module.title}
      </h4>

      <div className="flex-1 space-y-4 pt-1">
        {module.resources.map((resource) => (
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
