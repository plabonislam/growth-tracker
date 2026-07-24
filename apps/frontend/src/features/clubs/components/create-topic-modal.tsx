import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { CreateTopicSchema, type CreateTopic } from 'shared';

import { Button } from '@/components/ui/button';
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
import { MentorSelect } from '@/features/users/components/mentor-select';
import { fieldLabelClass } from '@/lib/form-styles';
import { getApiErrorMessage } from '@/services/http/client';
import { useCreateTopic } from '../hooks/use-clubs';

type CreateTopicModalProps = {
  clubId: string;
  open: boolean;
  onClose: () => void;
};

export function CreateTopicModal({
  clubId,
  open,
  onClose,
}: CreateTopicModalProps) {
  const mutation = useCreateTopic(clubId);

  const form = useForm<CreateTopic>({
    resolver: zodResolver(CreateTopicSchema),
    defaultValues: { name: '', mentorId: '', certificationRequired: false },
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

  // Reset the form each time the modal opens so stale input never lingers.
  useEffect(() => {
    if (open)
      form.reset({ name: '', mentorId: '', certificationRequired: false });
  }, [open, form]);

  if (!open) return null;

  const onSubmit = (values: CreateTopic) =>
    mutation.mutate(values, {
      onSuccess: (topic) => {
        toast.success(`Topic “${topic.name}” created`);
        onClose();
      },
      onError: (error) =>
        toast.error(
          getApiErrorMessage(
            error,
            'Couldn’t create the topic. Please try again.',
          ),
        ),
    });

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create a topic"
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
            <h2 className="text-base font-semibold leading-tight">
              Create a topic
            </h2>
            <p className="text-sm text-muted-foreground">
              Add a new learning track to this club.
            </p>
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

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating…' : 'Create topic'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>,
    document.body,
  );
}
