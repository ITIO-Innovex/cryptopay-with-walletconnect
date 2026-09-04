import { createFileRoute, Link } from "@tanstack/react-router";

import { AuthShell } from "@/features/auth/components/AuthShell";
import { SignInForm } from "@/features/auth/components/SignInForm";

type Search = { feHost?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const feHost = typeof search.feHost === "string" ? search.feHost.trim() : "";
    return feHost ? { feHost } : {};
  },
  head: () => ({
    meta: [
      { title: "Merchant sign in — Cryptope" },
      {
        name: "description",
        content:
          "Sign in to the Cryptope merchant dashboard to create invoices, track crypto payments and manage payouts.",
      },
      { property: "og:title", content: "Merchant sign in — Cryptope" },
      {
        property: "og:description",
        content: "Sign in to the Cryptope merchant dashboard to manage crypto payments and payouts.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthShell
      title="Merchant sign in"
      subtitle="Access your dashboard to create invoices, monitor payments and manage payouts."
      footer={
        <>
          New to Cryptope?{" "}
          <Link to="/signup" className="text-brand hover:underline">
            Create a merchant account
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthShell>
  );
}
