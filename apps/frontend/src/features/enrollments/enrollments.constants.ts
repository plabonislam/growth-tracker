import type {
  EnrollmentRequestStatus,
  EnrollmentTone,
} from './enrollments.types';

/** Tone → literal Tailwind classes (kept literal so the JIT compiler sees them). */
export const ENROLLMENT_TONE: Record<EnrollmentTone, { dot: string }> = {
  teal: { dot: 'bg-teal-500' },
  violet: { dot: 'bg-violet-500' },
  amber: { dot: 'bg-amber-500' },
  rose: { dot: 'bg-rose-500' },
  indigo: { dot: 'bg-indigo-500' },
};

/** Request status → badge label + classes. */
export const ENROLLMENT_STATUS_META: Record<
  EnrollmentRequestStatus,
  { label: string; className: string; dotClassName: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700',
    dotClassName: 'bg-amber-500',
  },
  approved: {
    label: 'Approved',
    className: 'bg-primary/10 text-primary',
    dotClassName: 'bg-primary',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-destructive/10 text-destructive',
    dotClassName: 'bg-destructive',
  },
};
