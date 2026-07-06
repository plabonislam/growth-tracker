import { ClipboardCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

type MarkDoneModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export function MarkDoneModal({ open, onClose, onSubmit }: MarkDoneModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  // Reset the confirmation whenever the modal is (re)opened.
  useEffect(() => {
    if (open) setConfirmed(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Submit module for review"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ClipboardCheck className="size-5" />
            </span>
            <h3 className="font-serif text-xl font-bold">Submit for Review?</h3>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              By submitting this module, you confirm that you have completed all
              tasks according to the requirements. Your mentor will review your
              work shortly.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/30">
            <Checkbox
              checked={confirmed}
              onCheckedChange={(value) => setConfirmed(value === true)}
              className="mt-0.5"
            />
            <span className="text-sm font-medium">
              I confirm that this task is complete and ready for review.
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-3 bg-muted/30 p-4 sm:flex-row-reverse">
          <Button className="flex-1" disabled={!confirmed} onClick={onSubmit}>
            Submit Request
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
