import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

import { DashboardShell, MetricCard } from "@/features/merchant/layout/DashboardShell";
import { ErrorState, LoadingState, EmptyState } from "@/features/merchant/shared/PageState";
import { StatusBadge } from "@/features/merchant/shared/StatusBadge";
import { formatCrypto, formatDateTime, formatUsd } from "@/features/merchant/shared/format";
import { getMerchantOverview } from "@/features/merchant/overview/overview.functions";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: OverviewPage,
});

function OverviewPage() {
  const fetchOverview = useServerFn(getMerchantOverview);
  const query = useQuery({ queryKey: ["merchant", "overview"], queryFn: () => fetchOverview() });

  return (
    <DashboardShell
      title="Overview"
      description="Crypto payments received, pending invoices and recent settlements."
      actions={
        <Link
          to="/dashboard/invoices"
          className="rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground"
        >
          Create invoice
        </Link>
      }
    >
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : null}
      {query.data ? (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Settled volume" value={formatUsd(query.data.metrics.volumeUsd)} />
            <MetricCard label="Paid invoices" value={String(query.data.metrics.paidCount)} />
            <MetricCard
              label="Awaiting payment"
              value={String(query.data.metrics.pendingCount)}
              hint="Includes under payments"
            />
            <MetricCard
              label="Completion rate"
              value={`${query.data.metrics.successRate}%`}
              hint={`Terminal ${query.data.account.terno}`}
            />
          </div>

          <section className="rounded-2xl border border-border bg-card">
            <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">
              Recent invoices
            </h2>
            {query.data.recentInvoices.length === 0 ? (
              <EmptyState
                title="No invoices yet"
                description="Create your first invoice, or call the invoice API from your store to send a buyer to the hosted checkout."
              />
            ) : (
              <ul className="divide-y divide-border">
                {query.data.recentInvoices.map((invoice) => (
                  <li key={invoice.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                    <span className="font-medium">{invoice.orderId}</span>
                    <span className="text-muted-foreground">{invoice.productName}</span>
                    <span className="ml-auto">{formatUsd(invoice.amountUsd)}</span>
                    <StatusBadge status={invoice.status} />
                    <span className="w-full text-xs text-muted-foreground sm:w-auto">
                      {formatDateTime(invoice.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card">
            <h2 className="border-b border-border px-4 py-3 text-sm font-semibold">
              Recent settlements
            </h2>
            {query.data.recentPayouts.length === 0 ? (
              <EmptyState
                title="No settlements yet"
                description="Once an invoice is paid, funds are batched to your payout wallet on the schedule you choose in Settings."
              />
            ) : (
              <ul className="divide-y divide-border">
                {query.data.recentPayouts.map((payout) => (
                  <li key={payout.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                    <span className="font-medium">
                      {formatCrypto(payout.netAmount)} {payout.asset}
                    </span>
                    <span className="text-muted-foreground">{payout.network}</span>
                    <span className="ml-auto">
                      <StatusBadge status={payout.status} />
                    </span>
                    <span className="w-full text-xs text-muted-foreground sm:w-auto">
                      {formatDateTime(payout.sentAt ?? payout.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </DashboardShell>
  );
}
