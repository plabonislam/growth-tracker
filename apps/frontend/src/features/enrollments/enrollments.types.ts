export type EnrollmentRequestStatus = 'pending' | 'approved' | 'rejected';

export type EnrollmentTone = 'teal' | 'violet' | 'amber' | 'rose' | 'indigo';

interface RequesterInfo {
  name: string;
  email: string;
}

/** A single pending request row — `target` is the club or topic name being applied to. */
export interface EnrollmentRequest {
  id: string;
  requester: RequesterInfo;
  target: string;
  targetTone: EnrollmentTone;
  dateSubmitted: string;
  timeSubmitted: string;
  status: EnrollmentRequestStatus;
}

export type PendingEnrollmentsTab = 'club' | 'topic';
