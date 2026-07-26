// Throwaway harness for eyeballing the enroll dialog at the spec's widths.
// Delete with preview-enroll.html once the design is signed off.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { TopicEnrollModal } from '@/features/clubs/components/topic-enroll-modal';
import {
  TOPIC_ENROLLMENT_REVIEW_INTRO,
  TOPIC_ENROLLMENT_REVIEW_NOTE,
  TOPIC_ENROLLMENT_TERMS,
  TOPIC_ENROLLMENT_WEEKLY_COMMITMENT,
} from '@/features/clubs/clubs.constants';
import './index.css';

const sent = new URLSearchParams(window.location.search).has('sent');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TopicEnrollModal
      open
      sent={sent}
      onClose={() => {}}
      onBackToForm={() => {}}
      topicName="vue.js"
      about={`Learning progressive framework for web. ${TOPIC_ENROLLMENT_REVIEW_INTRO}`}
      meta={{
        modules: 1,
        estTimeMinutes: 90,
        mentorName: 'Md. Shahnur Islam Plabon',
        weeklyCommitment: TOPIC_ENROLLMENT_WEEKLY_COMMITMENT,
      }}
      terms={TOPIC_ENROLLMENT_TERMS}
      reviewNote={TOPIC_ENROLLMENT_REVIEW_NOTE}
      onSubmit={() => {}}
    />
  </StrictMode>,
);
