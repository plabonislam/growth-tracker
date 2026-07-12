import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { ClubCreateForm } from './club-create-form';

type ClubCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function ClubCreateModal({
  open,
  onClose,
  onCreated,
}: ClubCreateModalProps) {
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
      aria-label="Create a new club"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div className="overflow-y-auto">
          <ClubCreateForm onCreated={onCreated} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
