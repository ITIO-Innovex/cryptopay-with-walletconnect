import { useState } from "react";
import { FlaskConical, X } from "lucide-react";
import { formatAmount, type PaymentStatus } from "@/lib/payment";

interface SimulationPanelProps {
  /** Crypto amount owed for the order. */
  due: number;
  symbol: string;
  /** Total received so far. */
  received: number;
  status: PaymentStatus;
  /** Adds a received transfer of the given amount. */
  onReceive: (amount: number) => void;
  /** Clears all simulated transfers. */
  onReset: () => void;
}

/**
 * Developer/test panel for simulating crypto deposits. It floats outside the
 * checkout design and lets you enter a received amount to drive the
 * underpaid / exact / overpaid outcomes without touching the gateway.
 */
export function SimulationPanel({
  due,
  symbol,
  received,
  status,
  onReceive,
  onReset,
}: SimulationPanelProps) {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState("");

  const remaining = Math.max(0, due - received);

  const submit = () => {
    const amount = parseFloat(value);
    if (!Number.isFinite(amount) || amount <= 0) return;
    onReceive(amount);
    setValue("");
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-bar transition-opacity hover:opacity-90 sm:bottom-6"
        aria-label="Open payment simulator"
      >
        <FlaskConical className="h-5 w-5" />
      </button>
    );
  }

  const statusLabel: Record<PaymentStatus, string> = {
    awaiting: "Awaiting payment",
    insufficient: "Insufficient — underpaid",
    completed: "Completed — exact",
    overpaid: "Overpaid — refund due",
  };

  return (
    <aside className="fixed bottom-24 right-4 z-30 w-[290px] rounded-2xl border border-border bg-card p-4 shadow-bar sm:bottom-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FlaskConical className="h-4 w-4 text-brand" />
          Payment simulator
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close simulator"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Simulate a crypto deposit to test under/over-payment handling.
      </p>

      <dl className="mt-3 space-y-1 rounded-xl bg-muted px-3 py-2.5 text-xs">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Amount due</dt>
          <dd className="font-medium text-foreground">
            {formatAmount(due)} {symbol}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Received</dt>
          <dd className="font-medium text-foreground">
            {formatAmount(received)} {symbol}
          </dd>
        </div>
        {remaining > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Remaining</dt>
            <dd className="font-medium text-destructive">
              {formatAmount(remaining)} {symbol}
            </dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border/60 pt-1">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="font-semibold text-foreground">{statusLabel[status]}</dd>
        </div>
      </dl>

      <div className="mt-3">
        <label htmlFor="sim-amount" className="block text-xs font-medium text-foreground">
          Amount received ({symbol})
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="sim-amount"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="e.g. 12.94"
            className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <button
            type="button"
            onClick={submit}
            className="shrink-0 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Send
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <QuickButton label="Underpay" onClick={() => onReceive(due * 0.8)} />
        <QuickButton label="Exact" onClick={() => onReceive(remaining > 0 ? remaining : due)} />
        <QuickButton label="Overpay" onClick={() => onReceive(due * 1.15)} />
      </div>

      {received > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="mt-3 w-full rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Reset simulation
        </button>
      )}
    </aside>
  );
}

function QuickButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
    </button>
  );
}
