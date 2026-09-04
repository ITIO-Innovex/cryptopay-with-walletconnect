import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

import { DashboardShell } from "@/features/merchant/layout/DashboardShell";
import { EmptyState, ErrorState, LoadingState } from "@/features/merchant/shared/PageState";
import { StatusBadge } from "@/features/merchant/shared/StatusBadge";
import {
  downloadCsv,
  formatCrypto,
  formatDateTime,
  shortenMiddle,
} from "@/features/merchant/shared/format";
import { listTransactions } from "@/features/merchant/transactions/transactions.functions";
import { CRYPTO_CURRENCIES } from "@/data/cryptocurrencies";

export const Route = createFileRoute("/_authenticated/dashboard/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const fetchTransactions = useServerFn(listTransactions);
  const [search, setSearch] = useState("");
  const [asset, setAsset] = useState("");
  const [network, setNetwork] = useState("");
  const [confirmed, setConfirmed] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const networks = Array.from(
    new Set(CRYPTO_CURRENCIES.flatMap((c) => c.networks.map((n) => n.name))),
  ).sort();

  const filters = {
    search: search || undefined,
    asset: asset || undefined,
    network: network || undefined,
    confirmed: confirmed === "" ? undefined : confirmed === "yes",
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
    limit: 200,
  };

  const query = useQuery({
    queryKey: ["merchant", "transactions", filters],
    queryFn: () => fetchTransactions({ data: filters }),
  });

  return (
    <DashboardShell
      title="Transactions"
      description="Every incoming transfer observed against your invoices, with the originating wallet and confirmations."
      actions={
        <button
          type="button"
          onClick={() => downloadCsv("transactions.csv", query.data ?? [])}
          className="rounded-xl border border-border px-3 py-2 text-sm font-medium"
        >
          Export CSV
        </button>
      }
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transaction hash"
          aria-label="Search transaction hash"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm lg:col-span-2"
        />
        <select
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
          aria-label="Filter by asset"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">All assets</option>
          {CRYPTO_CURRENCIES.map((c) => (
            <option key={c.symbol} value={c.symbol}>
              {c.symbol}
            </option>
          ))}
        </select>
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          aria-label="Filter by network"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">All networks</option>
          {networks.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select
          value={confirmed}
          onChange={(e) => setConfirmed(e.target.value)}
          aria-label="Filter by confirmation"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Any confirmation</option>
          <option value="yes">Confirmed</option>
          <option value="no">Unconfirmed</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          aria-label="From date"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          aria-label="To date"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : null}
      {query.data && query.data.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Transfers appear here as soon as a buyer sends funds to an invoice deposit address."
        />
      ) : null}

      {query.data && query.data.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Received</th>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Network</th>
                <th className="px-4 py-2">From</th>
                <th className="px-4 py-2">Hash</th>
                <th className="px-4 py-2">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-2 text-muted-foreground">{formatDateTime(tx.receivedAt)}</td>
                  <td className="px-4 py-2 font-medium">{tx.orderId}</td>
                  <td className="px-4 py-2">
                    {formatCrypto(tx.amount)} {tx.asset}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{tx.network}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {shortenMiddle(tx.senderAddress)}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{shortenMiddle(tx.txHash, 8, 6)}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={tx.invoiceStatus} />
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
