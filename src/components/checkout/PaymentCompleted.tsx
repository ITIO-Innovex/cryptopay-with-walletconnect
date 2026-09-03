import { useState } from "react";
import { AlertCircle, Check, CheckCircle2, Copy, Wallet } from "lucide-react";
import type { CryptoCurrency, CryptoNetwork } from "@/data/cryptocurrencies";
import { formatAmount, shortenMiddle } from "@/lib/payment";
import { ExplorerHashes } from "./ExplorerHashes";
import { RefundTermsDialog } from "./RefundTermsDialog";
import { ConfirmRefundDialog } from "./ConfirmRefundDialog";

interface PaymentCompletedProps {
  currency: CryptoCurrency;
  network: CryptoNetwork;
  /** Issued deposit address from the backend. */
  depositAddress: string;
  /** Total crypto amount received. */
  received: number;
  /** Extra amount overpaid (0 when exact). */
  extra: number;
  /** Wallet address the payment was sent from (default refund destination). */
  senderAddress: string;
  orderId: string;
  email: string;
  txHashes: string[];
  /** Which flow produced the deposit — WalletConnect signing vs manual send. */
  paymentMethod?: "wallet_connect" | "manual" | null;
  /** Opens the report-a-problem dialog. */
  onReport: () => void;
  /** Returns the buyer to the merchant store. */
  onReturnToMerchant: () => void;
}

/**
 * Success screen shown when the full amount (or more) has been received.
 * When the buyer overpaid, a guided refund flow is surfaced: refund terms →
 * confirmation with the sender's token/network/address prefilled, fee
 * breakdown and a network-minimum payout check.
 */
export function PaymentCompleted({
  currency,
  network,
  depositAddress,
  received,
  extra,
  senderAddress,
  orderId,
  email,
  txHashes,
  paymentMethod,
  onReport,
  onReturnToMerchant,
}: PaymentCompletedProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isOverpaid = extra > 0;

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const rows: { label: string; value: string; copyValue: string }[] = [
    {
      label: "Amount",
      value: `${formatAmount(received)} ${currency.symbol}`,
      copyValue: formatAmount(received),
    },
    {
      label: "Address",
      value: shortenMiddle(depositAddress),
      copyValue: depositAddress,
    },
    { label: "Currency", value: `${currency.symbol} · ${currency.name}`, copyValue: currency.symbol },
    {
      label: "Network",
      value: `${network.name} · ${network.standard}`,
      copyValue: network.name,
    },
    { label: "Order ID", value: shortenMiddle(orderId, 6, 8), copyValue: orderId },
  ];

  const methodLabel =
    paymentMethod === "wallet_connect"
      ? "WalletConnect"
      : paymentMethod === "manual"
        ? "Manual transfer"
        : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="h-16 w-16 text-brand" strokeWidth={1.5} />
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
          Payment completed
        </h2>
        {methodLabel && (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/5 px-3 py-1 text-xs font-medium text-brand">
            <Wallet className="h-3.5 w-3.5" />
            Paid via {methodLabel}
          </span>
        )}
      </div>

      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3 text-sm">
            <dt className="shrink-0 text-muted-foreground">{row.label}</dt>
            <span className="h-px flex-1 border-b border-dashed border-border" />
            <dd className="flex items-center gap-2 font-medium text-foreground">
              <span>{row.value}</span>
              <button
                type="button"
                onClick={() => copy(row.copyValue, row.label)}
                aria-label={`Copy ${row.label.toLowerCase()}`}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {copied === row.label ? (
                  <Check className="h-4 w-4 text-brand" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </dd>
          </div>
        ))}
      </dl>

      {/* Overpayment refund flow */}
      {isOverpaid && (
        <div className="rounded-2xl border border-warning/60 bg-warning/5 px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning-foreground" />
            <div className="text-sm">
              <p className="font-bold text-foreground">Overpayment detected</p>
              <p className="mt-1 text-muted-foreground">
                You sent{" "}
                <span className="font-bold text-foreground">
                  {formatAmount(extra)} {currency.symbol}
                </span>{" "}
                more than required. We can return the extra to the wallet you paid from.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="mt-4 h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Return the extra payment
          </button>
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="mt-2 w-full text-center text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            View refund terms
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onReturnToMerchant}
        className="h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Back to the store
      </button>

      {!isOverpaid && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/60 bg-warning/5 px-4 py-4 text-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning-foreground" />
          <p className="text-muted-foreground">
            <span className="font-bold text-foreground">Attention</span>: Do not send more funds! Any
            additional transfers to the same address will not be accepted and might result in a loss.
          </p>
        </div>
      )}

      <ExplorerHashes networkName={network.name} hashes={txHashes} />

      <button
        type="button"
        onClick={onReport}
        className="w-full text-center text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        Report a problem with this payment
      </button>

      <div className="border-t border-border pt-6">
        <p className="text-base font-semibold text-foreground">Transaction details sent to:</p>
        <p className="mt-2 text-sm text-muted-foreground">{email}</p>
      </div>

      <RefundTermsDialog
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={() => {
          setTermsOpen(false);
          setConfirmOpen(true);
        }}
      />

      <ConfirmRefundDialog
        open={confirmOpen}
        currency={currency}
        senderNetwork={network}
        senderAddress={senderAddress}
        extra={extra}
        onClose={() => setConfirmOpen(false)}
        onReturnToMerchant={() => {
          setConfirmOpen(false);
          onReturnToMerchant();
        }}
      />
    </div>
  );
}
