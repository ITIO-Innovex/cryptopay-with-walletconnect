import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

/**
 * Resolves the merchant account owned by the signed-in user. Every merchant
 * server function goes through this so a caller can never address another
 * merchant's data.
 */
export async function resolveMerchantId(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("merchant_account")
    .select("id")
    .eq("owner_user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("No merchant account found for this user. Sign out and back in to create one.");
  return data.id;
}

/**
 * Resolves the merchant and refuses live payment actions until business
 * verification (KYB / KYC / AML) has been approved.
 */
export async function resolveVerifiedMerchantId(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("merchant_account")
    .select("id, verification_status")
    .eq("owner_user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("No merchant account found for this user. Sign out and back in to create one.");
  if (data.verification_status !== "verified") {
    throw new Error(
      "This action is not available yet. Reason: your business verification has not been approved. Solution: complete verification on the Verification page — the feature unlocks automatically.",
    );
  }
  return data.id;
}
