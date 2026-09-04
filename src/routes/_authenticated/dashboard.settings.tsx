import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DashboardShell } from "@/features/merchant/layout/DashboardShell";
import { ErrorState, LoadingState } from "@/features/merchant/shared/PageState";
import { PAYOUT_MODES, formatDateTime } from "@/features/merchant/shared/format";
import {
  getMerchantSettings,
  removeWebhookEndpoint,
  saveWebhookEndpoint,
  updateCompanyProfile,
  updatePayoutSettings,
} from "@/features/merchant/settings/settings.functions";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const fetchSettings = useServerFn(getMerchantSettings);
  const savePayout = useServerFn(updatePayoutSettings);
  const saveProfile = useServerFn(updateCompanyProfile);
  const saveWebhook = useServerFn(saveWebhookEndpoint);
  const deleteWebhook = useServerFn(removeWebhookEndpoint);
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: ["merchant", "settings"], queryFn: () => fetchSettings() });
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["merchant"] });

  const [company, setCompany] = useState({ companyName: "", businessEmail: "", website: "", contactPhone: "" });
  const [payout, setPayout] = useState({ mode: "daily", minPayoutUsd: "0", autoRefund: true, email: "" });
  const [webhookUrl, setWebhookUrl] = useState("");
  const [signingSecret, setSigningSecret] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!query.data) return;
    setCompany({
      companyName: query.data.account?.company_name ?? "",
      businessEmail: query.data.account?.business_email ?? "",
      website: query.data.profile?.website ?? "",
      contactPhone: query.data.profile?.contact_phone ?? "",
    });
    if (query.data.payout) {
      setPayout({
        mode: query.data.payout.mode,
        minPayoutUsd: String(query.data.payout.min_payout_usd),
        autoRefund: query.data.payout.auto_refund_overpayment,
        email: query.data.payout.notification_email ?? "",
      });
    }
  }, [query.data]);

  const profileMutation = useMutation({
    mutationFn: () =>
      saveProfile({
        data: {
          companyName: company.companyName,
          businessEmail: company.businessEmail || undefined,
          website: company.website || undefined,
          contactPhone: company.contactPhone || undefined,
        },
      }),
    onSuccess: () => {
      setNotice("Business details saved.");
      invalidate();
    },
  });

  const payoutMutation = useMutation({
    mutationFn: () =>
      savePayout({
        data: {
          mode: payout.mode as "instant" | "hourly" | "daily" | "manual",
          minPayoutUsd: Number(payout.minPayoutUsd) || 0,
          autoRefundOverpayment: payout.autoRefund,
          notificationEmail: payout.email || undefined,
        },
      }),
    onSuccess: () => {
      setNotice("Payout schedule saved.");
      invalidate();
    },
  });

  const webhookMutation = useMutation({
    mutationFn: () => saveWebhook({ data: { url: webhookUrl, enabled: true } }),
    onSuccess: (result) => {
      setSigningSecret(result.signingSecret);
      setWebhookUrl("");
      invalidate();
    },
  });

  return (
    <DashboardShell
      title="Settings"
      description="Business details, how often you are paid out, and where payment events are delivered."
    >
      {notice ? (
        <p className="mb-4 rounded-xl border border-border bg-muted/40 p-3 text-sm">{notice}</p>
      ) : null}
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : null}

      {query.data ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              profileMutation.mutate();
            }}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <h2 className="text-sm font-semibold">Business details</h2>
            <div className="mt-3 space-y-3">
              <TextField
                id="companyName"
                label="Company name"
                hint="Shown to buyers on the hosted checkout page."
                value={company.companyName}
                onChange={(v) => setCompany((c) => ({ ...c, companyName: v }))}
              />
              <TextField
                id="businessEmail"
                label="Business email"
                hint="Where we send account and settlement notices."
                type="email"
                value={company.businessEmail}
                onChange={(v) => setCompany((c) => ({ ...c, businessEmail: v }))}
              />
              <TextField
                id="website"
                label="Website"
                hint="The store or product this account is used for."
                value={company.website}
                onChange={(v) => setCompany((c) => ({ ...c, website: v }))}
              />
              <TextField
                id="contactPhone"
                label="Contact phone"
                hint="Used only if we need to reach you about your account."
                value={company.contactPhone}
                onChange={(v) => setCompany((c) => ({ ...c, contactPhone: v }))}
              />
            </div>
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="mt-4 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-60"
            >
              Save business details
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Terminal number {query.data.account?.terno} · account status{" "}
              {query.data.account?.status}
            </p>
          </form>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              payoutMutation.mutate();
            }}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <h2 className="text-sm font-semibold">Payout schedule</h2>
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="payoutMode" className="text-sm font-medium">
                  When should we pay you?
                </label>
                <select
                  id="payoutMode"
                  value={payout.mode}
                  title="Instant sends after each paid invoice; batches group payments to save network fees."
                  onChange={(e) => setPayout((p) => ({ ...p, mode: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                >
                  {PAYOUT_MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Batching fewer, larger payouts reduces the network fee you pay.
                </p>
              </div>
              <TextField
                id="minPayoutUsd"
                label="Minimum payout (USD)"
                hint="Balances below this are held until the next run."
                type="number"
                value={payout.minPayoutUsd}
                onChange={(v) => setPayout((p) => ({ ...p, minPayoutUsd: v }))}
              />
              <TextField
                id="payoutEmail"
                label="Settlement notification email"
                hint="Optional address that receives a note for each payout."
                type="email"
                value={payout.email}
                onChange={(v) => setPayout((p) => ({ ...p, email: v }))}
              />
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={payout.autoRefund}
                  onChange={(e) => setPayout((p) => ({ ...p, autoRefund: e.target.checked }))}
                  className="mt-1"
                />
                <span>
                  Offer automatic overpayment returns
                  <span className="block text-xs text-muted-foreground">
                    Buyers who overpay are offered a return, minus network and platform fees.
                  </span>
                </span>
              </label>
            </div>
            <button
              type="submit"
              disabled={payoutMutation.isPending}
              className="mt-4 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-60"
            >
              Save payout schedule
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Next scheduled run: {formatDateTime(query.data.payout?.next_run_at)}
            </p>
          </form>

          <section className="rounded-2xl border border-border bg-card p-4 lg:col-span-2">
            <h2 className="text-sm font-semibold">Webhooks</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              We POST signed payment events to your endpoint. Verify the
              <code className="mx-1">X-Cryptope-Signature</code> header with your signing secret.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                webhookMutation.mutate();
              }}
              className="mt-3 flex flex-wrap items-end gap-3"
            >
              <div className="grow">
                <label htmlFor="webhookUrl" className="text-sm font-medium">
                  Endpoint URL
                </label>
                <input
                  id="webhookUrl"
                  type="url"
                  required
                  value={webhookUrl}
                  title="An HTTPS URL on your server that accepts POST requests."
                  placeholder="https://yourstore.com/webhooks/cryptope"
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Must be reachable over HTTPS and respond within a few seconds.
                </p>
              </div>
              <button
                type="submit"
                disabled={webhookMutation.isPending}
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-60"
              >
                Add endpoint
              </button>
            </form>

            {signingSecret ? (
              <div className="mt-3 rounded-xl bg-muted/40 p-3 text-xs">
                <p className="font-medium">Signing secret (shown once)</p>
                <code className="mt-1 block break-all">{signingSecret}</code>
              </div>
            ) : null}

            {query.data.endpoints.length > 0 ? (
              <ul className="mt-4 divide-y divide-border text-sm">
                {query.data.endpoints.map((endpoint) => (
                  <li key={endpoint.id} className="flex items-center gap-3 py-2">
                    <span className="break-all">{endpoint.url}</span>
                    <button
                      type="button"
                      onClick={() =>
                        void deleteWebhook({ data: { endpointId: endpoint.id } }).then(invalidate)
                      }
                      className="ml-auto rounded-lg border border-border px-2 py-1 text-xs text-destructive"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No endpoints configured yet.</p>
            )}

            {query.data.deliveries.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Recent deliveries
                </h3>
                <ul className="mt-2 divide-y divide-border text-sm">
                  {query.data.deliveries.map((delivery) => (
                    <li key={delivery.id} className="flex flex-wrap items-center gap-3 py-2">
                      <span className="font-medium">{delivery.event}</span>
                      <span className="text-muted-foreground">
                        {delivery.status_code ?? "no response"}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {formatDateTime(delivery.delivered_at ?? delivery.created_at)}
                      </span>
                      {delivery.error_message ? (
                        <span className="w-full text-xs text-destructive">
                          {delivery.error_message}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </DashboardShell>
  );
}

function TextField({
  id,
  label,
  hint,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        title={hint}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
      />
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
