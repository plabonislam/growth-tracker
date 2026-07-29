import { cn } from '@/lib/utils';

/**
 * The action row a form ends with — Cancel on the left, the committing action
 * on the right, in that DOM order. Every form uses this row so the pair reads
 * the same everywhere: same order, same spacing, and (with `size="lg"` on both
 * buttons) the same height and type.
 *
 * Stacked and reversed below `sm`, so the primary action sits on top, under
 * the thumb, rather than below Cancel.
 */
export function FormActions({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end',
        // Full width while stacked; sized to their labels once side by side,
        // with a floor so a short "Cancel" doesn't shrink next to its partner.
        '[&>button]:w-full sm:[&>button]:w-auto sm:[&>button]:min-w-[9.5rem]',
        className,
      )}
    >
      {children}
    </div>
  );
}
