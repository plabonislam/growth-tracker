import type {
  ClubResponse,
  CreateClub,
  CreateTopic,
  JoinClub,
  TopicListItem,
  TopicResponse,
} from 'shared';

import { httpClient } from '@/services/http/client';
import type {
  Club,
  ClubDetail,
  ClubIconKey,
  ClubJoinInfo,
  ClubTone,
  MembershipStatus,
  Topic,
  TopicIconKey,
} from '../clubs.types';

/**
 * Clubs service.
 *
 * `getClubs` calls the real `GET /clubs`. The other reads still resolve
 * local fixtures (see docs/frontend.md — Service Pattern) until their
 * endpoints exist.
 */

/** Shape returned by `GET /clubs` — see ClubsRepository.findAllActive(). */
interface ApiClub {
  id: string;
  name: string;
  description: string | null;
  archived: boolean;
  topicCount: number;
  memberCount: number;
  membershipStatus: MembershipStatus | null;
}

/** Shape returned by `GET /clubs/:id` — see ClubsRepository.findById(). */
interface ApiClubDetail {
  id: string;
  name: string;
  description: string | null;
  archived: boolean;
  topicCount: number;
  memberCount: number;
  sessionCount: number;
  mentorCount: number;
  coordinatorName: string | null;
  coordinatorId: string | null;
}

/** Compact member count, e.g. 1240 → "1.2k". */
function formatCount(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
}

function toClubDetail(api: ApiClubDetail): ClubDetail {
  return {
    id: api.id,
    name: api.name,
    description: api.description ?? '',
    tone: 'primary',
    topicsCount: api.topicCount,
    membersLabel: formatCount(api.memberCount),
    sessionsCount: api.sessionCount,
    mentorsCount: api.mentorCount,
    coordinatorName: api.coordinatorName,
    coordinatorId: api.coordinatorId,
    // Not surfaced on the current detail layout — kept for type completeness.
    expectationsIntro: '',
    expectations: [],
    mentorshipFocus: '',
    topics: [],
  };
}

// Backend doesn't track icon/tone per club — rotate through these for
// visual variety since real clubs don't come with a preset one.
const ICON_ROTATION: ClubIconKey[] = [
  'engineering',
  'data',
  'ai',
  'leadership',
  'security',
  'design',
];
const TONE_ROTATION: ClubTone[] = [
  'primary',
  'indigo',
  'amber',
  'rose',
  'violet',
];

// Topics carry no icon/tone in the DB — rotate for visual variety, same as clubs.
const TOPIC_ICON_ROTATION: TopicIconKey[] = ['analytics', 'neural', 'pipeline'];

/**
 * Map a `GET /clubs/:clubId/topics` row to the UI `Topic`. Icon/tone aren't
 * stored, so they rotate for visual variety; the mentor role is presentation
 * metadata the API doesn't track, so it's left off the badge.
 */
function toTopic(apiTopic: TopicListItem, index: number): Topic {
  return {
    id: apiTopic.id,
    title: apiTopic.name,
    description: apiTopic.description,
    status: apiTopic.status,
    iconKey: TOPIC_ICON_ROTATION[index % TOPIC_ICON_ROTATION.length]!,
    tone: TONE_ROTATION[index % TONE_ROTATION.length]!,
    modules: apiTopic.moduleCount,
    estTimeMinutes: apiTopic.estTimeMinutes,
    mentor: apiTopic.mentor
      ? { id: apiTopic.mentor.id, name: apiTopic.mentor.name }
      : undefined,
    enrolled: false,
  };
}

function toClub(apiClub: ApiClub, index: number): Club {
  return {
    id: apiClub.id,
    name: apiClub.name,
    description: apiClub.description ?? '',
    iconKey: ICON_ROTATION[index % ICON_ROTATION.length]!,
    tone: TONE_ROTATION[index % TONE_ROTATION.length]!,
    topics: apiClub.topicCount,
    members: apiClub.memberCount,
    membership: apiClub.membershipStatus,
  };
}

const CLUB_JOIN_INFO: ClubJoinInfo = {
  id: 'data-science-masters',
  name: 'Data Science Masters',
  iconKey: 'analytics',
  tone: 'primary',
  topicsLabel: '24 active tracks',
  membersLabel: '1,240 learners',
  coordinators: ['Priya Nair', 'Tom Reed', 'Lena Wu', 'Omar Farouk'],
  rules: [
    'Maintain professional conduct in all community channels.',
    'Active participation required in at least one topic per month.',
    'No plagiarism in shared code snippets or project contributions.',
    'Support fellow members and provide constructive feedback.',
    'Respect the intellectual property of DSI course materials.',
  ],
};

export interface JoinApplicationResult {
  applicationId: string;
  status: 'pending';
}

/** Shape returned by `POST /clubs/:id/members` — see clubMembershipsTable. */
interface ApiMembership {
  id: string;
  status: 'pending';
}

export const clubsService = {
  getClubs: (): Promise<Club[]> =>
    httpClient.get<ApiClub[]>('/clubs').then((r) => r.data.map(toClub)),
  getClubDetail: (id: string): Promise<ClubDetail> =>
    httpClient
      .get<ApiClubDetail>(`/clubs/${id}`)
      .then((r) => toClubDetail(r.data)),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getClubJoinInfo: (_id: string): Promise<ClubJoinInfo> =>
    Promise.resolve(CLUB_JOIN_INFO),
  submitJoinApplication: (
    clubId: string,
    payload: JoinClub,
  ): Promise<JoinApplicationResult> =>
    httpClient
      .post<ApiMembership>(`/clubs/${clubId}/members`, payload)
      .then((r) => ({ applicationId: r.data.id, status: r.data.status })),
  createClub: (payload: CreateClub): Promise<ClubResponse> =>
    httpClient.post<ClubResponse>('/clubs', payload).then((r) => r.data),
  getTopicsByClub: (clubId: string): Promise<Topic[]> =>
    httpClient
      .get<TopicListItem[]>(`/clubs/${clubId}/topics`)
      .then((r) => r.data.map(toTopic)),
  createTopic: (clubId: string, payload: CreateTopic): Promise<TopicResponse> =>
    httpClient
      .post<TopicResponse>(`/clubs/${clubId}/topics`, payload)
      .then((r) => r.data),
  checkClubNameAvailable: (name: string): Promise<boolean> =>
    httpClient
      .get<{ available: boolean }>('/clubs/check-name', { params: { name } })
      .then((r) => r.data.available),
};
