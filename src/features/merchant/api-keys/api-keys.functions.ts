/** API key management. Secrets are stored hashed and shown only once. */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveMerchantId } from "../shared/merchant.server";

function randomKey(prefix: string, bytes = 24): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return `${prefix}_${Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("merchant_api_key")
      .select("id, label, public_key, secret_preview, is_active, last_used_at, revoked_at, created_at")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ label: z.string().min(1).max(80) }).parse(data))
  .handler(async ({ data, context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    const publicKey = randomKey("pk_live");
    const secret = randomKey("sk_live");
    const { error } = await context.supabase.from("merchant_api_key").insert({
      merchant_id: merchantId,
      label: data.label,
      public_key: publicKey,
      secret_hash: await sha256Hex(secret),
      secret_preview: `${secret.slice(0, 12)}…${secret.slice(-4)}`,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { publicKey, secret };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ keyId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("merchant_api_key")
      .update({ is_active: false, revoked_at: new Date().toISOString(), updated_by: context.userId })
      .eq("id", data.keyId)
      .eq("merchant_id", merchantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
