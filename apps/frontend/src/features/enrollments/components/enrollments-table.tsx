import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';

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

  return (
    <DataTable
      columns={columns}
      data={data?.requests ?? []}
      isLoading={isLoading}
      emptyState="No pending requests."
      searchColumnId="requester"
      searchPlaceholder="Search applicants…"
      pageCount={Math.max(1, Math.ceil((data?.total ?? 0) / pageSize))}
      pagination={{ pageIndex, pageSize }}
      onPaginationChange={setPagination}
      toolbar={() => (
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
      )}
    />
  );
}
