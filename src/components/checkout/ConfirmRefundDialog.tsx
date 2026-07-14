import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Lock, Pencil, X } from "lucide-react";
import type { CryptoCurrency, CryptoNetwork } from "@/data/cryptocurrencies";
import { computeRefund } from "@/data/refund-economics";
import { formatAmount, shortenMiddle } from "@/lib/payment";

interface ConfirmRefundDialogProps {
  open: boolean;
  currency: CryptoCurrency;
  /** Network the original payment was received on (default refund network). */
  senderNetwork: CryptoNetwork;
  /** Address the original payment came from (default refund address). */
  senderAddress: string;
  /** Overpaid amount to be returned, in token units. */
  extra: number;
  onClose: () => void;
  onReturnToMerchant: () => void;
}

type Phase = "confirm" | "submitted" | "below-minimum";

/**
 * Confirmation step for returning an overpayment. The token, network and
 * address are prefilled from the original (sender's) transaction. The token is
 * locked; the network can only be changed for multi-network tokens (USDT); the
 * address is always editable. Network + platform fees are deducted and the
 * payout is checked against the network minimum before the refund proceeds.
 */
export function ConfirmRefundDialog({
  open,
  currency,
  senderNetwork,
  senderAddress,
  extra,
  onClose,
  onReturnToMerchant,
}: ConfirmRefundDialogProps) {
  const [network, setNetwork] = useState<CryptoNetwork>(senderNetwork);
  const [address, setAddress] = useState(senderAddress);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState(false);
  const [tokenNote, setTokenNote] = useState(false);
  const [networkNote, setNetworkNote] = useState(false);
  const [phase, setPhase] = useState<Phase>("confirm");

  // USDT is the only multi-network token here; everything else is single-network.
  const canChangeNetwork = currency.symbol === "USDT" && currency.networks.length > 1;

  const breakdown = useMemo(
    () => computeRefund(extra, currency.symbol, network.name),
    [extra, currency.symbol, network.name],
  );

  if (!open) return null;

  const addressValid = address.trim().length >= 8;

  const handleConfirm = () => {
    if (breakdown.belowMinimum) {
      setPhase("below-minimum");
    } else {
      setPhase("submitted");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm refund"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-card p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        {phase === "confirm" && (
          <>
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-foreground">Confirm refund</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll return the extra to the wallet you paid from. Review the details below.
            </p>

            <div className="mt-5 space-y-3">
              {/* Token (locked) */}
              <Row label="Token">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {currency.symbol} · {currency.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTokenNote((v) => !v)}
                    aria-label="Why can't I change the token?"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Lock className="h-4 w-4" />
                  </button>
                </div>
              </Row>
              {tokenNote && (
                <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                  We can only refund in the same token you sent ({currency.symbol}). A different token
                  cannot be returned.
                </p>
              )}

              {/* Network */}
              <Row label="Network">
                {editingNetwork && canChangeNetwork ? (
                  <select
                    value={network.name}
                    onChange={(e) => {
                      const next = currency.networks.find((n) => n.name === e.target.value);
                      if (next) setNetwork(next);
                      setEditingNetwork(false);
                    }}
                    className="rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    {currency.networks.map((n) => (
                      <option key={`${n.name}-${n.standard}`} value={n.name}>
                        {n.name} · {n.standard}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {network.name} · {network.standard}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (canChangeNetwork) {
                          setEditingNetwork(true);
                          setNetworkNote(false);
                        } else {
                          setNetworkNote((v) => !v);
                        }
                      }}
                      aria-label="Change network"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {canChangeNetwork ? (
                        <Pencil className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </Row>
              {networkNote && !canChangeNetwork && (
                <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                  {currency.symbol} only settles on the {network.name} network, so the network cannot
                  be changed.
                </p>
              )}

              {/* Address */}
              <Row label="Address" align="start">
                {editingAddress ? (
                  <input
                    autoFocus
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={() => setEditingAddress(false)}
                    placeholder={`Your ${network.name} ${currency.symbol} address`}
                    className="w-full rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="break-all font-medium text-foreground">
                      {shortenMiddle(address)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingAddress(true)}
                      aria-label="Change address"
                      className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </Row>
            </div>

            {/* Fee breakdown */}
            <dl className="mt-5 space-y-2 rounded-2xl bg-muted px-4 py-3 text-sm">
              <BreakdownRow label="Extra received" value={`${formatAmount(breakdown.extra)} ${currency.symbol}`} />
              <BreakdownRow
                label="Network fee"
                value={`− ${formatAmount(breakdown.networkFee)} ${currency.symbol}`}
                muted
              />
              <BreakdownRow
                label="Platform fee"
                value={`− ${formatAmount(breakdown.platformFee)} ${currency.symbol}`}
                muted
              />
              <div className="flex items-center justify-between border-t border-border/60 pt-2">
                <dt className="font-semibold text-foreground">You receive</dt>
                <dd className="font-semibold text-foreground">
                  {formatAmount(breakdown.payout)} {currency.symbol}
                </dd>
              </div>
            </dl>

            {breakdown.belowMinimum && (
              <div className="mt-3 flex items-start gap-2 rounded-2xl border border-destructive/50 bg-destructive/5 px-3 py-2.5 text-xs text-muted-foreground">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p>
                  After fees, the payout is below the {network.name} minimum of{" "}
                  <span className="font-bold text-foreground">
                    {formatAmount(breakdown.networkMinimum)} {currency.symbol}
                  </span>
                  . This refund cannot be sent.
                </p>
              </div>
            )}

            <button
              type="button"
              disabled={!addressValid}
              onClick={handleConfirm}
              className="mt-6 h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirm refund
            </button>
          </>
        )}

        {phase === "submitted" && (
          <div className="py-2 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-brand" strokeWidth={1.5} />
            <h3 className="mt-4 text-xl font-semibold text-foreground">Refund request received</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your refund of{" "}
              <span className="font-bold text-foreground">
                {formatAmount(breakdown.payout)} {currency.symbol}
              </span>{" "}
              to <span className="break-all font-medium text-foreground">{shortenMiddle(address)}</span>{" "}
              on {network.name} will be reviewed manually and processed within 48 hours.
            </p>
            <button
              type="button"
              onClick={onReturnToMerchant}
              className="mt-6 h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Return to merchant
            </button>
          </div>
        )}

        {phase === "below-minimum" && (
          <div className="py-2 text-center">
            <AlertCircle className="mx-auto h-14 w-14 text-destructive" strokeWidth={1.5} />
            <h3 className="mt-4 text-xl font-semibold text-foreground">Refund not possible</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              After deducting the network and platform fees, the remaining{" "}
              <span className="font-bold text-foreground">
                {formatAmount(breakdown.payout)} {currency.symbol}
              </span>{" "}
              is lower than the minimum the {network.name} network allows to send (
              {formatAmount(breakdown.networkMinimum)} {currency.symbol}). We&apos;re unable to refund
              this amount as per the network&apos;s policy.
            </p>
            <button
              type="button"
              onClick={onReturnToMerchant}
              className="mt-6 h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              I understand — return to merchant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  children,
  align = "center",
}: {
  label: string;
  children: React.ReactNode;
  align?: "center" | "start";
}) {
  return (
    <div className={`flex ${align === "start" ? "items-start" : "items-center"} justify-between gap-4 text-sm`}>
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <div className="min-w-0 text-right">{children}</div>
    </div>
  );
}

function BreakdownRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={muted ? "text-muted-foreground" : "font-medium text-foreground"}>{value}</dd>
    </div>
  );
}
