import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { ClubHero } from '@/features/clubs/components/club-hero';
import { CreateTopicModal } from '@/features/clubs/components/create-topic-modal';
import { TopicEnrollModal } from '@/features/clubs/components/topic-enroll-modal';
import { TopicsList } from '@/features/clubs/components/topics-list';
import {
  TOPIC_ENROLLMENT_ACKNOWLEDGEMENT,
  TOPIC_ENROLLMENT_COMMITMENTS,
  TOPIC_ENROLLMENT_REVIEW_NOTE,
} from '@/features/clubs/clubs.constants';
import type { Topic } from '@/features/clubs/clubs.types';
import { useClubDetail, useClubTopics } from '@/features/clubs/hooks/use-clubs';
import { useAuthStore } from '@/store/auth.store';

/**
 * Enrollment blurb — degrades gracefully while the topics list endpoint omits
 * mentor and curriculum stats (see `Topic`).
 */
function buildTopicAbout(topic: Topic): string {
  const lead = topic.mentor
    ? `This topic is led by ${topic.mentor.name}`
    : 'This topic';
  const span =
    topic.modules != null
      ? ` and spans ${topic.modules} modules${topic.hours != null ? ` (~${topic.hours} hrs)` : ''}`
      : '';
  return `${lead}${span}. Enroll to access its modules, tasks, and the peer-review process.`;
}

export function ClubDetailPage({ clubId }: { clubId: string }) {
  const navigate = useNavigate();
  const isAuthority = useAuthStore((s) => s.isAuthority);
  const userId = useAuthStore((s) => s.userId);
  const { data: club, isLoading, isError } = useClubDetail(clubId);
  const { data: topics = [], isLoading: topicsLoading } = useClubTopics(clubId);
  const [enrollTopic, setEnrollTopic] = useState<Topic | null>(null);
  const [creatingTopic, setCreatingTopic] = useState(false);

  const handleTopicAction = (topic: Topic) => {
    if (topic.mentor?.id === userId) {
      navigate(`/topics/${topic.id}`); // "Edit" — mentor manages the topic
      return;
    }
    if (topic.enrolled) {
      navigate(`/topics/${topic.id}`); // "Open" — enrolled topic view
      return;
    }
    setEnrollTopic(topic);
  };

  return (
    <div className="pb-24">
      <main className="mx-auto w-full max-w-[1800px] px-4 py-6 md:px-6 lg:px-12 lg:py-8">
        {/* In-content back affordance — keeps global chrome constant */}
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Explore
        </button>

        {isError && (
          <p className="py-12 text-center text-sm text-destructive">
            Couldn’t load this club. Please try again.
          </p>
        )}

        {isLoading && (
          <div className="space-y-8">
            <div className="h-48 animate-pulse rounded-2xl bg-muted md:h-56" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          </div>
        )}

        {club && (
          <div className="flex flex-col gap-4 md:gap-5 lg:gap-6">
            <ClubHero
              name={club.name}
              tagline={club.description}
              topicsCount={club.topicsCount}
              membersLabel={club.membersLabel}
              sessionsCount={club.sessionsCount}
              mentorsCount={club.mentorsCount}
              coordinatorName={club.coordinatorName}
            />

            {topicsLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-40 animate-pulse rounded-xl bg-muted"
                  />
                ))}
              </div>
            ) : (
              <TopicsList
                topics={topics}
                onTopicAction={handleTopicAction}
                onCreateTopic={
                  isAuthority ? () => setCreatingTopic(true) : undefined
                }
              />
            )}
          </div>
        )}
      </main>

      {enrollTopic && (
        <TopicEnrollModal
          open
          onClose={() => setEnrollTopic(null)}
          topicName={enrollTopic.title}
          stats={{ modules: enrollTopic.modules }}
          about={buildTopicAbout(enrollTopic)}
          commitments={TOPIC_ENROLLMENT_COMMITMENTS}
          finalAcknowledgement={TOPIC_ENROLLMENT_ACKNOWLEDGEMENT}
          reviewNote={TOPIC_ENROLLMENT_REVIEW_NOTE}
          onSubmit={() => setEnrollTopic(null)}
        />
      )}

      <CreateTopicModal
        clubId={clubId}
        open={creatingTopic}
        onClose={() => setCreatingTopic(false)}
      />
    </div>
  );
}
