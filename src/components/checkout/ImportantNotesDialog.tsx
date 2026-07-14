import { X } from "lucide-react";
import type { CryptoCurrency, CryptoNetwork } from "@/data/cryptocurrencies";

interface ImportantNotesDialogProps {
  open: boolean;
  currency: CryptoCurrency;
  network: CryptoNetwork;
  onClose: () => void;
}

/**
 * Modal repeating the deposit safety notes; shown via the info button on the
 * send-funds step.
 */
export function ImportantNotesDialog({
  open,
  currency,
  network,
  onClose,
}: ImportantNotesDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Important notes"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-card p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-foreground">Important notes</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm text-foreground">
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
          <li>
            Transfer of another currency is <span className="font-bold">unrecoverable</span>
          </li>
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          I understand
        </button>
      </div>
    </div>
  );
}
