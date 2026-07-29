import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';
import { ClubJoinForm } from './club-join-form';

type ClubJoinModalProps = {
  clubId: string;
  open: boolean;
  onClose: () => void;
};

export function ClubJoinModal({ clubId, open, onClose }: ClubJoinModalProps) {
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
      aria-label="Club application form"
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-foreground/60 p-4 backdrop-blur-sm',
      )}
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
          className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-background/80 md:size-9 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div className="overflow-y-auto">
          <ClubJoinForm clubId={clubId} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
