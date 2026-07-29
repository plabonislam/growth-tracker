import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavbarActionButtonProps
  extends Omit<React.ComponentProps<typeof Button>, 'size' | 'children'> {
  /** Visible from `sm` up, and the accessible name at every width. */
  label: string;
  icon: LucideIcon;
}

/**
 * The single shape every primary create action in the top bar takes — "Create
 * Club" from the shell, "Create Module" from a page's `NavbarActions` portal.
 * Sharing it is what keeps two buttons that can sit in the same 56/64px bar
 * from drifting to different heights.
 *
 * Below `sm` the label is dropped, but as a square icon button rather than a
 * shrunken pill — a deliberate target, and `aria-label` carries the name that
 * the hidden text no longer does.
 *
 * Touch sizing: 44px tall up to `md`, the pointer-friendly floor the whole
 * top bar holds to; 36px from `md` up, where a mouse is the likely pointer.
 */
export function NavbarActionButton({
  label,
  icon: Icon,
  className,
  ...props
}: NavbarActionButtonProps) {
  return (
    <Button
      type="button"
      aria-label={label}
      className={cn(
        'h-11 w-11 gap-1.5 px-0 has-[>svg]:px-0',
        'sm:w-auto sm:px-4 sm:has-[>svg]:px-3',
        'md:h-9',
        className,
      )}
      {...props}
    >
      <Icon className="size-4" strokeWidth={1.75} />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
