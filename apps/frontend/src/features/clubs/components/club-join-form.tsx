import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { JOIN_EXPECTATION_LENGTH, JoinClubSchema, type JoinClub } from 'shared';

import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { fieldLabelClass } from '@/lib/form-styles';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/services/http/client';
import { useSubmitJoinApplication } from '../hooks/use-clubs';

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <Label className={fieldLabelClass}>{label}</Label>
      <div className="flex h-11 items-center rounded-lg border bg-muted/40 px-4 text-sm text-muted-foreground">
        {value}
      </div>
    </div>
  );
}

export function ClubJoinForm({ clubId }: { clubId: string }) {
  const { data: user } = useCurrentUser();
  const mutation = useSubmitJoinApplication(clubId);

  const form = useForm<JoinClub>({
    resolver: zodResolver(JoinClubSchema),
    values: {
      memberId: '',
      expectation: '',
    },
  });

  const onSubmit = (values: JoinClub) => mutation.mutate(values);

  if (mutation.isSuccess) {
    return (
      <Card className="items-center gap-3 border-primary/20 p-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-7" />
        </span>
        <h3 className="font-serif text-2xl font-semibold">
          Application submitted
        </h3>
        <p className="text-sm text-muted-foreground">
          Coordinators usually review applications within 3–5 business days.
          You’ll be notified once a decision is made.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0 shadow-md">
      <div className="border-b p-8 pb-6 text-center">
        <h2 className="mb-3 font-serif text-2xl font-semibold text-primary">
          Application for Membership
        </h2>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">
          Complete your application to join the club. Gain access to specialized
          tracks, peer mentoring, and industry-leading research resources.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-8">
          {/* items-start: an error under the ID adds a row to that column, and
              a stretched neighbour would spread the extra height across its own
              label and value box, dragging both out of line. */}
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClass}>DSI-ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="DSI-99238"
                      // Hints the mobile keyboard to open in caps; the handler
                      // below is what actually guarantees it.
                      autoCapitalize="characters"
                      {...field}
                      // The prefix is written `DSI-`, so typing "dsi" becomes
                      // "DSI" as it is entered. Case-preserving, so the caret
                      // stays where the applicant left it.
                      onChange={(event) =>
                        field.onChange(event.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ReadOnlyField label="Full Name" value={user?.name ?? '—'} />
          </div>

          <ReadOnlyField label="Email Address" value={user?.email ?? '—'} />

          <FormField
            control={form.control}
            name="expectation"
            render={({ field }) => {
              // Trimmed, the same string the schema measures — a raw count
              // would read as met while a field of spaces was still rejected.
              const count = (field.value ?? '').trim().length;
              const remaining = JOIN_EXPECTATION_LENGTH.min - count;
              return (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel className={fieldLabelClass}>
                      Joining Expectations
                    </FormLabel>
                    {/* Counts toward the floor first, since that is the bound
                        an applicant actually meets; the cap only matters once
                        the writing runs long. */}
                    <span
                      className={cn(
                        'text-xs font-semibold tabular-nums',
                        count > JOIN_EXPECTATION_LENGTH.max
                          ? 'text-destructive'
                          : 'text-muted-foreground',
                      )}
                    >
                      {remaining > 0
                        ? `${remaining} more to go`
                        : `${count} of ${JOIN_EXPECTATION_LENGTH.max}`}
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Briefly describe what you aim to achieve and contribute to the club community..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(
                mutation.error,
                'Something went wrong submitting your application. Please try again.',
              )}
            </p>
          )}

          <div className="space-y-4">
            <Button
              type="submit"
              size="lg"
              className="group w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Submitting…' : 'Submit Application'}
              <Send className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Application review typically takes 3–5 business days.
            </p>
          </div>
        </form>
      </Form>
    </Card>
  );
}
