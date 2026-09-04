import { statusLabel } from "./format";

const TONES: Record<string, string> = {
  awaiting: "bg-muted text-muted-foreground",
  underpaid: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  overpaid: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  expired: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
  refunded: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  queued: "bg-muted text-muted-foreground",
  processing: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  sent: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  failed: "bg-destructive/15 text-destructive",
};

/** Colour-coded payment / payout status pill. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        TONES[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}
