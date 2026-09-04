/** Invoice listing, creation and cancellation for the merchant dashboard. */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveMerchantId } from "../shared/merchant.server";

const filterSchema = z.object({
  search: z.string().max(120).optional(),
  status: z.string().max(20).optional(),
  asset: z.string().max(20).optional(),
  network: z.string().max(60).optional(),
  from: z.string().max(40).optional(),
  to: z.string().max(40).optional(),
  minUsd: z.number().optional(),
  maxUsd: z.number().optional(),
  limit: z.number().min(1).max(500).default(100),
});

export type InvoiceFilters = z.input<typeof filterSchema>;

export const listInvoices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => filterSchema.parse(data ?? {}))
  .handler(async ({ data, context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    let query = context.supabase
      .from("payment_invoice")
      .select(
        "id, order_id, product_name, customer_email, amount_usd, fiat_currency, asset, network, due_amount, received_amount, status, settled, created_at, paid_at, expires_at",
      )
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (data.status) query = query.eq("status", data.status as never);
    if (data.asset) query = query.eq("asset", data.asset);
    if (data.network) query = query.eq("network", data.network);
    if (data.from) query = query.gte("created_at", data.from);
    if (data.to) query = query.lte("created_at", data.to);
    if (typeof data.minUsd === "number") query = query.gte("amount_usd", data.minUsd);
    if (typeof data.maxUsd === "number") query = query.lte("amount_usd", data.maxUsd);
    if (data.search) {
      const term = `%${data.search}%`;
      query = query.or(
        `order_id.ilike.${term},product_name.ilike.${term},customer_email.ilike.${term}`,
      );
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      ...r,
      amount_usd: Number(r.amount_usd),
      due_amount: r.due_amount === null ? null : Number(r.due_amount),
      received_amount: Number(r.received_amount),
    }));
  });

export const createInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        productName: z.string().min(1).max(160),
        description: z.string().max(500).optional(),
        amountUsd: z.number().positive().max(1_000_000),
        customerEmail: z.string().email().max(160).optional().or(z.literal("")),
        redirectUrl: z.string().url().max(500).optional().or(z.literal("")),
        expiresInMinutes: z.number().min(10).max(1440).default(60),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    const { data: account } = await context.supabase
      .from("merchant_account")
      .select("terno")
      .eq("id", merchantId)
      .maybeSingle();
    const { data: key } = await context.supabase
      .from("merchant_api_key")
      .select("public_key")
      .eq("merchant_id", merchantId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    const orderId = `CP-${Date.now().toString(36).toUpperCase()}`;
    const { data: invoice, error } = await context.supabase
      .from("payment_invoice")
      .insert({
        merchant_id: merchantId,
        order_id: orderId,
        product_name: data.productName,
        description: data.description || null,
        amount_usd: data.amountUsd,
        customer_email: data.customerEmail || null,
        redirect_url: data.redirectUrl || null,
        expires_at: new Date(Date.now() + data.expiresInMinutes * 60_000).toISOString(),
        public_key: key?.public_key ?? null,
        terno: account?.terno ?? null,
        created_by: context.userId,
      })
      .select("id, order_id")
      .single();
    if (error) throw new Error(error.message);
    return invoice;
  });

export const cancelInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ invoiceId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("payment_invoice")
      .update({ status: "cancelled", updated_by: context.userId })
      .eq("id", data.invoiceId)
      .eq("merchant_id", merchantId)
      .in("status", ["awaiting", "underpaid"]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
