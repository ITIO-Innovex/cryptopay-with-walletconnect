import { ArrowLeft } from "lucide-react";

interface CheckoutHeaderProps {
  /** Whether to show the "Cancel order" back affordance. */
  onCancel?: () => void;
}

/**
 * Top bar with the neutral gateway wordmark and a cancel-order action.
 */
export function CheckoutHeader({ onCancel }: CheckoutHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-5xl items-center justify-center px-4">
        <button
          type="button"
          onClick={onCancel}
          className="absolute left-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel order
        </button>
        <div className="flex items-center gap-1.5 text-xl font-semibold tracking-tight">
          <span className="text-foreground">swift</span>
          <span className="text-brand">PAY</span>
        </div>
      </div>
    </header>
  );
}
