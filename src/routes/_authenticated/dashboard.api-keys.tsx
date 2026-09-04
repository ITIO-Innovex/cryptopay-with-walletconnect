import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { VerificationGate } from "@/features/merchant/shared/VerificationGate";
import { DashboardShell } from "@/features/merchant/layout/DashboardShell";
import { EmptyState, ErrorState, LoadingState } from "@/features/merchant/shared/PageState";
import { formatDateTime } from "@/features/merchant/shared/format";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
} from "@/features/merchant/api-keys/api-keys.functions";

export const Route = createFileRoute("/_authenticated/dashboard/api-keys")({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const fetchKeys = useServerFn(listApiKeys);
  const create = useServerFn(createApiKey);
  const revoke = useServerFn(revokeApiKey);
  const queryClient = useQueryClient();

  const [label, setLabel] = useState("");
  const [freshSecret, setFreshSecret] = useState<string | null>(null);
  const [error, setError] = useState("");

  const query = useQuery({ queryKey: ["merchant", "api-keys"], queryFn: () => fetchKeys() });
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["merchant"] });

  const createMutation = useMutation({
    mutationFn: () => create({ data: { label } }),
    onSuccess: (key) => {
      setFreshSecret(key.secret);
      setLabel("");
      invalidate();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "The key could not be created."),
  });

  const origin = typeof window === "undefined" ? "https://cryptope.net" : window.location.origin;

  return (
    <DashboardShell
      title="API keys"
      description="Use the secret key to create invoices from your server. The public key identifies you on the checkout page."
    >
      <div className="mb-4">
        <VerificationGate feature="Creating API keys">{null}</VerificationGate>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          createMutation.mutate();
        }}
        className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4"
      >
        <div className="grow">
          <label htmlFor="keyLabel" className="text-sm font-medium">
            Key label
          </label>
          <input
            id="keyLabel"
            value={label}
            required
            title="A name so you can tell your keys apart, e.g. 'Production store'."
            placeholder="Production store"
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Used only in this dashboard so you can identify the key later.
          </p>
        </div>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-60"
        >
          {createMutation.isPending ? "Creating…" : "Create key"}
        </button>
      </form>

      {error ? (
        <p className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      ) : null}

      {freshSecret ? (
        <div className="mb-5 rounded-2xl border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium">Copy your secret key now</p>
          <p className="text-muted-foreground">
            This is the only time it is shown. Store it in your server environment.
          </p>
          <code className="mt-2 block break-all rounded-lg bg-background p-2 text-xs">
            {freshSecret}
          </code>
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(freshSecret)}
            className="mt-2 rounded-lg border border-border px-2.5 py-1 text-xs"
          >
            Copy secret
          </button>
        </div>
      ) : null}

      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : null}
      {query.data && query.data.length === 0 ? (
        <EmptyState title="No API keys" description="Create a key to start generating invoices from your server." />
      ) : null}

      {query.data && query.data.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Label</th>
                <th className="px-4 py-2">Public key</th>
                <th className="px-4 py-2">Secret</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data.map((key) => (
                <tr key={key.id} className={key.is_active ? "" : "opacity-60"}>
                  <td className="px-4 py-2">{key.label}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{key.public_key}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{key.secret_preview}</td>
                  <td className="px-4 py-2 text-muted-foreground">{formatDateTime(key.created_at)}</td>
                  <td className="px-4 py-2 text-right">
                    {key.is_active ? (
                      <button
                        type="button"
                        onClick={() => void revoke({ data: { keyId: key.id } }).then(invalidate)}
                        className="rounded-lg border border-border px-2 py-1 text-xs text-destructive"
                      >
                        Revoke
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Revoked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <section className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm">
        <h2 className="font-semibold">Create an invoice from your server</h2>
        <p className="mt-1 text-muted-foreground">
          Send the request below and redirect the buyer to the returned checkout URL.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-background p-3 text-xs">{`curl -X POST ${origin}/api/public/v1/invoices \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "product_name": "Pro plan",
    "amount_usd": 149,
    "customer_email": "buyer@example.com",
    "redirect_url": "https://yourstore.com/thanks"
  }'`}</pre>
      </section>
    </DashboardShell>
  );
}
