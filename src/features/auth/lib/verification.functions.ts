/**
 * Business verification (KYB / KYC / AML).
 *
 * Verification itself is performed by our provider (didit.me). We send the
 * merchant to the provider's hosted flow and record the outcome against the
 * merchant account. The provider URL is a placeholder until the live session
 * URL and API credentials are supplied.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const VERIFICATION_PROVIDER_NAME = "didit.me";

export interface VerificationState {
  merchantId: string;
  companyName: string;
  status: "not_started" | "in_review" | "verified" | "rejected";
  skipped: boolean;
  reference: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  isDemo: boolean;
  /** True when the merchant may use live payment features. */
  featuresEnabled: boolean;
}

function mapRow(row: {
  id: string;
  company_name: string;
  verification_status: string;
  verification_skipped: boolean;
  verification_ref: string | null;
  verification_submitted_at: string | null;
  verified_at: string | null;
  is_demo: boolean;
}): VerificationState {
  const status = row.verification_status as VerificationState["status"];
  return {
    merchantId: row.id,
    companyName: row.company_name,
    status,
    skipped: row.verification_skipped,
    reference: row.verification_ref,
    submittedAt: row.verification_submitted_at,
    verifiedAt: row.verified_at,
    isDemo: row.is_demo,
    featuresEnabled: status === "verified",
  };
}

const SELECT =
  "id, company_name, verification_status, verification_skipped, verification_ref, verification_submitted_at, verified_at, is_demo";

/** Current verification state of the signed-in merchant. */
export const getVerificationState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VerificationState | null> => {
    const { data } = await context.supabase
      .from("merchant_account")
      .select(SELECT)
      .eq("owner_user_id", context.userId)
      .maybeSingle();
    return data ? mapRow(data) : null;
  });

/**
 * Creates a real hosted verification session with our provider and returns the
 * URL the merchant should open.
 */
export const startVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ origin: z.string().url().optional() }).parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { data: merchant, error: readError } = await context.supabase
      .from("merchant_account")
      .select("id, company_name, business_email")
      .eq("owner_user_id", context.userId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!merchant) throw new Error("No merchant account found. Sign out and back in to create one.");

    const { createDiditSession } = await import("./didit.server");
    const origin = data.origin ?? "https://cryptope.net";
    const session = await createDiditSession({
      vendorData: merchant.id,
      vendorBusinessId: merchant.id,
      callbackUrl: `${origin}/dashboard/verification`,
      contactEmail: merchant.business_email,
    });

    const { data: row, error } = await context.supabase
      .from("merchant_account")
      .update({
        verification_status: "in_review",
        verification_skipped: false,
        verification_ref: session.session_id,
        verification_session_id: session.session_id,
        verification_submitted_at: new Date().toISOString(),
        updated_by: context.userId,
      })
      .eq("owner_user_id", context.userId)
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return {
      state: mapRow(row),
      url: session.url,
      provider: VERIFICATION_PROVIDER_NAME,
    };
  });


/** Merchant chose to look around the dashboard before verifying. */
export const skipVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("merchant_account")
      .update({ verification_skipped: true, updated_by: context.userId })
      .eq("owner_user_id", context.userId)
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data);
  });

/**
 * Pulls the latest decision for the merchant's session straight from the
 * provider. The signed webhook remains the source of truth; this only lets a
 * merchant refresh the page without waiting for the next delivery.
 */
export const refreshVerificationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VerificationState | null> => {
    const { data: merchant } = await context.supabase
      .from("merchant_account")
      .select("id, verification_session_id")
      .eq("owner_user_id", context.userId)
      .maybeSingle();
    if (!merchant?.verification_session_id) return null;

    const { fetchDiditDecision, mapDiditStatus } = await import("./didit.server");
    let decision: { status?: string } | null = null;
    try {
      decision = (await fetchDiditDecision(merchant.verification_session_id)) as { status?: string };
    } catch (error) {
      console.error("[didit] decision fetch failed", error);
      return null;
    }

    const mapped = mapDiditStatus(decision?.status);
    const { data: row, error } = await context.supabase
      .from("merchant_account")
      .update({
        verification_status: mapped.verification,
        verification_reason: mapped.reason,
        verified_at: mapped.verification === "verified" ? new Date().toISOString() : null,
        updated_by: context.userId,
      })
      .eq("owner_user_id", context.userId)
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return mapRow(row);
  });

