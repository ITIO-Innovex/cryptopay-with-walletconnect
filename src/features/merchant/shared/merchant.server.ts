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
