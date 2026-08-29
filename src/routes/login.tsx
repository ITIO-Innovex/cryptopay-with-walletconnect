import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Mail } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Merchant Log In — Cryptope" },
      {
        name: "description",
        content:
          "Log in to the Cryptope merchant area to manage your crypto payment gateway settings, wallets and payment sessions.",
      },
      { property: "og:title", content: "Merchant Log In — Cryptope" },
      {
        property: "og:description",
        content: "Sign in to the Cryptope merchant area for your crypto payment gateway.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Merchant Log In — Cryptope" },
      {
        name: "twitter:description",
        content: "Sign in to the Cryptope merchant area for your crypto payment gateway.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

/**
 * Demo-only merchant sign-in screen. No authentication runs here: the form
 * simply shows a notice, since the merchant area is not part of this build.
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
          {isSignup ? "Create a merchant account" : "Merchant log in"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignup
            ? "Tell us who you are and we will follow up with integration details."
            : "Sign in to manage your gateway settings, wallets and payment sessions."}
        </p>

        <form
          className="mt-7 space-y-4 rounded-2xl border border-border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            setNotice(true);
          }}
        >
          {isSignup && (
            <AuthField
              id="company"
              label="Company name"
              placeholder="Onternity Tech Limited"
              hint="The registered business that will receive settlements."
            />
          )}

          <AuthField
            id="email"
            type="email"
            label="Work email"
            placeholder="you@company.com"
            hint="We use this address for account access and gateway notices."
            icon={<Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
          />

          <AuthField
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            hint="Minimum eight characters. Never share it with anyone."
            icon={<Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
          />

          {!isSignup && (
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
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            {isSignup ? "Create account" : "Log in"}
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

/** Labelled input with placeholder and a short helper line. */
function AuthField({
  id,
  label,
  hint,
  placeholder,
  type = "text",
  icon,
}: {
  id: string;
  label: string;
  hint: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
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
          required
          placeholder={placeholder}
          title={hint}
          className="w-full bg-transparent py-2.5 text-sm outline-none"
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
