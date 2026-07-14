import { useState } from "react";
import { AlertCircle, Check, ChevronDown, ChevronUp, Copy, QrCode } from "lucide-react";
import type { CryptoCurrency, CryptoNetwork } from "@/data/cryptocurrencies";
import { MOCK_DEPOSIT_ADDRESS } from "@/data/cryptocurrencies";
import { formatAmount } from "@/lib/payment";
import { CountdownRing } from "./CountdownRing";
import { PaymentQr, type QrMode } from "./PaymentQr";
import { ExplorerHashes } from "./ExplorerHashes";
import { StatusCheckButton } from "./StatusCheckButton";

interface PaymentProcessingProps {
  currency: CryptoCurrency;
  network: CryptoNetwork;
  /** Remaining crypto amount still owed. */
  remaining: number;
  secondsLeft: number;
  /** Total length of the payment window in seconds. */
  windowSeconds: number;
  /** Hashes of the partial transfers received so far. */
  txHashes: string[];
  /** True when the payment window has elapsed. */
  expired?: boolean;
  /** Opens the report-a-problem dialog. */
  onReport: () => void;
}

/**
 * Shown when a buyer underpays — mirrors the gateway "payment processing"
 * state with the shortfall warning, a QR for the remaining amount and the
 * collapsible payment details panel.
 */
export function PaymentProcessing({
  currency,
  network,
  remaining,
  secondsLeft,
  windowSeconds,
  txHashes,
  expired,
  onReport,
}: PaymentProcessingProps) {
  const remainingLabel = formatAmount(remaining);
  const [qrMode, setQrMode] = useState<QrMode>("amount");
  const [copied, setCopied] = useState<"amount" | "address" | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const copy = async (value: string, key: "amount" | "address") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Payment processing
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            We are currently processing your payment. It may take a few minutes to complete. Thank
            you for your patience.
          </p>
        </div>
        <CountdownRing secondsLeft={secondsLeft} total={windowSeconds} />
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-destructive/50 bg-destructive/5 px-4 py-4 text-sm">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <p className="text-muted-foreground">
          Your payment was insufficient. To complete this order, please send the remaining amount:{" "}
          <span className="font-bold text-foreground">
            {remainingLabel} {currency.symbol}
          </span>
        </p>
      </div>

      <div className="border-t border-border pt-6">
        <PaymentQr
          address={MOCK_DEPOSIT_ADDRESS}
          amount={remainingLabel}
          currency={currency}
          network={network}
          mode={qrMode}
          onModeChange={setQrMode}
        />
      </div>

      <div className="border-t border-border pt-6">
        <button
          type="button"
          onClick={() => setDetailsOpen((o) => !o)}
          className="flex w-full items-center justify-between"
          aria-expanded={detailsOpen}
        >
          <span className="text-base font-semibold text-foreground">Payment details</span>
          {detailsOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {detailsOpen && (
          <>
            <div className="mt-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-destructive">Amount left to pay</p>
                  <p className="mt-1 text-lg font-semibold text-destructive">
                    {remainingLabel} {currency.symbol}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Network: {network.name} · {network.standard}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => copy(remainingLabel, "amount")}
                    aria-label="Copy amount"
                    className="transition-colors hover:text-foreground"
                  >
                    {copied === "amount" ? (
                      <Check className="h-5 w-5 text-brand" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrMode("amount")}
                    aria-label="Show QR with amount"
                    className="transition-colors hover:text-foreground"
                  >
                    <QrCode className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="mt-1 break-all text-lg font-semibold text-foreground">
                    {MOCK_DEPOSIT_ADDRESS}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => copy(MOCK_DEPOSIT_ADDRESS, "address")}
                    aria-label="Copy address"
                    className="transition-colors hover:text-foreground"
                  >
                    {copied === "address" ? (
                      <Check className="h-5 w-5 text-brand" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrMode("address")}
                    aria-label="Show QR for address"
                    className="transition-colors hover:text-foreground"
                  >
                    <QrCode className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-warning/60 bg-warning/5 px-4 py-4 text-sm text-foreground">
              <p className="font-bold">Important notes:</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  <span className="font-bold">NOTE:</span> {network.name}-based smart contract
                  payments are not accepted. Send as an ordinary transfer only!
                </li>
                <li>
                  Only send{" "}
                  <span className="font-bold">
                    {currency.symbol} {currency.name}
                  </span>{" "}
                  to this address from{" "}
                  <span className="font-bold">
                    {network.name} network ({network.standard})
                  </span>
                </li>
                <li>
                  You need to send <span className="font-bold">exactly the same amount</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {expired ? (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/50 bg-destructive/5 px-4 py-4 text-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p className="text-muted-foreground">
            <span className="font-bold text-foreground">The payment window has closed</span> before
            the full amount arrived. Don&apos;t send more funds now — report this below and our team
            will reconcile what was received.
          </p>
        </div>
      ) : (
        <StatusCheckButton resultMessage="We've received a partial payment. Send the remaining amount above, then check again — confirmations can take a few minutes." />
      )}

      <button
        type="button"
        onClick={onReport}
        className="w-full text-center text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        Report a problem with this payment
      </button>

      <ExplorerHashes networkName={network.name} hashes={txHashes} />
    </div>
  );
}
