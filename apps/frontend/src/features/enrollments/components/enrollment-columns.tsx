import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { ENROLLMENT_TONE } from '../enrollments.constants';
import type { EnrollmentRequest } from '../enrollments.types';
import { EnrollmentRowActions } from './enrollment-row-actions';
import { EnrollmentStatusBadge } from './enrollment-status-badge';
import { RequesterCell } from './requester-cell';

/**
 * Column defs are a *factory* (not a constant) so the target column can be
 * relabelled per enrollment type (Club name vs Target topic). Memoize the
 * result in the consumer.
 */
export function buildEnrollmentColumns(
  targetColumnLabel: string,
): ColumnDef<EnrollmentRequest>[] {
  return [
    {
      id: 'requester',
      accessorFn: (row) => row.requester.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="User name" />
      ),
      cell: ({ row }) => <RequesterCell {...row.original.requester} />,
      meta: { cellClassName: 'w-[18%] min-w-[130px] pl-4 sm:pl-6' },
    },
    {
      accessorKey: 'target',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={targetColumnLabel} />
      ),
      cell: ({ row }) => {
        const tone = ENROLLMENT_TONE[row.original.targetTone];
        return (
          <span className="flex items-center gap-2 text-foreground">
            <span className={`size-1.5 shrink-0 rounded-full ${tone.dot}`} />
            <span className="truncate">{row.original.target}</span>
          </span>
        );
      },
      meta: { cellClassName: 'w-[16%] min-w-[110px]' },
    },
    {
      id: 'dateSubmitted',
      accessorFn: (row) =>
        new Date(`${row.dateSubmitted} ${row.timeSubmitted}`).getTime(),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Date submitted" />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          <div>{row.original.dateSubmitted}</div>
          <div className="hidden text-xs sm:block">
            {row.original.timeSubmitted}
          </div>
        </div>
      ),
      meta: { cellClassName: 'hidden w-[16%] min-w-[110px] md:table-cell' },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Status" />
      ),
      cell: ({ row }) => <EnrollmentStatusBadge status={row.original.status} />,
      meta: { cellClassName: 'w-[14%] min-w-[130px]' },
    },
    {
      id: 'actions',
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => <EnrollmentRowActions request={row.original} />,
      meta: { cellClassName: 'w-[18%] min-w-[180px] pr-4 sm:pr-6' },
    },
  ];
}
