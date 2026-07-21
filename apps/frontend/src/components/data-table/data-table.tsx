import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';
import type { DataTableProps } from './data-table.types';

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  emptyState,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  toolbar,
  searchColumnId,
  searchPlaceholder,
  enableRowSelection = false,
  pageSizeOptions,
}: DataTableProps<TData, TValue>) {
  const isServer = pageCount !== undefined;

  // Uncontrolled state, used only in client mode.
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    pageCount: isServer ? pageCount : undefined,
    state: {
      sorting: isServer ? sorting : localSorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(isServer && pagination ? { pagination } : {}),
    },
    enableRowSelection,
    manualPagination: isServer,
    manualSorting: isServer,
    onSortingChange: isServer ? onSortingChange : setLocalSorting,
    onPaginationChange: isServer ? onPaginationChange : undefined,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: isServer ? undefined : getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: isServer ? undefined : getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      {(toolbar || searchColumnId) && (
        <DataTableToolbar
          table={table}
          searchColumnId={searchColumnId}
          searchPlaceholder={searchPlaceholder}
        >
          {toolbar?.(table)}
        </DataTableToolbar>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/30">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : undefined
                    }
                    className={header.column.columnDef.meta?.cellClassName}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  Loading…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="text-sm"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(cell.column.columnDef.meta?.cellClassName)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  {emptyState ?? 'No results.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      </div>
    </div>
  );
}
