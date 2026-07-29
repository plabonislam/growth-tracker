import type { MonthOption, SessionCadence } from './activity-sheet.types';

/** How many months back the picker offers. */
export const MONTH_CHOICES = 12;

/**
 * Cadence badge — literal Tailwind classes, as everywhere else, so the JIT
 * compiler can see them.
 */
export const CADENCE_BADGE: Record<SessionCadence, string> = {
  weekly:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-400',
  monthly:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-400',
};

/** How many members a roster page holds before it starts paginating. */
export const ROSTER_PAGE_SIZE = 12;

/** `2025-12` — the id a month is asked for by, stable across time zones. */
export function monthId(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** `2025-12` → "December 2025". */
export function monthLabel(id: string): string {
  const [year, month] = id.split('-').map(Number);
  if (!year || !month) return id;
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

/** The current month and the ones before it, newest first. */
export function recentMonths(count = MONTH_CHOICES): MonthOption[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const id = monthId(date);
    return { id, label: monthLabel(id) };
  });
}

/**
 * "Md. Shahnur Islam Plabon" → "MP". Dots are dropped first so an initial
 * never comes back as punctuation.
 */
export function initialsOf(name: string): string {
  const parts = name.replace(/\./g, '').split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}
