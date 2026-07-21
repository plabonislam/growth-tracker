import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { PendingEnrollmentsTab } from '../enrollments.types';
import { EnrollmentsTable } from './enrollments-table';

const TABS: {
  key: PendingEnrollmentsTab;
  label: string;
  targetColumnLabel: string;
}[] = [
  { key: 'club', label: 'Club enrollments', targetColumnLabel: 'Club name' },
  {
    key: 'topic',
    label: 'Topic enrollments',
    targetColumnLabel: 'Target topic',
  },
];

export function PendingEnrollmentsTabs() {
  const [activeTab, setActiveTab] = useState<PendingEnrollmentsTab>('club');
  const active = TABS.find((t) => t.key === activeTab)!;

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

      <EnrollmentsTable
        key={active.key}
        type={active.key}
        targetColumnLabel={active.targetColumnLabel}
      />
    </div>
  );
}
