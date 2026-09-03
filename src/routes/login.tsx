import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PasswordField } from "@/components/site/PasswordField";
import {
  getApiBaseUrl,
  merchantAppOrigin,
  merchantSignupUrl,
  navigateToMerchant,
} from "@/lib/domainUtils";
import {
  persistMerchantLoginSession,
  persistTwoFactorPending,
  PGX_MERCHANT_LOGIN_MESSAGE,
  sanitizeMerchantUser,
} from "@/lib/merchant-session";

type Search = { feHost?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    feHost: typeof search.feHost === "string" ? search.feHost.trim() : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Merchant Log In" },
      {
        name: "description",
        content: "Sign in to manage your payment page settings, wallet addresses and payment sessions.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

/**
 * SS3 replica merchant log in (header + card). Authenticates against the same
 * /api/auth/login as the merchant dashboard, then opens SS5 (/dashboard/overview)
 * on the parent merchant origin.
 */
function LoginPage() {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailId.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setBusy(true);
    setError("");
    void fetch(`${getApiBaseUrl()}/api/auth/login`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ emailId: emailId.trim(), password }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.responseMessage || `HTTP ${res.status}`);
        }
        return data as {
          success?: boolean;
          responseMessage?: string;
          jwtToken?: string;
          user?: { roles?: string; twoFactorEnabled?: boolean | null };
        };
      })
      .then((res) => {
        if (!res?.success) {
          throw new Error(res.responseMessage || "Incorrect user ID or password. Try again.");
        }
        const user = res.user;
        const jwt = res.jwtToken;
        if (!user) {
          throw new Error(res.responseMessage || "Login failed. Try again.");
        }
        const twoFactor = Boolean(user.twoFactorEnabled);
        if (twoFactor) {
          handOffToMerchant({ user, jwtToken: jwt, twoFactor: true });
          return;
        }
        if (!jwt) {
          throw new Error(res.responseMessage || "Login failed. Try again.");
        }
        handOffToMerchant({ user, jwtToken: jwt, twoFactor: false });
      })
      .catch((err: unknown) => {
        setBusy(false);
        setError(err instanceof Error ? err.message : "Incorrect user ID or password. Try again.");
      });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Merchant log in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage your payment page settings, wallet addresses and payment sessions.
        </p>

        <form className="mt-7 space-y-4 rounded-2xl border border-border bg-card p-5" onSubmit={submit}>
          <div>
            <label htmlFor="emailId" className="text-sm font-medium">
              Work email
            </label>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-brand">
              <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                id="emailId"
                name="emailId"
                type="text"
                autoComplete="username"
                required
                placeholder="you@yourcompany.com"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              We use this address for account access and service notices.
            </p>
          </div>

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
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-brand"
              />
              Remember me
            </label>
            <a
              href={`${merchantAppOrigin().replace(/\/$/, "")}/forgot-password`}
              target="_top"
              rel="noopener"
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Log in"}
          </button>

          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
              {error}
            </p>
          )}
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          No account yet?{" "}
          <a
            href={merchantSignupUrl()}
            target="_top"
            rel="noopener"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign up
          </a>
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

function handOffToMerchant(payload: {
  user: { roles?: string; twoFactorEnabled?: boolean | null; [key: string]: unknown };
  jwtToken?: string;
  twoFactor: boolean;
}) {
  const user = sanitizeMerchantUser(payload.user);
  const jwt = payload.jwtToken;
  const merchantOrigin = merchantAppOrigin();

  try {
    if (window.top && window.top !== window) {
      try {
        const store = window.top.sessionStorage;
        if (payload.twoFactor) {
          persistTwoFactorPending(user, jwt, store);
        } else if (jwt) {
          persistMerchantLoginSession(user, jwt, store);
        }
        window.top.location.assign(
          `${merchantOrigin.replace(/\/$/, "")}${payload.twoFactor ? "/2fa" : "/dashboard/overview"}`,
        );
        return;
      } catch {
        window.top.postMessage(
          {
            type: PGX_MERCHANT_LOGIN_MESSAGE,
            user,
            jwtToken: jwt,
            twoFactor: payload.twoFactor,
          },
          merchantOrigin || "*",
        );
        return;
      }
    }
  } catch {
    /* fall through */
  }

  if (payload.twoFactor) {
    persistTwoFactorPending(user, jwt);
    navigateToMerchant("/2fa");
    return;
  }
  if (jwt) persistMerchantLoginSession(user, jwt);
  navigateToMerchant("/dashboard/overview");
}
