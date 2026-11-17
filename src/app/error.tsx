"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { ErrorState } from "@/components/error-state";

// Last-resort boundary for errors thrown while rendering a page (e.g. a
// failure in a server component). The error is not shown: in production it
// arrives redacted, and its message is developer-facing anyway.
export default function RouteError({ reset }: { reset: () => void }) {
  const router = useRouter();

  return (
    <ErrorState
      onRetry={() => {
        // `reset()` alone only re-renders on the client and would reuse the
        // failed server result; the refresh makes the server render again.
        startTransition(() => {
          router.refresh();
          reset();
        });
      }}
    />
  );
}
