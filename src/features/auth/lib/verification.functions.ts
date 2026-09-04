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

/** Hosted KYB/KYC flow. Replace with the live didit.me session URL. */
export const VERIFICATION_PROVIDER_URL = "https://verify.didit.me/cryptope/start";
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

/** Records that the merchant has been sent to the provider, returns the URL. */
export const startVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const reference = `KYB-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await context.supabase
      .from("merchant_account")
      .update({
        verification_status: "in_review",
        verification_skipped: false,
        verification_ref: reference,
        verification_submitted_at: new Date().toISOString(),
        updated_by: context.userId,
      })
      .eq("owner_user_id", context.userId)
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return {
      state: mapRow(data),
      url: `${VERIFICATION_PROVIDER_URL}?reference=${encodeURIComponent(reference)}`,
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
 * Applies a verification decision. Until the provider webhook is wired up this
 * is called from the "I have completed verification" button so the flow can be
 * exercised end to end.
 */
export const applyVerificationDecision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ decision: z.enum(["verified", "rejected", "in_review"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("merchant_account")
      .update({
        verification_status: data.decision,
        verified_at: data.decision === "verified" ? new Date().toISOString() : null,
        verification_skipped: false,
        updated_by: context.userId,
      })
      .eq("owner_user_id", context.userId)
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return mapRow(row);
  });
