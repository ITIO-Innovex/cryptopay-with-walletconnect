/** Dashboard overview metrics for the signed-in merchant. */

import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveMerchantId } from "../shared/merchant.server";

export const getMerchantOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const merchantId = await resolveMerchantId(supabase, userId);

    const { data: account } = await supabase
      .from("merchant_account")
      .select("company_name, terno, status")
      .eq("id", merchantId)
      .maybeSingle();

    const { data: invoices } = await supabase
      .from("payment_invoice")
      .select("id, order_id, product_name, amount_usd, asset, status, created_at, received_amount")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false })
      .limit(200);

    const { data: batches } = await supabase
      .from("payout_batch")
      .select("id, asset, network, net_amount, status, sent_at, created_at")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false })
      .limit(10);

    const all = invoices ?? [];
    const paid = all.filter((i) => i.status === "paid" || i.status === "overpaid");
    const volumeUsd = paid.reduce((sum, i) => sum + Number(i.amount_usd), 0);
    const pending = all.filter((i) => i.status === "awaiting" || i.status === "underpaid").length;

    return {
      account: {
        companyName: account?.company_name ?? "Merchant",
        terno: account?.terno ?? "",
        status: account?.status ?? "pending",
      },
      metrics: {
        volumeUsd,
        paidCount: paid.length,
        pendingCount: pending,
        invoiceCount: all.length,
        successRate: all.length ? Math.round((paid.length / all.length) * 100) : 0,
      },
      recentInvoices: all.slice(0, 8).map((i) => ({
        id: i.id,
        orderId: i.order_id,
        productName: i.product_name,
        amountUsd: Number(i.amount_usd),
        asset: i.asset,
        status: i.status,
        createdAt: i.created_at,
      })),
      recentPayouts: (batches ?? []).map((b) => ({
        id: b.id,
        asset: b.asset,
        network: b.network,
        netAmount: Number(b.net_amount),
        status: b.status,
        sentAt: b.sent_at,
        createdAt: b.created_at,
      })),
    };
  });
