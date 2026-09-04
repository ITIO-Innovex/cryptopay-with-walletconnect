import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DashboardShell } from "@/features/merchant/layout/DashboardShell";
import { EmptyState, ErrorState, LoadingState } from "@/features/merchant/shared/PageState";
import { StatusBadge } from "@/features/merchant/shared/StatusBadge";
import {
  PAYOUT_STATUSES,
  downloadCsv,
  formatCrypto,
  formatDateTime,
  shortenMiddle,
} from "@/features/merchant/shared/format";
import { listPayouts, settleNow } from "@/features/merchant/payouts/payouts.functions";

export const Route = createFileRoute("/_authenticated/dashboard/payouts")({
  component: PayoutsPage,
});

function PayoutsPage() {
  const fetchPayouts = useServerFn(listPayouts);
  const settle = useServerFn(settleNow);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const filters = { status: status || undefined, limit: 200 };
  const query = useQuery({
    queryKey: ["merchant", "payouts", filters],
    queryFn: () => fetchPayouts({ data: filters }),
  });

  const settleMutation = useMutation({
    mutationFn: () => settle(),
    onSuccess: (result) => {
      setMessage(
        `Settlement run finished: ${result.batchesCreated} batch(es) sent, ${result.batchesFailed} failed.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["merchant"] });
    },
    onError: (err) =>
      setMessage(err instanceof Error ? err.message : "The settlement run could not start."),
  });

  return (
    <DashboardShell
      title="Payouts"
      description="Outgoing settlements to your own wallets, batched on the schedule set in Settings."
      actions={
        <>
          <button
            type="button"
            onClick={() => downloadCsv("payouts.csv", query.data ?? [])}
            className="rounded-xl border border-border px-3 py-2 text-sm font-medium"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => settleMutation.mutate()}
            disabled={settleMutation.isPending}
            className="rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-60"
          >
            {settleMutation.isPending ? "Settling…" : "Settle now"}
          </button>
        </>
      }
    >
      {message ? (
        <p className="mb-4 rounded-xl border border-border bg-muted/40 p-3 text-sm">{message}</p>
      ) : null}

      <div className="mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter payouts by status"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {PAYOUT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : null}
      {query.data && query.data.length === 0 ? (
        <EmptyState
          title="No settlements yet"
          description="Paid invoices are grouped by asset and network, then sent to your default payout wallet."
        />
      ) : null}

      {query.data && query.data.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Asset</th>
                <th className="px-4 py-2">Gross</th>
                <th className="px-4 py-2">Fees</th>
                <th className="px-4 py-2">Net sent</th>
                <th className="px-4 py-2">Destination</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data.map((batch) => (
                <tr key={batch.id}>
                  <td className="px-4 py-2 text-muted-foreground">
                    {formatDateTime(batch.sent_at ?? batch.created_at)}
                  </td>
                  <td className="px-4 py-2">
                    {batch.asset}
                    <span className="ml-1 text-xs text-muted-foreground">{batch.network}</span>
                  </td>
                  <td className="px-4 py-2">{formatCrypto(batch.gross_amount)}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {formatCrypto(batch.fee_amount)}
                  </td>
                  <td className="px-4 py-2 font-medium">{formatCrypto(batch.net_amount)}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {shortenMiddle(batch.destination_address)}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={batch.status} />
                    {batch.error_message ? (
                      <p className="mt-1 text-xs text-destructive">{batch.error_message}</p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </DashboardShell>
  );
}
