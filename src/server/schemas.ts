import { z } from "zod";

// The frontend imports its types from here. This file stays free of
// server-only code and Node APIs so that a future value import (e.g. reusing a
// schema in the form) cannot break the client bundle.

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

// Pagination is keyset-based: the cursor is the position (`createdAt` + `id`)
// of the last task already delivered, not a reference that must still exist.
// So it keeps working when that task is deleted while the user scrolls.
export const taskCursorSchema = taskSchema.pick({ id: true, createdAt: true });

// Deliberately not `.strict()`: the tRPC client adds a `direction` field to
// every infinite query input, and it only sends `cursor` after the first page
// (hence `nullish`).
export const listTasksInput = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  cursor: taskCursorSchema.nullish(),
});

export type Task = z.infer<typeof taskSchema>;
export type TaskCursor = z.infer<typeof taskCursorSchema>;
export type ListTasksInput = z.infer<typeof listTasksInput>;
// `nextCursor` is null on the last page.
export type TaskPage = { items: Task[]; nextCursor: TaskCursor | null };
export type CreateTaskInput = z.infer<typeof createTaskInput>;
export type UpdateTaskInput = z.infer<typeof updateTaskInput>;
export type TaskIdInput = z.infer<typeof taskIdInput>;
