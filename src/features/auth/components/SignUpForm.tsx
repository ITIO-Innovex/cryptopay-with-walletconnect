import { useState } from "react";

import { PasswordField, isStrongPassword } from "@/components/site/PasswordField";
import { EmailOtpDialog } from "@/components/site/EmailOtpDialog";
import { AuthField, AuthMessage } from "./AuthShell";
import { signUpMerchantAccount } from "../lib/auth-client";

/**
 * Merchant sign-up. The work email must be verified with the small OTP dialog
 * before the account can be created.
 */
export function SignUpForm() {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | "confirm" | "active">(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!emailVerified) {
      setError(
        "Your work email is not verified. Reason: we send a one-time code before creating an account. Solution: tick the verify box next to the email field.",
      );
      return;
    }
    if (!isStrongPassword(password)) {
      setError(
        "The password does not meet our rules. Reason: one or more conditions below the field are still unmet. Solution: adjust the password until every rule shows a tick.",
      );
      return;
    }
    if (password !== repeat) {
      setError(
        "The two passwords do not match. Reason: 'Repeat password' differs from 'Password'. Solution: retype both values.",
      );
      return;
    }

    setBusy(true);
    try {
      const result = await signUpMerchantAccount({
        email,
        password,
        fullName,
        companyName,
        website,
        contactPhone: phone,
      });
      setDone(result.session ? "active" : "confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not create the account.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <AuthMessage tone="success">
        We have received your account request for <strong>{email}</strong>.
        {done === "confirm"
          ? " Please confirm your email address using the link we just sent, then sign in."
          : " Your merchant dashboard is ready — you can sign in now."}
      </AuthMessage>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}

      <div className="space-y-4">
        <AuthField
          id="fullName"
          label="Contact name"
          hint="Who we should speak to about this account."
          placeholder="Jane Doe"
          value={fullName}
          onChange={setFullName}
        />
        <AuthField
          id="companyName"
          label="Company name"
          hint="The registered name of your business. It appears on your invoices."
          placeholder="Your Company Limited"
          value={companyName}
          onChange={setCompanyName}
        />
        <AuthField
          id="website"
          label="Website"
          hint="The site that will take payments, so we can review your integration."
          placeholder="https://yourcompany.com"
          required={false}
          value={website}
          onChange={setWebsite}
        />
        <AuthField
          id="phone"
          label="Contact number"
          hint="Used only if we need to reach you about your account."
          required={false}
          placeholder="+44 20 0000 0000"
          value={phone}
          onChange={setPhone}
        />

        <div>
          <AuthField
            id="signupEmail"
            label="Work email"
            hint="Use a company domain address. This becomes your sign-in username."
            type="email"
            autoComplete="email"
            placeholder="you@yourcompany.com"
            value={email}
            onChange={(v) => {
              setEmail(v);
              setEmailVerified(false);
            }}
          />
          <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={emailVerified}
              onChange={(e) => {
                if (!e.target.checked) {
                  setEmailVerified(false);
                  return;
                }
                if (!email.trim()) {
                  setError("Enter your work email before verifying it.");
                  return;
                }
                setOtpOpen(true);
              }}
              className="h-4 w-4 rounded border-input"
            />
            {emailVerified ? "Work email verified" : "Verify this work email"}
          </label>
        </div>

        <PasswordField
          id="newPassword"
          label="Password"
          hint="At least 8 characters with upper and lower case, a number and a symbol."
          value={password}
          onChange={setPassword}
          showRules
        />
        <PasswordField
          id="repeatPassword"
          label="Repeat password"
          hint="Type the same password again so we know it was not mistyped."
          value={repeat}
          onChange={setRepeat}
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-60"
      >
        {busy ? "Creating account…" : "Create account"}
      </button>

      <EmailOtpDialog
        open={otpOpen}
        email={email}
        onClose={() => setOtpOpen(false)}
        onVerified={() => {
          setEmailVerified(true);
          setOtpOpen(false);
        }}
      />
    </form>
  );
}
