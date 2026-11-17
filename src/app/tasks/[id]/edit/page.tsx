import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { TaskForm } from "@/components/task-form";
import type { Task } from "@/server/schemas";
import { caller } from "@/trpc/server";

// Same reason as the list page: the task is read straight from the in-memory
// store, so Next must not cache this page's output.
export const dynamic = "force-dynamic";

export default async function EditTaskPage({
  params,
}: {
  // In Next 15 the route params are a Promise.
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // The form only needs the task as its initial values, so a direct call is
  // enough: nothing has to be hydrated into the client's query cache.
  let task: Task;
  try {
    task = await caller.task.byId({ id });
  } catch (error) {
    // `notFound()` works by throwing, so it must stay outside the `try`.
    if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound();
    throw error;
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Editar tarefa</h1>
      <TaskForm task={task} />
    </>
  );
}
