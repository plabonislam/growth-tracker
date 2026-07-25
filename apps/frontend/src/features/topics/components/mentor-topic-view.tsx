import { Plus } from 'lucide-react';

import { NavbarActions } from '@/components/layout/navbar-actions';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/format-duration';
import { ModuleCard, type ModuleCardModule } from './module-card';
import { useTopicModules } from '../hooks/use-topics';
import type { CurriculumModule, TopicDetail } from '../topics.types';

/**
 * Onto the shape the learner's module card reads, so a mentor sees their
 * curriculum exactly as it will be published. Progress is the one thing left
 * out — there is no status or completion state to speak of while authoring.
 */
function toCardModule(module: CurriculumModule): ModuleCardModule {
  return {
    id: module.id,
    // Stored 0-based, rendered 1-based.
    order: module.order + 1,
    title: module.title,
    weightPct: module.weight,
    // Blank when the mentor left it out — the card drops the chip.
    estTime: formatDuration(module.estTime) ?? '',
    description: module.body,
    resources: module.resources.map((resource) => ({
      id: resource.id,
      kind: resource.kind,
      label: resource.title,
      url: resource.url,
    })),
  };
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
  const allocatedWeight = sorted.reduce((sum, m) => sum + m.weight, 0);

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
        action={
          sorted.length > 0 && (
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
              {sorted.length} Module{sorted.length === 1 ? '' : 's'} •{' '}
              {allocatedWeight}% Allocated
            </span>
          )
        }
      />

      {isError && (
        <p className="py-12 text-center text-sm text-destructive">
          Couldn’t load the modules. Please try again.
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(400px,100%),1fr))] items-start gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-lg bg-muted" />
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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(400px,100%),1fr))] items-start gap-4">
          {sorted.map((module) => (
            <ModuleCard
              key={module.id}
              module={toCardModule(module)}
              emptyResourcesLabel="No resources attached yet."
            />
          ))}
        </div>
      )}
    </section>
  );
}
