import { LearnerTopicView } from '@/features/topics/components/learner-topic-view';
import { MentorTopicView } from '@/features/topics/components/mentor-topic-view';
import { useTopic } from '@/features/topics/hooks/use-topics';
import { useAuthStore } from '@/store/auth.store';

/**
 * Topic route — picks the view by the caller's relationship to the topic.
 * Its own mentor authors the curriculum (modules only); everyone else works
 * through it. The role split lives here so neither view carries the other's
 * concerns.
 */
export function EnrolledTopicPage({ topicId }: { topicId: string }) {
  const userId = useAuthStore((s) => s.userId);
  const { data: topic, isLoading, isError } = useTopic(topicId);

  const isMentor = topic?.mentor != null && topic.mentor.id === userId;

  return (
    <div className="pb-16">
      <main className="mx-auto max-w-[1800px] px-4 py-8 md:px-6">
        {isError && (
          <p className="py-12 text-center text-sm text-destructive">
            Couldn’t load this topic. Please try again.
          </p>
        )}

        {/* Hold the role decision until the topic resolves — rendering the
            learner view first would flash the wrong page at the mentor. */}
        {isLoading && (
          <div className="space-y-8">
            <div className="h-24 w-2/3 animate-pulse rounded-xl bg-muted" />
            <div className="h-56 animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {topic &&
          (isMentor ? (
            <MentorTopicView topic={topic} />
          ) : (
            <LearnerTopicView topicId={topicId} />
          ))}
      </main>
    </div>
  );
}
