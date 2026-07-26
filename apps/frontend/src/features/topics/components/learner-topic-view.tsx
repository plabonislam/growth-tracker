import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { SectionHeading } from '@/components/ui/section-heading';
import { formatDuration } from '@/lib/format-duration';
import { getApiErrorMessage } from '@/services/http/client';
import { MarkDoneModal } from './mark-done-modal';
import {
  ModuleCard,
  type LearnerModuleStatus,
  type ModuleCardModule,
} from './module-card';
import { TopicMentorCard } from './topic-mentor-card';
import { TopicProgressCard } from './topic-progress-card';
import {
  useSetModuleProgress,
  useTopic,
  useTopicModules,
  useTopicProgress,
} from '../hooks/use-topics';
import {
  PLACEHOLDER_EST_COMPLETION,
  PLACEHOLDER_MENTOR_STATS,
} from '../topics.constants';
import type { ModuleStatus } from '../topics.types';

/** A module as the learner works through it — curriculum plus their own state. */
type LearnerModule = ModuleCardModule & { status: ModuleStatus };

/** ISO date → "Jun 12, 2026"; undefined while the request is still out. */
function formatDay(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? undefined
    : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
}

/**
 * The learner's topic view — their progress and the curriculum, each module
 * carrying where they have got to with it. The curriculum comes from the topic;
 * the state comes from `GET /topics/:id/progress`, which answers per caller.
 */
export function LearnerTopicView({ topicId }: { topicId: string }) {
  const modulesQuery = useTopicModules(topicId);
  const progressQuery = useTopicProgress(topicId);
  const setStatus = useSetModuleProgress(topicId);
  // Already in cache — the topic page fetched it to decide which view to show.
  const mentorName = useTopic(topicId).data?.mentor?.name;

  const [markDoneModule, setMarkDoneModule] = useState<LearnerModule | null>(
    null,
  );

  const isLoading = modulesQuery.isLoading || progressQuery.isLoading;
  const isError = modulesQuery.isError || progressQuery.isError;

  const modules = useMemo<LearnerModule[]>(() => {
    const curriculum = modulesQuery.data ?? [];
    const statusByModule = new Map(
      (progressQuery.data?.modules ?? []).map((m) => [m.id, m.status]),
    );

    return curriculum.map((module, index) => ({
      id: module.id,
      // Numbered by position, so a gap in the stored order never reads as one.
      order: index + 1,
      title: module.title,
      weightPct: module.weight,
      estTime: formatDuration(module.estTime) ?? '',
      description: module.body,
      status: statusByModule.get(module.id) ?? 'to_do',
      resources: module.resources.map((resource) => ({
        id: resource.id,
        kind: resource.kind,
        label: resource.title,
        url: resource.url,
      })),
    }));
  }, [modulesQuery.data, progressQuery.data]);

  const completed = modules.filter((m) => m.status === 'completed').length;
  const resourceCount = modules.reduce((n, m) => n + m.resources.length, 0);

  const apply = (module: LearnerModule, status: LearnerModuleStatus) =>
    setStatus.mutate(
      { moduleId: module.id, status },
      {
        onError: (error) =>
          toast.error(
            getApiErrorMessage(
              error,
              'Couldn’t update this module. Please try again.',
            ),
          ),
      },
    );

  const submitForReview = () => {
    if (!markDoneModule) return;
    const { title } = markDoneModule;

    setStatus.mutate(
      { moduleId: markDoneModule.id, status: 'pending_confirmation' },
      {
        onSuccess: () => {
          toast.success(`“${title}” sent to your mentor for review`);
          setMarkDoneModule(null);
        },
        onError: (error) =>
          toast.error(
            getApiErrorMessage(
              error,
              'Couldn’t send this module for review. Please try again.',
            ),
          ),
      },
    );
  };

  return (
    <>
      {isError && (
        <p className="py-12 text-center text-sm text-destructive">
          Couldn’t load this topic. Please try again.
        </p>
      )}

      {isLoading && (
        <div className="space-y-8">
          <div className="h-24 w-2/3 animate-pulse rounded-xl bg-muted" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-56 animate-pulse rounded-xl bg-muted" />
            <div className="h-56 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Progress 2/3, mentor 1/3 (never below 275px) */}
          <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-[2fr_minmax(275px,1fr)]">
            <TopicProgressCard
              progressPct={progressQuery.data?.progress ?? 0}
              startedOn={formatDay(progressQuery.data?.startedAt)}
              estCompletion={PLACEHOLDER_EST_COMPLETION}
              modulesDone={completed}
              modulesTotal={modules.length}
            />
            {mentorName && (
              <TopicMentorCard
                mentor={{ name: mentorName, ...PLACEHOLDER_MENTOR_STATS }}
              />
            )}
          </div>

          <section>
            <SectionHeading
              title="Learning Modules"
              className="mb-6"
              action={
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                  {modules.length} {modules.length === 1 ? 'module' : 'modules'}{' '}
                  · {resourceCount}{' '}
                  {resourceCount === 1 ? 'resource' : 'resources'}
                </span>
              }
            />

            {modules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-input px-5 py-12 text-center">
                <div className="text-sm font-semibold text-foreground">
                  No modules yet
                </div>
                <p className="mt-1.5 text-[13px] text-muted-foreground">
                  Your mentor is still building this curriculum.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] items-stretch gap-4">
                {modules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    onMarkDone={setMarkDoneModule}
                    onSetStatus={apply}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <MarkDoneModal
        open={markDoneModule !== null}
        onClose={() => setMarkDoneModule(null)}
        onSubmit={submitForReview}
        isSubmitting={setStatus.isPending}
      />
    </>
  );
}
