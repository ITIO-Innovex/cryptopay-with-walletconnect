/** Merchant payout wallets: where settled funds are sent. */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveMerchantId } from "../shared/merchant.server";

export const listWallets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("merchant_wallet")
      .select("id, label, asset, network, address, is_default, is_active, verified, min_payout, created_at")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((w) => ({ ...w, min_payout: Number(w.min_payout) }));
  });

export const addWallet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        label: z.string().max(80).optional(),
        asset: z.string().min(1).max(20),
        network: z.string().min(1).max(60),
        address: z.string().min(8).max(160),
        minPayout: z.number().min(0).max(1e9).default(0),
        makeDefault: z.boolean().default(true),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    if (data.makeDefault) {
      await context.supabase
        .from("merchant_wallet")
        .update({ is_default: false })
        .eq("merchant_id", merchantId)
        .eq("asset", data.asset)
        .eq("network", data.network);
    }
    const { error } = await context.supabase.from("merchant_wallet").insert({
      merchant_id: merchantId,
      label: data.label || null,
      asset: data.asset,
      network: data.network,
      address: data.address,
      min_payout: data.minPayout,
      is_default: data.makeDefault,
      verified: true,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setDefaultWallet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ walletId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    const { data: wallet } = await context.supabase
      .from("merchant_wallet")
      .select("asset, network")
      .eq("id", data.walletId)
      .eq("merchant_id", merchantId)
      .maybeSingle();
    if (!wallet) throw new Error("That wallet no longer exists.");
    await context.supabase
      .from("merchant_wallet")
      .update({ is_default: false })
      .eq("merchant_id", merchantId)
      .eq("asset", wallet.asset)
      .eq("network", wallet.network);
    const { error } = await context.supabase
      .from("merchant_wallet")
      .update({ is_default: true, updated_by: context.userId })
      .eq("id", data.walletId)
      .eq("merchant_id", merchantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeWallet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ walletId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("merchant_wallet")
      .update({ is_active: false, is_default: false, updated_by: context.userId })
      .eq("id", data.walletId)
      .eq("merchant_id", merchantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
