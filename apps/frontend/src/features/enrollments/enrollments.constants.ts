import type {
  EnrollmentRequest,
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

/** Mock club enrollment requests — UI-only, matches specs/ui/Pending Enrollments.pdf. */
export const MOCK_CLUB_ENROLLMENT_REQUESTS: EnrollmentRequest[] = [
  {
    id: 'ce-1',
    requester: {
      name: 'Marcus Holloway',
      email: 'm.holloway@university.edu',
    },
    target: 'Advanced Robotics Club',
    targetTone: 'teal',
    dateSubmitted: '24 Oct 2023',
    timeSubmitted: '09:42 AM',
    status: 'pending',
  },
  {
    id: 'ce-2',
    requester: {
      name: 'Sarah Chen',
      email: 'sarah.chen@university.edu',
    },
    target: 'UX Design Collective',
    targetTone: 'violet',
    dateSubmitted: '23 Oct 2023',
    timeSubmitted: '02:15 PM',
    status: 'pending',
  },
];

/** Mock topic enrollment requests — UI-only, matches specs/ui/Pending Enrollments.pdf. */
export const MOCK_TOPIC_ENROLLMENT_REQUESTS: EnrollmentRequest[] = [
  {
    id: 'te-1',
    requester: {
      name: 'James Wilson',
      email: 'j.wilson@university.edu',
    },
    target: 'Sustainable Energy Lab',
    targetTone: 'teal',
    dateSubmitted: '23 Oct 2023',
    timeSubmitted: '11:00 AM',
    status: 'pending',
  },
  {
    id: 'te-2',
    requester: {
      name: 'Elena Rodriguez',
      email: 'e.rodriguez@university.edu',
    },
    target: 'Data Ethics Workshop',
    targetTone: 'violet',
    dateSubmitted: '22 Oct 2023',
    timeSubmitted: '04:55 PM',
    status: 'pending',
  },
];

export const MOCK_CLUB_REQUESTS_TOTAL = 42;
export const MOCK_TOPIC_REQUESTS_TOTAL = 18;
export const MOCK_PENDING_REQUESTS_TOTAL =
  MOCK_CLUB_REQUESTS_TOTAL + MOCK_TOPIC_REQUESTS_TOTAL;
