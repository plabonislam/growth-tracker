import { useState } from 'react';

import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { cn } from '@/lib/utils';
import type { PendingEnrollmentsTab } from '../enrollments.types';
import { EnrollmentsTable } from './enrollments-table';

const TABS: {
  key: PendingEnrollmentsTab;
  label: string;
  targetColumnLabel: string;
  /** True when only the club's coordinator (or an authority) reviews these. */
  coordinatorsOnly?: boolean;
}[] = [
  {
    key: 'club',
    label: 'Club enrollments',
    targetColumnLabel: 'Club name',
    coordinatorsOnly: true,
  },
  {
    key: 'topic',
    label: 'Topic enrollments',
    targetColumnLabel: 'Target topic',
  },
];

export function PendingEnrollmentsTabs() {
  const { data: user } = useCurrentUser();
  const roles = user?.roles;

  // Who joins a club is the coordinator's call; a mentor reviews only the
  // requests for their own topics, so the club queue isn't theirs to see.
  const tabs = TABS.filter(
    (tab) =>
      !tab.coordinatorsOnly || roles?.isCoordinator || roles?.isAuthority,
  );

  const [requestedTab, setRequestedTab] =
    useState<PendingEnrollmentsTab | null>(null);
  // Falls back to the first tab this caller has, which is the topic queue for a
  // mentor — the roles arrive a render after the tabs are first drawn.
  const active =
    tabs.find((tab) => tab.key === requestedTab) ?? tabs[0] ?? null;

  if (!active) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* One queue is not a choice — the strip appears only when both do. */}
      {tabs.length > 1 && (
        <div className="flex gap-6 border-b">
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

      <EnrollmentsTable
        key={active.key}
        type={active.key}
        targetColumnLabel={active.targetColumnLabel}
      />
    </div>
  );
}
