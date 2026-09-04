import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { VerificationGate } from "@/features/merchant/shared/VerificationGate";
import { DashboardShell } from "@/features/merchant/layout/DashboardShell";
import { EmptyState, ErrorState, LoadingState } from "@/features/merchant/shared/PageState";
import { StatusBadge } from "@/features/merchant/shared/StatusBadge";
import {
  INVOICE_STATUSES,
  downloadCsv,
  formatCrypto,
  formatDateTime,
  formatUsd,
} from "@/features/merchant/shared/format";
import {
  cancelInvoice,
  createInvoice,
  listInvoices,
} from "@/features/merchant/invoices/invoices.functions";

export const Route = createFileRoute("/_authenticated/dashboard/invoices")({
  component: InvoicesPage,
});

function InvoicesPage() {
  const fetchInvoices = useServerFn(listInvoices);
  const create = useServerFn(createInvoice);
  const cancel = useServerFn(cancelInvoice);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productName: "", amountUsd: "", customerEmail: "", description: "" });
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const filters = {
    search: search || undefined,
    status: status || undefined,
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
    limit: 200,
  };

  const query = useQuery({
    queryKey: ["merchant", "invoices", filters],
    queryFn: () => fetchInvoices({ data: filters }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      create({
        data: {
          productName: form.productName,
          amountUsd: Number(form.amountUsd),
          customerEmail: form.customerEmail || undefined,
          description: form.description || undefined,
          expiresInMinutes: 60,
        },
      }),
    onSuccess: (invoice) => {
      setLastLink(`${window.location.origin}/checkout?invoice=${invoice.id}`);
      setForm({ productName: "", amountUsd: "", customerEmail: "", description: "" });
      setShowForm(false);
      void queryClient.invalidateQueries({ queryKey: ["merchant"] });
    },
    onError: (err) =>
      setFormError(err instanceof Error ? err.message : "The invoice could not be created."),
  });

  const cancelMutation = useMutation({
    mutationFn: (invoiceId: string) => cancel({ data: { invoiceId } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["merchant"] }),
  });

  return (
    <DashboardShell
      title="Invoices"
      description="Payment requests sent to the hosted checkout. Each invoice gets a unique deposit address."
      actions={
        <>
          <button
            type="button"
            onClick={() => downloadCsv("invoices.csv", query.data ?? [])}
            className="rounded-xl border border-border px-3 py-2 text-sm font-medium"
          >
      <div className="mb-4">
        <VerificationGate feature="Creating invoices">{null}</VerificationGate>
      </div>
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground"
          >
            {showForm ? "Close" : "New invoice"}
          </button>
        </>
      }
    >
      {lastLink ? (
        <div className="mb-4 rounded-xl border border-border bg-muted/40 p-3 text-sm">
          <p className="font-medium">Checkout link ready</p>
          <code className="mt-1 block break-all text-xs text-muted-foreground">{lastLink}</code>
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(lastLink)}
            className="mt-2 rounded-lg border border-border px-2.5 py-1 text-xs"
          >
            Copy link
          </button>
        </div>
      ) : null}

      {showForm ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFormError("");
            createMutation.mutate();
          }}
          className="mb-5 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2"
        >
          {formError ? (
            <p className="sm:col-span-2 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
              {formError}
            </p>
          ) : null}
          <Field
            label="Product or service"
            hint="Shown to the buyer on the checkout page."
            value={form.productName}
            onChange={(v) => setForm((f) => ({ ...f, productName: v }))}
            placeholder="Pro plan — 12 months"
            required
          />
          <Field
            label="Amount (USD)"
            hint="Converted to the crypto asset the buyer picks."
            value={form.amountUsd}
            onChange={(v) => setForm((f) => ({ ...f, amountUsd: v }))}
            placeholder="149.00"
            type="number"
            required
          />
          <Field
            label="Customer email"
            hint="Optional. Used for the payment receipt only."
            value={form.customerEmail}
            onChange={(v) => setForm((f) => ({ ...f, customerEmail: v }))}
            placeholder="buyer@example.com"
            type="email"
          />
          <Field
            label="Description"
            hint="Optional line of detail under the product name."
            value={form.description}
            onChange={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder="Annual subscription"
          />
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-60"
            >
              {createMutation.isPending ? "Creating…" : "Create invoice"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order, product or email"
          aria-label="Search invoices"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {INVOICE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
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
          title="No invoices match"
          description="Adjust the filters, or create an invoice to generate a checkout link for a buyer."
        />
      ) : null}

      {query.data && query.data.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Received</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-4 py-2 font-medium">{invoice.order_id}</td>
                  <td className="px-4 py-2 text-muted-foreground">{invoice.product_name}</td>
                  <td className="px-4 py-2">{formatUsd(invoice.amount_usd)}</td>
                  <td className="px-4 py-2">
                    {invoice.asset
                      ? `${formatCrypto(invoice.received_amount)} / ${formatCrypto(invoice.due_amount)} ${invoice.asset}`
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {formatDateTime(invoice.created_at)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        void navigator.clipboard.writeText(
                          `${window.location.origin}/checkout?invoice=${invoice.id}`,
                        )
                      }
                      className="rounded-lg border border-border px-2 py-1 text-xs"
                    >
                      Copy link
                    </button>
                    {invoice.status === "awaiting" || invoice.status === "underpaid" ? (
                      <button
                        type="button"
                        onClick={() => cancelMutation.mutate(invoice.id)}
                        className="ml-2 rounded-lg border border-border px-2 py-1 text-xs text-destructive"
                      >
                        Cancel
                      </button>
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

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        title={hint}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
      />
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
