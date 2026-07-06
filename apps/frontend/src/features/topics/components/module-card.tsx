import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MODULE_STATUS_META, RESOURCE_KIND_META } from '../topics.constants';
import type { ModuleResource, TopicModule } from '../topics.types';

function ResourceRow({
  resource,
  dimWhenDone,
}: {
  resource: ModuleResource;
  dimWhenDone: boolean;
}) {
  const meta = RESOURCE_KIND_META[resource.kind];
  const Icon = meta.icon;
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3',
        dimWhenDone && resource.done && 'opacity-60',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Icon
          className={cn(
            'size-5 shrink-0',
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
      <button
        type="button"
        className="shrink-0 text-sm font-bold text-primary hover:underline"
      >
        {meta.action}
      </button>
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
    <Card
      className={cn(
        'h-full gap-4 rounded-lg border-l-4 p-6 transition-shadow hover:shadow-md',
        meta.border,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
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
      </div>

      <h4 className="font-serif text-xl font-semibold leading-tight">
        {module.title}
      </h4>

      <div className="flex-1 space-y-4 pt-1">
        {module.resources.map((resource) => (
          <ResourceRow
            key={resource.id}
            resource={resource}
            dimWhenDone={module.status === 'in_progress'}
          />
        ))}
      </div>

      {module.status === 'in_progress' && (
        <Button
          size="lg"
          className="mt-2 w-fit self-end px-8"
          onClick={() => onMarkDone?.(module)}
        >
          Mark as Done
        </Button>
      )}
    </Card>
  );
}
