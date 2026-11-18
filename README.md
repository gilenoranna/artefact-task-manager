# Task Manager

A simple application to create, list, edit and delete tasks, built with **Next.js 15** and
**tRPC**. Data lives in memory (no database) and all sample data is fictional.

## Stack

- Next.js 15 (App Router) and React 19
- tRPC 11 + TanStack Query
- zod (validation)
- Tailwind CSS 4 and sonner (toasts)

## Running it

Requires Node.js 20 or later. There are no environment variables (see `.env.example`).

```bash
npm install
npm run dev        # development at http://localhost:3000
```

Production build:

```bash
npm run build
npm run start      # http://localhost:3000
```

Lint: `npm run lint`.

## Features

- Server-side rendered (SSR) list with infinite scroll (10 tasks at a time).
- Create, edit and delete tasks (deleting asks for confirmation).
- Validation on both frontend and backend; error messages are shown in Portuguese.
- Feedback through toasts, plus loading, empty-list and error states (with a "Tentar novamente"
  retry button).

On startup, the server loads 33 fictional tasks so the scrolling is visible.

## Structure

```
src/
├── app/                 # routes (App Router): list, /tasks/new, /tasks/[id]/edit, tRPC API
├── components/          # list, form and state components (loading, empty, error)
├── lib/                 # error translation to PT-BR and list cache updates
├── server/
│   ├── store/           # in-memory data (unaware of tRPC)
│   ├── routers/         # tRPC procedures (thin layer over the store)
│   ├── schemas.ts       # zod schemas and types
│   └── trpc.ts          # tRPC initialization
└── trpc/                # tRPC clients (browser and server) and QueryClient
```

## How it works

**Flow:** the UI calls a tRPC procedure → the router validates the input with zod → the store
reads or changes the in-memory collection → the typed result goes back to the UI.

**List SSR:** the home page is a Server Component that fetches the first page of tasks directly
from the router (no HTTP request) and hands the result to the client with `HydrationBoundary`.
The first HTML already contains the tasks, and the browser doesn't fetch them again on load. The
page is `force-dynamic`; without it, Next would prerender it at build time and freeze the list.

**Infinite scroll:** `task.list` returns one page at a time. A sentinel element at the end of the
list is watched by an `IntersectionObserver`, which loads the next page shortly before it becomes
visible.

## Backend operations

| Procedure     | Type     | Input                                        | Returns                  |
|---------------|----------|----------------------------------------------|--------------------------|
| `task.list`   | query    | `{ limit?: 1–50 (default 10), cursor? }`     | `{ items, nextCursor }`  |
| `task.byId`   | query    | `{ id }`                                     | task                     |
| `task.create` | mutation | `{ title, description? }`                    | created task             |
| `task.update` | mutation | `{ id, title, description? }`                | updated task             |
| `task.delete` | mutation | `{ id }`                                     | `{ id }`                 |

A task has an `id`, a `title`, an optional `description` and a `createdAt`. Invalid input (for
example, an empty title) responds with `BAD_REQUEST`; a nonexistent `id` responds with
`NOT_FOUND`. `task.byId` is not part of the basic CRUD: it exists so the edit page can load a
single task.

## Decisions

- **Store on `globalThis`:** data isn't lost when Next reloads modules in development, and all
  server modules share the same collection.
- **Thin router:** the store only knows about data; the router handles validation and error codes.
- **Position-based cursor pagination** (`createdAt` + `id`): stays correct if the cursor's task is
  deleted during scrolling, and creating or deleting tasks neither repeats nor skips items.
- **Double validation:** the form validates to give immediate feedback; the backend validates
  again, since it's the one that can be trusted.
- **Errors in one place:** the backend responds in English (`code` + `message`) and a single
  helper (`src/lib/error-messages.ts`) translates them into the Portuguese shown on screen.
- **Fixed-timezone dates** (`America/Sao_Paulo`): server and browser produce the same text, which
  avoids hydration errors.

## Limitations

- Data is lost when the server restarts (no persistence, per the challenge requirements).
- No authentication: anyone with access to the application can see and change all tasks.
- No automated tests.
- The order is always "most recent first"; there is no search or filtering.
