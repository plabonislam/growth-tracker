import type { ClubResponse, CreateClub, JoinClub } from 'shared';

import { httpClient } from '@/services/http/client';
import type { Club, ClubDetail, ClubJoinInfo } from '../clubs.types';

/**
 * Clubs service.
 *
 * These would normally be `httpClient.get('/clubs')` calls (see
 * docs/frontend.md — Service Pattern); until that endpoint exists we resolve
 * local fixtures so the TanStack Query wiring is real and swappable.
 */

const CLUBS: Club[] = [
  {
    id: 'software-engineering',
    name: 'Software Engineering Hub',
    description:
      'Master the latest frameworks and architectural patterns with industry experts.',
    iconKey: 'engineering',
    tone: 'primary',
    topics: 12,
    members: 124,
    membership: 'active',
  },
  {
    id: 'data-insights',
    name: 'Data Insights Circle',
    description:
      'Exploring big data, visualization, and predictive modeling in a collaborative space.',
    iconKey: 'data',
    tone: 'indigo',
    topics: 8,
    members: 89,
    membership: 'on_break',
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    description:
      'Deep dive into neural networks, NLP, and the ethics of artificial intelligence.',
    iconKey: 'ai',
    tone: 'amber',
    topics: 15,
    members: 210,
    membership: null,
  },
  {
    id: 'leadership',
    name: 'Leadership Essentials',
    description:
      'Developing the soft skills needed to manage global teams effectively.',
    iconKey: 'leadership',
    tone: 'primary',
    topics: 5,
    members: 45,
    membership: 'dropped_out',
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity Guard',
    description:
      'From ethical hacking to risk management, stay ahead of modern threats.',
    iconKey: 'security',
    tone: 'rose',
    topics: 20,
    members: 178,
    membership: null,
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX Design Studio',
    description:
      'Discussing accessibility, design systems, and user-centric research methodologies.',
    iconKey: 'design',
    tone: 'violet',
    topics: 10,
    members: 62,
    membership: 'active',
  },
];

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

export const clubsService = {
  getClubs: (): Promise<Club[]> => Promise.resolve(CLUBS),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getClubDetail: (_id: string): Promise<ClubDetail> =>
    Promise.resolve(CLUB_DETAIL),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getClubJoinInfo: (_id: string): Promise<ClubJoinInfo> =>
    Promise.resolve(CLUB_JOIN_INFO),
  submitJoinApplication: (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _clubId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _payload: JoinClub,
  ): Promise<JoinApplicationResult> =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({ applicationId: crypto.randomUUID(), status: 'pending' }),
        600,
      ),
    ),
  createClub: (payload: CreateClub): Promise<ClubResponse> =>
    httpClient.post<ClubResponse>('/clubs', payload).then((r) => r.data),
};
