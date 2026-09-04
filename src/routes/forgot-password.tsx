import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { AuthShell, AuthField, AuthMessage } from "@/features/auth/components/AuthShell";
import { sendPasswordResetEmail } from "@/features/auth/lib/auth-client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Cryptope" },
      { name: "description", content: "Request a password reset link for your Cryptope merchant account." },
      { property: "og:title", content: "Reset your password — Cryptope" },
      { property: "og:description", content: "Request a password reset link for your merchant account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await sendPasswordResetEmail(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not send the reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We will email you a secure link to choose a new password."
      footer={
        <Link to="/login" className="text-brand hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <AuthMessage tone="success">
          If an account exists for {email}, a reset link is on its way. The link expires shortly, so
          use it soon.
        </AuthMessage>
      ) : (
        <form onSubmit={submit} noValidate>
          {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
          <AuthField
            id="resetEmail"
            label="Work email"
            hint="The email address on your merchant account."
            type="email"
            autoComplete="email"
            placeholder="you@yourcompany.com"
            value={email}
            onChange={setEmail}
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
