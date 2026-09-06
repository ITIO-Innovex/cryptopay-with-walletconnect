import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { PasswordField } from "@/components/site/PasswordField";
import { AuthField, AuthMessage } from "./AuthShell";
import { AuthDivider, GoogleSignInButton } from "./GoogleSignInButton";
import { signInWithEmailAndPassword } from "../lib/auth-client";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  ensureDemoMerchant,
} from "../lib/demo-merchant.functions";

const REMEMBER_KEY = "cryptope-remember-email";

/** Merchant sign-in form. Lands on the merchant dashboard on success. */
export function SignInForm() {
  const navigate = useNavigate();
  const prepareDemo = useServerFn(ensureDemoMerchant);
  const [email, setEmail] = useState(() =>
    typeof window === "undefined" ? "" : (localStorage.getItem(REMEMBER_KEY) || DEMO_EMAIL),
  );
  const [password, setPassword] = useState(DEMO_PASSWORD);

  // The demonstration merchant is created on first visit so the pre-filled
  // credentials always work and land on a fully verified account.
  useEffect(() => {
    void prepareDemo({ data: undefined as never }).catch(() => undefined);
  }, [prepareDemo]);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signInWithEmailAndPassword(email, password);
      if (remember) localStorage.setItem(REMEMBER_KEY, email.trim().toLowerCase());
      else localStorage.removeItem(REMEMBER_KEY);
      await navigate({ to: "/dashboard" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(
        /invalid login/i.test(message)
          ? "We could not sign you in. Reason: the email or password does not match an account. Solution: check both values, or reset your password below."
          : message,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}

      <div className="space-y-4">
        <AuthField
          id="email"
          label="Email address"
          hint="The email address your merchant account was created with."
          type="email"
          autoComplete="email"
          placeholder="you@yourcompany.com"
          value={email}
          onChange={setEmail}
        />
        <PasswordField
          id="password"
          label="Password"
          hint="Your account password. Use the eye icon to check what you typed."
          value={password}
          onChange={setPassword}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-muted-foreground">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Remember me
        </label>
        <Link to="/forgot-password" className="text-brand hover:underline">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>

      <AuthDivider />
      <GoogleSignInButton />
    </form>
  );
}
