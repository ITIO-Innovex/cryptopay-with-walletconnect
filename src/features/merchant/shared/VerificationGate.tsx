import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

import { useVerification } from "./useVerification";

/**
 * Wraps any live payment feature. Unverified merchants see an explanation and
 * a link to the verification page instead of the control.
 */
export function VerificationGate({
  feature,
  children,
}: {
  feature: string;
  children: ReactNode;
}) {
  const { featuresEnabled, isLoading } = useVerification();
  if (isLoading || featuresEnabled) return <>{children}</>;

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="text-sm">
          <p className="font-semibold text-foreground">{feature} is not available yet</p>
          <p className="mt-1 text-muted-foreground">
            Reason: your business verification (KYB, KYC and AML) has not been approved. Solution:
            complete verification and this unlocks automatically.
          </p>
          <Link
            to="/dashboard/verification"
            className="mt-2 inline-block rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground"
          >
            Complete verification
          </Link>
        </div>
      </div>
    </div>
  );
}
