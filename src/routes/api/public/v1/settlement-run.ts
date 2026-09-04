/**
 * Scheduled settlement run. A cron caller hits this endpoint; every merchant
 * whose payout schedule is due gets their paid invoices batched and sent.
 */

import { createFileRoute } from "@tanstack/react-router";

import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/v1/settlement-run")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { runSettlement } = await import("@/features/payments/settlement.server");
        const result = await runSettlement(supabaseAdmin);
        return Response.json(result);
      },
    },
  },
});
