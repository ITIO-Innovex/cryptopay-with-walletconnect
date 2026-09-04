import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { PasswordField, isStrongPassword } from "@/components/site/PasswordField";
import { AuthShell, AuthMessage } from "@/features/auth/components/AuthShell";
import { setNewPasswordFromRecovery } from "@/features/auth/lib/auth-client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Choose a new password — Cryptope" },
      { name: "description", content: "Set a new password for your Cryptope merchant account." },
      { property: "og:title", content: "Choose a new password — Cryptope" },
      { property: "og:description", content: "Set a new password for your merchant account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isStrongPassword(password)) {
      setError("The password does not meet every rule shown below the field.");
      return;
    }
    if (password !== repeat) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await setNewPasswordFromRecovery(password);
      setDone(true);
      setTimeout(() => void navigate({ to: "/dashboard" }), 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} Solution: request a fresh reset link from the sign-in page.`
          : "We could not update the password.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Set a strong password for your merchant account.">
      {done ? (
        <AuthMessage tone="success">Password updated. Taking you to your dashboard…</AuthMessage>
      ) : (
        <form onSubmit={submit} noValidate>
          {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
          <div className="space-y-4">
            <PasswordField
              id="newPassword"
              label="New password"
              hint="At least 8 characters with upper and lower case, a number and a symbol."
              value={password}
              onChange={setPassword}
              showRules
            />
            <PasswordField
              id="repeatPassword"
              label="Repeat new password"
              hint="Type the same password again."
              value={repeat}
              onChange={setRepeat}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-60"
          >
            {busy ? "Saving…" : "Update password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
