/**
 * Server functions used by the multi-step sign-up wizard: saving the personal
 * details captured before the password step, and the business details captured
 * straight after the account is created.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Stores the person behind the account and marks the email as verified. */
export const savePersonalDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        firstName: z.string().trim().min(1).max(80),
        lastName: z.string().trim().min(1).max(80),
        phone: z.string().trim().max(40).optional(),
        emailVerified: z.boolean().default(true),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    const { error } = await context.supabase
      .from("auth_user_profile")
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: fullName,
        contact_phone: data.phone || null,
        email_verified: data.emailVerified,
        updated_by: context.userId,
      })
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Turns whatever the merchant typed into a proper https address.
 * "example.com", "http://example.com", "www.example.com/pricing" all become
 * "https://…" — plain http is never accepted.
 */
export function normaliseWebsite(raw: string): { url: string; domain: string } | null {
  const cleaned = raw.trim().replace(/\s+/g, "").replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  if (!cleaned) return null;
  const host = cleaned.split("/")[0] ?? "";
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) return null;
  return { url: `https://${cleaned}`, domain: host.replace(/^www\./i, "").toLowerCase() };
}

/**
 * Checks that the website the merchant typed actually answers, and returns the
 * tidied https address plus a preview image URL to show beside the field.
 */
export const checkWebsiteAvailability = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ website: z.string().trim().max(200) }).parse(data))
  .handler(async ({ data }) => {
    const parsed = normaliseWebsite(data.website);
    if (!parsed) {
      return {
        ok: false as const,
        reason:
          "That does not look like a website address. Reason: a domain needs a name and an ending such as .com. Solution: enter it like yourcompany.com.",
      };
    }

    const candidates = [parsed.url, `https://www.${parsed.domain}`];
    for (const candidate of candidates) {
      try {
        const response = await fetch(candidate, {
          redirect: "follow",
          signal: AbortSignal.timeout(8000),
          headers: { "user-agent": "Mozilla/5.0 (compatible; CryptopeSignup/1.0)" },
        });
        if (response.ok || response.status === 403 || response.status === 401) {
          const finalUrl = response.url || candidate;
          const domain = new URL(finalUrl).hostname.replace(/^www\./i, "").toLowerCase();
          return {
            ok: true as const,
            url: finalUrl,
            domain,
            previewUrl: `https://s.wordpress.com/mshots/v1/${encodeURIComponent(finalUrl)}?w=640&h=420`,
          };
        }
      } catch {
        // try the next candidate
      }
    }

    return {
      ok: false as const,
      reason:
        "We cannot reach that website. Reason: the address did not respond over a secure connection. Solution: check the spelling, or enter the address your customers use.",
    };
  });

/** Tells the sign-up form whether an email address already belongs to an account. */
export const checkEmailAvailability = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ email: z.string().trim().toLowerCase().email().max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: taken, error } = await supabaseAdmin.rpc("email_is_registered", {
      _email: data.email,
    });
    if (error) throw new Error("We could not check that email just now. Please try again.");
    return { available: !taken };
  });

/** Stores the business the merchant account trades as. */
export const saveBusinessDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        businessName: z.string().trim().min(2).max(160),
        website: z.string().trim().max(200).optional(),
        corporateEmail: z.string().trim().toLowerCase().email().max(200).optional(),
        country: z.string().trim().max(80).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("merchant_account")
      .update({
        company_name: data.businessName,
        business_email: data.corporateEmail || null,
        updated_by: context.userId,
      })
      .eq("owner_user_id", context.userId);
    if (error) throw new Error(error.message);

    await context.supabase
      .from("auth_user_profile")
      .update({
        company_name: data.businessName,
        website: data.website || null,
        updated_by: context.userId,
      })
      .eq("user_id", context.userId);

    return { ok: true };
  });
