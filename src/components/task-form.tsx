"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import type { Task } from "@/server/schemas";
import {
  getErrorMessage,
  getFieldErrors,
  TITLE_REQUIRED_MESSAGE,
} from "@/lib/error-messages";
import { useTRPC } from "@/trpc/client";

type TaskFormProps = {
  // Present when editing: it carries both the initial values and the id.
  // Absent when creating a new task.
  task?: Task;
};

// One form for both modes, so the fields and the validation live in one place.
export function TaskForm({ task }: TaskFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const listKey = trpc.task.list.queryKey();

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [titleError, setTitleError] = useState<string>();

  const titleRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const titleErrorId = useId();
  const descriptionId = useId();

  // Runs after either mutation succeeds. The list is invalidated so it is
  // refetched, and the redirect goes back to it.
  function finish(message: string) {
    queryClient.invalidateQueries({ queryKey: listKey });
    toast.success(message);
    router.push("/");
  }

  // Shared by both mutations. A title error from the backend goes under the
  // field (no toast, so the same problem is not reported twice); anything
  // else is shown as a toast.
  function handleSaveError(error: unknown) {
    const { title: fieldError } = getFieldErrors(error);
    if (fieldError) {
      setTitleError(fieldError);
      titleRef.current?.focus();
      return;
    }
    toast.error(getErrorMessage(error));
  }

  // Hooks cannot be conditional, so both mutations are declared and the one
  // that matches the mode is picked below.
  const createTask = useMutation(
    trpc.task.create.mutationOptions({
      onSuccess: (created) => {
        // Show the result on the list right away: the page we are going back
        // to only replaces the cached list after it renders, which would
        // otherwise flash the old one. Newest first, like the server.
        queryClient.setQueryData(listKey, (old) => old && [created, ...old]);
        finish("Tarefa criada com sucesso");
      },
      onError: handleSaveError,
    }),
  );
  const updateTask = useMutation(
    trpc.task.update.mutationOptions({
      onSuccess: (updated) => {
        queryClient.setQueryData(listKey, (old) =>
          old?.map((item) => (item.id === updated.id ? updated : item)),
        );
        finish("Tarefa atualizada com sucesso");
      },
      onError: handleSaveError,
    }),
  );

  const mutation = task ? updateTask : createTask;
  // `isSuccess` keeps the button disabled while the redirect is in flight, so
  // a second click cannot create the task twice.
  const isSubmitting = mutation.isPending || mutation.isSuccess;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    // The backend validates again (it is the one that can be trusted); this
    // check only saves a round trip and gives immediate feedback.
    if (title.trim() === "") {
      setTitleError(TITLE_REQUIRED_MESSAGE);
      titleRef.current?.focus();
      return;
    }

    if (task) {
      updateTask.mutate({ id: task.id, title, description });
    } else {
      createTask.mutate({ title, description });
    }
  }

  return (
    // `noValidate` so the browser's own bubble does not replace our message.
    <form onSubmit={handleSubmit} noValidate className="card flex flex-col gap-4">
      <div>
        <label htmlFor={titleId} className="field-label">
          Título
        </label>
        <input
          ref={titleRef}
          id={titleId}
          type="text"
          required
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setTitleError(undefined);
          }}
          aria-invalid={titleError ? "true" : undefined}
          aria-describedby={titleError ? titleErrorId : undefined}
          className="field"
        />
        {titleError && (
          <p id={titleErrorId} role="alert" className="field-error">
            {titleError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={descriptionId} className="field-label">
          Descrição (opcional)
        </label>
        <textarea
          id={descriptionId}
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="field"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Link href="/" className="btn btn-secondary">
          Cancelar
        </Link>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
