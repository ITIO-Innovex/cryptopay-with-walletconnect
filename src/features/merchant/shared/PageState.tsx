import type { ReactNode } from "react";

/** Skeleton shown while a dashboard page loads. */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

/** Message shown when a query fails, explaining what to do next. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm">
      <p className="font-medium text-destructive">We could not load this page</p>
      <p className="mt-1 text-muted-foreground">Reason: {message}</p>
      <p className="mt-1 text-muted-foreground">
        Solution: check your connection and try again. If it keeps failing, contact support.
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

/** Friendly empty state with an optional call to action. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
