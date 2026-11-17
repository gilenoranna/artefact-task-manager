import { initTRPC } from "@trpc/server";

// There is no authentication in this app, so the context is empty.
const t = initTRPC.create();

// Export only the pieces the app needs instead of the whole `t` object.
export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
