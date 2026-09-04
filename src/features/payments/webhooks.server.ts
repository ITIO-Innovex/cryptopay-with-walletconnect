/**
 * Signed merchant webhooks. Every delivery is logged so merchants can inspect
 * attempts, status codes and errors from the dashboard.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

async function signPayload(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Delivers an event to every enabled endpoint of a merchant. */
export async function dispatchWebhook(
  admin: Client,
  input: { merchantId: string; event: string; invoiceId?: string | null; payload: Json },
): Promise<void> {
  const { data: endpoints } = await admin
    .from("webhook_endpoint")
    .select("id, url, signing_secret")
    .eq("merchant_id", input.merchantId)
    .eq("is_enabled", true)
    .eq("is_active", true);

  for (const endpoint of endpoints ?? []) {
    const body = JSON.stringify({
      event: input.event,
      created_at: new Date().toISOString(),
      data: input.payload,
    });
    let statusCode: number | null = null;
    let errorMessage: string | null = null;
    try {
      const signature = await signPayload(endpoint.signing_secret, body);
      const res = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Cryptope-Event": input.event,
          "X-Cryptope-Signature": signature,
        },
        body,
      });
      statusCode = res.status;
      if (!res.ok) errorMessage = `Endpoint responded with ${res.status}.`;
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "Delivery failed.";
    }

    await admin.from("webhook_delivery").insert({
      endpoint_id: endpoint.id,
      event: input.event,
      invoice_id: input.invoiceId ?? null,
      payload: input.payload,
      status_code: statusCode,
      error_message: errorMessage,
      delivered_at: errorMessage ? null : new Date().toISOString(),
    });
  }
}
