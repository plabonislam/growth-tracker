import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { LearnerCell } from './learner-cell';
import { ModuleReviewRowActions } from './module-review-row-actions';
import type { ModuleReviewRequest } from '../topics.types';

/** ISO → "Jun 12, 2026" plus the time on its own line. */
function formatSubmitted(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return {
    day: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export const moduleReviewColumns: ColumnDef<ModuleReviewRequest>[] = [
  {
    id: 'learner',
    accessorFn: (row) => row.learner.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Learner" />
    ),
    cell: ({ row }) => <LearnerCell {...row.original.learner} />,
    meta: { cellClassName: 'w-[24%] min-w-[160px] pl-4 sm:pl-6' },
  },
  {
    accessorKey: 'moduleTitle',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Module" />
    ),
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate text-foreground">
          {row.original.moduleTitle}
        </div>
        {/* The share of the topic this module carries — what approving awards. */}
        <div className="text-xs text-muted-foreground">
          Weight {row.original.weight}%
        </div>
      </div>
    ),
    meta: { cellClassName: 'w-[24%] min-w-[150px]' },
  },
  {
    accessorKey: 'topicName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Topic" />
    ),
    // Block, so the cell's width actually clips a long topic name.
    cell: ({ row }) => (
      <span className="block truncate text-muted-foreground">
        {row.original.topicName}
      </span>
    ),
    meta: { cellClassName: 'hidden w-[16%] min-w-[120px] lg:table-cell' },
  },
  {
    id: 'submittedAt',
    accessorFn: (row) => (row.submittedAt ? Date.parse(row.submittedAt) : 0),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Submitted" />
    ),
    cell: ({ row }) => {
      const submitted = formatSubmitted(row.original.submittedAt);
      if (!submitted) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="text-muted-foreground">
          <div>{submitted.day}</div>
          <div className="hidden text-xs sm:block">{submitted.time}</div>
        </div>
      );
    },
    meta: { cellClassName: 'hidden w-[16%] min-w-[110px] md:table-cell' },
  },
  {
    id: 'actions',
    enableHiding: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <ModuleReviewRowActions request={row.original} />,
    meta: { cellClassName: 'w-[20%] min-w-[190px] pr-4 sm:pr-6' },
  },
];
