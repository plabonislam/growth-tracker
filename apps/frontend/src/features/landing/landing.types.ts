import type { LucideIcon } from 'lucide-react';

/** Accent tones mapped to concrete classes in `landing.constants.ts`. */
export type AccentTone = 'primary' | 'emerald' | 'indigo' | 'amber';

export interface Benefit {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: AccentTone;
}

export interface Step {
  order: number;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: AccentTone;
}

export interface Stat {
  id: string;
  value: string;
  label: string;
  tone: AccentTone;
}

export interface Club {
  id: string;
  name: string;
  blurb: string;
  tone: AccentTone | 'slate';
  /** `wide` clubs span two columns in the bento grid. */
  span: 'default' | 'wide';
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  tone: AccentTone;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}
