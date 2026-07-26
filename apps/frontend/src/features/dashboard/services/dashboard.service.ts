import type { LearnerDashboard } from '../dashboard.types';

/**
 * Learner dashboard service.
 *
 * Would normally be `httpClient.get('/dashboard/me')` (see docs/frontend.md —
 * Service Pattern); until that endpoint exists we resolve a local fixture so
 * the TanStack Query wiring is real and swappable.
 */

const DASHBOARD: LearnerDashboard = {
  nudge: 'Pick up module 4 — one quiz is due today.',
  journey: {
    clubName: 'Artificial Intelligence Specialization',
    description:
      'A mentor-led track through machine learning foundations, neural networks and applied AI systems.',
    memberSince: '12 Jan 2026',
    cohortBadge: 'Top 5% of cohort',
    progressPct: 68,
    memberNames: ['Priya Nair', 'Tom Reed', 'Lena Wu'],
    extraMembers: 14,
    membersNote: '1,240 active learners in this specialization',
  },
  // `clubProgress` mirrors `journey.progressPct`; `learningTime` has nothing
  // behind it anywhere yet — no session or study time is recorded.
  stats: {
    completedTopics: { value: 12, note: 'Across 3 clubs' },
    earnedCertificates: { value: 3, note: 'Latest: Deep Learning I' },
    clubProgress: { value: 68, unit: '%', note: 'AI Specialization' },
    learningTime: { value: 46, unit: 'h', note: 'Logged this quarter' },
  },
  activeTopic: {
    id: 'advanced-neural-networks',
    title: 'Advanced Neural Networks',
    description:
      'Explore backpropagation, optimization algorithms, and architectural trade-offs in multi-layered perceptrons.',
    startedOn: '02 Jun 2026',
    moduleLabel: 'Module 4 of 8',
    progressPct: 42,
  },
  learningPath: {
    subtitle: 'Next topics on your specialization roadmap',
    steps: [
      {
        id: 'advanced-neural-networks',
        order: 1,
        title: 'Advanced Neural Networks',
        meta: 'Module 4 of 8 · 42% complete',
        status: 'active',
      },
      {
        id: 'nlp',
        order: 2,
        title: 'Natural language processing',
        meta: 'Unlocks after Module 6 · 6 tasks · Est. 3 weeks',
        status: 'upcoming',
      },
    ],
  },
  deadlines: [
    {
      id: 'final-quiz',
      title: 'Final Module Quiz',
      when: 'Today, 11:59 PM',
      iconKey: 'quiz',
      tone: 'error',
    },
    {
      id: 'project-docs',
      title: 'Project Documentation',
      when: 'Tomorrow, 09:00 AM',
      iconKey: 'doc',
      tone: 'neutral',
    },
  ],
  events: [
    {
      id: 'ai-ethics',
      title: 'AI Ethics Workshop',
      when: 'Wednesday, 4:00 PM',
      iconKey: 'workshop',
      tone: 'info',
    },
    {
      id: 'career-qa',
      title: 'Career Path Q&A',
      when: 'Friday, 1:00 PM',
      iconKey: 'podcast',
      tone: 'amber',
    },
  ],
};

export const dashboardService = {
  getLearnerDashboard: (): Promise<LearnerDashboard> =>
    Promise.resolve(DASHBOARD),
};
