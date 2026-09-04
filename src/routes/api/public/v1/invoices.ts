/**
 * Public invoice API.
 *
 * Merchants POST here with their secret key to create a payment request and
 * receive a hosted checkout URL to redirect the buyer to.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  product_name: z.string().min(1).max(160),
  description: z.string().max(500).optional(),
  amount_usd: z.number().positive().max(1_000_000),
  fiat_currency: z.string().length(3).default("USD"),
  customer_email: z.string().email().max(160).optional(),
  redirect_url: z.string().url().max(500).optional(),
  order_id: z.string().max(80).optional(),
  expires_in_minutes: z.number().min(10).max(1440).default(60),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export const Route = createFileRoute("/api/public/v1/invoices")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const secret = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
        if (!secret.startsWith("sk_live_")) {
          return Response.json(
            { error: "Missing or malformed API secret key in the Authorization header." },
            { status: 401, headers: CORS },
          );
        }

        let payload: z.infer<typeof bodySchema>;
        try {
          payload = bodySchema.parse(await request.json());
        } catch (err) {
          return Response.json(
            {
              error: "The request body is invalid.",
              details: err instanceof z.ZodError ? err.issues : undefined,
            },
            { status: 422, headers: CORS },
          );
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: key } = await supabaseAdmin
          .from("merchant_api_key")
          .select("id, merchant_id, public_key")
          .eq("secret_hash", await sha256Hex(secret))
          .eq("is_active", true)
          .maybeSingle();
        if (!key) {
          return Response.json(
            { error: "That API key is not recognised or has been revoked." },
            { status: 401, headers: CORS },
          );
        }

        const { data: account } = await supabaseAdmin
          .from("merchant_account")
          .select("terno, status")
          .eq("id", key.merchant_id)
          .maybeSingle();
        if (account?.status === "suspended") {
          return Response.json(
            { error: "This merchant account is suspended and cannot create invoices." },
            { status: 403, headers: CORS },
          );
        }

        const orderId = payload.order_id ?? `CP-${Date.now().toString(36).toUpperCase()}`;
        const { data: invoice, error } = await supabaseAdmin
          .from("payment_invoice")
          .insert({
            merchant_id: key.merchant_id,
            order_id: orderId,
            product_name: payload.product_name,
            description: payload.description ?? null,
            amount_usd: payload.amount_usd,
            fiat_currency: payload.fiat_currency,
            customer_email: payload.customer_email ?? null,
            redirect_url: payload.redirect_url ?? null,
            expires_at: new Date(Date.now() + payload.expires_in_minutes * 60_000).toISOString(),
            public_key: key.public_key,
            terno: account?.terno ?? null,
            metadata: (payload.metadata ?? {}) as never,
          })
          .select("id, order_id, expires_at")
          .single();
        if (error || !invoice) {
          return Response.json(
            { error: "The invoice could not be created. Try again shortly." },
            { status: 500, headers: CORS },
          );
        }

        await supabaseAdmin.from("merchant_api_key").update({ last_used_at: new Date().toISOString() }).eq("id", key.id);

        const origin = new URL(request.url).origin;
        return Response.json(
          {
            invoice_id: invoice.id,
            order_id: invoice.order_id,
            expires_at: invoice.expires_at,
            checkout_url: `${origin}/checkout?invoice=${invoice.id}`,
            public_key: key.public_key,
            terno: account?.terno ?? null,
          },
          { status: 201, headers: CORS },
        );
      },
    },
  },
});
