import { router } from "../trpc";
import { taskRouter } from "./task";

export const appRouter = router({
  task: taskRouter,
});

// Exported so the client can infer end-to-end types without importing server code.
export type AppRouter = typeof appRouter;
