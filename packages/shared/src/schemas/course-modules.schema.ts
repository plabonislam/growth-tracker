import { z } from 'zod';

import { resourceKindSchema } from '../enums';

/**
 * Wire contract for `POST /topics/:topicId/modules`. Every field is required —
 * a module is only created fully authored.
 */
export const CreateModuleSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  weight: z.number().int().min(1).max(100),
  estTime: z.number().int().positive(),
  order: z.number().int().min(0),
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
  title: z.string().min(1),
  url: z.string().url(),
  kind: resourceKindSchema,
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
  resources: z.array(CreateResourceSchema).min(1).max(10),
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
