import { useEffect, useState } from 'react';

import { LandingHeader } from '@/features/landing/components/landing-header';
import { MarkDoneModal } from '@/features/topics/components/mark-done-modal';
import { ModuleCard } from '@/features/topics/components/module-card';
import { TopicMentorCard } from '@/features/topics/components/topic-mentor-card';
import { TopicProgressCard } from '@/features/topics/components/topic-progress-card';
import { useEnrolledTopic } from '@/features/topics/hooks/use-topics';
import type { TopicModule } from '@/features/topics/topics.types';

export function EnrolledTopicPage({ topicId }: { topicId: string }) {
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
    <div className="min-h-screen bg-background pb-16 text-foreground">
      <LandingHeader showLogin={false} showNotifications />

      <main className="mx-auto max-w-[1800px] px-4 py-8 md:px-6">
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
            <section className="mb-8">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                Enrolled Topic
              </div>
              <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-primary md:text-4xl">
                {topic.title}
              </h1>
            </section>

            {/* Summary row — progress flexes, mentor column capped at 350px */}
            <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-[1fr_350px]">
              <TopicProgressCard
                startedOn={topic.startedOn}
                estCompletion={topic.estCompletion}
                progressPct={topic.progressPct}
              />
              <TopicMentorCard mentor={topic.mentor} />
            </div>

            {/* Curriculum */}
            <section>
              <div className="mb-6 flex flex-col items-start gap-2 border-b pb-4 md:flex-row md:items-center md:justify-between">
                <h2 className="font-serif text-2xl font-bold tracking-tight">
                  Learning Modules
                </h2>
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                  {topic.moduleCount} Modules • {topic.taskCount} Tasks
                </span>
              </div>

              <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      </main>

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
    </div>
  );
}
