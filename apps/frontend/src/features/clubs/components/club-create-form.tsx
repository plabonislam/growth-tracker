import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { CreateClubSchema, type CreateClub } from 'shared';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CoordinatorSelect } from '@/features/users/components/coordinator-select';
import { fieldLabelClass } from '@/lib/form-styles';
import { getApiErrorMessage, isConflictError } from '@/services/http/client';
import { useCheckClubName, useCreateClub } from '../hooks/use-clubs';

const NAME_TAKEN_MESSAGE = 'This club name is already taken';

export function ClubCreateForm({ onCreated }: { onCreated?: () => void }) {
  const mutation = useCreateClub();
  const checkName = useCheckClubName();
  const lastCheckedName = useRef<string | null>(null);

  const form = useForm<CreateClub>({
    resolver: zodResolver(CreateClubSchema),
    defaultValues: {
      name: '',
      description: '',
      coordinatorEmail: undefined,
    },
  });

  const onSubmit = async (values: CreateClub) => {
    // The blur check is a soft, early hint — re-verify authoritatively here so
    // a submit that races ahead of (or skips) the blur check can't slip through.
    const available = await checkName
      .mutateAsync(values.name)
      .catch(() => true);
    if (!available) {
      form.setError('name', { type: 'manual', message: NAME_TAKEN_MESSAGE });
      return;
    }

    mutation.mutate(values, {
      onSuccess: () => onCreated?.(),
      onError: (error) => {
        // Final backstop for a name that was taken in the instant between
        // this check and the actual insert (e.g. another tab/user racing us).
        if (isConflictError(error)) {
          form.setError('name', {
            type: 'manual',
            message: NAME_TAKEN_MESSAGE,
          });
        }
      },
    });
  };

  const checkNameOnBlur = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === lastCheckedName.current) return;
    lastCheckedName.current = trimmed;

    const available = await checkName.mutateAsync(trimmed).catch(() => true);
    if (!available) {
      form.setError('name', { type: 'manual', message: NAME_TAKEN_MESSAGE });
    }
  };

  if (mutation.isSuccess) {
    return (
      <Card className="items-center gap-3 border-primary/20 p-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-7" />
        </span>
        <h3 className="font-serif text-2xl font-semibold">Club created</h3>
        <p className="text-sm text-muted-foreground">
          {form.getValues('name')} is ready. You can invite a coordinator and
          start adding topics at any time.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0 shadow-md">
      <div className="border-b p-8 pb-6 ">
        <h2 className="mb-3 font-serif text-2xl font-semibold text-primary text-center">
          Create a New Club
        </h2>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">
          Establish a new community. Define its identity and, optionally,
          designate its initial coordinator.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClass}>Club Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="e.g., Innovation Lab"
                      className="pr-9"
                      maxLength={100}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        lastCheckedName.current = null;
                        if (form.formState.errors.name?.type === 'manual') {
                          form.clearErrors('name');
                        }
                      }}
                      onBlur={(e) => {
                        field.onBlur();
                        void checkNameOnBlur(e.target.value);
                      }}
                    />
                    {checkName.isPending && (
                      <Loader2 className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClass}>Description</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    minLength={30}
                    placeholder="Describe the club's mission, vision, and activities..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coordinatorEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClass}>
                  Select Coordinator{' '}
                  <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground/70">
                    (Optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <CoordinatorSelect
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription className="italic">
                  You can choose a coordinator later if you&apos;re not ready.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {mutation.isError && !isConflictError(mutation.error) && (
            <p className="text-sm text-destructive text-center">
              {getApiErrorMessage(
                mutation.error,
                'Something went wrong creating the club. Please try again.',
              )}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="group w-full"
            disabled={mutation.isPending || checkName.isPending}
          >
            {mutation.isPending
              ? 'Creating…'
              : checkName.isPending
                ? 'Checking name…'
                : 'Create Club'}
            <Send className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </form>
      </Form>
    </Card>
  );
}
