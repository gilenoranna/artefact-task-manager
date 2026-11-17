import { publicProcedure, router } from "../trpc";

export const appRouter = router({
  // Temporary health check used to validate the tRPC setup.
  ping: publicProcedure.query(() => ({ ok: true })),
});

// Exported so the client can infer end-to-end types without importing server code.
export type AppRouter = typeof appRouter;
