/**
 * Ready-made demonstration merchant.
 *
 * The sign-in page offers a pre-filled account that is already through KYB/KYC,
 * so every dashboard feature can be exercised immediately. Newly registered
 * merchants are unverified and stay feature-gated until verification passes.
 *
 * The seeder is idempotent: it creates the auth user, merchant account, wallet,
 * API key and a spread of sample invoices/deposits/payouts only once.
 */

import { createServerFn } from "@tanstack/react-start";

export const DEMO_EMAIL = "demo@merchant.com";
export const DEMO_PASSWORD = "Demo@2026";

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

function hex(length: number): string {
  const bytes = new Uint8Array(length / 2);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Creates (or repairs) the demonstration merchant and returns its credentials.
 * Safe to call on every visit to the sign-in page.
 */
export const ensureDemoMerchant = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // --- auth user ----------------------------------------------------------
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  let user = list?.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL);

  if (!user) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Dana Merchant", company_name: "Northwind Retail Limited" },
    });
    if (error) return { email: DEMO_EMAIL, password: DEMO_PASSWORD, ready: false };
    user = data.user;
  } else {
    // Keep the advertised password valid even if it was changed.
    await supabaseAdmin.auth.admin.updateUserById(user.id, { password: DEMO_PASSWORD });
  }

  const userId = user.id;

  // --- profile, role ------------------------------------------------------
  const { data: profile } = await supabaseAdmin
    .from("auth_user_profile")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!profile) {
    await supabaseAdmin.from("auth_user_profile").insert({
      user_id: userId,
      first_name: "Dana",
      last_name: "Merchant",
      full_name: "Dana Merchant",
      company_name: "Northwind Retail Limited",
      contact_phone: "+44 20 7946 0991",
      email_verified: true,
      status: "active",
      created_by: userId,
      updated_by: userId,
    });
  }

  const { data: roleRow } = await supabaseAdmin
    .from("auth_user_role")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!roleRow) {
    await supabaseAdmin
      .from("auth_user_role")
      .insert({ user_id: userId, role: "merchant", created_by: userId });
  }

  // --- merchant account ---------------------------------------------------
  let { data: merchant } = await supabaseAdmin
    .from("merchant_account")
    .select("id")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (!merchant) {
    const { data } = await supabaseAdmin
      .from("merchant_account")
      .insert({
        owner_user_id: userId,
        company_name: "Northwind Retail Limited",
        business_email: DEMO_EMAIL,
        terno: "700100200",
        status: "active",
        is_demo: true,
        verification_status: "verified",
        verified_at: hoursAgo(720),
        verification_ref: "KYB-DEMO-0001",
        verification_submitted_at: hoursAgo(744),
        created_by: userId,
        updated_by: userId,
      })
      .select("id")
      .single();
    merchant = data;
  } else {
    await supabaseAdmin
      .from("merchant_account")
      .update({
        is_demo: true,
        verification_status: "verified",
        verified_at: hoursAgo(720),
        verification_skipped: false,
      })
      .eq("id", merchant.id);
  }

  if (!merchant) return { email: DEMO_EMAIL, password: DEMO_PASSWORD, ready: false };
  const merchantId = merchant.id;

  // --- payout setting, wallet, API key ------------------------------------
  const { data: setting } = await supabaseAdmin
    .from("merchant_payout_setting")
    .select("id")
    .eq("merchant_id", merchantId)
    .maybeSingle();
  if (!setting) {
    await supabaseAdmin.from("merchant_payout_setting").insert({
      merchant_id: merchantId,
      mode: "hourly",
      notification_email: DEMO_EMAIL,
      created_by: userId,
      updated_by: userId,
    });
  }

  const { count: walletCount } = await supabaseAdmin
    .from("merchant_wallet")
    .select("id", { count: "exact", head: true })
    .eq("merchant_id", merchantId);
  if (!walletCount) {
    await supabaseAdmin.from("merchant_wallet").insert([
      {
        merchant_id: merchantId,
        label: "Treasury USDT",
        asset: "USDT",
        network: "Tron",
        address: "TXn9YvQ4mDemoTreasuryWallet00000001",
        is_default: true,
        verified: true,
        created_by: userId,
        updated_by: userId,
      },
      {
        merchant_id: merchantId,
        label: "Treasury BTC",
        asset: "BTC",
        network: "Bitcoin",
        address: "bc1qdemotreasurywallet0000000000000002",
        verified: true,
        created_by: userId,
        updated_by: userId,
      },
    ]);
  }

  const { count: keyCount } = await supabaseAdmin
    .from("merchant_api_key")
    .select("id", { count: "exact", head: true })
    .eq("merchant_id", merchantId);
  if (!keyCount) {
    const secret = `sk_live_${hex(40)}`;
    await supabaseAdmin.from("merchant_api_key").insert({
      merchant_id: merchantId,
      label: "Demo key",
      public_key: `pk_live_${hex(32)}`,
      secret_hash: await sha256Hex(secret),
      secret_preview: `${secret.slice(0, 12)}…${secret.slice(-4)}`,
      created_by: userId,
      updated_by: userId,
    });
  }

  // --- sample invoices, deposits and a payout -----------------------------
  const { count: invoiceCount } = await supabaseAdmin
    .from("payment_invoice")
    .select("id", { count: "exact", head: true })
    .eq("merchant_id", merchantId);

  if (!invoiceCount) {
    const samples = [
      { product: "Annual subscription", usd: 480, asset: "USDT", net: "Tron", status: "paid", paidPct: 1, hrs: 2 },
      { product: "Proxy traffic top-up", usd: 14, asset: "USDT", net: "Tron", status: "paid", paidPct: 1, hrs: 6 },
      { product: "Hardware bundle", usd: 1250, asset: "BTC", net: "Bitcoin", status: "overpaid", paidPct: 1.04, hrs: 9 },
      { product: "Design retainer", usd: 900, asset: "USDT", net: "Ethereum", status: "underpaid", paidPct: 0.62, hrs: 3 },
      { product: "Support plan", usd: 120, asset: "USDT", net: "Tron", status: "awaiting", paidPct: 0, hrs: 1 },
      { product: "Licence renewal", usd: 300, asset: "USDT", net: "Tron", status: "expired", paidPct: 0, hrs: 96 },
    ] as const;

    for (const [i, s] of samples.entries()) {
      const due = s.asset === "BTC" ? s.usd / 62000 : s.usd;
      const received = Number((due * s.paidPct).toFixed(8));
      const { data: inv } = await supabaseAdmin
        .from("payment_invoice")
        .insert({
          merchant_id: merchantId,
          order_id: `DEMO-${1000 + i}`,
          product_name: s.product,
          description: `${s.product} — demonstration order`,
          amount_usd: s.usd,
          asset: s.asset,
          network: s.net,
          due_amount: due,
          received_amount: received,
          status: s.status,
          customer_email: `buyer${i + 1}@example.com`,
          deposit_address: `dep_${hex(24)}`,
          paid_at: s.paidPct >= 1 ? hoursAgo(s.hrs) : null,
          settled: s.paidPct >= 1 && i < 2,
          created_at: hoursAgo(s.hrs + 1),
          created_by: userId,
          updated_by: userId,
        })
        .select("id")
        .single();

      if (inv && received > 0) {
        await supabaseAdmin.from("payment_deposit").insert({
          invoice_id: inv.id,
          tx_hash: `0x${hex(64)}`,
          amount: received,
          asset: s.asset,
          network: s.net,
          confirmations: 12,
          confirmed: true,
          sender_address: `0x${hex(40)}`,
          source: i % 2 === 0 ? "wallet_connect" : "manual",
          received_at: hoursAgo(s.hrs),
          created_by: userId,
          updated_by: userId,
        });
      }
    }

    const { data: batch } = await supabaseAdmin
      .from("payout_batch")
      .insert({
        merchant_id: merchantId,
        asset: "USDT",
        network: "Tron",
        mode: "hourly",
        status: "sent",
        gross_amount: 494,
        fee_amount: 1.5,
        net_amount: 492.5,
        destination_address: "TXn9YvQ4mDemoTreasuryWallet00000001",
        tx_hash: `0x${hex(64)}`,
        scheduled_at: hoursAgo(2),
        sent_at: hoursAgo(1),
        created_by: userId,
        updated_by: userId,
      })
      .select("id")
      .single();

    if (batch) {
      const { data: settled } = await supabaseAdmin
        .from("payment_invoice")
        .select("id, due_amount")
        .eq("merchant_id", merchantId)
        .eq("settled", true);
      for (const inv of settled ?? []) {
        await supabaseAdmin.from("payout_batch_item").insert({
          batch_id: batch.id,
          invoice_id: inv.id,
          amount: inv.due_amount ?? 0,
          created_by: userId,
        });
      }
    }
  }

  return { email: DEMO_EMAIL, password: DEMO_PASSWORD, ready: true };
});
