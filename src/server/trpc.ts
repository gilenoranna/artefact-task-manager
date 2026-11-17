import { initTRPC } from "@trpc/server";
import { z, ZodError } from "zod";

// There is no authentication in this app, so the context is empty.
const t = initTRPC.create({
  // Adds the per-field validation errors to the response so the UI can show
  // each message next to the right field. It is `null` for non-validation
  // errors (e.g. NOT_FOUND).
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? z.flattenError(error.cause) : null,
      },
    };
  },
});

// Export only the pieces the app needs instead of the whole `t` object.
export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
