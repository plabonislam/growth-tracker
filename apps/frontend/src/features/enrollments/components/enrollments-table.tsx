import { useMemo, useState } from 'react';
import { Inbox, RefreshCw } from 'lucide-react';

import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import type { EnrollmentType } from '../services/enrollments.service';
import { usePendingEnrollments } from '../hooks/use-enrollments';
import { buildEnrollmentColumns } from './enrollment-columns';

/**
 * Feature-level binding: joins the enrollments query + columns to the generic
 * DataTable for a single enrollment type. Reused verbatim for club and topic —
 * only `type` and `targetColumnLabel` differ.
 */
export function EnrollmentsTable({
  type,
  targetColumnLabel,
}: {
  type: EnrollmentType;
  targetColumnLabel: string;
}) {
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, isFetching, refetch } = usePendingEnrollments(
    type,
    pageIndex,
    pageSize,
  );

  const columns = useMemo(
    () => buildEnrollmentColumns(targetColumnLabel),
    [targetColumnLabel],
  );

  const requests = data?.requests ?? [];
  const pendingCount = data?.total ?? 0;

  // Once the query has resolved with no pending requests, hide the table
  // entirely and show a meaningful empty state instead.
  if (!isLoading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card px-6 py-16 text-center">
        <Inbox className="size-10 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">No pending requests</p>
          <p className="text-sm text-muted-foreground">
            There are no requests awaiting review right now.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs font-medium"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={isFetching ? 'size-4 animate-spin' : 'size-4'}
          />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/10">
            <Inbox className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold leading-none tracking-tight text-foreground">
                Pending Requests
              </h2>
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium tabular-nums text-muted-foreground">
                {pendingCount}
              </span>
            </div>
            <p className="mt-1.5 text-[13px] leading-none text-muted-foreground">
              Applications awaiting your review
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={isFetching ? 'size-4 animate-spin' : 'size-4'}
          />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={requests}
        isLoading={isLoading}
        emptyState="No pending requests."
        pageCount={Math.max(1, Math.ceil(pendingCount / pageSize))}
        pagination={{ pageIndex, pageSize }}
        onPaginationChange={setPagination}
      />
    </div>
  );
}
