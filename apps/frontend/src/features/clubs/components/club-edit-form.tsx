import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  CLUB_DESCRIPTION_LENGTH,
  UpdateClubSchema,
  type UpdateClub,
} from 'shared';

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
import { cn } from '@/lib/utils';
import { getApiErrorMessage, isConflictError } from '@/services/http/client';
import type { Club } from '../clubs.types';
import { useClubDetail, useUpdateClub } from '../hooks/use-clubs';

const NAME_TAKEN_MESSAGE = 'This club name is already taken';

/**
 * An authority editing a club's identity. Name and description arrive filled
 * in, since editing is a correction to something that exists rather than a
 * blank form.
 *
 * The coordinator is the exception: it starts empty and is only sent when one
 * is picked, so saving a renamed club can't silently clear whoever runs it.
 * The current holder is shown alongside so the field reads as "change this",
 * not "this is unset".
 */
export function ClubEditForm({
  club,
  onSaved,
}: {
  club: Club;
  onSaved?: () => void;
}) {
  const mutation = useUpdateClub(club.id);
  // Only for the current coordinator's name — the card doesn't carry it.
  const { data: detail } = useClubDetail(club.id);

  const form = useForm<UpdateClub>({
    resolver: zodResolver(UpdateClubSchema),
    defaultValues: {
      name: club.name,
      description: club.description,
      coordinatorEmail: undefined,
    },
  });

  const onSubmit = (values: UpdateClub) => {
    mutation.mutate(values, {
      onSuccess: (club) => {
        toast.success(`Club “${club.name}” updated`);
        onSaved?.();
      },
      onError: (error) => {
        // The only conflict this endpoint raises is a name already in use.
        if (isConflictError(error)) {
          form.setError('name', {
            type: 'manual',
            message: NAME_TAKEN_MESSAGE,
          });
        }
      },
    });
  };

  return (
    <Card className="overflow-hidden p-0 shadow-md">
      <div className="border-b p-8 pb-6">
        <h2 className="mb-3 text-center font-serif text-2xl font-semibold text-primary">
          Edit Club
        </h2>
        <p className="mx-auto max-w-xl text-center text-sm text-muted-foreground">
          Update how {club.name} is described across the programme, or hand it
          to a different coordinator.
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
                  <Input
                    maxLength={100}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      field.onChange(e);
                      if (form.formState.errors.name?.type === 'manual') {
                        form.clearErrors('name');
                      }
                    }}
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
              const count = (field.value ?? '').trim().length;
              const belowMin = count < CLUB_DESCRIPTION_LENGTH.min;
              const overMax = count > CLUB_DESCRIPTION_LENGTH.max;
              return (
                <FormItem>
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel className={fieldLabelClass}>
                      Description
                    </FormLabel>
                    <span
                      className={cn(
                        'text-xs tabular-nums',
                        overMax
                          ? 'text-destructive'
                          : belowMin
                            ? 'text-muted-foreground'
                            : 'text-primary',
                      )}
                    >
                      {belowMin
                        ? `${count}/${CLUB_DESCRIPTION_LENGTH.min} min`
                        : `${count}/${CLUB_DESCRIPTION_LENGTH.max}`}
                    </span>
                  </div>
                  <FormControl>
                    <Textarea rows={4} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="coordinatorEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={fieldLabelClass}>
                  Change Coordinator{' '}
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
                  {detail?.coordinatorName
                    ? `Currently ${detail.coordinatorName}. Leave empty to keep them.`
                    : 'This club has no coordinator yet.'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {mutation.isError && !isConflictError(mutation.error) && (
            <p className="text-center text-sm text-destructive">
              {getApiErrorMessage(
                mutation.error,
                'Something went wrong saving the club. Please try again.',
              )}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving…' : 'Save Changes'}
            <Save className="size-4" />
          </Button>
        </form>
      </Form>
    </Card>
  );
}
