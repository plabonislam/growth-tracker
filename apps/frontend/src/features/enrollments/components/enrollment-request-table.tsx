import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnMeta,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ENROLLMENT_TONE } from '../enrollments.constants';
import type { EnrollmentRequest } from '../enrollments.types';
import { EnrollmentPagination } from './enrollment-pagination';
import { EnrollmentStatusBadge } from './enrollment-status-badge';
import { RequesterCell } from './requester-cell';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Applied to both the <th> and <td> — drives width + responsive visibility. */
    cellClassName?: string;
  }
}

interface EnrollmentRow extends EnrollmentRequest {
  onApprove: (request: EnrollmentRequest) => void;
  onReject: (request: EnrollmentRequest) => void;
}

const columnHelper = createColumnHelper<EnrollmentRow>();

/**
 * Clickable column header — idle columns reveal their sort affordance on hover;
 * the actively sorted column stays highlighted with a directional arrow.
 */
function SortableHeader({
  label,
  column,
}: {
  label: string;
  column: Column<EnrollmentRow, unknown>;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        'group/sort -ml-2 inline-flex h-7 items-center gap-1.5 rounded-md px-2 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring',
        sorted && 'text-foreground',
      )}
    >
      {label}
      {sorted === 'asc' && <ArrowUp className="size-3.5 text-primary" />}
      {sorted === 'desc' && <ArrowDown className="size-3.5 text-primary" />}
      {!sorted && (
        <ArrowUpDown className="size-3.5 opacity-0 transition-opacity group-hover/sort:opacity-60" />
      )}
    </button>
  );
}

function buildColumns(targetColumnLabel: string) {
  return [
    columnHelper.accessor((row) => row.requester.name, {
      id: 'requester',
      header: ({ column }) => (
        <SortableHeader label="User name" column={column} />
      ),
      cell: (info) => <RequesterCell {...info.row.original.requester} />,
      // Always the visual first column — carries the edge padding itself.
      meta: {
        cellClassName: 'w-[18%] min-w-[130px] px-2 pl-4 sm:pl-6',
      } satisfies ColumnMeta<EnrollmentRow, unknown>,
    }),
    columnHelper.accessor('target', {
      header: ({ column }) => (
        <SortableHeader label={targetColumnLabel} column={column} />
      ),
      cell: (info) => {
        const tone = ENROLLMENT_TONE[info.row.original.targetTone];
        return (
          <span className="flex items-center gap-2 text-foreground">
            <span className={`size-1.5 shrink-0 rounded-full ${tone.dot}`} />
            <span className="truncate">{info.getValue()}</span>
          </span>
        );
      },
      meta: { cellClassName: 'w-[16%] min-w-[110px] px-2' },
    }),
    columnHelper.accessor(
      (row) => new Date(`${row.dateSubmitted} ${row.timeSubmitted}`).getTime(),
      {
        id: 'dateSubmitted',
        header: ({ column }) => (
          <SortableHeader label="Date submitted" column={column} />
        ),
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            <div>{row.original.dateSubmitted}</div>
            <div className="hidden text-xs sm:block">
              {row.original.timeSubmitted}
            </div>
          </div>
        ),
        meta: {
          cellClassName: 'hidden w-[16%] min-w-[110px] px-2 md:table-cell',
        },
      },
    ),
    columnHelper.accessor('status', {
      header: ({ column }) => <SortableHeader label="Status" column={column} />,
      cell: (info) => <EnrollmentStatusBadge status={info.getValue()} />,
      meta: { cellClassName: 'w-[14%] min-w-[130px] px-2' },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            onClick={() => row.original.onApprove(row.original)}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => row.original.onReject(row.original)}
          >
            Reject
          </Button>
        </div>
      ),
      // Always the last column — carries the edge padding itself.
      meta: { cellClassName: 'w-[18%] min-w-[180px] px-2 pr-4 sm:pr-6' },
    }),
  ];
}

export function EnrollmentRequestTable({
  icon: Icon,
  title,
  targetColumnLabel,
  filterLabel,
  pendingCount,
  requests,
  total,
  onApprove,
  onReject,
}: {
  icon: LucideIcon;
  title: string;
  targetColumnLabel: string;
  filterLabel: string;
  pendingCount: number;
  requests: EnrollmentRequest[];
  total: number;
  onApprove: (request: EnrollmentRequest) => void;
  onReject: (request: EnrollmentRequest) => void;
}) {
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const pageSize = requests.length || 1;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Actions travel with each row so the column def can call them without a closure per render.
  const data = useMemo(
    () => requests.map((req) => ({ ...req, onApprove, onReject })),
    [requests, onApprove, onReject],
  );
  const columns = useMemo(
    () => buildColumns(targetColumnLabel),
    [targetColumnLabel],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {pendingCount} pending
          </span>
        </div>
        <Select defaultValue="all">
          <SelectTrigger size="sm" className="text-xs font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="all" className="text-xs font-medium">
              {filterLabel}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b bg-muted/30 text-xs font-medium text-muted-foreground"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : undefined
                    }
                    className={cn(
                      'h-11 py-0 align-middle font-medium',
                      header.column.columnDef.meta?.cellClassName,
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="text-sm transition-colors hover:bg-muted/40"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn(
                      'py-3 align-middle',
                      cell.column.columnDef.meta?.cellClassName,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EnrollmentPagination
        page={page}
        pageCount={pageCount}
        rangeLabel={`Showing 1–${requests.length} of ${total} requests`}
        onPageChange={setPage}
      />
    </div>
  );
}
