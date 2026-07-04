import type { Club, Faq, Stat, Testimonial } from '../landing.types';

/**
 * Landing content service.
 *
 * The DSI Club landing page is content-driven (stats, clubs, testimonials,
 * FAQs). These would normally be `httpClient.get(...)` calls to the backend
 * (see docs/frontend.md — Service Pattern); until that endpoint exists we
 * resolve local fixtures so the TanStack Query wiring is real and swappable.
 */

const STATS: Stat[] = [
  {
    id: 'engineers',
    value: '500+',
    label: 'Active Engineers',
    tone: 'primary',
  },
  {
    id: 'sessions',
    value: '45+',
    label: 'Weekly Study Sessions',
    tone: 'emerald',
  },
  { id: 'support', value: '100%', label: 'Peer Support Rate', tone: 'indigo' },
];

const CLUBS: Club[] = [
  {
    id: 'frontend',
    name: 'Frontend',
    blurb: 'React, Tailwind, and Design Systems at scale.',
    tone: 'primary',
    span: 'wide',
  },
  {
    id: 'java',
    name: 'Java',
    blurb: 'Spring Boot & Microservices.',
    tone: 'indigo',
    span: 'default',
  },
  {
    id: 'devops',
    name: 'DevOps',
    blurb: 'K8s, CI/CD, and IaC.',
    tone: 'emerald',
    span: 'default',
  },
  {
    id: 'security',
    name: 'Security',
    blurb: 'OWASP Top 10, Pen Testing, and Secure Design.',
    tone: 'slate',
    span: 'wide',
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'sarah',
    name: 'Sarah J.',
    role: 'Front-end Lead',
    quote:
      "The Frontend Club wasn't just about learning React. It was about learning how to think in components at an enterprise scale. I landed my Senior role shortly after finishing my first project here.",
    tone: 'primary',
  },
  {
    id: 'marcus',
    name: 'Marcus V.',
    role: 'DevOps Engineer',
    quote:
      'Having direct access to mentors who manage million-dollar cloud budgets is invaluable. The DevOps curriculum here is practical and battle-tested.',
    tone: 'emerald',
  },
  {
    id: 'elena',
    name: 'Elena R.',
    role: 'Security Architect',
    quote:
      "Security is often an afterthought in most tutorials. Here, it's baked into every lesson. The peer reviews changed how I approach secure system design.",
    tone: 'amber',
  },
];

const FAQS: Faq[] = [
  {
    id: 'time',
    question: 'What is the expected time commitment?',
    answer:
      'Most clubs suggest a commitment of 3-5 hours per week. This includes the weekly sync session, independent lab work, and code reviews. Each path is self-paced, allowing you to go faster if you have more bandwidth.',
  },
  {
    id: 'groups',
    question: 'How are the study groups formed?',
    answer:
      'Groups are formed based on your current skill level and time zone to ensure optimal collaboration. We typically group 4-6 engineers with one senior mentor for maximum interaction.',
  },
  {
    id: 'multiple',
    question: 'Can I join more than one club at once?',
    answer:
      'Technically yes, but we recommend focusing on one learning path at a time to truly master the material. Once you complete a certification, you can immediately enroll in your next choice.',
  },
];

const resolve = <T>(data: T): Promise<T> => Promise.resolve(data);

export const landingService = {
  getStats: (): Promise<Stat[]> => resolve(STATS),
  getClubs: (): Promise<Club[]> => resolve(CLUBS),
  getTestimonials: (): Promise<Testimonial[]> => resolve(TESTIMONIALS),
  getFaqs: (): Promise<Faq[]> => resolve(FAQS),
};
