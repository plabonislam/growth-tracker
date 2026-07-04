import {
  BookOpen,
  ClipboardList,
  Clock,
  GitBranch,
  Info,
  ListChecks,
  Send,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type TopicEnrollModalProps = {
  open: boolean;
  onClose: () => void;
  topicName: string;
  stats?: { modules?: number; tasks?: number; weeks?: number };
  about: string;
  prerequisites?: string[];
  commitments: string[];
  /** The emphasized final acknowledgement shown at the bottom of the list. */
  finalAcknowledgement?: string;
  reviewNote?: string;
  onSubmit: () => void;
  isSubmitting?: boolean;
};

function StatItem({
  icon: Icon,
  label,
}: {
  icon: typeof BookOpen;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className="size-4" />
      {label}
    </span>
  );
}

function CheckRow({
  checked,
  onChange,
  children,
  className,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn('group flex cursor-pointer items-start gap-3', className)}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        className="mt-0.5"
      />
      <span className="text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground">
        {children}
      </span>
    </label>
  );
}

export function TopicEnrollModal({
  open,
  onClose,
  topicName,
  stats,
  about,
  prerequisites,
  commitments,
  finalAcknowledgement,
  reviewNote,
  onSubmit,
  isSubmitting = false,
}: TopicEnrollModalProps) {
  const items = useMemo(
    () => [
      ...(prerequisites ?? []),
      ...commitments,
      ...(finalAcknowledgement ? [finalAcknowledgement] : []),
    ],
    [prerequisites, commitments, finalAcknowledgement],
  );

  const [checked, setChecked] = useState<boolean[]>(() =>
    items.map(() => false),
  );

  // Reset the acknowledgements whenever the modal is (re)opened for a topic.
  useEffect(() => {
    if (open) setChecked(items.map(() => false));
  }, [open, items]);

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

  const prereqCount = prerequisites?.length ?? 0;
  const setAt = (index: number, value: boolean) =>
    setChecked((prev) => prev.map((c, i) => (i === index ? value : c)));

  const allChecked = checked.length > 0 && checked.every(Boolean);
  const canSubmit = allChecked && !isSubmitting;

  const statChips = [
    stats?.modules != null && (
      <StatItem key="m" icon={BookOpen} label={`${stats.modules} Modules`} />
    ),
    stats?.tasks != null && (
      <StatItem key="t" icon={ClipboardList} label={`${stats.tasks} Tasks`} />
    ),
    stats?.weeks != null && (
      <StatItem key="w" icon={Clock} label={`${stats.weeks} Weeks Est.`} />
    ),
  ].filter(Boolean);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Enroll in ${topicName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border bg-card shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex flex-col gap-2 border-b bg-muted/30 p-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Topic Enrollment
          </span>
          <h2 className="font-serif text-2xl font-semibold">{topicName}</h2>
          {statChips.length > 0 && (
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {statChips}
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="space-y-8 overflow-y-auto p-6">
          {/* About */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-base font-bold">
              <Info className="size-5 text-primary" />
              About this Topic
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {about}
            </p>
          </section>

          {/* Prerequisites */}
          {prereqCount > 0 && (
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-base font-bold">
                <GitBranch className="size-5 text-primary" />
                Prerequisite Topics
              </h3>
              <div className="grid grid-cols-1 gap-4 rounded-xl border bg-muted/20 p-5 md:grid-cols-2">
                {prerequisites!.map((prereq, i) => (
                  <CheckRow
                    key={prereq}
                    checked={checked[i] ?? false}
                    onChange={(value) => setAt(i, value)}
                  >
                    {prereq}
                  </CheckRow>
                ))}
              </div>
            </section>
          )}

          {/* Commitment statement */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-base font-bold">
              <ListChecks className="size-5 text-primary" />
              Commitment Statement
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              By enrolling in this topic, you commit to completing all modules
              and participating in the peer-review process.
            </p>
            <div className="space-y-4 rounded-xl border-l-4 border-primary bg-muted/30 p-5">
              {commitments.map((commitment, i) => {
                const index = prereqCount + i;
                return (
                  <CheckRow
                    key={commitment}
                    checked={checked[index] ?? false}
                    onChange={(value) => setAt(index, value)}
                  >
                    {commitment}
                  </CheckRow>
                );
              })}

              {finalAcknowledgement && (
                <CheckRow
                  checked={checked[items.length - 1] ?? false}
                  onChange={(value) => setAt(items.length - 1, value)}
                  className="border-t pt-4"
                >
                  <span className="italic">{finalAcknowledgement}</span>
                </CheckRow>
              )}
            </div>
          </section>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <Button
              type="button"
              size="lg"
              className="group w-full md:w-auto md:px-12"
              disabled={!canSubmit}
              onClick={onSubmit}
            >
              {isSubmitting ? 'Submitting…' : 'Submit Enrollment Request'}
              <Send className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            {reviewNote && (
              <p className="max-w-sm text-center text-sm text-muted-foreground">
                {reviewNote}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
