import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, a staleTime above 0 avoids refetching right away on the
        // client the data that was just hydrated from the server.
        staleTime: 30 * 1000,
      },
      dehydrate: {
        // Also send queries that are still pending, so a server component can
        // start a prefetch without awaiting it.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
        // Next.js detects dynamic rendering through the digest of errors thrown
        // during render; redacting them here would hide it and break the build.
        shouldRedactErrors: () => false,
      },
    },
  });
}
