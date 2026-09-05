/**
 * Verification provider (didit.me) webhook receiver.
 *
 * This is the source of truth for a merchant's verification decision. It
 * verifies the provider's signature, de-duplicates on event id, applies the
 * decision to the merchant account and answers 2xx immediately.
 */

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/kyc-provider/webhook/didit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();

        const { verifyDiditWebhook, applyDiditStatus } = await import(
          "@/features/auth/lib/didit.server"
        );
        const result = verifyDiditWebhook(raw, request.headers);
        if ("error" in result) return result.error;
        const payload = result.payload;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const eventId =
          payload.event_id ??
          `${payload.session_id ?? "unknown"}:${payload.webhook_type ?? "event"}:${payload.timestamp ?? 0}`;

        const { error: insertError } = await supabaseAdmin.from("kyc_webhook_event").insert({
          event_id: eventId,
          session_id: payload.session_id ?? null,
          webhook_type: payload.webhook_type ?? null,
          status: payload.status ?? null,
          vendor_data: payload.vendor_data ?? null,
          payload: payload as never,
        });
        // Unique violation => already processed; acknowledge and stop.
        if (insertError) {
          if (insertError.code === "23505") return new Response("ok");
          console.error("[didit] webhook log failed", insertError.message);
        }

        await applyDiditStatus(supabaseAdmin, payload);
        return new Response("ok");
      },
    },
  },
});
