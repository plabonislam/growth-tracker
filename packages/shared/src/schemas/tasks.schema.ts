import { z } from 'zod';

export const CreateTaskSchema = z.object({
  statement: z.string().min(1),
  mandatory: z.boolean().default(false),
});

export const UpdateTaskSchema = z.object({
  statement: z.string().min(1).optional(),
  mandatory: z.boolean().optional(),
});

export const TaskResponseSchema = z.object({
  id: z.string().uuid(),
  moduleId: z.string().uuid(),
  statement: z.string(),
  inputType: z.string(),
  mandatory: z.boolean(),
  createdAt: z.string(),
});

export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type TaskResponse = z.infer<typeof TaskResponseSchema>;
