import { isTRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";

// The backend speaks English (developer-facing); everything the user sees is
// translated here, in one place, from the tRPC error `code`. The raw backend
// `message` and stack traces are never shown.

// Shared with the form's local validation so the text exists only once.
export const TITLE_REQUIRED_MESSAGE = "O título é obrigatório";

const GENERIC_MESSAGE = "Algo deu errado. Tente novamente em instantes.";

export function getErrorMessage(error: unknown): string {
  if (!isTRPCClientError<AppRouter>(error)) return GENERIC_MESSAGE;

  // No `data` means the server never answered with a tRPC error: the request
  // failed (server down, offline) or the response was not a tRPC payload.
  if (!error.data) {
    return "Não foi possível conectar ao servidor. Tente novamente.";
  }

  switch (error.data.code) {
    case "BAD_REQUEST":
      return "Dados inválidos. Verifique os campos e tente novamente.";
    case "NOT_FOUND":
      return "Tarefa não encontrada. Ela pode já ter sido excluída.";
    default:
      return GENERIC_MESSAGE;
  }
}

// Validation errors the backend attached to a specific field (see the
// `errorFormatter` in server/trpc.ts), translated so the form can show them
// below the right input. Returns `{}` when the error is not a field error.
export function getFieldErrors(error: unknown): { title?: string } {
  if (!isTRPCClientError<AppRouter>(error)) return {};

  // The formatter flattens an error of unknown shape, so the field names are
  // not part of the inferred type.
  const fieldErrors: Record<string, string[] | undefined> | undefined =
    error.data?.zodError?.fieldErrors;

  // This assumes "required" is the only rule on `title`. If another rule is
  // added to the schema, map by the zod issue instead of by the field alone.
  if (fieldErrors?.title?.length) {
    return { title: TITLE_REQUIRED_MESSAGE };
  }
  return {};
}
