/**
 * Settlement runner. Groups unsettled paid invoices into payout batches
 * according to each merchant's chosen schedule and sends them to the merchant's
 * payout wallet. Settlement transactions are simulated until the custody
 * provider is connected; every amount and fee is real maths.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { intervalMinutes, mockSettlementHash, settlementMath } from "./engine.server";

type Client = SupabaseClient<Database>;

export interface SettlementResult {
  merchantsProcessed: number;
  batchesCreated: number;
  batchesFailed: number;
}

export async function runSettlement(
  admin: Client,
  options: { merchantId?: string; force?: boolean } = {},
): Promise<SettlementResult> {
  const now = new Date();
  const result: SettlementResult = { merchantsProcessed: 0, batchesCreated: 0, batchesFailed: 0 };

  let settingsQuery = admin
    .from("merchant_payout_setting")
    .select("merchant_id, mode, next_run_at");
  if (options.merchantId) settingsQuery = settingsQuery.eq("merchant_id", options.merchantId);
  const { data: settings, error } = await settingsQuery;
  if (error) throw new Error(error.message);

  for (const setting of settings ?? []) {
    const minutes = intervalMinutes(setting.mode);
    const manual = minutes === null;
    if (manual && !options.force) continue;
    if (!manual && !options.force && setting.next_run_at && new Date(setting.next_run_at) > now) {
      continue;
    }

    result.merchantsProcessed += 1;

    const { data: invoices } = await admin
      .from("payment_invoice")
      .select("id, asset, network, received_amount")
      .eq("merchant_id", setting.merchant_id)
      .eq("settled", false)
      .in("status", ["paid", "overpaid"]);

    const groups = new Map<string, { asset: string; network: string; ids: string[]; gross: number }>();
    for (const inv of invoices ?? []) {
      if (!inv.asset || !inv.network) continue;
      const key = `${inv.asset}|${inv.network}`;
      const group = groups.get(key) ?? { asset: inv.asset, network: inv.network, ids: [], gross: 0 };
      group.ids.push(inv.id);
      group.gross += Number(inv.received_amount ?? 0);
      groups.set(key, group);
    }

    for (const group of groups.values()) {
      const { data: wallet } = await admin
        .from("merchant_wallet")
        .select("id, address")
        .eq("merchant_id", setting.merchant_id)
        .eq("asset", group.asset)
        .eq("network", group.network)
        .eq("is_active", true)
        .order("is_default", { ascending: false })
        .limit(1)
        .maybeSingle();

      const math = settlementMath(group.gross, group.asset, group.network);

      if (!wallet) {
        const { data: batch } = await admin
          .from("payout_batch")
          .insert({
            merchant_id: setting.merchant_id,
            mode: setting.mode,
            status: "failed",
            asset: group.asset,
            network: group.network,
            gross_amount: math.gross,
            fee_amount: math.platformFee + math.networkFee,
            net_amount: math.net,
            error_message: `No payout wallet configured for ${group.asset} on ${group.network}.`,
          })
          .select("id")
          .single();
        if (batch) {
          await admin.from("payout_batch_item").insert(
            group.ids.map((id) => ({ batch_id: batch.id, invoice_id: id, amount: 0 })),
          );
        }
        result.batchesFailed += 1;
        continue;
      }

      const { data: batch, error: batchError } = await admin
        .from("payout_batch")
        .insert({
          merchant_id: setting.merchant_id,
          wallet_id: wallet.id,
          mode: setting.mode,
          status: "sent",
          asset: group.asset,
          network: group.network,
          destination_address: wallet.address,
          gross_amount: math.gross,
          fee_amount: math.platformFee + math.networkFee,
          net_amount: math.net,
          tx_hash: mockSettlementHash(group.network),
          sent_at: now.toISOString(),
        })
        .select("id")
        .single();
      if (batchError || !batch) {
        result.batchesFailed += 1;
        continue;
      }

      await admin.from("payout_batch_item").insert(
        group.ids.map((id) => ({ batch_id: batch.id, invoice_id: id, amount: 0 })),
      );
      await admin.from("payment_invoice").update({ settled: true }).in("id", group.ids);
      result.batchesCreated += 1;
    }

    if (!manual) {
      const next = new Date(now.getTime() + (minutes ?? 0) * 60_000).toISOString();
      await admin
        .from("merchant_payout_setting")
        .update({ next_run_at: next })
        .eq("merchant_id", setting.merchant_id);
    }
  }

  return result;
}
