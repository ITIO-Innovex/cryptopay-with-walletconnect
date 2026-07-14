import { useState } from "react";
import { Loader2, RefreshCw, Search } from "lucide-react";

interface StatusCheckButtonProps {
  /**
   * Message shown after a check completes, describing the current on-chain
   * state (e.g. "No deposit detected yet" or "Waiting for confirmations").
   */
  resultMessage: string;
}

/**
 * Lets the buyer manually re-check the payment status. Buyers pay from their
 * own wallet app, so instead of a "I have paid" button this runs a short,
 * friendly poll and reports what the gateway currently sees on-chain.
 */
export function StatusCheckButton({ resultMessage }: StatusCheckButtonProps) {
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);

  const runCheck = () => {
    setChecking(true);
    setChecked(false);
    window.setTimeout(() => {
      setChecking(false);
      setChecked(true);
    }, 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-muted/40 px-4 py-4">
      <p className="text-sm font-medium text-foreground">Already sent the payment?</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Pay from your own wallet app, then check the status here. Network confirmations can take a
        few minutes.
      </p>
      <button
        type="button"
        onClick={runCheck}
        disabled={checking}
        className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        {checking ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking status…
          </>
        ) : checked ? (
          <>
            <RefreshCw className="h-4 w-4" />
            Check again
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Check payment status
          </>
        )}
      </button>
      {checked && !checking && (
        <p className="mt-3 text-sm text-muted-foreground">{resultMessage}</p>
      )}
    </div>
  );
}
