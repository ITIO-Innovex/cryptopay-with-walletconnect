/** On-chain deposits (incoming transactions) with advanced filtering. */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveMerchantId } from "../shared/merchant.server";

export const listTransactions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        search: z.string().max(120).optional(),
        asset: z.string().max(20).optional(),
        network: z.string().max(60).optional(),
        confirmed: z.boolean().optional(),
        from: z.string().max(40).optional(),
        to: z.string().max(40).optional(),
        limit: z.number().min(1).max(500).default(100),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);

    const { data: invoices } = await context.supabase
      .from("payment_invoice")
      .select("id, order_id, product_name, status")
      .eq("merchant_id", merchantId);
    const byId = new Map((invoices ?? []).map((i) => [i.id, i]));
    if (byId.size === 0) return [];

    let query = context.supabase
      .from("payment_deposit")
      .select("id, invoice_id, tx_hash, amount, asset, network, sender_address, source, confirmations, confirmed, received_at")
      .in("invoice_id", Array.from(byId.keys()))
      .order("received_at", { ascending: false })
      .limit(data.limit);

    if (data.asset) query = query.eq("asset", data.asset);
    if (data.network) query = query.eq("network", data.network);
    if (typeof data.confirmed === "boolean") query = query.eq("confirmed", data.confirmed);
    if (data.from) query = query.gte("received_at", data.from);
    if (data.to) query = query.lte("received_at", data.to);
    if (data.search) query = query.ilike("tx_hash", `%${data.search}%`);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    return (rows ?? []).map((r) => {
      const invoice = byId.get(r.invoice_id);
      return {
        id: r.id,
        txHash: r.tx_hash,
        amount: Number(r.amount),
        asset: r.asset,
        network: r.network,
        senderAddress: r.sender_address,
        source: r.source,
        confirmations: r.confirmations,
        confirmed: r.confirmed,
        receivedAt: r.received_at,
        orderId: invoice?.order_id ?? "—",
        productName: invoice?.product_name ?? "—",
        invoiceStatus: invoice?.status ?? "—",
      };
    });
  });
