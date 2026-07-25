import { useEffect, useState } from 'react';

import { SectionHeading } from '@/components/ui/section-heading';
import { MarkDoneModal } from './mark-done-modal';
import { ModuleCard } from './module-card';
import { TopicMentorCard } from './topic-mentor-card';
import { TopicProgressCard } from './topic-progress-card';
import { useEnrolledTopic } from '../hooks/use-topics';
import type { TopicModule } from '../topics.types';

/**
 * The learner's topic view — progress, mentor, and the module list with its
 * mark-done flow. Still fixture-backed (see `topics.service`).
 */
export function LearnerTopicView({ topicId }: { topicId: string }) {
  const { data: topic, isLoading, isError } = useEnrolledTopic(topicId);
  const [markDoneModule, setMarkDoneModule] = useState<TopicModule | null>(
    null,
  );
  const [showToast, setShowToast] = useState(false);

  // Auto-dismiss the confirmation toast.
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showToast]);

  const handleMarkDoneSubmit = () => {
    setMarkDoneModule(null);
    setShowToast(true);
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      )}

      {topic && (
        <>
          {/* Title */}
          <SectionHeading
            as="h1"
            eyebrow="Enrolled Topic"
            title={topic.title}
            className="mb-8"
          />

          {/* Summary row — progress 2/3, mentor 1/3 (never below 275px) */}
          <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-[2fr_minmax(275px,1fr)]">
            <TopicProgressCard
              startedOn={topic.startedOn}
              estCompletion={topic.estCompletion}
              progressPct={topic.progressPct}
              modulesDone={
                topic.modules.filter((m) => m.status === 'completed').length
              }
              modulesTotal={topic.modules.length}
            />
            <TopicMentorCard mentor={topic.mentor} />
          </div>

          {/* Curriculum */}
          <section>
            <SectionHeading
              title="Learning Modules"
              className="mb-6"
              action={
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                  {topic.moduleCount} Modules • {topic.taskCount} Tasks
                </span>
              }
            />

            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(400px,100%),1fr))] items-start gap-4">
              {topic.modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onMarkDone={setMarkDoneModule}
                />
              ))}
            </div>
          </section>
        </>
      )}

      <MarkDoneModal
        open={markDoneModule !== null}
        onClose={() => setMarkDoneModule(null)}
        onSubmit={handleMarkDoneSubmit}
      />

      {showToast && (
        <div className="fixed bottom-10 left-1/2 z-[100] -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm text-white shadow-xl">
            ✅ Module marked as done! Awaiting mentor review
          </div>
        </div>
      )}
    </>
  );
}
