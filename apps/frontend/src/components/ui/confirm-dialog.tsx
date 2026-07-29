import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { FormActions } from '@/components/ui/form-actions';
import { cn } from '@/lib/utils';

/**
 * Blocking yes/no for an action that cannot be taken back. Mounted only while
 * it is being asked, so it holds no open state of its own — the caller decides
 * what is pending confirmation.
 */
export function ConfirmDialog({
  title,
  description,
  detail,
  confirmLabel = 'Confirm',
  pendingLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  pending = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  /** The consequence, in a sentence — what happens if they go ahead. */
  description: string;
  /** Optional second line for specifics, e.g. what else is taken with it. */
  detail?: string;
  confirmLabel?: string;
  /** Replaces the confirm label while the action runs. Defaults to it. */
  pendingLabel?: string;
  cancelLabel?: string;
  /** Colours the confirm button as destructive and adds the warning mark. */
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Escape cancels, never confirms — the safe half of the choice.
      if (event.key === 'Escape') onCancel();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onCancel]);

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
      onClick={pending ? undefined : onCancel}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border bg-card shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex gap-4 p-6">
          {destructive && (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" strokeWidth={1.75} />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-bold leading-tight tracking-tight">
              {title}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {description}
            </p>
            {detail && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {detail}
              </p>
            )}
          </div>
        </div>

        <FormActions className="border-t bg-muted/30 p-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            // Focused on open: the reversible half of the choice is the one a
            // stray Enter should land on.
            autoFocus
            disabled={pending}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            size="lg"
            disabled={pending}
            onClick={onConfirm}
            className={cn(pending && 'pointer-events-none')}
          >
            {pending ? (pendingLabel ?? confirmLabel) : confirmLabel}
          </Button>
        </FormActions>
      </div>
    </div>,
    document.body,
  );
}
