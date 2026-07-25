import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { NavbarActions } from '@/components/layout/navbar-actions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/format-duration';
import { getApiErrorMessage } from '@/services/http/client';
import { ModuleCard, type ModuleCardModule } from './module-card';
import { useDeleteModule, useTopicModules } from '../hooks/use-topics';
import type { CurriculumModule, TopicDetail } from '../topics.types';

/**
 * Onto the shape the learner's module card reads, so a mentor sees their
 * curriculum exactly as it will be published. Progress is the one thing left
 * out — there is no status or completion state to speak of while authoring.
 */
function toCardModule(
  module: CurriculumModule,
  position: number,
): ModuleCardModule {
  return {
    id: module.id,
    // Numbered from its place in the sorted list, not its stored `order`: a
    // gap left by a delete would otherwise read as "Module 01, Module 03".
    order: position,
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
  onEditModule,
}: {
  topic: TopicDetail;
  /** Fired by the "Create Module" action in the curriculum header. */
  onCreateModule?: () => void;
  /** Fired by a card's edit control. Omitted hides the control. */
  onEditModule?: (module: CurriculumModule) => void;
}) {
  const { data: modules = [], isLoading, isError } = useTopicModules(topic.id);
  const deleteMutation = useDeleteModule(topic.id);

  // The module awaiting confirmation; null while nothing is being deleted.
  const [pendingDelete, setPendingDelete] = useState<CurriculumModule | null>(
    null,
  );

  const sorted = [...modules].sort((a, b) => a.order - b.order);
  const allocatedWeight = sorted.reduce((sum, m) => sum + m.weight, 0);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const { id, title } = pendingDelete;

    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`Module “${title}” deleted`);
        setPendingDelete(null);
      },
      onError: (error) => {
        toast.error(
          getApiErrorMessage(
            error,
            'Couldn’t delete the module. Please try again.',
          ),
        );
        // Left open on failure, so the mentor can retry without hunting for
        // the card again.
      },
    });
  };

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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(400px),1fr))] items-start gap-4">
          {sorted.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={toCardModule(module, index + 1)}
              emptyResourcesLabel="No resources attached yet."
              // Only this view renders for the topic's mentor, so the control
              // needs no further permission check of its own.
              onEdit={onEditModule && (() => onEditModule(module))}
              onDelete={() => setPendingDelete(module)}
            />
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          destructive
          title={`Delete “${pendingDelete.title}”?`}
          description={`Learners lose this module, and the ${pendingDelete.weight}% it carries returns to the topic’s budget. This can’t be undone.`}
          detail={
            pendingDelete.resources.length > 0
              ? `Its ${pendingDelete.resources.length} resource${pendingDelete.resources.length === 1 ? '' : 's'} will be removed with it.`
              : undefined
          }
          confirmLabel="Delete module"
          pendingLabel="Deleting…"
          pending={deleteMutation.isPending}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </section>
  );
}
