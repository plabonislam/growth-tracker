import { z } from 'zod';

export const CreateModuleSchema = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  weight: z.number().int().min(1).max(100),
  estTime: z.number().int().positive().optional(),
  order: z.number().int().min(0),
});

export const UpdateModuleSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().optional(),
  weight: z.number().int().min(1).max(100).optional(),
  estTime: z.number().int().positive().optional(),
  order: z.number().int().min(0).optional(),
});

export const ReorderModulesSchema = z.object({
  moduleIds: z.array(z.string().min(1)).min(1),
});

export const CreateResourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
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

export type CreateModule = z.infer<typeof CreateModuleSchema>;
export type UpdateModule = z.infer<typeof UpdateModuleSchema>;
export type ReorderModules = z.infer<typeof ReorderModulesSchema>;
export type CreateResource = z.infer<typeof CreateResourceSchema>;
export type ModuleResponse = z.infer<typeof ModuleResponseSchema>;
