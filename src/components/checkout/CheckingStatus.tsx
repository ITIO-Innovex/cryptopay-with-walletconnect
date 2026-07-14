import { Loader2 } from "lucide-react";

/**
 * Brief transitional state shown while the gateway confirms an incoming
 * transfer, before routing to the success or shortfall screen.
 */
export function CheckingStatus() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-brand" strokeWidth={1.75} />
      <p className="text-lg font-medium text-muted-foreground">Checking payment status...</p>
    </div>
  );
}
