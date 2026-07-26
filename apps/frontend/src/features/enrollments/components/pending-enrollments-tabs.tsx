import { useState } from 'react';

import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { ModuleReviewsTable } from '@/features/topics/components/module-reviews-table';
import { cn } from '@/lib/utils';
import type { PendingEnrollmentsTab } from '../enrollments.types';
import { EnrollmentsTable } from './enrollments-table';

/** Who each queue belongs to — an authority reviews all of them. */
type TabAudience = 'coordinator' | 'mentor';

const TABS: {
  key: PendingEnrollmentsTab;
  label: string;
  targetColumnLabel?: string;
  audience?: TabAudience;
}[] = [
  {
    key: 'club',
    label: 'Club enrollments',
    targetColumnLabel: 'Club name',
    audience: 'coordinator',
  },
  {
    key: 'topic',
    label: 'Topic enrollments',
    targetColumnLabel: 'Target topic',
  },
  {
    key: 'module',
    label: 'Module reviews',
    audience: 'mentor',
  },
];

export function PendingEnrollmentsTabs() {
  const { data: user } = useCurrentUser();
  const roles = user?.roles;

  // Who joins a club is the coordinator's call; whether work is done is the
  // mentor's. Each sees their own queue, and an authority sees every one.
  const tabs = TABS.filter((tab) => {
    if (!tab.audience || roles?.isAuthority) return true;
    return tab.audience === 'coordinator'
      ? roles?.isCoordinator
      : roles?.isMentor;
  });

  const [requestedTab, setRequestedTab] =
    useState<PendingEnrollmentsTab | null>(null);
  // Falls back to the first tab this caller has — the roles arrive a render
  // after the tabs are first drawn.
  const active =
    tabs.find((tab) => tab.key === requestedTab) ?? tabs[0] ?? null;

  if (!active) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* One queue is not a choice — the strip appears only when several do. */}
      {tabs.length > 1 && (
        <div className="flex flex-wrap gap-6 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setRequestedTab(tab.key)}
              className={cn(
                'relative pb-3 text-sm font-medium transition-colors',
                active.key === tab.key
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {active.key === tab.key && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}

      {active.key === 'module' ? (
        <ModuleReviewsTable />
      ) : (
        <EnrollmentsTable
          key={active.key}
          type={active.key}
          targetColumnLabel={active.targetColumnLabel ?? ''}
        />
      )}
    </div>
  );
}
