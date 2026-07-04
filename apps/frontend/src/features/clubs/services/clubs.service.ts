import type { Club, ClubDetail } from '../clubs.types';

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
  ],
};

export const clubsService = {
  getClubs: (): Promise<Club[]> => Promise.resolve(CLUBS),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getClubDetail: (_id: string): Promise<ClubDetail> =>
    Promise.resolve(CLUB_DETAIL),
};
