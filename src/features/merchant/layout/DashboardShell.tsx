import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, ShieldAlert } from "lucide-react";

import { BrandLogo } from "@/components/site/BrandLogo";
import { signOutCurrentUser } from "@/features/auth/lib/auth-client";
import { useVerification } from "@/features/merchant/shared/useVerification";

/** Company badge in the header: green when verified, red until then. */
function VerificationPill() {
  const { state, isLoading } = useVerification();
  if (isLoading || !state) return null;

  if (state.status === "verified") {
    return (
      <Link
        to="/dashboard/verification"
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-600"
      >
        <BadgeCheck className="h-4 w-4" />
        <span className="hidden sm:inline">{state.companyName}</span> Verified
      </Link>
    );
  }

  return (
    <Link
      to="/dashboard/verification"
      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/50 bg-destructive/10 px-2.5 py-1.5 text-xs font-semibold text-destructive"
    >
      <ShieldAlert className="h-4 w-4" />
      {state.status === "in_review" ? "Verification in review" : "Verify your company"}
    </Link>
  );
}

/**
 * Chrome shared by every merchant dashboard page: brand, section navigation
 * and sign-out. Admin gets its own shell later and reuses the same data layer.
 */

const NAV = [
  { to: "/dashboard", label: "Overview", exact: true },
  { to: "/dashboard/invoices", label: "Invoices" },
  { to: "/dashboard/transactions", label: "Transactions" },
  { to: "/dashboard/payouts", label: "Payouts" },
  { to: "/dashboard/wallets", label: "Wallets" },
  { to: "/dashboard/api-keys", label: "API keys" },
  { to: "/dashboard/settings", label: "Settings" },
  { to: "/dashboard/verification", label: "Verification" },
] as const;

export function DashboardShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOutCurrentUser();
    void navigate({ to: "/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <BrandLogo />
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
              Merchant dashboard
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <VerificationPill />
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto w-full max-w-7xl overflow-x-auto px-4">
          <ul className="flex gap-1 pb-2 text-sm">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: "exact" in item ? item.exact : false }}
                  activeProps={{ className: "bg-muted font-semibold text-foreground" }}
                  className="inline-block whitespace-nowrap rounded-lg px-3 py-1.5 text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        {children}
      </main>
    </div>
  );
}

/** Small labelled metric card used across dashboard pages. */
export function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
