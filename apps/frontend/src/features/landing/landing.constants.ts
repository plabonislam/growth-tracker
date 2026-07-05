import {
  Award,
  BadgeCheck,
  Network,
  Search,
  Terminal,
  Users,
} from 'lucide-react';

import type { AccentTone, Benefit, Step } from './landing.types';

/** Tailwind class fragments per accent tone, resolved at render time. */
export const TONE: Record<
  AccentTone | 'slate',
  {
    text: string;
    bg: string;
    bgSoft: string;
    border: string;
    gradient: string;
    /** Literal `group-hover:` fill — kept literal so the JIT compiler sees it. */
    groupHoverBg: string;
  }
> = {
  primary: {
    text: 'text-primary',
    bg: 'bg-primary',
    bgSoft: 'bg-primary/10',
    border: 'border-primary',
    gradient: 'from-primary/90',
    groupHoverBg: 'group-hover:bg-primary',
  },
  emerald: {
    text: 'text-emerald-600',
    bg: 'bg-emerald-600',
    bgSoft: 'bg-emerald-500/10',
    border: 'border-emerald-500',
    gradient: 'from-emerald-600/90',
    groupHoverBg: 'group-hover:bg-emerald-600',
  },
  indigo: {
    text: 'text-indigo-600',
    bg: 'bg-indigo-600',
    bgSoft: 'bg-indigo-500/10',
    border: 'border-indigo-500',
    gradient: 'from-indigo-600/90',
    groupHoverBg: 'group-hover:bg-indigo-600',
  },
  amber: {
    text: 'text-amber-600',
    bg: 'bg-amber-600',
    bgSoft: 'bg-amber-500/10',
    border: 'border-amber-500',
    gradient: 'from-amber-600/90',
    groupHoverBg: 'group-hover:bg-amber-600',
  },
  slate: {
    text: 'text-slate-600',
    bg: 'bg-slate-900',
    bgSoft: 'bg-slate-500/10',
    border: 'border-slate-500',
    gradient: 'from-slate-900/90',
    groupHoverBg: 'group-hover:bg-slate-900',
  },
};

export const HERO = {
  eyebrow: 'DSI Club',
  title: 'Grow Faster Together in the DSI Club',
  subtitle:
    'Take your membership further by joining specialized interest clubs. Master the latest stacks with a dedicated squad that has your back.',
  primaryCta: 'See What Engineers Are Learning',
  secondaryCta: 'Read Success Stories & Impact',
} as const;

export const BENEFITS: Benefit[] = [
  {
    title: 'Structured Learning',
    description:
      'Step-by-step curriculum designed to take you from foundational concepts to advanced systems architecture.',
    icon: Network,
    tone: 'primary',
  },
  {
    title: 'Certifications',
    description:
      'Earn industry-recognized badges that validate your technical expertise and contribution to the DSI community.',
    icon: BadgeCheck,
    tone: 'emerald',
  },
  {
    title: 'Mentors',
    description:
      'Gain direct access to L5+ senior engineers for code reviews, architectural feedback, and career guidance.',
    icon: Users,
    tone: 'indigo',
  },
  {
    title: 'Real Projects',
    description:
      'Collaborate on open-source and internal tools that mirror enterprise environments and scalability challenges.',
    icon: Terminal,
    tone: 'amber',
  },
];

export const STEPS: Step[] = [
  {
    order: 1,
    title: 'Browse & Select',
    description:
      'Find the learning path that aligns with your career goals. Explore curriculums, meet the leads, and preview upcoming cohorts.',
    icon: Search,
    tone: 'primary',
  },
  {
    order: 2,
    title: 'Immersive Learning',
    description:
      'Join peer cohorts and hands-on labs. Engage in weekly syncs, deep-dive discussions, and real-world collaborative exercises.',
    icon: Users,
    tone: 'indigo',
  },
  {
    order: 3,
    title: 'Get Certified',
    description:
      'Complete the final architectural challenge. Present your solution to L5+ mentors and receive your digital credential.',
    icon: Award,
    tone: 'emerald',
  },
];
