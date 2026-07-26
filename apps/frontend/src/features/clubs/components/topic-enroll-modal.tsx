import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Check,
  Clock,
  GraduationCap,
  Send,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TOPIC_ENROLLMENT_REASON_LENGTH } from 'shared';

import { formatDuration } from '@/lib/format-duration';
import { cn } from '@/lib/utils';

type TopicEnrollModalProps = {
  open: boolean;
  onClose: () => void;
  topicName: string;
  /** Sits under the title — the topic's description plus what happens next. */
  about: string;
  /** The topic summary panel; each fact is dropped when it isn't known. */
  meta?: {
    modules?: number;
    /** The modules' estimates added up, rendered as "1h 30m". */
    estTimeMinutes?: number;
    mentorName?: string;
    /** Expected weekly load, e.g. "5–8 hrs / week". */
    weeklyCommitment?: string;
  };
  /** Lines the learner confirms before the request can be sent. */
  terms: string[];
  /** How long review takes — the footer strip. */
  reviewNote?: string;
  onSubmit: (reason: string) => void;
  isSubmitting?: boolean;
  /** Covers the form with the confirmation once the request has gone. */
  sent?: boolean;
  /** Returns from the confirmation to the form. */
  onBackToForm?: () => void;
};

interface SummaryFact {
  icon: typeof Clock;
  label: string;
  value: string;
}

/** Icon tile over a labelled value — the topic summary's repeating unit. */
function SummaryItem({ icon: Icon, label, value }: SummaryFact) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-[9px] border bg-card text-primary">
        <Icon className="size-3.5" strokeWidth={1.9} />
      </span>
      <span className="min-w-0">
        <span className="block text-[9.5px] font-semibold uppercase leading-none tracking-[0.1em] text-muted-foreground">
          {label}
        </span>
        <span className="mt-[5px] block text-[13.5px] font-semibold leading-tight text-foreground">
          {value}
        </span>
      </span>
    </div>
  );
}

/**
 * The learner's enrollment request. Enrolling is an application rather than a
 * button press, so the dialog is built as one: the topic's facts on the left to
 * decide from, and on the right the two things the mentor is given — why the
 * learner wants it, and the terms they have confirmed. The action stays closed
 * until both are done, and says what is missing rather than sitting dead.
 */
export function TopicEnrollModal({
  open,
  onClose,
  topicName,
  about,
  meta,
  terms,
  reviewNote,
  onSubmit,
  isSubmitting = false,
  sent = false,
  onBackToForm,
}: TopicEnrollModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const [checked, setChecked] = useState<boolean[]>(() =>
    terms.map(() => false),
  );
  const [reason, setReason] = useState('');

  // Reset the form whenever the modal is (re)opened for a topic.
  useEffect(() => {
    if (!open) return;
    setChecked(terms.map(() => false));
    setReason('');
  }, [open, terms]);

  // Move focus into the dialog, so Escape and Tab act on it rather than on the
  // page still rendered behind the scrim.
  useEffect(() => {
    if (open) panelRef.current?.focus();
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

  const toggleAt = (index: number) =>
    setChecked((prev) => prev.map((c, i) => (i === index ? !c : c)));

  // Counted off `terms` rather than off `checked`, so a list that changed
  // between renders can't report more confirmations than it has lines.
  const confirmed = terms.reduce((n, _, i) => (checked[i] ? n + 1 : n), 0);
  const unconfirmed = terms.length - confirmed;

  // Trimmed, the same string the schema measures — a raw count would read as
  // met while a reason of spaces was still rejected.
  const reasonLength = reason.trim().length;
  const reasonShortBy = Math.max(
    0,
    TOPIC_ENROLLMENT_REASON_LENGTH.min - reasonLength,
  );
  const reasonTooLong = reasonLength > TOPIC_ENROLLMENT_REASON_LENGTH.max;
  const ready = unconfirmed === 0 && reasonShortBy === 0 && !reasonTooLong;

  // One sentence for whichever step is still open, in the order the form is
  // filled in — the checklist sits below the reason, so it answers last.
  const blockNote = reasonTooLong
    ? `Trim your reason to ${TOPIC_ENROLLMENT_REASON_LENGTH.max} characters or fewer.`
    : reasonShortBy > 0
      ? `Add ${reasonShortBy} more character${reasonShortBy === 1 ? '' : 's'} to your reason.`
      : `Confirm ${unconfirmed} more line${unconfirmed === 1 ? '' : 's'} to send this request.`;

  const estimate = formatDuration(meta?.estTimeMinutes);
  const facts: SummaryFact[] = [];
  if (meta?.modules != null) {
    facts.push({
      icon: BookOpen,
      label: 'Modules',
      value: `${meta.modules} ${meta.modules === 1 ? 'module' : 'modules'}`,
    });
  }
  if (estimate) {
    facts.push({ icon: Clock, label: 'Estimated time', value: estimate });
  }
  if (meta?.mentorName) {
    facts.push({ icon: UserRound, label: 'Mentor', value: meta.mentorName });
  }
  if (meta?.weeklyCommitment) {
    facts.push({
      icon: BarChart3,
      label: 'Commitment',
      value: meta.weeklyCommitment,
    });
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      // Scrolls as one at 360px, where the form is taller than the screen.
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/60 p-3.5 backdrop-blur-sm sm:px-6 sm:py-8"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-[600px] overflow-hidden rounded-2xl border bg-card shadow-2xl outline-none min-[1060px]:max-w-[980px]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header — centered, as the club application's is */}
        <div className="relative border-b px-4 pb-4 pt-5 text-center sm:px-[30px] sm:pb-[18px] sm:pt-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3.5 top-3.5 inline-flex size-[34px] items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X className="size-[15px]" strokeWidth={2.2} />
          </button>

          <span className="inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase leading-none tracking-[0.13em] text-primary">
            <GraduationCap className="size-[15px]" strokeWidth={1.9} />
            Topic enrollment
          </span>

          <h2
            id={titleId}
            className="mt-2.5 font-serif text-[19px] font-bold leading-tight text-primary sm:text-2xl"
          >
            Request to enroll in {topicName}
          </h2>

          <p className="mx-auto mt-[7px] max-w-[480px] text-[12.5px] leading-relaxed text-muted-foreground">
            {about}
          </p>
        </div>

        <div className="grid min-[1060px]:grid-cols-[318px_minmax(0,1fr)]">
          {/* Topic summary — the facts the decision rests on, kept out of the
              form so the form is only what the learner has to fill in. */}
          {facts.length > 0 && (
            <aside className="border-b bg-muted/40 p-4 sm:px-[22px] sm:py-[18px] min-[1060px]:border-b-0 min-[1060px]:border-r min-[1060px]:px-6 min-[1060px]:py-[22px]">
              <div className="text-[10.5px] font-semibold uppercase leading-none tracking-[0.12em] text-muted-foreground">
                Topic summary
              </div>
              {/* One column when there is room to read down it, two across the
                  tablet range where the panel is full-width and short. */}
              <div className="mt-3 grid gap-[11px] sm:grid-cols-2 min-[1060px]:grid-cols-1">
                {facts.map((fact) => (
                  <SummaryItem key={fact.label} {...fact} />
                ))}
              </div>
            </aside>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (ready) onSubmit(reason.trim());
            }}
            className="flex flex-col gap-4 p-4 sm:px-[22px] sm:py-[18px] min-[1060px]:px-6 min-[1060px]:py-[22px]"
          >
            <label className="block">
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[0.09em] text-foreground/80">
                  Why this topic
                </span>
                <span
                  className={cn(
                    'text-[11px] font-medium leading-none tabular-nums',
                    reasonTooLong
                      ? 'text-destructive'
                      : reasonShortBy > 0
                        ? 'text-muted-foreground'
                        : 'text-emerald-700 dark:text-emerald-400',
                  )}
                >
                  {reasonTooLong
                    ? `${reasonLength} of ${TOPIC_ENROLLMENT_REASON_LENGTH.max}`
                    : reasonShortBy > 0
                      ? `${reasonShortBy} more character${reasonShortBy === 1 ? '' : 's'}`
                      : 'Looks good'}
                </span>
              </span>
              <textarea
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={`Briefly describe what you want to build with ${topicName} and how this topic fits your track…`}
                className="mt-2 min-h-[82px] w-full resize-y rounded-[9px] border bg-muted/40 px-3.5 py-3 text-[13.5px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-background focus:ring-[3px] focus:ring-primary/12"
              />
            </label>

            <div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[0.09em] text-foreground/80">
                  Before you enroll
                </span>
                <span
                  className={cn(
                    'text-[11px] font-semibold leading-none tabular-nums',
                    unconfirmed === 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-muted-foreground',
                  )}
                >
                  {confirmed} of {terms.length} confirmed
                </span>
              </div>

              {/* A confirmed line tints, so the panel fills in as it is worked
                  down. The box is drawn rather than a checkbox control, to keep
                  the tick inside the row's own tinting. */}
              <ul className="mt-2 overflow-hidden rounded-[11px] border">
                {terms.map((term, index) => {
                  const isChecked = checked[index] ?? false;
                  return (
                    <li key={term} className="border-t first:border-t-0">
                      <label
                        className={cn(
                          'flex cursor-pointer items-center gap-2.5 px-3.5 py-3 transition-colors',
                          isChecked
                            ? 'bg-primary/5'
                            : 'hover:bg-primary/[0.03]',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAt(index)}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden
                          className={cn(
                            'inline-flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] text-primary-foreground transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-1',
                            isChecked
                              ? 'border-primary bg-primary'
                              : 'border-input bg-card',
                          )}
                        >
                          <Check
                            className={cn(
                              'size-[11px] transition-opacity',
                              isChecked ? 'opacity-100' : 'opacity-0',
                            )}
                            strokeWidth={3}
                          />
                        </span>
                        <span className="text-[12.5px] leading-[1.45] text-foreground/80">
                          {term}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* What is left, or that nothing is — the send button never has to
                be guessed at. */}
            {ready ? (
              <span className="-mt-1 flex items-start gap-2 text-[12px] font-semibold leading-[1.45] text-emerald-700 dark:text-emerald-400">
                <Check className="mt-px size-3.5 shrink-0" strokeWidth={2.2} />
                All set — your mentor will be notified.
              </span>
            ) : (
              <span className="-mt-1 flex items-start gap-2 text-[12px] font-semibold leading-[1.45] text-amber-700 dark:text-amber-400">
                <AlertCircle
                  className="mt-px size-3.5 shrink-0"
                  strokeWidth={2}
                />
                {blockNote}
              </span>
            )}

            {/* wrap-reverse: the primary action leads on one line and sits on
                top when they stack. */}
            <div className="flex flex-wrap-reverse gap-2.5 border-t pt-3.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-[1_1_130px] rounded-[10px] border bg-card px-[18px] py-3.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!ready || isSubmitting}
                title={ready ? undefined : blockNote}
                className={cn(
                  'inline-flex flex-[2_1_220px] items-center justify-center gap-2 rounded-[10px] border px-[18px] py-3.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  ready && !isSubmitting
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                    : 'cursor-not-allowed border-muted bg-muted text-muted-foreground',
                )}
              >
                {isSubmitting ? 'Sending…' : 'Send enrollment request'}
                <Send className="size-3.5" strokeWidth={2} />
              </button>
            </div>
          </form>
        </div>

        {reviewNote && (
          <div className="border-t bg-muted/20 px-5 py-[11px] text-center text-[11.5px] font-medium leading-snug text-muted-foreground">
            {reviewNote}
          </div>
        )}

        {/* Sits over the form rather than replacing it — the request is done,
            and what it was is still behind the confirmation. */}
        {sent && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/50 p-5">
            <div className="w-full max-w-[380px] rounded-[15px] border bg-card p-[22px] text-center shadow-2xl">
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Check className="size-5" strokeWidth={2.2} />
              </span>
              <div className="mt-3 text-[17px] font-bold leading-tight text-foreground">
                Request sent
              </div>
              <p className="mt-[7px] text-[12.5px] leading-relaxed text-muted-foreground">
                {meta?.mentorName ?? 'Your mentor'} will review your enrollment
                for {topicName}. You’ll be notified once it’s approved.
              </p>
              <button
                type="button"
                onClick={onBackToForm ?? onClose}
                className="mt-4 w-full rounded-[9px] border bg-card p-3 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {onBackToForm ? 'Back to form' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
