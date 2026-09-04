import { useEffect } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { getOrCreateAccount } from "@/features/auth/lib/account.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

/**
 * Ensures the signed-in user has a merchant account, payout schedule and first
 * API key before any dashboard page queries data.
 */
function DashboardLayout() {
  const bootstrap = useServerFn(getOrCreateAccount);
  useEffect(() => {
    void bootstrap(undefined as never).catch(() => undefined);
  }, [bootstrap]);

  return <Outlet />;
}
