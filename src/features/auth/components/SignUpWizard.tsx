import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, Loader2, ShieldCheck } from "lucide-react";

import { PasswordField, isStrongPassword } from "@/components/site/PasswordField";
import { EmailOtpDialog } from "@/components/site/EmailOtpDialog";
import { AuthField, AuthMessage } from "./AuthShell";
import { AuthDivider, GoogleSignInButton } from "./GoogleSignInButton";
import { signUpMerchantAccount } from "../lib/auth-client";
import {
  savePersonalDetails,
  saveBusinessDetails,
  checkWebsiteAvailability,
  checkEmailAvailability,
} from "../lib/signup.functions";
import { getOrCreateAccount } from "../lib/account.functions";
import {
  startVerification,
  skipVerification,
  refreshVerificationStatus,
  VERIFICATION_PROVIDER_NAME,
} from "../lib/verification.functions";

type Step = "details" | "password" | "business" | "verification";

/**
 * Four-step merchant registration: personal details with email verification,
 * password, business name, then KYB/KYC with the option to skip for now.
 */
export function SignUpWizard() {
  const navigate = useNavigate();
  const bootstrapAccount = useServerFn(getOrCreateAccount);
  const persistPersonal = useServerFn(savePersonalDetails);
  const persistBusiness = useServerFn(saveBusinessDetails);
  const inspectWebsite = useServerFn(checkWebsiteAvailability);
  const inspectEmail = useServerFn(checkEmailAvailability);
  const beginVerification = useServerFn(startVerification);
  const postponeVerification = useServerFn(skipVerification);
  const refreshVerification = useServerFn(refreshVerificationStatus);

  const [step, setStep] = useState<Step>("details");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);

  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [site, setSite] = useState<{ url: string; domain: string } | null>(null);
  const [siteError, setSiteError] = useState("");
  const [checkingSite, setCheckingSite] = useState(false);
  const [corporateEmail, setCorporateEmail] = useState("");
  const [corporateEmailError, setCorporateEmailError] = useState("");
  const [checkingCorporateEmail, setCheckingCorporateEmail] = useState(false);

  const [verificationSent, setVerificationSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  function fail(message: string) {
    setError(message);
    setBusy(false);
  }

  // --- step 1 --------------------------------------------------------------
  function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      fail(
        "We cannot continue. Reason: your first and last name are missing. Solution: fill in both name fields.",
      );
      return;
    }
    if (!emailVerified) {
      fail(
        "Your email is not verified yet. Reason: we confirm the address with a one-time code before creating an account. Solution: select Verify next to the email field and enter the code.",
      );
      return;
    }
    setStep("password");
  }

  // --- step 2: create the account -----------------------------------------
  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isStrongPassword(password)) {
      fail(
        "That password cannot be used. Reason: it does not meet every rule listed below the field. Solution: add the missing characters until each rule turns green.",
      );
      return;
    }
    if (password !== repeat) {
      fail(
        "The passwords do not match. Reason: the repeat field is different. Solution: type the same password in both fields.",
      );
      return;
    }
    setBusy(true);
    try {
      await signUpMerchantAccount({
        email,
        password,
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        companyName: "",
        contactPhone: phone,
      });
      // Creates the profile, merchant account, payout setting and first API key
      // so the business and verification steps have something to write to.
      await bootstrapAccount({ data: undefined as never });
      await persistPersonal({
        data: { firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), emailVerified: true },
      });
      setBusy(false);
      setStep("business");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      fail(
        /already registered|already exists/i.test(message)
          ? "We could not create the account. Reason: this email already has an account. Solution: sign in instead, or use the forgot-password link."
          : message,
      );
    }
  }

  // --- step 3: business ----------------------------------------------------

  /** Confirms the website answers. */
  async function runWebsiteCheck() {
    const value = website.trim();
    if (!value) {
      setSite(null);
      setSiteError("");
      return;
    }
    setCheckingSite(true);
    setSiteError("");
    try {
      const result = await inspectWebsite({ data: { website: value } });
      if (result.ok) {
        setSite({ url: result.url, domain: result.domain });
        setWebsite(result.url);
      } else {
        setSite(null);
        setSiteError(result.reason);
      }
    } catch {
      setSite(null);
      setSiteError(
        "We could not check that website. Reason: the check did not complete. Solution: try again in a moment.",
      );
    } finally {
      setCheckingSite(false);
    }
  }

  /** Corporate email must match the website domain and be free to use. */
  async function runCorporateEmailCheck(): Promise<boolean> {
    const value = corporateEmail.trim().toLowerCase();
    if (!site) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setCorporateEmailError(
        "That does not look like an email address. Solution: enter it like you@" + site.domain + ".",
      );
      return false;
    }
    if (!value.endsWith("@" + site.domain)) {
      setCorporateEmailError(
        `This address does not belong to your website. Reason: it must end with @${site.domain}. Solution: use your company address on that domain.`,
      );
      return false;
    }
    setCheckingCorporateEmail(true);
    try {
      const result = await inspectEmail({ data: { email: value } });
      if (!result.available) {
        setCorporateEmailError(
          "This address already has an account. Reason: it was registered before. Solution: sign in with it, or use a different company address.",
        );
        return false;
      }
      setCorporateEmailError("");
      return true;
    } catch {
      setCorporateEmailError("We could not check that address just now. Please try again.");
      return false;
    } finally {
      setCheckingCorporateEmail(false);
    }
  }

  async function submitBusiness(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (businessName.trim().length < 2) {
      fail(
        "The business name is missing. Reason: verification is carried out against your registered company. Solution: enter the legal name of your business.",
      );
      return;
    }
    if (!site) {
      fail(
        "We still need a working website. Reason: the address has not been confirmed yet. Solution: enter your website address and wait for the check to finish.",
      );
      return;
    }
    if (!(await runCorporateEmailCheck())) {
      fail(
        "We cannot continue without a valid corporate email. Reason: see the message under that field. Solution: correct the address and try again.",
      );
      return;
    }
    setBusy(true);
    try {
      await persistBusiness({
        data: {
          businessName: businessName.trim(),
          website: site.url,
          corporateEmail: corporateEmail.trim().toLowerCase(),
        },
      });
      setBusy(false);
      setStep("verification");
    } catch (err) {
      fail(err instanceof Error ? err.message : "Could not save the business details");
    }
  }

  // --- step 4: verification -----------------------------------------------
  async function goVerify() {
    setBusy(true);
    setError("");
    try {
      const result = await beginVerification({ data: { origin: window.location.origin } });
      setVerificationSent(true);
      setBusy(false);
      window.open(result.url, "_blank", "noopener");
    } catch (err) {
      fail(err instanceof Error ? err.message : "Could not start verification");
    }
  }

  async function completeVerification() {
    setBusy(true);
    try {
      await refreshVerification({ data: undefined as never });
      await navigate({ to: "/dashboard" });
    } catch (err) {
      fail(err instanceof Error ? err.message : "Could not update verification");
    }
  }

  async function skipForNow() {
    setBusy(true);
    try {
      await postponeVerification({ data: undefined as never });
      await navigate({ to: "/dashboard" });
    } catch (err) {
      fail(err instanceof Error ? err.message : "Could not open the dashboard");
    }
  }

  return (
    <>
      
      {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}

      {step === "details" && (
        <form onSubmit={submitDetails} noValidate className="space-y-4">
          <GoogleSignInButton />
          <AuthDivider />
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              id="firstName"
              label="First name"
              hint="As shown on your company records."
              autoComplete="given-name"
              placeholder="Dana"
              value={firstName}
              onChange={setFirstName}
            />
            <AuthField
              id="lastName"
              label="Last name"
              hint="Used on your account and agreements."
              autoComplete="family-name"
              placeholder="Merchant"
              value={lastName}
              onChange={setLastName}
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@yourcompany.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailVerified(false);
                }}
                onBlur={() => {
                  if (emailLooksValid && !emailVerified) setOtpOpen(true);
                }}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
              {emailVerified ? (
                <span className="flex shrink-0 items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-600">
                  <BadgeCheck className="h-4 w-4" /> Verified
                </span>
              ) : emailLooksValid ? (
                <button
                  type="button"
                  onClick={() => setOtpOpen(true)}
                  className="shrink-0 rounded-xl border border-brand px-3 text-xs font-semibold text-brand"
                >
                  Verify
                </button>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              We send a one-time code to confirm the address. Everything about your account is sent
              here.
            </p>
          </div>

          <AuthField
            id="phone"
            label="Phone number (optional)"
            hint="Only used if we need to reach you about a payment issue."
            type="tel"
            required={false}
            autoComplete="tel"
            placeholder="+44 20 7946 0991"
            value={phone}
            onChange={setPhone}
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground"
          >
            Continue
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={submitPassword} noValidate className="space-y-4">
          <p className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Signing up as <span className="font-medium text-foreground">{email}</span> — verified.
            Choose a password to secure the account.
          </p>
          <PasswordField
            id="password"
            label="Create password"
            hint="Each rule below turns green as your password meets it."
            value={password}
            onChange={setPassword}
            showRules
          />
          <PasswordField
            id="repeat"
            label="Repeat password"
            hint="Type the same password again so we know it was not mistyped."
            value={repeat}
            onChange={setRepeat}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("details")}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-60"
            >
              {busy ? "Creating account…" : "Create account"}
            </button>
          </div>
        </form>
      )}

      {step === "business" && (
        <form onSubmit={submitBusiness} noValidate className="space-y-4">
          <AuthMessage tone="success">
            Your account has been created successfully. Next, set up your business account.
          </AuthMessage>
          <AuthField
            id="businessName"
            label="Business name"
            hint="The legal name of the company we will verify and settle funds to."
            placeholder="Your Company Limited"
            value={businessName}
            onChange={setBusinessName}
          />

          <div>
            <label htmlFor="website" className="text-sm font-medium">
              Website
            </label>
            <input
              id="website"
              placeholder="yourcompany.com"
              value={website}
              onChange={(e) => {
                setWebsite(e.target.value);
                setSite(null);
                setSiteError("");
                setCorporateEmail("");
                setCorporateEmailError("");
              }}
              onBlur={() => void runWebsiteCheck()}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Just the address is fine — we add the secure https:// part for you and check it
              responds.
            </p>
            {checkingSite ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Checking the website…
              </p>
            ) : null}
            {siteError ? <p className="mt-1.5 text-xs text-destructive">{siteError}</p> : null}
            {site ? <p className="mt-1.5 text-xs text-emerald-600">Reachable at {site.url}</p> : null}
          </div>

          {site ? (
            <div>
              <label htmlFor="corporateEmail" className="text-sm font-medium">
                Corporate email
              </label>
              <input
                id="corporateEmail"
                type="email"
                placeholder={`you@${site.domain}`}
                value={corporateEmail}
                onChange={(e) => {
                  setCorporateEmail(e.target.value);
                  setCorporateEmailError("");
                }}
                onBlur={() => void runCorporateEmailCheck()}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Must use the same domain as your website ({site.domain}) and must not already have
                an account with us.
              </p>
              {checkingCorporateEmail ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking this address…
                </p>
              ) : null}
              {corporateEmailError ? (
                <p className="mt-1.5 text-xs text-destructive">{corporateEmailError}</p>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save and continue"}
          </button>
        </form>
      )}

      {step === "verification" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-brand" /> Business verification (KYB, KYC and AML)
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Verification is carried out by our verification partner, {VERIFICATION_PROVIDER_NAME}.
              You will be taken to their secure page to upload company documents and confirm the
              identity of the directors. It usually takes a few minutes.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Live payment features stay switched off until verification is approved. You can look
              around the dashboard in the meantime.
            </p>
          </div>

          {verificationSent ? (
            <AuthMessage tone="success">
              We have opened the verification page in a new tab. Once you have finished there, come
              back and select “I have completed verification”.
            </AuthMessage>
          ) : null}

          <button
            type="button"
            onClick={goVerify}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {verificationSent ? "Open verification again" : "Start verification"}
          </button>

          {verificationSent ? (
            <button
              type="button"
              onClick={completeVerification}
              disabled={busy}
              className="w-full rounded-xl border border-emerald-500/50 px-4 py-2.5 text-sm font-semibold text-emerald-600 disabled:opacity-60"
            >
              I have completed verification
            </button>
          ) : null}

          <button
            type="button"
            onClick={skipForNow}
            disabled={busy}
            className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            Skip for now and go to the dashboard
          </button>
        </div>
      )}

      <EmailOtpDialog
        open={otpOpen}
        email={email}
        onVerified={() => {
          setEmailVerified(true);
          setOtpOpen(false);
        }}
        onClose={() => setOtpOpen(false)}
      />
    </>
  );
}
