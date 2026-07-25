import { z } from 'zod';

import { resourceKindSchema } from '../enums';

const MAX_TITLE_LENGTH = 120;
/** A line or two at minimum — this is what a learner reads before starting. */
const MIN_BODY_LENGTH = 30;
const MAX_BODY_LENGTH = 5000;
/** Past what every mainstream browser will follow in an address bar. */
const MAX_URL_LENGTH = 2048;
const MAX_EST_TIME_MINUTES = 24 * 60;
const MIN_RESOURCES = 1;
const MAX_RESOURCES = 10;

/**
 * The body's bounds, published so the form can count a mentor toward the floor
 * instead of restating the number and drifting from it.
 */
export const MODULE_BODY_LENGTH = {
  min: MIN_BODY_LENGTH,
  max: MAX_BODY_LENGTH,
} as const;

/** Every way of getting a link wrong reads the same to the mentor. */
const LINK_MESSAGE = 'Link must be a valid URL';

/**
 * A mentor-authored text field: trimmed, length-bounded, capped. Every message
 * opens with the field's own label, because `ZodValidationPipe` flattens issues
 * and collapses nested paths — for a resource the API only reports `resources`,
 * so the message text is all that says which field broke.
 */
const authoredText = (
  label: string,
  { min = 1, max }: { min?: number; max: number },
) =>
  z
    .string({
      required_error: `${label} is required`,
      invalid_type_error: `${label} must be text`,
    })
    .trim()
    // A field that is merely required reports the bare floor; a real minimum
    // states its number, the way `clubs.schema.ts` does for a description.
    .min(
      min,
      min === 1
        ? `${label} must contain at least 1 character(s)`
        : `${label} must be at least ${min} characters`,
    )
    .max(max, `${label} must be ${max} characters or fewer`);

/**
 * Wire contract for `POST /topics/:topicId/modules`. Every field is required —
 * a module is only created fully authored.
 */
export const CreateModuleSchema = z.object({
  title: authoredText('Title', { max: MAX_TITLE_LENGTH }),
  body: authoredText('Learning content', {
    min: MIN_BODY_LENGTH,
    max: MAX_BODY_LENGTH,
  }),
  weight: z
    .number({
      required_error: 'Weight is required',
      // Covers a half-typed number too: an input holding "-" or "e" parses to
      // NaN, which Zod reports as a type failure rather than a range one.
      invalid_type_error: 'Weight must be a number between 1 and 100',
    })
    .int('Weight must be a whole number')
    .min(1, 'Weight must be at least 1%')
    .max(100, 'Weight must be 100% or less'),
  estTime: z
    .number({
      required_error: 'Estimated time is required',
      invalid_type_error: 'Estimated time must be a number of minutes',
    })
    .int('Estimated time must be a whole number of minutes')
    .min(1, 'Estimated time must be at least 1 minute')
    .max(
      MAX_EST_TIME_MINUTES,
      `Estimated time must be ${MAX_EST_TIME_MINUTES} minutes (${MAX_EST_TIME_MINUTES / 60} hours) or less`,
    ),
  // Derived from the topic's module count rather than typed, so these messages
  // only ever reach a hand-rolled API call.
  order: z
    .number({
      required_error: 'Order is required',
      invalid_type_error: 'Order must be a number',
    })
    .int('Order must be a whole number')
    .min(0, 'Order cannot be negative'),
});

/**
 * Wire contract for `PATCH /topics/:topicId/modules/:id`. The same fields under
 * the same constraints, but each one optional: a patch carries only what
 * changed, and omitted fields are left alone. Position is normally moved
 * through `ReorderModulesSchema` instead, so `order` rarely appears here.
 */
export const UpdateModuleSchema = CreateModuleSchema.partial();

export const ReorderModulesSchema = z.object({
  moduleIds: z.array(z.string().min(1)).min(1),
});

export const CreateResourceSchema = z.object({
  title: authoredText('Resource title', { max: MAX_TITLE_LENGTH }),
  // Blank, malformed, over-long, or the wrong scheme — one message covers them
  // all, so the mentor is told what a link should be rather than which rule it
  // tripped. The scheme check still stands: `.url()` waves `javascript:`
  // through, and the module card puts this string straight into an `href`.
  url: z
    .string({ required_error: LINK_MESSAGE, invalid_type_error: LINK_MESSAGE })
    .trim()
    .min(1, LINK_MESSAGE)
    .max(MAX_URL_LENGTH, LINK_MESSAGE)
    .url(LINK_MESSAGE)
    .refine((value) => /^https?:\/\//i.test(value), {
      message: LINK_MESSAGE,
    }),
  // The shared enum stays message-free — sessions and topics use it too — so the
  // resource wording is attached here.
  kind: z.enum(resourceKindSchema.options, {
    errorMap: () => ({ message: 'Resource type must be Video or Doc' }),
  }),
});

/**
 * What a mentor fills in when authoring a module. `order` is derived from the
 * topic's existing modules rather than typed, and resources are attached in a
 * second call once the module has an id. A module carries at least one
 * resource — there is nothing to work through otherwise.
 */
export const CreateModuleWithResourcesSchema = CreateModuleSchema.omit({
  order: true,
}).extend({
  resources: z
    .array(CreateResourceSchema, {
      required_error: `Resources must contain at least ${MIN_RESOURCES} item`,
      invalid_type_error: `Resources must contain at least ${MIN_RESOURCES} item`,
    })
    .min(MIN_RESOURCES, `Resources must contain at least ${MIN_RESOURCES} item`)
    .max(
      MAX_RESOURCES,
      `Resources must contain at most ${MAX_RESOURCES} items`,
    ),
});

/**
 * `CreateModuleWithResourcesSchema` narrowed by the weight a topic has already
 * allocated. The create endpoint rejects a topic whose module weights would
 * pass 100; refining here puts that failure on the `weight` field at author
 * time instead of leaving it to a round-trip 400.
 */
export const buildCreateModuleWithResourcesSchema = (allocatedWeight: number) =>
  CreateModuleWithResourcesSchema.superRefine((values, ctx) => {
    if (allocatedWeight + values.weight <= 100) return;
    const remaining = Math.max(0, 100 - allocatedWeight);
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['weight'],
      message:
        remaining === 0
          ? 'This topic is fully allocated — free up weight on another module first.'
          : `Only ${remaining}% is left to allocate on this topic.`,
    });
  });

export const ModuleResponseSchema = z.object({
  id: z.string().uuid(),
  topicId: z.string().uuid(),
  title: z.string(),
  body: z.string().nullable(),
  weight: z.number(),
  estTime: z.number().nullable(),
  order: z.number(),
  createdAt: z.string(),
});

export const ResourceResponseSchema = z.object({
  id: z.string().uuid(),
  moduleId: z.string().uuid(),
  title: z.string(),
  url: z.string(),
  kind: resourceKindSchema,
});

/**
 * What `GET /topics/:topicId/modules` returns. Only the list endpoint carries
 * resources — creating a module returns the bare row, since its resources are
 * attached afterwards.
 */
export const ModuleWithResourcesResponseSchema = ModuleResponseSchema.extend({
  resources: z.array(ResourceResponseSchema),
});

export type CreateModule = z.infer<typeof CreateModuleSchema>;
export type UpdateModule = z.infer<typeof UpdateModuleSchema>;
export type ReorderModules = z.infer<typeof ReorderModulesSchema>;
export type CreateResource = z.infer<typeof CreateResourceSchema>;
export type CreateModuleWithResources = z.infer<
  typeof CreateModuleWithResourcesSchema
>;
export type ModuleResponse = z.infer<typeof ModuleResponseSchema>;
export type ResourceResponse = z.infer<typeof ResourceResponseSchema>;
export type ModuleWithResourcesResponse = z.infer<
  typeof ModuleWithResourcesResponseSchema
>;
