import { useState } from 'react';

import { BottomNav } from '@/components/layout/bottom-nav';
import { PageHeader } from '@/components/layout/page-header';
import { ClubExpectations } from '@/features/clubs/components/club-expectations';
import { ClubHero } from '@/features/clubs/components/club-hero';
import { TopicEnrollModal } from '@/features/clubs/components/topic-enroll-modal';
import { TopicsList } from '@/features/clubs/components/topics-list';
import {
  TOPIC_ENROLLMENT_ACKNOWLEDGEMENT,
  TOPIC_ENROLLMENT_COMMITMENTS,
  TOPIC_ENROLLMENT_REVIEW_NOTE,
} from '@/features/clubs/clubs.constants';
import type { Topic } from '@/features/clubs/clubs.types';
import { useClubDetail } from '@/features/clubs/hooks/use-clubs';
import { navigate } from '@/lib/navigation';

export function ClubDetailPage({ clubId }: { clubId: string }) {
  const { data: club, isLoading, isError } = useClubDetail(clubId);
  const [enrollTopic, setEnrollTopic] = useState<Topic | null>(null);

  const handleTopicAction = (topic: Topic) => {
    if (topic.enrolled) return; // "Open" — enrolled topic navigation TBD
    setEnrollTopic(topic);
  };

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <PageHeader title="Club Detail" onBack={() => navigate('/explore')} />

      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8">
        {isError && (
          <p className="py-12 text-center text-sm text-destructive">
            Couldn’t load this club. Please try again.
          </p>
        )}

        {isLoading && (
          <div className="space-y-6">
            <div className="h-[240px] animate-pulse rounded-xl bg-muted md:h-[320px]" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {club && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-12">
              <ClubHero
                name={club.name}
                tone={club.tone}
                topicsCount={club.topicsCount}
                membersLabel={club.membersLabel}
              />
            </div>
            <div className="md:col-span-4">
              <ClubExpectations
                expectationsIntro={club.expectationsIntro}
                expectations={club.expectations}
                mentorshipFocus={club.mentorshipFocus}
              />
            </div>
            <div className="md:col-span-8">
              <TopicsList
                topics={club.topics}
                onTopicAction={handleTopicAction}
              />
            </div>
          </div>
        )}
      </main>

      {enrollTopic && (
        <TopicEnrollModal
          open
          onClose={() => setEnrollTopic(null)}
          topicName={enrollTopic.title}
          stats={{ modules: enrollTopic.modules }}
          about={`This topic is led by ${enrollTopic.mentor.name} and spans ${enrollTopic.modules} modules (~${enrollTopic.hours} hrs). Enroll to access its modules, tasks, and the peer-review process.`}
          commitments={TOPIC_ENROLLMENT_COMMITMENTS}
          finalAcknowledgement={TOPIC_ENROLLMENT_ACKNOWLEDGEMENT}
          reviewNote={TOPIC_ENROLLMENT_REVIEW_NOTE}
          onSubmit={() => setEnrollTopic(null)}
        />
      )}

      <BottomNav activePath="/explore" />
    </div>
  );
}
