import { EnrollmentStatus, MembershipStatus } from 'shared';

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
 * "Approve" means different things per resource: a club *membership* becomes
 * `active` (there is no `approved` member state), while a topic *enrollment*
 * becomes `approved`. Sending `approved` to the club endpoint fails its Zod
 * schema with a 400.
 */
const API_STATUS: Record<
  EnrollmentType,
  Record<'approved' | 'rejected', string>
> = {
  club: {
    approved: MembershipStatus.active,
    rejected: MembershipStatus.rejected,
  },
  topic: {
    approved: EnrollmentStatus.approved,
    rejected: EnrollmentStatus.rejected,
  },
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
    httpClient.patch(`/${RESOURCE_PATH[type]}/${targetId}/members/${userId}`, {
      status: API_STATUS[type][status],
      droppedReason,
    }),
};
