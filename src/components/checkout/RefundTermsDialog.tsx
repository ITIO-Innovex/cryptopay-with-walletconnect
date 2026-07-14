import { X } from "lucide-react";

interface RefundTermsDialogProps {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}

/**
 * Refund terms shown before the buyer confirms a return of an overpayment.
 * Explains that the refund goes to the same token, that fees are deducted and
 * that there is a network minimum below which a refund cannot be sent.
 */
export function RefundTermsDialog({ open, onAccept, onClose }: RefundTermsDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Refund terms"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-card p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-foreground">Refund terms</h3>
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
            Refunds are returned in the{" "}
            <span className="font-bold">same token you sent</span>. A different token cannot be
            returned.
          </li>
          <li>
            A <span className="font-bold">network fee</span> (the on-chain cost to send) and a{" "}
            <span className="font-bold">platform fee</span> are deducted from the amount before it is
            returned.
          </li>
          <li>
            The final payout must be above the{" "}
            <span className="font-bold">minimum amount the network can send</span>. If it is lower,
            the refund cannot be processed.
          </li>
          <li>
            Refund requests are <span className="font-bold">reviewed manually</span> and processed
            within <span className="font-bold">48 hours</span>.
          </li>
          <li>
            Double-check the destination address. Transfers to an incorrect address are{" "}
            <span className="font-bold">unrecoverable</span>.
          </li>
        </ul>

        <button
          type="button"
          onClick={onAccept}
          className="mt-6 h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          I understand
        </button>
      </div>
    </div>
  );
}
