import "server-only"; // ensures this file is never imported from the client

import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { appRouter } from "@/server/routers/_app";
import { createCallerFactory } from "@/server/trpc";
import { makeQueryClient } from "./query-client";

// One QueryClient per request: `cache` returns the same instance while the
// same request is rendered, and a new one for the next request.
export const getQueryClient = cache(makeQueryClient);

// Query options built straight from the router (no HTTP round-trip), used to
// prefetch in server components and hydrate the data into client components.
export const trpc = createTRPCOptionsProxy({
  ctx: {},
  router: appRouter,
  queryClient: getQueryClient,
});

// Direct procedure calls for when a server component needs the data itself.
// This bypasses the query cache, so the data is not hydrated to the client.
export const caller = createCallerFactory(appRouter)({});
