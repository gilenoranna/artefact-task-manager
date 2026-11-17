"use client";

import { useEffect, useRef } from "react";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";

type InfiniteScrollFooterProps = {
  hasNextPage: boolean;
  // Any request in flight (next page or a refetch of the loaded pages).
  isFetching: boolean;
  isFetchingNextPage: boolean;
  // The last attempt to load the next page failed.
  isError: boolean;
  errorMessage: string;
  // Must keep the same identity between renders (it is an effect dependency).
  onLoadMore: () => unknown;
};

// Goes right after the list: loads the next page when it scrolls into view and
// shows the loading, error and end-of-list states.
export function InfiniteScrollFooter({
  hasNextPage,
  isFetching,
  isFetchingNextPage,
  isError,
  errorMessage,
  onLoadMore,
}: InfiniteScrollFooterProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Not while something is loading (it would cancel the request in flight) and
  // not after an error: the sentinel would still be visible and a failing
  // endpoint would be called again in a loop. The retry button is used instead.
  const canLoadMore = hasNextPage && !isFetching && !isError;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!canLoadMore || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // Stop observing before loading so a second callback cannot trigger
        // the same load twice. A new observer is created once this load ends
        // (and loads again right away if the sentinel is still visible, which
        // is what fills a tall screen).
        observer.disconnect();
        onLoadMore();
      },
      // Starts loading a little before the end of the list is reached.
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoadMore, onLoadMore]);

  return (
    <div>
      <div ref={sentinelRef} aria-hidden="true" />
      {isFetchingNextPage ? (
        <LoadingState message="Carregando mais tarefas…" />
      ) : isError ? (
        // A wrapper so the click event is not passed on to `onLoadMore`.
        <ErrorState message={errorMessage} onRetry={() => onLoadMore()} />
      ) : !hasNextPage ? (
        <p className="py-6 text-center text-sm text-gray-500">
          Você chegou ao fim da lista
        </p>
      ) : null}
    </div>
  );
}
