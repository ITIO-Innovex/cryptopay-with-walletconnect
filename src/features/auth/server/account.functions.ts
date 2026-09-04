/**
 * Authenticated account server functions.
 *
 * Bootstraps everything a freshly signed-up merchant needs so the dashboard is
 * usable on first login: profile row, merchant role, merchant account, payout
 * setting and a first API key pair.
 */

import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface AccountBundle {
  userId: string;
  email: string | null;
  profile: {
    full_name: string | null;
    company_name: string | null;
    contact_phone: string | null;
    website: string | null;
    status: string;
  };
  merchant: {
    id: string;
    company_name: string;
    terno: string;
    status: string;
    business_email: string | null;
  };
  roles: string[];
}

function randomTerno(): string {
  return String(Math.floor(100000000 + Math.random() * 899999999));
}

function randomKey(prefix: string, length = 32): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `${prefix}_${out}`;
}

/** SHA-256 hex digest — API secrets are never stored in clear text. */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Returns the signed-in user's account, creating any missing pieces.
 */
export const getOrCreateAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccountBundle> => {
    const { supabase, userId, claims } = context;
    const email = (claims["email"] as string | undefined) ?? null;
    const meta = (claims["user_metadata"] as Record<string, unknown> | undefined) ?? {};
    const companyName =
      (meta["company_name"] as string | undefined)?.trim() || email?.split("@")[0] || "My Company";

    // --- profile -----------------------------------------------------------
    let { data: profile } = await supabase
      .from("auth_user_profile")
      .select("full_name, company_name, contact_phone, website, status")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      const { data, error } = await supabase
        .from("auth_user_profile")
        .insert({
          user_id: userId,
          full_name: (meta["full_name"] as string | undefined) ?? null,
          company_name: companyName,
          contact_phone: (meta["contact_phone"] as string | undefined) ?? null,
          website: (meta["website"] as string | undefined) ?? null,
          status: "active",
          created_by: userId,
          updated_by: userId,
        })
        .select("full_name, company_name, contact_phone, website, status")
        .single();
      if (error) throw new Error(error.message);
      profile = data;
    }

    // --- merchant account ---------------------------------------------------
    let { data: merchant } = await supabase
      .from("merchant_account")
      .select("id, company_name, terno, status, business_email")
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (!merchant) {
      const { data, error } = await supabase
        .from("merchant_account")
        .insert({
          owner_user_id: userId,
          company_name: companyName,
          business_email: email,
          terno: randomTerno(),
          status: "active",
          created_by: userId,
          updated_by: userId,
        })
        .select("id, company_name, terno, status, business_email")
        .single();
      if (error) throw new Error(error.message);
      merchant = data;
    }

    // --- role, payout setting, first API key --------------------------------
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roleRows } = await supabase
      .from("auth_user_role")
      .select("role")
      .eq("user_id", userId);
    let roles = (roleRows ?? []).map((r) => r.role as string);
    if (roles.length === 0) {
      await supabaseAdmin
        .from("auth_user_role")
        .insert({ user_id: userId, role: "merchant", created_by: userId });
      roles = ["merchant"];
    }

    const { data: setting } = await supabase
      .from("merchant_payout_setting")
      .select("id")
      .eq("merchant_id", merchant.id)
      .maybeSingle();
    if (!setting) {
      await supabase.from("merchant_payout_setting").insert({
        merchant_id: merchant.id,
        mode: "daily",
        notification_email: email,
        created_by: userId,
        updated_by: userId,
      });
    }

    const { count } = await supabase
      .from("merchant_api_key")
      .select("id", { count: "exact", head: true })
      .eq("merchant_id", merchant.id);
    if (!count) {
      const secret = randomKey("sk_live", 40);
      await supabase.from("merchant_api_key").insert({
        merchant_id: merchant.id,
        label: "Default",
        public_key: randomKey("pk_live", 32),
        secret_hash: await sha256Hex(secret),
        secret_preview: `${secret.slice(0, 12)}…${secret.slice(-4)}`,
        created_by: userId,
        updated_by: userId,
      });
    }

    return { userId, email, profile, merchant, roles };
  });

/** Updates the signed-in merchant's business profile. */
export const updateBusinessProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    fullName: string;
    companyName: string;
    contactPhone: string;
    website: string;
    businessEmail: string;
  }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error: pErr } = await supabase
      .from("auth_user_profile")
      .update({
        full_name: data.fullName,
        company_name: data.companyName,
        contact_phone: data.contactPhone,
        website: data.website,
        updated_by: userId,
      })
      .eq("user_id", userId);
    if (pErr) throw new Error(pErr.message);

    const { error: mErr } = await supabase
      .from("merchant_account")
      .update({
        company_name: data.companyName,
        business_email: data.businessEmail,
        updated_by: userId,
      })
      .eq("owner_user_id", userId);
    if (mErr) throw new Error(mErr.message);

    return { ok: true };
  });
