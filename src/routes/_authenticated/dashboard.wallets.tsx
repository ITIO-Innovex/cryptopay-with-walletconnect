import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DashboardShell } from "@/features/merchant/layout/DashboardShell";
import { EmptyState, ErrorState, LoadingState } from "@/features/merchant/shared/PageState";
import { formatDateTime, shortenMiddle } from "@/features/merchant/shared/format";
import {
  addWallet,
  listWallets,
  removeWallet,
  setDefaultWallet,
} from "@/features/merchant/wallets/wallets.functions";
import { CRYPTO_CURRENCIES } from "@/data/cryptocurrencies";

export const Route = createFileRoute("/_authenticated/dashboard/wallets")({
  component: WalletsPage,
});

function WalletsPage() {
  const fetchWallets = useServerFn(listWallets);
  const add = useServerFn(addWallet);
  const setDefault = useServerFn(setDefaultWallet);
  const remove = useServerFn(removeWallet);
  const queryClient = useQueryClient();

  const [asset, setAsset] = useState(CRYPTO_CURRENCIES[0]?.symbol ?? "USDT");
  const [network, setNetwork] = useState(CRYPTO_CURRENCIES[0]?.networks[0]?.name ?? "Tron");
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  const networksForAsset =
    CRYPTO_CURRENCIES.find((c) => c.symbol === asset)?.networks.map((n) => n.name) ?? [];

  const query = useQuery({ queryKey: ["merchant", "wallets"], queryFn: () => fetchWallets() });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["merchant"] });

  const addMutation = useMutation({
    mutationFn: () =>
      add({ data: { asset, network, address, label: label || undefined, makeDefault: true } }),
    onSuccess: () => {
      setAddress("");
      setLabel("");
      invalidate();
    },
    onError: (err) =>
      setError(err instanceof Error ? err.message : "The wallet could not be saved."),
  });

  return (
    <DashboardShell
      title="Payout wallets"
      description="Where settled funds are sent. One default wallet per asset and network is used for every batch."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          addMutation.mutate();
        }}
        className="mb-5 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-4"
      >
        {error ? (
          <p className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive sm:col-span-4">
            {error}
          </p>
        ) : null}
        <div>
          <label htmlFor="walletAsset" className="text-sm font-medium">
            Asset
          </label>
          <select
            id="walletAsset"
            value={asset}
            title="The token this wallet receives."
            onChange={(e) => {
              setAsset(e.target.value);
              const first = CRYPTO_CURRENCIES.find((c) => c.symbol === e.target.value)?.networks[0];
              if (first) setNetwork(first.name);
            }}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            {CRYPTO_CURRENCIES.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">The token this wallet receives.</p>
        </div>
        <div>
          <label htmlFor="walletNetwork" className="text-sm font-medium">
            Network
          </label>
          <select
            id="walletNetwork"
            value={network}
            title="Funds sent on the wrong network cannot be recovered."
            onChange={(e) => setNetwork(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            {networksForAsset.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            Must match the network your wallet supports.
          </p>
        </div>
        <div>
          <label htmlFor="walletAddress" className="text-sm font-medium">
            Wallet address
          </label>
          <input
            id="walletAddress"
            value={address}
            required
            title="Settled funds are sent to this address. Double-check it."
            placeholder="Paste your receiving address"
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            A wrong address means the funds are lost permanently.
          </p>
        </div>
        <div>
          <label htmlFor="walletLabel" className="text-sm font-medium">
            Label
          </label>
          <input
            id="walletLabel"
            value={label}
            title="Optional name so you can tell wallets apart."
            placeholder="Treasury"
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">Optional, for your reference.</p>
        </div>
        <div className="sm:col-span-4">
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-60"
          >
            {addMutation.isPending ? "Saving…" : "Add wallet"}
          </button>
        </div>
      </form>

      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : null}
      {query.data && query.data.filter((w) => w.is_active).length === 0 ? (
        <EmptyState
          title="No payout wallet yet"
          description="Add a wallet for each asset you accept. Settlements fail until a matching wallet exists."
        />
      ) : null}

      {query.data && query.data.some((w) => w.is_active) ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Label</th>
                <th className="px-4 py-2">Asset</th>
                <th className="px-4 py-2">Address</th>
                <th className="px-4 py-2">Added</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.data
                .filter((w) => w.is_active)
                .map((wallet) => (
                  <tr key={wallet.id}>
                    <td className="px-4 py-2">
                      {wallet.label || "—"}
                      {wallet.is_default ? (
                        <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600">
                          Default
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2">
                      {wallet.asset}
                      <span className="ml-1 text-xs text-muted-foreground">{wallet.network}</span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {shortenMiddle(wallet.address, 10, 8)}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {formatDateTime(wallet.created_at)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {!wallet.is_default ? (
                        <button
                          type="button"
                          onClick={() =>
                            void setDefault({ data: { walletId: wallet.id } }).then(invalidate)
                          }
                          className="rounded-lg border border-border px-2 py-1 text-xs"
                        >
                          Make default
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void remove({ data: { walletId: wallet.id } }).then(invalidate)}
                        className="ml-2 rounded-lg border border-border px-2 py-1 text-xs text-destructive"
                      >
                        Remove
                      </button>
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
