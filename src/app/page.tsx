import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Link from "next/link";
import { TaskList } from "@/components/task-list";
import { getQueryClient, trpc } from "@/trpc/server";

// The prefetch below calls the router directly (no fetch, no headers), so
// Next would otherwise prerender this page at build time and freeze the list.
export const dynamic = "force-dynamic";

export default async function Home() {
  // The first page of the list is fetched on the server and handed to the
  // client through hydration: the first HTML already contains the tasks (real
  // SSR) and the browser does not need an extra request when the page loads.
  // The next pages are loaded by the client as the user scrolls. The awaited
  // prefetch is what makes this work; the 30s staleTime (see query-client.ts)
  // keeps the client from refetching the hydrated data right away.
  // The input and `getNextPageParam` must match the ones in TaskList: they
  // produce the query key, and a different key means the data is not hydrated.
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(
      {},
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Tarefas</h1>
        <Link href="/tasks/new" className="btn btn-primary">
          Nova tarefa
        </Link>
      </div>
      <TaskList />
    </HydrationBoundary>
  );
}
