/**
 * Didit (didit.me) KYB / KYC / AML provider integration — server only.
 *
 * Responsibilities:
 *  - create a hosted verification session for a merchant (`createDiditSession`)
 *  - verify the signature of an incoming provider webhook (`verifyDiditWebhook`)
 *  - map a provider status onto our merchant verification state (`applyDiditStatus`)
 *
 * The API key never leaves the server; the browser only ever receives the
 * hosted session URL.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

/** Per-session configuration, not a secret: the "Cryptope KYB" workflow. */
export const DIDIT_WORKFLOW_ID = "6e6268dd-e98c-4c42-b3d7-cdee881bf9c0";
const DIDIT_API_BASE = "https://verification.didit.me";

export interface DiditSession {
  session_id: string;
  url: string;
  status: string;
}

/**
 * Creates a hosted verification session for one merchant and returns the URL
 * the merchant should be sent to.
 */
export async function createDiditSession(input: {
  vendorData: string;
  vendorBusinessId?: string;
  callbackUrl: string;
  contactEmail?: string | null;
}): Promise<DiditSession> {
  const apiKey = process.env["DIDIT_API_KEY"];
  if (!apiKey) throw new Error("Verification provider is not configured (missing API key).");

  const body: Record<string, unknown> = {
    workflow_id: DIDIT_WORKFLOW_ID,
    vendor_data: input.vendorData,
    callback: input.callbackUrl,
  };
  if (input.vendorBusinessId) body["vendor_business_id"] = input.vendorBusinessId;
  if (input.contactEmail) {
    body["contact_details"] = { email: input.contactEmail, send_notification_emails: false };
  }

  const response = await fetch(`${DIDIT_API_BASE}/v3/session/`, {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[didit] create session failed", response.status, detail);
    throw new Error(
      "Verification could not be started. Reason: our verification partner did not accept the request. Solution: try again in a minute, or contact support if it keeps failing.",
    );
  }

  const session = (await response.json()) as DiditSession;
  return { session_id: session.session_id, url: session.url, status: session.status };
}

/** Fetches the full decision payload for a session (source of truth on demand). */
export async function fetchDiditDecision(sessionId: string): Promise<unknown> {
  const apiKey = process.env["DIDIT_API_KEY"];
  if (!apiKey) throw new Error("Verification provider is not configured (missing API key).");
  const response = await fetch(`${DIDIT_API_BASE}/v3/session/${sessionId}/decision/`, {
    headers: { "x-api-key": apiKey },
  });
  if (!response.ok) throw new Error(`Provider returned ${response.status}`);
  return response.json();
}

/* ---------------------------------------------------------------- webhook */

/** Whole-number floats (1.0) become integers (1), recursively. */
function shortenFloats(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shortenFloats);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, shortenFloats(v)]),
    );
  }
  if (typeof value === "number" && !Number.isInteger(value) && value % 1 === 0) {
    return Math.trunc(value);
  }
  return value;
}

/** Recursive lexicographic key sort; array order is preserved. */
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.keys(value as object)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

export interface DiditWebhookPayload {
  event_id?: string;
  webhook_type?: string;
  session_id?: string;
  status?: string;
  vendor_data?: string;
  timestamp?: number;
  decision?: unknown;
  [key: string]: unknown;
}

/**
 * Verifies freshness and the X-Signature-V2 HMAC of an incoming webhook.
 * Returns the parsed payload, or an error Response to send straight back.
 */
export function verifyDiditWebhook(
  rawBody: string,
  headers: Headers,
): { payload: DiditWebhookPayload } | { error: Response } {
  const secret = process.env["DIDIT_WEBHOOK_SECRET"];
  if (!secret) {
    console.error("[didit] webhook secret missing");
    return { error: new Response("not configured", { status: 500 }) };
  }

  const signature = headers.get("x-signature-v2") ?? "";
  const timestamp = Number(headers.get("x-timestamp"));
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300) {
    return { error: new Response("stale", { status: 401 }) };
  }

  let parsed: DiditWebhookPayload;
  try {
    parsed = JSON.parse(rawBody) as DiditWebhookPayload;
  } catch {
    return { error: new Response("bad body", { status: 400 }) };
  }

  const canonical = JSON.stringify(sortKeys(shortenFloats(parsed)));
  const expected = createHmac("sha256", secret).update(canonical, "utf8").digest("hex");
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return { error: new Response("bad sig", { status: 401 }) };
  }

  return { payload: parsed };
}

/** Provider status -> our merchant verification status. */
export function mapDiditStatus(status: string | undefined): {
  verification: "not_started" | "in_review" | "verified" | "rejected";
  reason: string;
} {
  switch (status) {
    case "Approved":
      return { verification: "verified", reason: "Verification approved by our partner." };
    case "Declined":
      return {
        verification: "rejected",
        reason: "Our partner could not approve the submitted company details.",
      };
    case "In Review":
      return { verification: "in_review", reason: "Documents are being reviewed." };
    case "In Progress":
    case "Awaiting User":
      return { verification: "in_review", reason: "Verification is in progress." };
    case "Resubmitted":
      return { verification: "in_review", reason: "Some steps were sent back for resubmission." };
    case "Abandoned":
    case "Expired":
      return {
        verification: "not_started",
        reason: "The verification session was not completed in time.",
      };
    case "Kyc Expired":
      return { verification: "not_started", reason: "Verification has expired and must be redone." };
    default:
      return { verification: "in_review", reason: "Verification is in progress." };
  }
}

/**
 * Applies a provider decision to the merchant account. Idempotent: the caller
 * has already de-duplicated on event_id.
 */
export async function applyDiditStatus(
  admin: SupabaseClient<Database>,
  payload: DiditWebhookPayload,
): Promise<void> {
  const merchantId = payload.vendor_data;
  if (!merchantId) return;
  if (payload.status === "Not Started") return;

  const { verification, reason } = mapDiditStatus(payload.status);
  const update: Record<string, unknown> = {
    verification_status: verification,
    verification_reason: reason,
    verification_skipped: false,
    verified_at: verification === "verified" ? new Date().toISOString() : null,
  };
  if (payload.session_id) update["verification_session_id"] = payload.session_id;
  if (payload.decision !== undefined) update["verification_decision"] = payload.decision;

  const { error } = await admin
    .from("merchant_account")
    .update(update as never)
    .eq("id", merchantId);
  if (error) console.error("[didit] merchant update failed", error.message);
}
