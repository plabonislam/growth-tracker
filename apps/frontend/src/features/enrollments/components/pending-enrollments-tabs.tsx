import { useState } from 'react';
import { BookOpen, Users } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  MOCK_CLUB_ENROLLMENT_REQUESTS,
  MOCK_CLUB_REQUESTS_TOTAL,
  MOCK_TOPIC_ENROLLMENT_REQUESTS,
  MOCK_TOPIC_REQUESTS_TOTAL,
} from '../enrollments.constants';
import type {
  EnrollmentRequest,
  PendingEnrollmentsTab,
} from '../enrollments.types';
import { EnrollmentRequestTable } from './enrollment-request-table';

const TABS: { key: PendingEnrollmentsTab; label: string }[] = [
  { key: 'club', label: 'Club enrollments' },
  { key: 'topic', label: 'Topic enrollments' },
];

export function PendingEnrollmentsTabs() {
  const [activeTab, setActiveTab] = useState<PendingEnrollmentsTab>('club');

  // UI-only mock — approve/reject just log for now, wired to the backend in a follow-up.
  const handleApprove = (request: EnrollmentRequest) =>
    console.log('approve', request.id);
  const handleReject = (request: EnrollmentRequest) =>
    console.log('reject', request.id);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-6 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'relative pb-3 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'club' ? (
        <EnrollmentRequestTable
          icon={Users}
          title="Club enrollment requests"
          targetColumnLabel="Club name"
          filterLabel="All clubs"
          pendingCount={MOCK_CLUB_REQUESTS_TOTAL}
          requests={MOCK_CLUB_ENROLLMENT_REQUESTS}
          total={MOCK_CLUB_REQUESTS_TOTAL}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ) : (
        <EnrollmentRequestTable
          icon={BookOpen}
          title="Topic enrollment requests"
          targetColumnLabel="Target topic"
          filterLabel="All topics"
          pendingCount={MOCK_TOPIC_REQUESTS_TOTAL}
          requests={MOCK_TOPIC_ENROLLMENT_REQUESTS}
          total={MOCK_TOPIC_REQUESTS_TOTAL}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
