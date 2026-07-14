import { useState } from "react";
import { AlertCircle, ArrowLeft, Check, Copy, QrCode } from "lucide-react";
import type { CryptoCurrency, CryptoNetwork } from "@/data/cryptocurrencies";
import { MOCK_DEPOSIT_ADDRESS } from "@/data/cryptocurrencies";
import { CountdownRing } from "./CountdownRing";
import { PaymentQr, type QrMode } from "./PaymentQr";
import { StatusCheckButton } from "./StatusCheckButton";

interface SendFundsProps {
  currency: CryptoCurrency;
  network: CryptoNetwork;
  amount: string;
  /** Fiat-equivalent label for the order total, e.g. "14 USD". */
  usdLabel: string;
  /** Seconds remaining before the payment window expires. */
  secondsLeft: number;
  /** Total length of the payment window in seconds. */
  windowSeconds: number;
  /** True when the payment window has elapsed. */
  expired?: boolean;
  onBack: () => void;
  /** Opens the report-a-problem dialog. */
  onReport: () => void;
}

/**
 * Step 3 — deposit instructions: QR code, payable amount, address and the
 * full list of safety notes, plus an expiry countdown.
 */
export function SendFunds({
  currency,
  network,
  amount,
  usdLabel,
  secondsLeft,
  windowSeconds,
  expired,
  onBack,
  onReport,
}: SendFundsProps) {
  const [qrMode, setQrMode] = useState<QrMode>("address");
  const [copied, setCopied] = useState<"amount" | "address" | null>(null);

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
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="mt-1 text-brand transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Send funds to the address below
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Please send funds to the specified address or use QR code for a deposit. Transfer of
              another currency is unrecoverable.
            </p>
          </div>
        </div>
        <CountdownRing secondsLeft={secondsLeft} total={windowSeconds} />
      </div>

      <div className="border-t border-border pt-6">
        <PaymentQr
          address={MOCK_DEPOSIT_ADDRESS}
          amount={amount}
          currency={currency}
          network={network}
          mode={qrMode}
          onModeChange={setQrMode}
        />
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <Field
          label="Amount to pay"
          onCopy={() => copy(amount, "amount")}
          onShowQr={() => setQrMode("amount")}
          copied={copied === "amount"}
        >
          <p className="text-lg font-semibold text-foreground">
            {amount} {currency.symbol}
          </p>
          <p className="text-sm text-muted-foreground">
            ≈ {usdLabel} · Network: {network.name} · {network.standard}
          </p>
        </Field>

        <Field
          label="Address"
          onCopy={() => copy(MOCK_DEPOSIT_ADDRESS, "address")}
          onShowQr={() => setQrMode("address")}
          copied={copied === "address"}
        >
          <p className="break-all text-lg font-semibold text-foreground">{MOCK_DEPOSIT_ADDRESS}</p>
        </Field>
      </div>

      <div className="rounded-2xl border border-warning/60 bg-warning/5 px-4 py-4 text-sm text-foreground">
        <p className="font-bold">Important notes:</p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            <span className="font-bold">NOTE:</span> {network.name}-based smart contract payments are
            not accepted. Send as an ordinary transfer only!
          </li>
          <li>
            Only send <span className="font-bold">{currency.symbol} {currency.name}</span> to this
            address from{" "}
            <span className="font-bold">
              {network.name} network ({network.standard})
            </span>
          </li>
          <li>
            You need to send <span className="font-bold">exactly the same amount</span>
          </li>
          <li>
            If the wallet/exchange you are using <span className="font-bold">charges a fee</span> that
            reduces the total amount that is sent, please send enough to cover it
          </li>
        </ul>
      </div>

      {expired ? (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/50 bg-destructive/5 px-4 py-4 text-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p className="text-muted-foreground">
            <span className="font-bold text-foreground">The payment window has closed.</span> Please
            do not send funds to this address now. Start a new payment, or if you already sent funds,
            report it below so our team can help.
          </p>
        </div>
      ) : (
        <StatusCheckButton resultMessage="No deposit detected yet. If you've already paid, the transaction may still be waiting for network confirmations — check again in a few minutes." />
      )}

      <button
        type="button"
        onClick={onReport}
        className="w-full text-center text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        Report a problem with this payment
      </button>
    </div>
  );
}

function Field({
  label,
  children,
  onCopy,
  onShowQr,
  copied,
}: {
  label: string;
  children: React.ReactNode;
  onCopy: () => void;
  onShowQr: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy ${label.toLowerCase()}`}
          className="transition-colors hover:text-foreground"
        >
          {copied ? <Check className="h-5 w-5 text-brand" /> : <Copy className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={onShowQr}
          aria-label={`Show QR for ${label.toLowerCase()}`}
          className="transition-colors hover:text-foreground"
        >
          <QrCode className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
