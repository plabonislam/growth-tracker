import {
  MembershipStatus,
  type MyTopicEnrollment,
  type TopicEnrollmentResponse,
} from 'shared';

import { httpClient } from '@/services/http/client';
import type { EnrollmentRequest } from '../enrollments.types';

export type EnrollmentType = 'club' | 'topic';

interface ApiPendingEnrollment {
  id: string;
  userId: string;
  clubId?: string;
  topicId?: string;
  requester: {
    name: string;
    email: string;
  };
  target: string;
  status: 'pending';
  createdAt: string;
}

interface PendingEnrollmentsResponse {
  data: ApiPendingEnrollment[];
  total: number;
}

interface FetchEnrollmentsParams {
  type: EnrollmentType;
  limit?: number;
  offset?: number;
}

export interface UpdateEnrollmentParams {
  type: EnrollmentType;
  targetId: string;
  userId: string;
  status: 'approved' | 'rejected';
  droppedReason?: string;
}

const RESOURCE_PATH: Record<EnrollmentType, string> = {
  club: 'clubs',
  topic: 'topics',
};

/**
 * A decision reads differently per resource. A club *membership* is moved to a
 * state — `active`, since there is no `approved` member — through the members
 * endpoint, while a topic *enrollment* is decided by an action the enrollments
 * endpoint applies itself. The two contracts don't overlap, so each is built
 * where it is sent.
 */
const CLUB_MEMBER_STATUS: Record<'approved' | 'rejected', string> = {
  approved: MembershipStatus.active,
  rejected: MembershipStatus.rejected,
};

const TONE_ROTATION = ['teal', 'violet', 'amber', 'rose', 'indigo'] as const;

function getEnrollmentTone(index: number) {
  return TONE_ROTATION[index % TONE_ROTATION.length];
}

function toEnrollmentRequest(
  apiEnrollment: ApiPendingEnrollment,
  index: number,
): EnrollmentRequest {
  const date = new Date(apiEnrollment.createdAt);
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    id: apiEnrollment.id,
    userId: apiEnrollment.userId,
    clubId: apiEnrollment.clubId,
    topicId: apiEnrollment.topicId,
    requester: apiEnrollment.requester,
    target: apiEnrollment.target,
    targetTone: getEnrollmentTone(index),
    dateSubmitted: dateStr,
    timeSubmitted: timeStr,
    status: 'pending',
  };
}

export const enrollmentsService = {
  fetchEnrollments: async ({
    type,
    limit = 10,
    offset = 0,
  }: FetchEnrollmentsParams) => {
    const response = await httpClient.get<PendingEnrollmentsResponse>(
      `/${RESOURCE_PATH[type]}/enrollments/pending`,
      { params: { limit, offset } },
    );

    return {
      requests: response.data.data.map(toEnrollmentRequest),
      total: response.data.total,
    };
  },

  updateEnrollment: ({
    type,
    targetId,
    userId,
    status,
    droppedReason,
  }: UpdateEnrollmentParams) =>
    type === 'topic'
      ? httpClient.patch(`/topics/${targetId}/enrollments/${userId}`, {
          action: status === 'approved' ? 'approve' : 'reject',
        })
      : httpClient.patch(`/clubs/${targetId}/members/${userId}`, {
          status: CLUB_MEMBER_STATUS[status],
          droppedReason,
        }),

  /** Sends a learner's request to join a topic — `POST /topics/:id/enroll`. */
  enrollInTopic: (
    topicId: string,
    reason: string,
  ): Promise<TopicEnrollmentResponse> =>
    httpClient
      .post<TopicEnrollmentResponse>(`/topics/${topicId}/enroll`, { reason })
      .then((r) => r.data),

  /** Where the caller stands with every topic they have applied to. */
  getMyTopicEnrollments: (): Promise<MyTopicEnrollment[]> =>
    httpClient
      .get<MyTopicEnrollment[]>('/topics/enrollments/mine')
      .then((r) => r.data),
};
