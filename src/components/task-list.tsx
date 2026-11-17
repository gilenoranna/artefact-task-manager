"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { InfiniteScrollFooter } from "@/components/infinite-scroll-footer";
import { LoadingState } from "@/components/loading-state";
import { getErrorMessage } from "@/lib/error-messages";
import { removeTask } from "@/lib/task-pages";
import type { TaskPages } from "@/lib/task-pages";
import type { Task } from "@/server/schemas";
import { useTRPC } from "@/trpc/client";

// The time zone is fixed so the server and the browser render the exact same
// text; otherwise a different zone on each side would cause a hydration
// mismatch (and a wrong time shown to the user).
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function TaskList() {
  const trpc = useTRPC();
  // The first page is hydrated from the server (see app/page.tsx), so
  // `isPending` is only true when that prefetch did not make it to the client.
  // The input and `getNextPageParam` must match the prefetch's.
  const {
    data,
    error,
    isPending,
    isError,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(
      {},
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  if (isPending) return <LoadingState />;
  // A failed "next page" is not handled here: the tasks already loaded stay on
  // screen and the footer shows the error. `!data` is the initial-load failure
  // (and narrows the type); any other failure, such as a refetch, replaces the
  // list.
  if (!data || (isError && !isFetchNextPageError)) {
    return (
      <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
    );
  }

  const tasks = data.pages.flatMap((page) => page.items);

  if (tasks.length === 0) {
    return (
      <EmptyState>
        <Link href="/tasks/new" className="btn btn-primary">
          Nova tarefa
        </Link>
      </EmptyState>
    );
  }

  // The list stays on screen while refetching (e.g. after a delete) instead of
  // being swapped for a loading state, so it does not flash.
  return (
    <>
      <ul aria-busy={isFetching} className="flex flex-col gap-3">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskItem task={task} />
          </li>
        ))}
      </ul>
      <InfiniteScrollFooter
        hasNextPage={hasNextPage}
        isFetching={isFetching}
        isFetchingNextPage={isFetchingNextPage}
        isError={isFetchNextPageError}
        errorMessage={getErrorMessage(error)}
        onLoadMore={fetchNextPage}
      />
    </>
  );
}

function TaskItem({ task }: { task: Task }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  // A filter (matches by prefix) instead of an exact key, so it finds the list
  // whatever input it was fetched with.
  const listFilter = trpc.task.list.infiniteQueryFilter();

  // One mutation per row: only this row's button is disabled while it runs,
  // and several rows can be deleted at the same time.
  const deleteTask = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: () => {
        // Remove the row right away; the refetch in `onSettled` confirms it.
        queryClient.setQueriesData<TaskPages>(listFilter, (old) =>
          removeTask(old, task.id),
        );
        toast.success("Tarefa excluída com sucesso");
      },
      onError: (error) => toast.error(getErrorMessage(error)),
      // Runs on failure too, so a task that was already deleted elsewhere
      // (NOT_FOUND) also disappears from the list. Returning the promise keeps
      // the button disabled until the refetch finishes.
      onSettled: () => queryClient.invalidateQueries(listFilter),
    }),
  );

  function handleDelete() {
    const confirmed = window.confirm(
      `Excluir a tarefa "${task.title}"? Esta ação não pode ser desfeita.`,
    );
    if (confirmed) deleteTask.mutate({ id: task.id });
  }

  return (
    <article className="card flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="break-words text-base font-semibold">{task.title}</h2>
        {task.description && (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-700">
            {task.description}
          </p>
        )}
        <time
          dateTime={new Date(task.createdAt).toISOString()}
          className="mt-2 block text-xs text-gray-500"
        >
          {dateFormatter.format(task.createdAt)}
        </time>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link
          href={`/tasks/${task.id}/edit`}
          aria-label={`Editar tarefa: ${task.title}`}
          className="btn btn-secondary"
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteTask.isPending}
          aria-label={`Excluir tarefa: ${task.title}`}
          className="btn btn-danger"
        >
          {deleteTask.isPending ? "Excluindo…" : "Excluir"}
        </button>
      </div>
    </article>
  );
}
