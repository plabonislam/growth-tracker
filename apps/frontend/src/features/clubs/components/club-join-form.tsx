import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ChevronDown, Gavel, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { JoinClubSchema, type JoinClub } from 'shared';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { fieldLabelClass } from '@/lib/form-styles';
import { cn } from '@/lib/utils';
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

function ReviewRules({ rules }: { rules: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border bg-muted/20">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between bg-muted/40 p-4 transition-colors hover:bg-muted/60"
      >
        <span className="flex items-center gap-2 font-semibold">
          <Gavel className="size-5 text-primary" />
          Review Club Rules
        </span>
        <ChevronDown
          className={cn(
            'size-5 transition-transform duration-300',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <ul className="space-y-3 border-t p-6 text-sm text-muted-foreground">
          {rules.map((rule) => (
            <li key={rule} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              {rule}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ClubJoinForm({
  clubId,
  rules,
}: {
  clubId: string;
  rules?: string[];
}) {
  const { data: user } = useCurrentUser();
  const mutation = useSubmitJoinApplication(clubId);

  const form = useForm<JoinClub>({
    resolver: zodResolver(JoinClubSchema),
    values: {
      memberId: user?.id ?? '',
      expectation: '',
      acceptedRules: false,
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClass}>ID #</FormLabel>
                  <FormControl>
                    <Input placeholder="DSI-99238" {...field} />
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
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClass}>
                  Joining Expectations
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="Briefly describe what you aim to achieve and contribute to the club community..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {rules && rules.length > 0 && <ReviewRules rules={rules} />}

          <FormField
            control={form.control}
            name="acceptedRules"
            render={({ field }) => (
              <FormItem className="rounded-lg border border-primary/10 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal leading-relaxed text-muted-foreground">
                    I confirm that I have read and agree to the Terms of
                    Participation and the{' '}
                    <span className="font-semibold text-primary">
                      Club Rules
                    </span>{' '}
                    outlined above. I understand that membership is subject to
                    review by the board.
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {mutation.isError && (
            <p className="text-sm text-destructive">
              Something went wrong submitting your application. Please try
              again.
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
