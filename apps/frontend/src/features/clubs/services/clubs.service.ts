import type { ClubResponse, CreateClub, JoinClub } from 'shared';

import { httpClient } from '@/services/http/client';
import type {
  Club,
  ClubDetail,
  ClubIconKey,
  ClubJoinInfo,
  ClubTone,
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

function toClub(apiClub: ApiClub, index: number): Club {
  return {
    id: apiClub.id,
    name: apiClub.name,
    description: apiClub.description ?? '',
    iconKey: ICON_ROTATION[index % ICON_ROTATION.length]!,
    tone: TONE_ROTATION[index % TONE_ROTATION.length]!,
    topics: apiClub.topicCount,
    members: apiClub.memberCount,
    // GET /clubs is a global listing, not scoped to the current user.
    membership: null,
  };
}

const CLUB_DETAIL: ClubDetail = {
  id: 'data-insights',
  name: 'Advanced Data Analytics Club',
  tone: 'primary',
  topicsCount: 12,
  membersLabel: '1.2k',
  expectationsIntro:
    'This club focuses on bridging the gap between theoretical data science and practical industry application. Members are expected to:',
  expectations: [
    'Commit 4-6 hours weekly for research and peer discussions.',
    'Contribute to at least one group project per quarter.',
    'Maintain a collaborative and mentorship-driven attitude.',
  ],
  mentorshipFocus: 'Guided by industry leads from top tech firms.',
  topics: [
    {
      id: 'statistical-forecasting',
      title: 'Statistical Forecasting Models',
      iconKey: 'analytics',
      tone: 'primary',
      modules: 8,
      hours: 4.5,
      mentor: { name: 'Dr. Marcus Chen', role: 'Lead Mentor' },
      enrolled: true,
    },
    {
      id: 'neural-networks',
      title: 'Neural Network Architectures',
      iconKey: 'neural',
      tone: 'amber',
      modules: 15,
      hours: 12,
      mentor: { name: 'Sarah Jenkins', role: 'Expert' },
      enrolled: false,
    },
    {
      id: 'data-pipelines',
      title: 'Scalable Data Pipelines',
      iconKey: 'pipeline',
      tone: 'indigo',
      modules: 6,
      hours: 3,
      mentor: { name: 'David Volek', role: 'Specialist' },
      enrolled: false,
    },
    {
      id: 'exploratory-analysis',
      title: 'Exploratory Data Analysis',
      iconKey: 'analytics',
      tone: 'violet',
      modules: 5,
      hours: 2.5,
      mentor: { name: 'Amara Osei', role: 'Expert' },
      enrolled: false,
    },
    {
      id: 'ml-deployment',
      title: 'ML Model Deployment & Serving',
      iconKey: 'neural',
      tone: 'rose',
      modules: 10,
      hours: 8,
      mentor: { name: 'Dr. Elena Petrova', role: 'Lead Mentor' },
      enrolled: false,
    },
  ],
};

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getClubDetail: (_id: string): Promise<ClubDetail> =>
    Promise.resolve(CLUB_DETAIL),
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
  checkClubNameAvailable: (name: string): Promise<boolean> =>
    httpClient
      .get<{ available: boolean }>('/clubs/check-name', { params: { name } })
      .then((r) => r.data.available),
};
