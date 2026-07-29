import { useNavigate } from 'react-router';

import { useClubDetail } from '@/features/clubs/hooks/use-clubs';
import { LearnerTopicView } from '@/features/topics/components/learner-topic-view';
import { MentorTopicView } from '@/features/topics/components/mentor-topic-view';
import { useTopic } from '@/features/topics/hooks/use-topics';
import { useAuthStore } from '@/store/auth.store';

/**
 * Topic route — picks the view by the caller's relationship to the topic.
 * Whoever administers it sees the curriculum: its mentor, who writes it, and
 * the club's coordinator and an authority, who read it. Everyone else works
 * through it. The role split lives here so neither view carries the other's
 * concerns.
 */
export function EnrolledTopicPage({ topicId }: { topicId: string }) {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.userId);
  const isAuthority = useAuthStore((s) => s.isAuthority);
  const { data: topic, isLoading, isError } = useTopic(topicId);
  // Coordinating is a fact about the club, not about the caller's token — so
  // it has to be asked of the club the topic belongs to.
  const { data: club } = useClubDetail(topic?.clubId ?? '');

  const isMentor = topic?.mentor != null && topic.mentor.id === userId;
  const isCoordinator =
    club?.coordinatorId != null && club.coordinatorId === userId;
  // Reading the curriculum is open to everyone who administers the topic;
  // writing to it is the mentor's alone — the API agrees on both counts.
  const canAdminister = isMentor || isCoordinator || isAuthority;

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

        {topic && (
          <>
            {/* Leaving is the navbar's job here — the shell carries the back
                arrow to the club, so the page owns no affordance of its own. */}
            {canAdminister ? (
              <MentorTopicView
                topic={topic}
                canEdit={isMentor}
                onCreateModule={() =>
                  navigate(`/topics/${topicId}/modules/new`)
                }
                onEditModule={(module) =>
                  navigate(`/topics/${topicId}/modules/${module.id}/edit`)
                }
              />
            ) : (
              <LearnerTopicView topicId={topicId} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
