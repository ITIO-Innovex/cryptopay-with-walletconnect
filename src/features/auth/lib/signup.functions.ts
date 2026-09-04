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

/** Stores the business the merchant account trades as. */
export const saveBusinessDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        businessName: z.string().trim().min(2).max(160),
        website: z.string().trim().max(200).optional(),
        country: z.string().trim().max(80).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("merchant_account")
      .update({ company_name: data.businessName, updated_by: context.userId })
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
