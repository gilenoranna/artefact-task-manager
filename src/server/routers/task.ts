import { TRPCError } from "@trpc/server";
import { createTaskInput, taskIdInput, updateTaskInput } from "../schemas";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from "../store/task-store";
import { publicProcedure, router } from "../trpc";

// A thin layer over the store: the store only knows about data and reports
// "not found" through its return values, while this router owns the
// transport concerns (input validation and the tRPC error codes). Invalid
// input never reaches the handlers; tRPC answers it with BAD_REQUEST.

function taskNotFound(id: string) {
  return new TRPCError({
    code: "NOT_FOUND",
    message: `Task "${id}" not found`,
  });
}

export const taskRouter = router({
  list: publicProcedure.query(() => listTasks()),

  // Not one of the four CRUD operations: it lets the edit page load a single
  // task without fetching the whole list.
  byId: publicProcedure.input(taskIdInput).query(({ input }) => {
    const task = getTask(input.id);
    if (!task) throw taskNotFound(input.id);
    return task;
  }),

  create: publicProcedure
    .input(createTaskInput)
    .mutation(({ input }) => createTask(input)),

  update: publicProcedure.input(updateTaskInput).mutation(({ input }) => {
    const task = updateTask(input);
    if (!task) throw taskNotFound(input.id);
    return task;
  }),

  delete: publicProcedure.input(taskIdInput).mutation(({ input }) => {
    if (!deleteTask(input.id)) throw taskNotFound(input.id);
    return { id: input.id };
  }),
});
