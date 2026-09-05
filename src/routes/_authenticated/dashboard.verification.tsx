import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";

import { DashboardShell } from "@/features/merchant/layout/DashboardShell";
import { LoadingState } from "@/features/merchant/shared/PageState";
import { useVerification } from "@/features/merchant/shared/useVerification";
import { formatDateTime } from "@/features/merchant/shared/format";
import {
  refreshVerificationStatus,
  startVerification,
  VERIFICATION_PROVIDER_NAME,
} from "@/features/auth/lib/verification.functions";

export const Route = createFileRoute("/_authenticated/dashboard/verification")({
  head: () => ({ meta: [{ title: "Business verification — Cryptope" }, { name: "robots", content: "noindex" }] }),
  component: VerificationPage,
});

const STATUS_COPY: Record<string, { label: string; tone: string; detail: string }> = {
  not_started: {
    label: "Not started",
    tone: "border-destructive/40 bg-destructive/10 text-destructive",
    detail:
      "Live payment features are switched off until your company is verified. Start verification below — it usually takes a few minutes.",
  },
  in_review: {
    label: "In review",
    tone: "border-amber-500/40 bg-amber-500/10 text-amber-700",
    detail:
      "Your documents are with our verification partner. We email you as soon as a decision is made; the dashboard updates automatically.",
  },
  verified: {
    label: "Verified",
    tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
    detail: "Your company is verified. Every payment feature is enabled on this account.",
  },
  rejected: {
    label: "Not approved",
    tone: "border-destructive/40 bg-destructive/10 text-destructive",
    detail:
      "Verification was not approved. Reason: the partner could not confirm your company details. Solution: restart verification with current documents, or contact support.",
  },
};

function VerificationPage() {
  const queryClient = useQueryClient();
  const { state, isLoading } = useVerification();
  const begin = useServerFn(startVerification);
  const refreshStatus = useServerFn(refreshVerificationStatus);
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(false);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["verification"] });
  }

  async function handleStart() {
    setBusy(true);
    try {
      const result = await begin({ data: { origin: window.location.origin } });
      setOpened(true);
      window.open(result.url, "_blank", "noopener");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleCompleted() {
    setBusy(true);
    try {
      await refreshStatus({ data: undefined as never });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const status = state?.status ?? "not_started";
  const copy = STATUS_COPY[status] ?? STATUS_COPY["not_started"]!;

  return (
    <DashboardShell
      title="Business verification"
      description="KYB, KYC and AML checks carried out by our verification partner."
    >
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="max-w-2xl space-y-4">
          <div className={`rounded-2xl border p-4 ${copy.tone}`}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              {status === "verified" ? (
                <BadgeCheck className="h-5 w-5" />
              ) : (
                <ShieldAlert className="h-5 w-5" />
              )}
              Verification status: {copy.label}
            </div>
            <p className="mt-2 text-sm">{copy.detail}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Business name</dt>
                <dd className="font-medium">{state?.companyName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Reference</dt>
                <dd className="font-medium">{state?.reference ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Submitted</dt>
                <dd className="font-medium">
                  {state?.submittedAt ? formatDateTime(state.submittedAt) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Approved</dt>
                <dd className="font-medium">
                  {state?.verifiedAt ? formatDateTime(state.verifiedAt) : "—"}
                </dd>
              </div>
            </dl>
          </div>

          {status !== "verified" && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 text-brand" /> What happens next
              </div>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                <li>We open the secure page of our partner, {VERIFICATION_PROVIDER_NAME}.</li>
                <li>You upload company documents and confirm director identity there.</li>
                <li>The decision is returned to us and this page updates.</li>
              </ol>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-60"
                >
                  <ExternalLink className="h-4 w-4" />
                  {status === "in_review" ? "Open verification again" : "Start verification"}
                </button>
                {(opened || status === "in_review") && (
                  <button
                    type="button"
                    onClick={handleCompleted}
                    disabled={busy}
                    className="rounded-xl border border-emerald-500/50 px-4 py-2 text-sm font-semibold text-emerald-600 disabled:opacity-60"
                  >
                    Refresh verification status
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
