/**
 * Public checkout server functions.
 *
 * These back the hosted `/checkout?invoice=<id>` page, which buyers open
 * without an account. Only non-sensitive invoice fields are returned.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { allocateDepositAddress, deriveStatus, dueAmountFor } from "./engine.server";

const idInput = z.object({ invoiceId: z.string().uuid() });

export interface PublicInvoice {
  id: string;
  orderId: string;
  productName: string;
  description: string | null;
  amountUsd: number;
  fiatCurrency: string;
  customerEmail: string | null;
  expiresAt: string;
  status: string;
  asset: string | null;
  network: string | null;
  depositAddress: string | null;
  depositMemo: string | null;
  dueAmount: number | null;
  receivedAmount: number;
  redirectUrl: string | null;
  merchantName: string;
  publicKey: string | null;
  terno: string | null;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Loads the invoice a buyer is paying, with merchant identification. */
export const getPublicInvoice = createServerFn({ method: "GET" })
  .inputValidator((data) => idInput.parse(data))
  .handler(async ({ data }): Promise<PublicInvoice> => {
    const db = await admin();
    const { data: invoice, error } = await db
      .from("payment_invoice")
      .select(
        "id, order_id, product_name, description, amount_usd, fiat_currency, customer_email, expires_at, status, asset, network, deposit_address, deposit_memo, due_amount, received_amount, redirect_url, public_key, terno, merchant_id",
      )
      .eq("id", data.invoiceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!invoice) throw new Error("This payment link is not valid or has been removed.");

    const { data: merchant } = await db
      .from("merchant_account")
      .select("company_name")
      .eq("id", invoice.merchant_id)
      .maybeSingle();

    return {
      id: invoice.id,
      orderId: invoice.order_id,
      productName: invoice.product_name,
      description: invoice.description,
      amountUsd: Number(invoice.amount_usd),
      fiatCurrency: invoice.fiat_currency,
      customerEmail: invoice.customer_email,
      expiresAt: invoice.expires_at,
      status: invoice.status,
      asset: invoice.asset,
      network: invoice.network,
      depositAddress: invoice.deposit_address,
      depositMemo: invoice.deposit_memo,
      dueAmount: invoice.due_amount === null ? null : Number(invoice.due_amount),
      receivedAmount: Number(invoice.received_amount),
      redirectUrl: invoice.redirect_url,
      merchantName: merchant?.company_name ?? "Merchant",
      publicKey: invoice.public_key,
      terno: invoice.terno,
    };
  });

/** Locks the invoice to an asset/network and allocates a deposit address. */
export const selectInvoiceAsset = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        invoiceId: z.string().uuid(),
        asset: z.string().min(1).max(20),
        network: z.string().min(1).max(60),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: invoice } = await db
      .from("payment_invoice")
      .select("id, amount_usd, status, asset, network, deposit_address, deposit_memo, due_amount")
      .eq("id", data.invoiceId)
      .maybeSingle();
    if (!invoice) throw new Error("This payment link is not valid or has been removed.");
    if (invoice.status !== "awaiting") {
      throw new Error("This invoice already has a payment in progress and cannot change asset.");
    }

    if (invoice.asset === data.asset && invoice.network === data.network && invoice.deposit_address) {
      return {
        address: invoice.deposit_address,
        memo: invoice.deposit_memo,
        dueAmount: Number(invoice.due_amount ?? 0),
      };
    }

    const allocated = await allocateDepositAddress({
      asset: data.asset,
      network: data.network,
      invoiceId: data.invoiceId,
    });
    const dueAmount = dueAmountFor(Number(invoice.amount_usd), data.asset);

    const { error } = await db
      .from("payment_invoice")
      .update({
        asset: data.asset,
        network: data.network,
        deposit_address: allocated.address,
        deposit_memo: allocated.memo ?? null,
        due_amount: dueAmount,
      })
      .eq("id", data.invoiceId);
    if (error) throw new Error(error.message);

    await db.from("payment_address_pool").insert({
      asset: data.asset,
      network: data.network,
      address: allocated.address,
      memo: allocated.memo ?? null,
      assigned_invoice_id: data.invoiceId,
      assigned_at: new Date().toISOString(),
    });

    return { address: allocated.address, memo: allocated.memo ?? null, dueAmount };
  });

/** Current payment state of an invoice, including every observed deposit. */
export const getInvoiceStatus = createServerFn({ method: "GET" })
  .inputValidator((data) => idInput.parse(data))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: invoice } = await db
      .from("payment_invoice")
      .select("status, due_amount, received_amount, expires_at")
      .eq("id", data.invoiceId)
      .maybeSingle();
    if (!invoice) throw new Error("This payment link is not valid or has been removed.");

    const { data: deposits } = await db
      .from("payment_deposit")
      .select("tx_hash, amount, confirmations, confirmed, received_at, sender_address")
      .eq("invoice_id", data.invoiceId)
      .order("received_at", { ascending: true });

    return {
      status: invoice.status,
      dueAmount: Number(invoice.due_amount ?? 0),
      receivedAmount: Number(invoice.received_amount),
      expiresAt: invoice.expires_at,
      deposits: (deposits ?? []).map((d) => ({
        hash: d.tx_hash,
        amount: Number(d.amount),
        confirmations: d.confirmations,
        confirmed: d.confirmed,
        receivedAt: d.received_at,
        senderAddress: d.sender_address,
      })),
    };
  });

/**
 * Records an incoming transfer for an invoice. Until on-chain watching is
 * connected this is driven by the checkout simulation panel and the wallet
 * mock, which is why the amount is supplied by the caller.
 */
export const recordInvoiceDeposit = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        invoiceId: z.string().uuid(),
        amount: z.number().positive().max(1e9),
        txHash: z.string().min(6).max(120).optional(),
        senderAddress: z.string().max(120).optional(),
        source: z.enum(["simulated", "wallet_connect"]).default("simulated"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: invoice } = await db
      .from("payment_invoice")
      .select("id, merchant_id, asset, network, due_amount, received_amount, status, order_id")
      .eq("id", data.invoiceId)
      .maybeSingle();
    if (!invoice) throw new Error("This payment link is not valid or has been removed.");
    if (invoice.status === "cancelled" || invoice.status === "expired") {
      throw new Error("This invoice is closed and can no longer receive payments.");
    }

    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const hash =
      data.txHash ??
      `0x${Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`;

    await db.from("payment_deposit").insert({
      invoice_id: invoice.id,
      tx_hash: hash,
      amount: data.amount,
      asset: invoice.asset,
      network: invoice.network,
      sender_address: data.senderAddress ?? null,
      source: data.source,
      confirmations: 3,
      confirmed: true,
    });

    const received = Number(invoice.received_amount) + data.amount;
    const due = Number(invoice.due_amount ?? 0);
    const status = deriveStatus(due, received);
    const paidNow = status === "paid" || status === "overpaid";

    await db
      .from("payment_invoice")
      .update({
        received_amount: received,
        status,
        paid_at: paidNow ? new Date().toISOString() : null,
      })
      .eq("id", invoice.id);

    const { dispatchWebhook } = await import("./webhooks.server");
    await dispatchWebhook(db, {
      merchantId: invoice.merchant_id,
      event: paidNow ? "invoice.paid" : "invoice.payment_received",
      invoiceId: invoice.id,
      payload: {
        invoice_id: invoice.id,
        order_id: invoice.order_id,
        status,
        due_amount: due,
        received_amount: received,
        tx_hash: hash,
      },
    });

    if (paidNow) {
      const { data: setting } = await db
        .from("merchant_payout_setting")
        .select("mode")
        .eq("merchant_id", invoice.merchant_id)
        .maybeSingle();
      if (setting?.mode === "instant") {
        const { runSettlement } = await import("./settlement.server");
        await runSettlement(db, { merchantId: invoice.merchant_id, force: true });
      }
    }

    return { status, receivedAmount: received, dueAmount: due, txHash: hash };
  });
