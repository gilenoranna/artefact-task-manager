import "server-only"; // ensures this file is never imported from the client

import { randomUUID } from "node:crypto";
import type { CreateTaskInput, Task, UpdateTaskInput } from "../schemas";

// Plain data functions with no knowledge of tRPC. "Not found" is reported
// through the return values; the router decides which error to raise.

function createSeed(): Map<string, Task> {
  const now = Date.now();
  const seed = [
    {
      title: "Estudar tRPC",
      description: "Ler a documentação do tRPC v11 para o App Router.",
    },
    { title: "Revisar README" },
    {
      title: "Preparar a demonstração",
      description: "Criar, editar e excluir tarefas de exemplo.",
    },
  ];

  // Staggered timestamps so "newest first" is a real, deterministic order.
  return new Map(
    seed.map((item, index): [string, Task] => {
      const task: Task = {
        id: randomUUID(),
        ...item,
        createdAt: now - index * 60_000,
      };
      return [task.id, task];
    }),
  );
}

// Kept on `globalThis` so the data is not reset when Next reloads modules in
// development, and so every module instance (route handler, server
// components) shares the same collection.
const globalForTasks = globalThis as unknown as {
  taskStore?: Map<string, Task>;
};
const tasks = (globalForTasks.taskStore ??= createSeed());

// An empty description means "no description": one representation only.
function normalizeDescription(description: string | undefined) {
  return description || undefined;
}

export function listTasks(): Task[] {
  return Array.from(tasks.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function getTask(id: string): Task | undefined {
  return tasks.get(id);
}

export function createTask(input: CreateTaskInput): Task {
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    description: normalizeDescription(input.description),
    // Set on the server; the client never sends it.
    createdAt: Date.now(),
  };
  tasks.set(task.id, task);
  return task;
}

// Replaces the editable fields as a whole: an omitted description clears it.
export function updateTask(input: UpdateTaskInput): Task | undefined {
  const existing = tasks.get(input.id);
  if (!existing) return undefined;

  const updated: Task = {
    ...existing,
    title: input.title,
    description: normalizeDescription(input.description),
  };
  tasks.set(updated.id, updated);
  return updated;
}

export function deleteTask(id: string): boolean {
  return tasks.delete(id);
}
