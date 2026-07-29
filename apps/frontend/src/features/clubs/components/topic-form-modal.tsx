import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createPortal } from 'react-dom';
import {
  CreateTopicSchema,
  TOPIC_DESCRIPTION_LENGTH,
  type CreateTopic,
  type CreateTopicInput,
} from 'shared';

import { Button } from '@/components/ui/button';
import { FormActions } from '@/components/ui/form-actions';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MentorSelect } from '@/features/users/components/mentor-select';
import { fieldLabelClass } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

/** What the form holds while empty; also what a create reopen resets it to. */
export const EMPTY_TOPIC: CreateTopicInput = {
  name: '',
  description: '',
  mentorId: '',
  certificationRequired: false,
};

type TopicFormModalProps = {
  open: boolean;
  onClose: () => void;
  /** Dialog heading and the line under it. */
  title: string;
  subtitle: string;
  /**
   * Seeds the fields on every open. Must be referentially stable — a fresh
   * object each render would reset the form out from under whoever is typing.
   */
  defaultValues: CreateTopicInput;
  submitLabel: string;
  pendingLabel: string;
  pending?: boolean;
  onSubmit: (values: CreateTopic) => void;
};

/**
 * The topic form — create and edit are the same fields under the same rules,
 * so both go through here and differ only in their wording and what they do
 * with the submitted values.
 */
export function TopicFormModal({
  open,
  onClose,
  title,
  subtitle,
  defaultValues,
  submitLabel,
  pendingLabel,
  pending = false,
  onSubmit,
}: TopicFormModalProps) {
  // Typed input-first: `certificationRequired` carries a schema default, so what
  // the fields hold and what `handleSubmit` receives are different shapes.
  const form = useForm<CreateTopicInput, unknown, CreateTopic>({
    resolver: zodResolver(CreateTopicSchema),
    defaultValues,
  });

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

  // Reseed each time the modal opens so neither stale input nor the previous
  // topic's values linger.
  useEffect(() => {
    if (open) form.reset(defaultValues);
  }, [open, form, defaultValues]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-card shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3 border-b p-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-base font-semibold leading-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClass}>Topic name</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      placeholder="e.g. Advanced React Patterns"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => {
                // Trimmed, the same string the schema measures — a raw count
                // would read as met while a field of spaces was still rejected.
                const count = (field.value ?? '').trim().length;
                const remaining = TOPIC_DESCRIPTION_LENGTH.min - count;
                return (
                  <FormItem>
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel className={fieldLabelClass}>
                        Description
                      </FormLabel>
                      {/* Counts toward the floor first, since that is the bound
                          a coordinator actually meets; the cap only matters
                          once the writing runs long. */}
                      <span
                        className={cn(
                          'text-xs font-semibold tabular-nums',
                          count > TOPIC_DESCRIPTION_LENGTH.max
                            ? 'text-destructive'
                            : 'text-muted-foreground',
                        )}
                      >
                        {remaining > 0
                          ? `${remaining} more to go`
                          : `${count} of ${TOPIC_DESCRIPTION_LENGTH.max}`}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="What this track covers and who it is for…"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="mentorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClass}>Mentor</FormLabel>
                  <FormControl>
                    <MentorSelect
                      value={field.value || undefined}
                      onChange={(userId) => field.onChange(userId ?? '')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certificationRequired"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 rounded-lg border border-primary/10 bg-primary/5 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Require certification
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Members must pass a certification to complete this topic.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormActions className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? pendingLabel : submitLabel}
              </Button>
            </FormActions>
          </form>
        </Form>
      </div>
    </div>,
    document.body,
  );
}
