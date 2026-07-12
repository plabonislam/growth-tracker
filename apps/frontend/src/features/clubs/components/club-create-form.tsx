import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Send, UserSearch } from 'lucide-react';
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
import { getApiErrorMessage } from '@/services/http/client';
import { useCreateClub } from '../hooks/use-clubs';

export function ClubCreateForm({ onCreated }: { onCreated?: () => void }) {
  const mutation = useCreateClub();

  const form = useForm<CreateClub>({
    resolver: zodResolver(CreateClubSchema),
    defaultValues: {
      name: '',
      description: '',
      coordinatorId: undefined,
    },
  });

  const onSubmit = (values: CreateClub) =>
    mutation.mutate(values, { onSuccess: () => onCreated?.() });

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
      <div className="border-b p-8 pb-6 text-center">
        <h2 className="mb-3 font-serif text-2xl font-semibold text-primary">
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
                  <Input placeholder="e.g., Innovation Lab" {...field} />
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
            name="coordinatorId"
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

          {mutation.isError && (
            <p className="text-sm text-destructive">
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
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Creating…' : 'Create Club'}
            <Send className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </form>
      </Form>
    </Card>
  );
}
