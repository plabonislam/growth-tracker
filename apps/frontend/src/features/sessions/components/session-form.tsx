import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Repeat, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CreateSessionSchema, SessionType, type CreateSession } from 'shared';

import { Button } from '@/components/ui/button';
import { FormActions } from '@/components/ui/form-actions';
import { Card } from '@/components/ui/card';
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
import { fieldLabelClass } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

/** Today, as a date input reads it — also the furthest ahead it may go. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const CADENCE: { value: CreateSession['type']; label: string; hint: string }[] =
  [
    {
      value: SessionType.weekly,
      label: 'Weekly',
      hint: 'A regular working session',
    },
    {
      value: SessionType.monthly,
      label: 'Monthly',
      hint: 'The month’s sync-up',
    },
  ];

/**
 * The session log form. It records a session that has already happened, so the
 * date cannot run ahead of today and every field describes the past tense.
 *
 * Attendance is the one optional field: heads are counted after the fact, often
 * by someone else, so the form lets a session be logged on the day and counted
 * later rather than forcing a number nobody has.
 */
export function SessionForm({
  clubName,
  pending = false,
  onSubmit,
  onCancel,
}: {
  clubName: string;
  pending?: boolean;
  onSubmit: (values: CreateSession) => void;
  onCancel: () => void;
}) {
  const form = useForm<CreateSession>({
    resolver: zodResolver(CreateSessionSchema),
    defaultValues: {
      date: today(),
      type: SessionType.weekly,
      objective: '',
      facilitator: '',
      participantCount: null,
    },
  });

  const cadence = form.watch('type');

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 md:space-y-6"
      >
        <Card className="gap-5 rounded-[14px] p-4 sm:p-5 lg:p-6">
          {/* Two across as soon as there is room for two labels; stacked at
              360, where a half-width date input is unreadable. */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClass}>
                    <CalendarDays
                      className="mr-1.5 inline size-3.5 align-[-2px]"
                      strokeWidth={2}
                    />
                    Date held
                  </FormLabel>
                  <FormControl>
                    {/* Capped at today: the log records what happened. */}
                    <Input type="date" max={today()} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClass}>
                    <Repeat
                      className="mr-1.5 inline size-3.5 align-[-2px]"
                      strokeWidth={2}
                    />
                    Cadence
                  </FormLabel>
                  <FormControl>
                    {/* Side by side once the hint fits on two lines; below
                        ~400px they stack rather than shred the wording. */}
                    <div className="grid grid-cols-1 gap-2.5 min-[400px]:grid-cols-2">
                      {CADENCE.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          aria-pressed={cadence === option.value}
                          className={cn(
                            'min-h-11 rounded-[10px] border p-3 text-left transition-colors',
                            cadence === option.value
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-muted-foreground/40',
                          )}
                        >
                          <span className="block text-[13px] font-bold text-foreground">
                            {option.label}
                          </span>
                          <span className="mt-0.5 block text-[11.5px] leading-tight text-muted-foreground">
                            {option.hint}
                          </span>
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="objective"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClass}>
                  What it covered
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="e.g. Undo management in Oracle"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="facilitator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClass}>Who ran it</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Nahid Hasan Lovon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participantCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClass}>
                    <Users
                      className="mr-1.5 inline size-3.5 align-[-2px]"
                      strokeWidth={2}
                    />
                    Attendance
                    <span className="ml-1.5 font-medium normal-case tracking-normal text-muted-foreground">
                      — optional
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="Leave empty if not counted yet"
                      value={field.value ?? ''}
                      // An empty box means "nobody has counted", which is null
                      // rather than 0 — the sheet reads the two differently.
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === '' ? null : e.target.valueAsNumber,
                        )
                      }
                    />
                  </FormControl>
                  <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                    You can log the session now and add the headcount later.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <FormActions>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={pending}>
            <span className="truncate">
              {pending ? 'Logging…' : `Log session for ${clubName}`}
            </span>
          </Button>
        </FormActions>
      </form>
    </Form>
  );
}
