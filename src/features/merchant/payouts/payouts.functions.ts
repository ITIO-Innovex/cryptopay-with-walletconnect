/** Outgoing settlements: batch history and manual "settle now". */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveMerchantId } from "../shared/merchant.server";

export const listPayouts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        status: z.string().max(20).optional(),
        asset: z.string().max(20).optional(),
        limit: z.number().min(1).max(500).default(100),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    let query = context.supabase
      .from("payout_batch")
      .select(
        "id, asset, network, destination_address, gross_amount, fee_amount, net_amount, status, mode, tx_hash, error_message, scheduled_at, sent_at, created_at",
      )
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.status) query = query.eq("status", data.status as never);
    if (data.asset) query = query.eq("asset", data.asset);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      ...r,
      gross_amount: Number(r.gross_amount),
      fee_amount: Number(r.fee_amount),
      net_amount: Number(r.net_amount),
    }));
  });

/** Runs settlement immediately for this merchant, whatever the schedule says. */
export const settleNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { runSettlement } = await import("@/features/payments/settlement.server");
    return runSettlement(supabaseAdmin, { merchantId, force: true });
  });
