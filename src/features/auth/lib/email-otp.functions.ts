/**
 * Real email verification for the sign-up wizard: a six-digit one-time code is
 * generated on the server, emailed to the merchant, and checked back here.
 * Codes are stored hashed, expire after ten minutes and allow five attempts.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 45;

const emailSchema = z.string().trim().toLowerCase().email().max(200);

/** SHA-256 of the address and code, so a database leak reveals no usable codes. */
async function hashCode(email: string, code: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${email}:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateSixDigitCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String((buf[0] ?? 0) % 1_000_000).padStart(6, "0");
}

/**
 * Creates a one-time code for the address and sends it as a branded email.
 * Public on purpose (the merchant has no account yet) and rate limited per address.
 */
export const requestEmailVerificationCode = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ email: emailSchema }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");

    const { data: recent } = await supabaseAdmin
      .from("email_verification_code")
      .select("created_at")
      .eq("email", data.email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent?.created_at) {
      const elapsed = (Date.now() - new Date(recent.created_at).getTime()) / 1000;
      if (elapsed < RESEND_COOLDOWN_SECONDS) {
        return {
          sent: false as const,
          retryInSeconds: Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed),
        };
      }
    }

    const code = generateSixDigitCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString();

    const { error } = await supabaseAdmin.from("email_verification_code").insert({
      email: data.email,
      code_hash: await hashCode(data.email, code),
      expires_at: expiresAt,
    });
    if (error) throw new Error("We could not start email verification. Please try again.");

    const result = await sendTemplateEmail("email-verification-code", data.email, {
      templateData: { code, minutes: CODE_TTL_MINUTES },
    });
    if (!result.sent) {
      throw new Error(
        "We cannot email this address. Reason: it has previously bounced or unsubscribed. Solution: use a different work email address.",
      );
    }

    return { sent: true as const, retryInSeconds: RESEND_COOLDOWN_SECONDS };
  });

/** Checks a code the merchant typed in and marks it as used when it matches. */
export const verifyEmailVerificationCode = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ email: emailSchema, code: z.string().trim().regex(/^\d{6}$/) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row } = await supabaseAdmin
      .from("email_verification_code")
      .select("id, code_hash, attempts, expires_at, consumed_at")
      .eq("email", data.email)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!row) {
      return {
        verified: false as const,
        reason:
          "We have no active code for this address. Reason: it was already used or never requested. Solution: select Send code to get a new one.",
      };
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return {
        verified: false as const,
        reason:
          "That code has expired. Reason: codes are valid for 10 minutes. Solution: select Resend code and enter the new one.",
      };
    }
    if (row.attempts >= MAX_ATTEMPTS) {
      return {
        verified: false as const,
        reason:
          "Too many incorrect attempts. Reason: this code has been locked for your security. Solution: select Resend code to start again.",
      };
    }

    const matches = row.code_hash === (await hashCode(data.email, data.code));
    if (!matches) {
      await supabaseAdmin
        .from("email_verification_code")
        .update({ attempts: row.attempts + 1, updated_at: new Date().toISOString() })
        .eq("id", row.id);
      return {
        verified: false as const,
        reason:
          "That code is not correct. Reason: it does not match the code we emailed. Solution: check the latest email and type the six digits again.",
      };
    }

    await supabaseAdmin
      .from("email_verification_code")
      .update({ consumed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", row.id);

    return { verified: true as const };
  });
