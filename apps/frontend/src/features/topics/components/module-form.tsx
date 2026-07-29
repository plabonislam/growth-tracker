import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import {
  buildCreateModuleWithResourcesSchema,
  MODULE_BODY_LENGTH,
  type CreateModuleWithResources,
} from 'shared';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormActions } from '@/components/ui/form-actions';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatDuration } from '@/lib/format-duration';
import { fieldLabelClass } from '@/lib/form-styles';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/services/http/client';
import { useCreateModule, useUpdateModule } from '../hooks/use-topics';
import { RESOURCE_KIND_META, RESOURCE_KINDS } from '../topics.constants';
import type { CurriculumModule } from '../topics.types';

/** Matches `CreateModuleWithResourcesSchema`'s `resources` cap. */
const MAX_RESOURCES = 10;

/** The schema demands at least one — a module with no resources teaches nothing. */
const MIN_RESOURCES = 1;

/** Row a mentor starts from; the kind picker defaults to the commoner case. */
const EMPTY_RESOURCE = { title: '', url: '', kind: 'doc' } as const;

/** Number fields carry their unit as a suffix, so the spinners come off. */
const numberInputClass =
  'pr-14 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

/**
 * Radix's trigger box is shorter and tighter than our `Input`, so the kind
 * picker sat low next to Title and Link. Match the input's height, radius,
 * padding, and focus ring. (`data-[size=default]:` because the base height
 * carries that modifier and would otherwise outrank a bare `h-11`.)
 */
const selectTriggerClass =
  'w-full rounded-lg border bg-background px-4 text-base data-[size=default]:h-11 md:text-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30';

type ModuleFormProps = {
  topicId: string;
  /** Position for a new module — the count of modules already on the topic. */
  nextOrder: number;
  /**
   * Weight held by every *other* module on the topic, 0–100. When editing, the
   * edited module's own share is left out, so re-saving it unchanged never
   * reads as overspending.
   */
  allocatedWeight: number;
  /** The module being edited. Absent authors a new one. */
  module?: CurriculumModule;
  onDone: () => void;
  onCancel: () => void;
};

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  /** Omit to use the card purely as a container — the header is skipped. */
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-0 p-4 sm:p-6 lg:p-7">
      {(title || description || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="font-serif text-lg font-bold tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </Card>
  );
}

/**
 * Authors a module, and edits one. Both run through the same form so a mentor
 * revisits exactly the page they filled in, with their answers already in it.
 */
export function ModuleForm({
  topicId,
  nextOrder,
  allocatedWeight,
  module,
  onDone,
  onCancel,
}: ModuleFormProps) {
  const isEditing = module != null;

  // Both are declared unconditionally — hooks cannot be called by branch — and
  // the mode decides which one submit runs.
  const createMutation = useCreateModule(topicId);
  const updateMutation = useUpdateModule(topicId);
  const mutation = isEditing ? updateMutation : createMutation;

  const remainingBefore = Math.max(0, 100 - allocatedWeight);

  const schema = useMemo(
    () => buildCreateModuleWithResourcesSchema(allocatedWeight),
    [allocatedWeight],
  );

  const form = useForm<CreateModuleWithResources>({
    resolver: zodResolver(schema),
    defaultValues: module
      ? {
          title: module.title,
          body: module.body ?? '',
          weight: module.weight,
          // Blank rather than 0 when the mentor never set one.
          estTime: module.estTime ?? undefined,
          resources: module.resources.map((resource) => ({
            title: resource.title,
            url: resource.url,
            kind: resource.kind,
          })),
        }
      : {
          title: '',
          body: '',
          weight: undefined,
          estTime: undefined,
          // One row up front: it is required, so an empty state would only be a
          // dead end the mentor has to click out of.
          resources: [{ ...EMPTY_RESOURCE }],
        },
  });

  const resources = useFieldArray({ control: form.control, name: 'resources' });

  // Index of a row just added, so the mentor lands in it instead of hunting.
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  // Autofocusing the title opens the keyboard on phones and hides the page.
  const [autoFocusTitle] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 768px)').matches,
  );

  const weightValue = useWatch({ control: form.control, name: 'weight' });
  const estTimeValue = useWatch({ control: form.control, name: 'estTime' });
  const bodyValue = useWatch({ control: form.control, name: 'body' });

  // Counted after trimming, the same string the schema measures — a counter that
  // credited padding would read as valid while the field was still rejected.
  const bodyLength = (bodyValue ?? '').trim().length;
  const bodyRemaining = MODULE_BODY_LENGTH.min - bodyLength;

  const pendingWeight =
    typeof weightValue === 'number' && Number.isFinite(weightValue)
      ? Math.max(0, Math.min(100, weightValue))
      : 0;
  const estTimeLabel = formatDuration(estTimeValue);

  const atMaxResources = resources.fields.length >= MAX_RESOURCES;
  const atMinResources = resources.fields.length <= MIN_RESOURCES;

  // A bound on the list itself, not on a row, so no `FormField` renders it. The
  // resolver nests it under `root` while rows are registered and reports it
  // directly once the list is empty — the case that trips the lower bound.
  const resourcesError =
    form.formState.errors.resources?.root?.message ??
    form.formState.errors.resources?.message;

  const addResource = () => {
    if (atMaxResources) return;
    setFocusIndex(resources.fields.length);
    resources.append({ ...EMPTY_RESOURCE });
  };

  const handleCancel = () => {
    if (
      form.formState.isDirty &&
      !window.confirm(
        isEditing
          ? 'Discard your changes? They won’t be saved.'
          : 'Discard this module? Your changes won’t be saved.',
      )
    ) {
      return;
    }
    onCancel();
  };

  /** Shared by both modes — only the verb in the copy differs. */
  const handleSaved = ({
    module: saved,
    failedResources,
  }: {
    module: CurriculumModule;
    failedResources: number;
  }) => {
    toast.success(
      `Module “${saved.title}” ${isEditing ? 'updated' : 'created'}`,
    );
    if (failedResources > 0) {
      toast.warning(
        `${failedResources} resource${failedResources === 1 ? 's' : ''} couldn’t be saved. Check the module’s resources.`,
      );
    }
    onDone();
  };

  const handleFailed = (error: unknown) =>
    toast.error(
      getApiErrorMessage(
        error,
        isEditing
          ? 'Couldn’t save the module. Please try again.'
          : 'Couldn’t create the module. Please try again.',
      ),
    );

  // The schema trims every text field and `zodResolver` hands `handleSubmit` the
  // parsed values, so these arrive ready to send.
  const onSubmit = ({
    resources: rows,
    ...fields
  }: CreateModuleWithResources) => {
    if (module) {
      // `order` is left out: editing never moves a module, and position is
      // rearranged through the reorder endpoint instead.
      updateMutation.mutate(
        {
          moduleId: module.id,
          module: fields,
          resources: rows,
          originalResources: module.resources,
        },
        { onSuccess: handleSaved, onError: handleFailed },
      );
      return;
    }

    createMutation.mutate(
      { module: { ...fields, order: nextOrder }, resources: rows },
      { onSuccess: handleSaved, onError: handleFailed },
    );
  };

  return (
    <SectionCard>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 items-start gap-5 sm:gap-6  xl:gap-8"
        >
          <div className="min-w-0 space-y-5 sm:space-y-6">
            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
              <SectionCard
                title="Module basics"
                description="What the module is called and what it teaches."
              >
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fieldLabelClass}>Title</FormLabel>
                        <FormControl>
                          <Input
                            autoFocus={autoFocusTitle}
                            placeholder="e.g. Cognitive Load and Visual Hierarchy"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-3">
                          <FormLabel className={fieldLabelClass}>
                            Learning content
                          </FormLabel>
                          {/* Counts toward the floor first, since that is the
                              bound a mentor actually meets; the cap only
                              matters once the writing runs long. */}
                          <span
                            className={cn(
                              'text-xs font-semibold tabular-nums',
                              bodyLength > MODULE_BODY_LENGTH.max
                                ? 'text-destructive'
                                : 'text-muted-foreground',
                            )}
                          >
                            {bodyRemaining > 0
                              ? `${bodyRemaining} more to go`
                              : `${bodyLength} of ${MODULE_BODY_LENGTH.max}`}
                          </span>
                        </div>
                        <FormControl>
                          <Textarea
                            rows={4}
                            className="min-h-20 resize-y leading-relaxed"
                            placeholder="Outline the core concepts, objectives, and key takeaways for this module…"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Learners read this before opening the resources — at
                          least 30 characters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Weight and pacing"
                description="How much of the topic this module carries, and how long it takes."
              >
                {/* Stacked at 360px, side by side from sm — neither field squeezes */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-1 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fieldLabelClass}>
                          Weight
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              max={100}
                              placeholder="15"
                              className={numberInputClass}
                              {...field}
                              value={field.value ?? ''}
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ''
                                    ? undefined
                                    : event.target.valueAsNumber,
                                )
                              }
                            />
                          </FormControl>
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-muted-foreground"
                          >
                            %
                          </span>
                        </div>

                        {/* `remainingBefore` excludes this module when editing,
                            so the arithmetic reads the same either way: what is
                            left over once this module takes its share. */}
                        <FormDescription>
                          {remainingBefore === 0
                            ? isEditing
                              ? 'The topic’s other modules already use all 100%.'
                              : 'The topic is already at 100%.'
                            : pendingWeight > 0
                              ? `${Math.max(0, remainingBefore - pendingWeight)}% of the topic left after this module.`
                              : `Share of the topic’s progress. ${remainingBefore}% available to this module.`}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fieldLabelClass}>
                          Estimated time
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              placeholder="90"
                              className={numberInputClass}
                              {...field}
                              value={field.value ?? ''}
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ''
                                    ? undefined
                                    : event.target.valueAsNumber,
                                )
                              }
                            />
                          </FormControl>
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-muted-foreground"
                          >
                            min
                          </span>
                        </div>
                        <FormDescription>
                          {estTimeLabel
                            ? `About ${estTimeLabel} for a first-time learner.`
                            : 'Roughly, for a first-time learner.'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SectionCard>
            </div>
            <SectionCard
              title="Resources"
              description="Links learners open alongside this module — a reading, a video, a repo. At least one is required."
              action={
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                    {resources.fields.length} of {MAX_RESOURCES}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={atMaxResources}
                    className="gap-1.5"
                    onClick={addResource}
                  >
                    <Plus className="size-4" strokeWidth={2} />
                    Add
                  </Button>
                </div>
              }
            >
              <ul className="space-y-3">
                {resources.fields.map((row, index) => (
                  // One layout at every width: a labelled header line keeps the
                  // remove control anchored and full-size down to 360px.
                  <li
                    key={row.id}
                    className="rounded-xl border bg-muted/40 p-3 sm:p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        Resource {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        // The last row stays put — a module needs one resource.
                        disabled={atMinResources}
                        aria-label={`Remove resource ${index + 1}`}
                        title={
                          atMinResources
                            ? 'A module needs at least one resource'
                            : undefined
                        }
                        className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => resources.remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    {/* items-start: a validation message under one field must
                        not stretch its neighbours and shift their labels. */}
                    <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-[1fr_1fr_11rem]">
                      <FormField
                        control={form.control}
                        name={`resources.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={fieldLabelClass}>
                              Title
                            </FormLabel>
                            <FormControl>
                              <Input
                                autoFocus={index === focusIndex}
                                placeholder="e.g. Heuristic Evaluation 101"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`resources.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={fieldLabelClass}>
                              Link
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="url"
                                inputMode="url"
                                placeholder="https://…"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`resources.${index}.kind`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={fieldLabelClass}>
                              Type
                            </FormLabel>
                            {/* Decides the icon and the action word ("Watch" /
                                "View") on the learner's module card. */}
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className={selectTriggerClass}>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {RESOURCE_KINDS.map((kind) => (
                                  <SelectItem key={kind} value={kind}>
                                    {RESOURCE_KIND_META[kind].label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              {resourcesError && (
                <p className="mt-3 text-sm text-destructive">
                  {resourcesError}
                </p>
              )}

              {atMaxResources && (
                <p className="mt-3 text-[13px] text-muted-foreground">
                  That’s the limit of {MAX_RESOURCES}. Remove one to add
                  another.
                </p>
              )}
            </SectionCard>
            {/* Centred rather than right-aligned: this row is the full width
                of the form, not a modal's footer, so the pair reads as the
                end of the page instead of drifting to one corner. */}
            <FormActions className="mt-10 sm:justify-center xl:mt-0">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={mutation.isPending}>
                {isEditing
                  ? mutation.isPending
                    ? 'Saving…'
                    : 'Save changes'
                  : mutation.isPending
                    ? 'Creating…'
                    : 'Create module'}
              </Button>
            </FormActions>
          </div>
        </form>
      </Form>
    </SectionCard>
  );
}
