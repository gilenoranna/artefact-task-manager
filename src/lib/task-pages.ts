import type { InfiniteData } from "@tanstack/react-query";
import type { Task, TaskCursor, TaskPage } from "@/server/schemas";

// Pure updates for the cached task list, which is stored as pages (see
// `task.list`). They accept `undefined` because the list may not be in the
// cache yet; in that case there is nothing to update.

export type TaskPages = InfiniteData<TaskPage, TaskCursor | null>;

function mapItems(data: TaskPages | undefined, fn: (items: Task[]) => Task[]) {
  return (
    data && {
      ...data,
      pages: data.pages.map((page) => ({ ...page, items: fn(page.items) })),
    }
  );
}

// A new task is the newest one, so it only belongs at the top of the first
// page. Later pages are untouched: their cursors point at older tasks.
export function prependTask(data: TaskPages | undefined, task: Task) {
  return (
    data && {
      ...data,
      pages: data.pages.map((page, index) =>
        index === 0 ? { ...page, items: [task, ...page.items] } : page,
      ),
    }
  );
}

// Editing keeps `createdAt`, so the task stays in the same position.
export function replaceTask(data: TaskPages | undefined, task: Task) {
  return mapItems(data, (items) =>
    items.map((item) => (item.id === task.id ? task : item)),
  );
}

export function removeTask(data: TaskPages | undefined, id: string) {
  return mapItems(data, (items) => items.filter((item) => item.id !== id));
}
