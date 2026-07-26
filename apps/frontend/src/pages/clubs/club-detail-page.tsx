import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { ClubHero } from '@/features/clubs/components/club-hero';
import { ClubJoinModal } from '@/features/clubs/components/club-join-modal';
import { ClubMembershipNotice } from '@/features/clubs/components/club-membership-notice';
import { CreateTopicModal } from '@/features/clubs/components/create-topic-modal';
import { EditTopicModal } from '@/features/clubs/components/edit-topic-modal';
import { TopicEnrollModal } from '@/features/clubs/components/topic-enroll-modal';
import { TopicsList } from '@/features/clubs/components/topics-list';
import {
  TOPIC_ENROLLMENT_REVIEW_INTRO,
  TOPIC_ENROLLMENT_REVIEW_NOTE,
  TOPIC_ENROLLMENT_TERMS,
  TOPIC_ENROLLMENT_WEEKLY_COMMITMENT,
} from '@/features/clubs/clubs.constants';
import type { Topic, TopicAction } from '@/features/clubs/clubs.types';
import { useClubDetail, useClubTopics } from '@/features/clubs/hooks/use-clubs';
import { useAuthStore } from '@/store/auth.store';

/**
 * The line under the enroll dialog's title: what the topic is, then what
 * happens to the request. The coordinator's own description leads when there is
 * one — the modules, time, and mentor are left to the summary panel rather than
 * restated in a sentence.
 */
function buildTopicAbout(topic: Topic): string {
  const lead = topic.description ?? 'This topic has no description yet.';
  return `${lead} ${TOPIC_ENROLLMENT_REVIEW_INTRO}`;
}

export function ClubDetailPage({ clubId }: { clubId: string }) {
  const navigate = useNavigate();
  const isAuthority = useAuthStore((s) => s.isAuthority);
  const userId = useAuthStore((s) => s.userId);
  const { data: club, isLoading, isError } = useClubDetail(clubId);
  const { data: topics = [], isLoading: topicsLoading } = useClubTopics(clubId);
  const [enrollTopic, setEnrollTopic] = useState<Topic | null>(null);
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [joiningClub, setJoiningClub] = useState(false);
  // The topic whose edit form is open; null while none is.
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  // Authority and the club's own coordinator administer its topics.
  const canManageTopics =
    isAuthority || (club?.coordinatorId ?? null) === userId;

  // The club is open to browse, but its curriculum is only enrollable once an
  // application has been approved — a pending one has not opened anything yet.
  const isClubMember = club?.membership === 'active';

  const handleTopicAction = (topic: Topic, action: TopicAction) => {
    if (action === 'enroll') {
      setEnrollTopic(topic);
      return;
    }
    // 'manage-modules' and 'open' both resolve to the topic route.
    navigate(`/topics/${topic.id}`);
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

            {/* People who administer the club's topics reach them by role, not
                by membership — the notice is for everyone else. */}
            {!canManageTopics && (
              <ClubMembershipNotice
                membership={club.membership}
                onJoin={() => setJoiningClub(true)}
              />
            )}

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
                canManageTopics={canManageTopics}
                isClubMember={isClubMember}
                // Editing includes reassigning the mentor, which the API
                // restricts to coordinator/authority — so a topic's own mentor
                // gets "Manage modules" without the edit control.
                onEditTopic={canManageTopics ? setEditingTopic : undefined}
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
          meta={{
            modules: enrollTopic.modules,
            estTimeMinutes: enrollTopic.estTimeMinutes,
            mentorName: enrollTopic.mentor?.name,
            weeklyCommitment: TOPIC_ENROLLMENT_WEEKLY_COMMITMENT,
          }}
          about={buildTopicAbout(enrollTopic)}
          terms={TOPIC_ENROLLMENT_TERMS}
          reviewNote={TOPIC_ENROLLMENT_REVIEW_NOTE}
          // TODO: POST the reason once the topic-enrollment endpoint exists —
          // until then the request has nowhere to go, so the dialog closes
          // rather than claiming it was sent.
          onSubmit={() => setEnrollTopic(null)}
        />
      )}

      <ClubJoinModal
        clubId={clubId}
        open={joiningClub}
        onClose={() => setJoiningClub(false)}
      />

      <CreateTopicModal
        clubId={clubId}
        open={creatingTopic}
        onClose={() => setCreatingTopic(false)}
      />

      {/* Keyed so switching topics remounts the form rather than reseeding a
          half-edited one. */}
      {editingTopic && (
        <EditTopicModal
          key={editingTopic.id}
          clubId={clubId}
          topic={editingTopic}
          onClose={() => setEditingTopic(null)}
        />
      )}
    </div>
  );
}
