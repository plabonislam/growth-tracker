import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
  Table,
} from '@tanstack/react-table';
import type { ReactNode } from 'react';

/**
 * Column-level UI hints understood by the generic table. This augmentation is a
 * *UI* concern (widths, responsive visibility), so it lives with the generic
 * DataTable rather than in any feature.
 */
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Applied to both the <th> and <td> — drives width + responsive visibility. */
    cellClassName?: string;
  }
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  /** UI states the table renders on its own. */
  isLoading?: boolean;
  emptyState?: ReactNode;

  /**
   * SERVER mode is enabled by passing `pageCount`. When present, the table
   * switches to manual pagination/sorting and delegates that state to the
   * parent. When absent, the table paginates/sorts client-side.
   */
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;

  /** Feature injects its own buttons here; receives the live table instance. */
  toolbar?: (table: Table<TData>) => ReactNode;

  /** Optional global search wired to a single column id. */
  searchColumnId?: string;
  searchPlaceholder?: string;

  enableRowSelection?: boolean;

  /** Page-size choices for the pagination control. */
  pageSizeOptions?: number[];
}
