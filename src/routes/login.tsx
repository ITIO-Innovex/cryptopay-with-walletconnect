import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Mail } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EmailOtpDialog } from "@/components/site/EmailOtpDialog";
import { PasswordField, isStrongPassword } from "@/components/site/PasswordField";

const CONTACT_EMAIL = "gateway@cryptope.net";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Merchant Log In — Cryptope" },
      {
        name: "description",
        content:
          "Log in to the Cryptope merchant area to manage your payment page settings, wallet addresses and payment sessions.",
      },
      { property: "og:title", content: "Merchant Log In — Cryptope" },
      {
        property: "og:description",
        content: "Sign in to the Cryptope merchant area for your digital asset payment technology.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Merchant Log In — Cryptope" },
      {
        name: "twitter:description",
        content: "Sign in to the Cryptope merchant area for your payment technology account.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

/**
 * Merchant sign-in and account request screen. No account system runs here:
 * sign-in shows a notice, and an account request is emailed to our team for
 * manual review and approval.
 */
function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [notice, setNotice] = useState(false);
  const isSignup = mode === "signup";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignup ? "Request a merchant account" : "Merchant log in"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignup
            ? "Tell us about your business. Every account is reviewed and approved manually before access is granted."
            : "Sign in to manage your payment page settings, wallet addresses and payment sessions."}
        </p>

        {isSignup ? <SignUpForm /> : <SignInForm notice={notice} setNotice={setNotice} />}

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have access?" : "No account yet?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? "signin" : "signup");
              setNotice(false);
            }}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          <Link to="/" className="underline underline-offset-4">
            Back to home
          </Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Sign-in form with remember-me and a forgot-password action. */
function SignInForm({
  notice,
  setNotice,
}: {
  notice: boolean;
  setNotice: (v: boolean) => void;
}) {
  const [password, setPassword] = useState("");

  return (
    <form
      className="mt-7 space-y-4 rounded-2xl border border-border bg-card p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setNotice(true);
      }}
    >
      <TextField
        id="email"
        type="email"
        label="Work email"
        placeholder="you@yourcompany.com"
        hint="We use this address for account access and service notices."
        icon={<Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      />

      <PasswordField
        id="password"
        label="Password"
        hint="Never share your password with anyone, including our team."
        value={password}
        onChange={setPassword}
      />

      <div className="flex items-center justify-between text-sm">
        <label htmlFor="remember" className="flex items-center gap-2 text-muted-foreground">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-input accent-brand"
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={() => setNotice(true)}
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
      >
        Log in
      </button>

      {notice && (
        <p className="rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">
          This is a demonstration screen and no account system runs here. Write to us from the{" "}
          <a href="/#contact" className="font-medium text-foreground underline">
            contact section
          </a>{" "}
          and we will set your merchant access up.
        </p>
      )}
    </form>
  );
}

/**
 * Account request form: company details, an email verified with a one-time
 * code, and a password with repeat confirmation. On submit the details are
 * handed to the visitor's mail app addressed to our team, exactly like the
 * contact form on the home page.
 */
function SignUpForm() {
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (!verified) {
      setError("Please verify your work email before creating an account.");
      return;
    }
    if (!isStrongPassword(password)) {
      setError("Your password does not meet all of the conditions listed below the field.");
      return;
    }
    if (password !== repeat) {
      setError("The two passwords do not match.");
      return;
    }

    setError("");
    const body = [
      "New merchant account request",
      "",
      `Company: ${fd.get("company")}`,
      `Contact name: ${fd.get("name")}`,
      `Work email: ${email} (verified by one-time code)`,
      `Website: ${fd.get("website")}`,
      `Expected monthly volume: ${fd.get("volume")}`,
    ].join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      "Merchant account request",
    )}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mt-7 rounded-2xl border border-border bg-card p-5">
        <BadgeCheck className="h-5 w-5 text-brand" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium">We have received your approval request.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Our team reviews every request as part of our onboarding and due diligence checks. We
          will email you at {email} once your account has been approved. If your mail app did not
          open, write to us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-foreground underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <form className="mt-7 space-y-4 rounded-2xl border border-border bg-card p-5" onSubmit={submit}>
        <TextField
          id="company"
          label="Company name"
          placeholder="Your Company Limited"
          hint="The registered business that will receive settlements."
        />

        <TextField
          id="name"
          label="Contact name"
          placeholder="Full name"
          hint="The person we should speak to about this account."
        />

        <TextField
          id="website"
          label="Website"
          placeholder="https://yourcompany.com"
          hint="The site where the payment page will be used."
        />

        <TextField
          id="volume"
          label="Expected monthly volume"
          placeholder="e.g. 50,000 USDT"
          hint="An estimate helps us confirm whether volume pricing applies."
          required={false}
        />

        <div>
          <label htmlFor="email" className="text-sm font-medium">
            Work email
          </label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-brand">
            <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@yourcompany.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setVerified(false);
              }}
              className="w-full bg-transparent py-2.5 text-sm outline-none"
            />
            {verified && <BadgeCheck className="h-4 w-4 text-brand" aria-label="Email verified" />}
          </div>
          <label
            htmlFor="verify-email"
            className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"
          >
            <input
              id="verify-email"
              type="checkbox"
              checked={verified}
              onChange={(e) => {
                if (e.target.checked) {
                  setOtpOpen(true);
                } else {
                  setVerified(false);
                }
              }}
              className="h-4 w-4 rounded border-input accent-brand"
            />
            {verified ? "Work email verified" : "Verify this email with a one-time code"}
          </label>
        </div>

        <PasswordField
          id="password"
          label="Password"
          hint="Used to sign in once your account is approved."
          value={password}
          onChange={setPassword}
          showRules
        />

        <PasswordField
          id="repeat-password"
          label="Repeat password"
          hint="Type the same password again to confirm it."
          value={repeat}
          onChange={setRepeat}
          error={repeat && repeat !== password ? "The two passwords do not match." : undefined}
        />

        {error && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Create account
        </button>

        <p className="text-xs text-muted-foreground">
          Accounts are opened only after our onboarding and due diligence review. By requesting an
          account you agree to our{" "}
          <Link
            to="/legal/$slug"
            params={{ slug: "terms" }}
            className="underline underline-offset-2"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            to="/legal/$slug"
            params={{ slug: "acceptable-use" }}
            className="underline underline-offset-2"
          >
            Acceptable Use Policy
          </Link>
          .
        </p>
      </form>

      <EmailOtpDialog
        open={otpOpen}
        email={email}
        onVerified={() => {
          setVerified(true);
          setOtpOpen(false);
          setError("");
        }}
        onClose={() => setOtpOpen(false)}
      />
    </>
  );
}

/** Labelled text input with placeholder and a short helper line. */
function TextField({
  id,
  label,
  hint,
  placeholder,
  type = "text",
  icon,
  required = true,
}: {
  id: string;
  label: string;
  hint: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-brand">
        {icon}
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          placeholder={placeholder}
          title={hint}
          className="w-full bg-transparent py-2.5 text-sm outline-none"
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
