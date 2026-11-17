import { z } from "zod";

// Shared with the frontend (forms import these types and schemas), so this
// file must stay free of server-only code and Node APIs.

export const taskSchema = z.object({
  // Not `z.uuid()`: an unknown id such as "abc" must reach the router and
  // produce NOT_FOUND instead of failing validation with BAD_REQUEST.
  id: z.string().min(1),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  // Epoch in milliseconds: serializable as plain JSON, no transformer needed.
  createdAt: z.number().int(),
});

// Reusing `pick` keeps the validation rules defined in a single place.
export const createTaskInput = taskSchema.pick({
  title: true,
  description: true,
});

export const updateTaskInput = taskSchema.pick({
  id: true,
  title: true,
  description: true,
});

export const taskIdInput = taskSchema.pick({ id: true });

export type Task = z.infer<typeof taskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskInput>;
export type UpdateTaskInput = z.infer<typeof updateTaskInput>;
export type TaskIdInput = z.infer<typeof taskIdInput>;
