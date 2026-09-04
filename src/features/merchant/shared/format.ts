/** Shared formatting helpers for the merchant dashboard. */

export function formatCrypto(value: number | string | null | undefined, maxDecimals = 8): string {
  const n = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  if (!Number.isFinite(n)) return "0";
  return n
    .toFixed(maxDecimals)
    .replace(/0+$/, "")
    .replace(/\.$/, "");
}

export function formatUsd(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number.isFinite(n) ? n : 0,
  );
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shortenMiddle(value: string | null | undefined, head = 6, tail = 6): string {
  if (!value) return "—";
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export const INVOICE_STATUSES = [
  "awaiting",
  "underpaid",
  "paid",
  "overpaid",
  "expired",
  "cancelled",
  "refunded",
] as const;

export const PAYOUT_STATUSES = ["queued", "processing", "sent", "failed"] as const;

export const PAYOUT_MODES = [
  { value: "instant", label: "After every transaction" },
  { value: "hourly", label: "Batch every hour" },
  { value: "daily", label: "Batch every 24 hours" },
  { value: "manual", label: "Manual only" },
] as const;

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    awaiting: "Awaiting payment",
    underpaid: "Under payment",
    paid: "Paid",
    overpaid: "Over payment",
    expired: "Expired",
    cancelled: "Cancelled",
    refunded: "Refunded",
    queued: "Queued",
    processing: "Processing",
    sent: "Sent",
    failed: "Failed",
  };
  return map[status] ?? status;
}

/** Builds a CSV file from rows and triggers a browser download. */
export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
