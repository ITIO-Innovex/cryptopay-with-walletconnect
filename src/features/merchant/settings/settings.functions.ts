/** Business profile, payout schedule and webhook endpoint settings. */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { intervalMinutes } from "@/features/payments/engine.server";
import { resolveMerchantId } from "../shared/merchant.server";

export const getMerchantSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    const [{ data: account }, { data: payout }, { data: endpoints }, { data: profile }] =
      await Promise.all([
        context.supabase
          .from("merchant_account")
          .select("company_name, business_email, terno, status")
          .eq("id", merchantId)
          .maybeSingle(),
        context.supabase
          .from("merchant_payout_setting")
          .select("mode, min_payout_usd, auto_refund_overpayment, notification_email, next_run_at")
          .eq("merchant_id", merchantId)
          .maybeSingle(),
        context.supabase
          .from("webhook_endpoint")
          .select("id, url, is_enabled, created_at")
          .eq("merchant_id", merchantId)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        context.supabase
          .from("auth_user_profile")
          .select("full_name, company_name, website, contact_phone")
          .eq("user_id", context.userId)
          .maybeSingle(),
      ]);

    const { data: deliveries } = await context.supabase
      .from("webhook_delivery")
      .select("id, event, status_code, error_message, delivered_at, created_at, endpoint_id")
      .in("endpoint_id", (endpoints ?? []).map((e) => e.id))
      .order("created_at", { ascending: false })
      .limit(20);

    return {
      account,
      profile,
      payout: payout
        ? { ...payout, min_payout_usd: Number(payout.min_payout_usd) }
        : null,
      endpoints: endpoints ?? [],
      deliveries: deliveries ?? [],
    };
  });

export const updatePayoutSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        mode: z.enum(["instant", "hourly", "daily", "manual"]),
        minPayoutUsd: z.number().min(0).max(1_000_000),
        autoRefundOverpayment: z.boolean(),
        notificationEmail: z.string().email().max(160).optional().or(z.literal("")),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    const minutes = intervalMinutes(data.mode);
    const nextRun =
      minutes === null ? null : new Date(Date.now() + minutes * 60_000).toISOString();
    const { error } = await context.supabase
      .from("merchant_payout_setting")
      .update({
        mode: data.mode,
        min_payout_usd: data.minPayoutUsd,
        auto_refund_overpayment: data.autoRefundOverpayment,
        notification_email: data.notificationEmail || null,
        next_run_at: nextRun,
        updated_by: context.userId,
      })
      .eq("merchant_id", merchantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateCompanyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        companyName: z.string().min(1).max(160),
        businessEmail: z.string().email().max(160).optional().or(z.literal("")),
        website: z.string().max(200).optional(),
        contactPhone: z.string().max(40).optional(),
        fullName: z.string().max(120).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    await context.supabase
      .from("merchant_account")
      .update({
        company_name: data.companyName,
        business_email: data.businessEmail || null,
        updated_by: context.userId,
      })
      .eq("id", merchantId);
    await context.supabase
      .from("auth_user_profile")
      .update({
        company_name: data.companyName,
        website: data.website || null,
        contact_phone: data.contactPhone || null,
        full_name: data.fullName || null,
        updated_by: context.userId,
      })
      .eq("user_id", context.userId);
    return { ok: true };
  });

export const saveWebhookEndpoint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ url: z.string().url().max(500), enabled: z.boolean().default(true) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    const secret = `whsec_${Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")}`;
    const { error } = await context.supabase.from("webhook_endpoint").insert({
      merchant_id: merchantId,
      url: data.url,
      is_enabled: data.enabled,
      signing_secret: secret,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { signingSecret: secret };
  });

export const removeWebhookEndpoint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ endpointId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const merchantId = await resolveMerchantId(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("webhook_endpoint")
      .update({ is_active: false, is_enabled: false, updated_by: context.userId })
      .eq("id", data.endpointId)
      .eq("merchant_id", merchantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
