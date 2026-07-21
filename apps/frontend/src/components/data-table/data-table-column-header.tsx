import type { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Clickable column header — idle sortable columns reveal their sort affordance
 * on hover; the actively sorted column stays highlighted with a directional
 * arrow. Non-sortable columns render the label as plain text.
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  label,
  className,
}: {
  column: Column<TData, TValue>;
  label: string;
  className?: string;
}) {
  if (!column.getCanSort()) {
    return (
      <span className={cn('text-xs font-medium', className)}>{label}</span>
    );
  }

  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        'group/sort -ml-2 inline-flex h-7 items-center gap-1.5 rounded-md px-2 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring',
        sorted && 'text-foreground',
        className,
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
