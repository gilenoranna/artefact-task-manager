import { LoadingState } from "@/components/loading-state";

// Shown while a dynamic page (the list, the edit page) is rendered on the
// server. A neutral message, since this one file covers every route.
export default function Loading() {
  return <LoadingState message="Carregando…" />;
}
