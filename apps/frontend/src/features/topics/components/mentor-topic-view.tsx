import { Lock, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { REQUIRED_TOPIC_WEIGHT } from 'shared';

import { NavbarActions } from '@/components/layout/navbar-actions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/format-duration';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/services/http/client';
import { ModuleCard, type ModuleCardModule } from './module-card';
import {
  useDeleteModule,
  useSetTopicPublished,
  useTopicModules,
} from '../hooks/use-topics';
import type { CurriculumModule, TopicDetail } from '../topics.types';

/** Cards reflow from one column to as many as fit, never narrower than 320px. */
const GRID =
  'grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] items-start gap-4';

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
 * Draft ⇄ Published as a segmented control: the state the topic is in reads as
 * the selected segment, and the other segment is the action. While the weights
 * don't add up the Published side is locked rather than hidden, so the mentor
 * can see what they're working toward and why it isn't available.
 */
function PublishToggle({
  isPublished,
  canPublish,
  note,
  onToggle,
}: {
  isPublished: boolean;
  canPublish: boolean;
  /** Explains the current state — why publishing is blocked, or that it's live. */
  note: string;
  onToggle: () => void;
}) {
  // `flex-1` splits the track evenly so the control keeps one width across
  // states — otherwise it resizes as the label changes (Publish → Published).
  const segment =
    'inline-flex flex-1 items-center justify-center gap-[7px] whitespace-nowrap rounded-[9px] px-[15px] py-2.5 text-[12.5px] font-semibold';

  return (
    <div className="flex flex-col gap-2 md:items-end md:text-right">
      <div className="flex w-full max-w-[320px] gap-[3px] rounded-xl border border-border bg-muted p-1">
        {isPublished ? (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              segment,
              'cursor-pointer text-muted-foreground transition-colors hover:bg-card/75 hover:text-foreground',
            )}
          >
            Draft
          </button>
        ) : (
          <span className={cn(segment, 'bg-card text-foreground shadow-sm')}>
            <span className="size-[7px] rounded-full bg-amber-500" />
            Draft
          </span>
        )}

        {isPublished ? (
          <span className={cn(segment, 'bg-card text-emerald-700 shadow-sm')}>
            <span className="size-[7px] rounded-full bg-emerald-500" />
            Published
          </span>
        ) : canPublish ? (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              segment,
              'cursor-pointer text-primary transition-colors hover:bg-card/85',
            )}
          >
            Publish
          </button>
        ) : (
          <span
            title={note}
            aria-disabled
            className={cn(
              segment,
              'cursor-not-allowed text-muted-foreground/60',
            )}
          >
            <Lock className="size-3" strokeWidth={2.2} />
            Published
          </span>
        )}
      </div>

      <span
        className={cn(
          'text-[11.5px] font-medium leading-[1.4]',
          isPublished
            ? 'text-muted-foreground'
            : canPublish
              ? 'text-emerald-700'
              : 'text-amber-700',
        )}
      >
        {note}
      </span>
    </div>
  );
}

/**
 * A topic's curriculum, for the people who administer it rather than work
 * through it — its mentor, the club's coordinator, and an authority. Progress
 * and mentor cards are deliberately absent.
 *
 * Only the mentor writes here. A coordinator or authority reads the same page
 * without the controls: the API grants authoring and publishing to the mentor
 * alone, so offering either to anyone else would only produce a 403.
 */
export function MentorTopicView({
  topic,
  canEdit,
  onCreateModule,
  onEditModule,
}: {
  topic: TopicDetail;
  /** True only for this topic's own mentor — everyone else is reading. */
  canEdit: boolean;
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

  const [pendingPublish, setPendingPublish] = useState(false);
  const publishMutation = useSetTopicPublished(topic.id);

  const sorted = [...modules].sort((a, b) => a.order - b.order);
  const allocatedWeight = sorted.reduce((sum, m) => sum + m.weight, 0);

  const isPublished = topic.status === 'published';
  // The API enforces this too; the button just refuses to send a request it
  // already knows will be rejected.
  const canPublish =
    sorted.length > 0 && allocatedWeight === REQUIRED_TOPIC_WEIGHT;
  const publishBlockedReason =
    sorted.length === 0
      ? 'Add at least one module before publishing.'
      : allocatedWeight > REQUIRED_TOPIC_WEIGHT
        ? `Over-allocated by ${allocatedWeight - REQUIRED_TOPIC_WEIGHT}% — trim a module to publish`
        : `Allocate the remaining ${REQUIRED_TOPIC_WEIGHT - allocatedWeight}% to publish`;

  // What the toggle explains about the topic's current state.
  const statusNote = isPublished
    ? 'Live — visible to enrolled members'
    : canPublish
      ? 'Fully allocated — learners see it the moment you switch'
      : publishBlockedReason;

  const confirmPublish = () => {
    publishMutation.mutate(!isPublished, {
      onSuccess: () => {
        toast.success(
          isPublished
            ? `“${topic.name}” is back to draft`
            : `“${topic.name}” is published`,
        );
        setPendingPublish(false);
      },
      onError: (error) =>
        toast.error(
          getApiErrorMessage(
            error,
            isPublished
              ? 'Couldn’t unpublish the topic. Please try again.'
              : 'Couldn’t publish the topic. Please try again.',
          ),
        ),
    });
  };

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
      {canEdit && (
        <NavbarActions>
          <Button
            type="button"
            size="sm"
            onClick={onCreateModule}
            aria-label="Create Module"
            // `h-auto` frees the height `size="sm"` fixes at 32px, and the
            // `has-` variant restates the padding so `sm`'s own
            // `has-[>svg]:px-2.5` — higher specificity, and this button does
            // have a direct svg child — can't clamp it back to 10px.
            className="h-auto gap-1.5  has-[>svg]:p-3"
          >
            <Plus className="size-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Create Module</span>
          </Button>
        </NavbarActions>
      )}

      <SectionHeading
        title="Curriculum Modules"
        subtitle={
          canEdit
            ? 'Manage and organize your learning content into learning modules'
            : `The curriculum as its mentor has built it${
                topic.mentor ? `, authored by ${topic.mentor.name}` : ''
              }`
        }
        className="mb-6"
        action={
          canEdit ? (
            <PublishToggle
              isPublished={isPublished}
              canPublish={canPublish}
              note={statusNote}
              onToggle={() => setPendingPublish(true)}
            />
          ) : (
            // Readable, not switchable: publishing is the mentor's call alone.
            <span
              className={cn(
                'inline-flex items-center gap-[7px] rounded-lg border px-3 py-2 text-[12.5px] font-semibold',
                isPublished
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400',
              )}
            >
              <span
                className={cn(
                  'size-[7px] rounded-full',
                  isPublished ? 'bg-emerald-500' : 'bg-amber-500',
                )}
              />
              {isPublished ? 'Published' : 'Draft'}
            </span>
          )
        }
      />

      {canEdit && isPublished && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-[12.5px] font-medium leading-[1.45] text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          <span className="mt-[5px] size-[7px] shrink-0 rounded-full bg-emerald-500" />
          This topic is live. Edits to a module publish immediately — switch
          back to Draft to work privately.
        </div>
      )}

      {isError && (
        <p className="py-12 text-center text-sm text-destructive">
          Couldn’t load the modules. Please try again.
        </p>
      )}

      {isLoading && (
        <div className={GRID}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-[14px] bg-muted"
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && sorted.length === 0 && (
        <div className="rounded-[14px] border-[1.5px] border-dashed border-input px-5 py-14 text-center">
          <div className="text-sm font-semibold text-foreground">
            No modules yet
          </div>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {canEdit
              ? 'Add the first module to give learners somewhere to start.'
              : 'Its mentor has not added any modules to this topic yet.'}
          </p>
        </div>
      )}

      {sorted.length > 0 && (
        <div className={GRID}>
          {sorted.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={toCardModule(module, index + 1)}
              emptyResourcesLabel="No resources attached yet."
              weightBar
              // Both controls are the mentor's; omitting them is what hides
              // them from a coordinator or authority reading the page.
              onEdit={
                canEdit && onEditModule ? () => onEditModule(module) : undefined
              }
              onDelete={canEdit ? () => setPendingDelete(module) : undefined}
            />
          ))}
        </div>
      )}

      {pendingPublish &&
        (isPublished ? (
          <ConfirmDialog
            title={`Unpublish “${topic.name}”?`}
            description="Learners lose access while it is a draft, and enrolled learners keep their progress. Republish once the curriculum is settled."
            detail="Module weights can only be changed while a topic is a draft."
            confirmLabel="Unpublish"
            pendingLabel="Unpublishing…"
            pending={publishMutation.isPending}
            onConfirm={confirmPublish}
            onCancel={() => setPendingPublish(false)}
          />
        ) : (
          <ConfirmDialog
            title={`Publish “${topic.name}”?`}
            description={`Learners will see this topic and can enroll in it. Its ${sorted.length} module${sorted.length === 1 ? '' : 's'} total ${allocatedWeight}%.`}
            detail="Module weights are frozen while a topic is published — unpublish to change them."
            confirmLabel="Publish topic"
            pendingLabel="Publishing…"
            pending={publishMutation.isPending}
            onConfirm={confirmPublish}
            onCancel={() => setPendingPublish(false)}
          />
        ))}

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
