import { Plus } from 'lucide-react';

import { NavbarActions } from '@/components/layout/navbar-actions';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTopicModules } from '../hooks/use-topics';
import type { CurriculumModule, TopicDetail } from '../topics.types';

/** "95" → "1h 35m"; whole hours drop the minutes. */
function formatEstTime(minutes: number | null): string | null {
  if (minutes == null) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

function ModuleRow({ module }: { module: CurriculumModule }) {
  const estTime = formatEstTime(module.estTime);

  return (
    <Card className="flex items-start gap-4 p-5">
      {/* Order is the mentor's primary handle on a curriculum */}
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted font-serif text-sm font-bold text-muted-foreground">
        {String(module.order + 1).padStart(2, '0')}
      </span>

      <div className="min-w-0 flex-1">
        <h4 className="font-serif text-base font-bold leading-snug text-foreground">
          {module.title}
        </h4>
        {module.body && (
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {module.body}
          </p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {module.weight}% weight
          </span>
          {estTime && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {estTime}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * The mentor's topic view — learning modules and nothing else. Progress and
 * mentor cards are deliberately absent: a mentor authors the curriculum, they
 * don't work through it.
 */
export function MentorTopicView({
  topic,
  onCreateModule,
}: {
  topic: TopicDetail;
  /** Fired by the "Create Module" action in the curriculum header. */
  onCreateModule?: () => void;
}) {
  const { data: modules = [], isLoading, isError } = useTopicModules(topic.id);

  const sorted = [...modules].sort((a, b) => a.order - b.order);

  return (
    <section>
      {/* The mentor's one authoring action sits in the navbar, next to the
          shell's other create actions. */}
      <NavbarActions>
        <Button
          type="button"
          size="sm"
          onClick={onCreateModule}
          aria-label="Create Module"
          className="gap-1.5"
        >
          <Plus className="size-4" strokeWidth={1.75} />
          <span className="hidden sm:inline">Create Module</span>
        </Button>
      </NavbarActions>

      <SectionHeading
        title="Curriculum Modules"
        subtitle="Manage and organize your learning content into learning modules"
        className="mb-6"
      />

      {isError && (
        <p className="py-12 text-center text-sm text-destructive">
          Couldn’t load the modules. Please try again.
        </p>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && !isError && sorted.length === 0 && (
        <div className="rounded-xl border border-dashed border-input px-5 py-14 text-center">
          <div className="text-sm font-semibold text-foreground">
            No modules yet
          </div>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Add the first module to give learners somewhere to start.
          </p>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="flex flex-col gap-4">
          {sorted.map((module) => (
            <ModuleRow key={module.id} module={module} />
          ))}
        </div>
      )}
    </section>
  );
}
