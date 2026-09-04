import { createFileRoute, Link } from "@tanstack/react-router";

import { AuthShell } from "@/features/auth/components/AuthShell";
import { SignUpWizard } from "@/features/auth/components/SignUpWizard";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create a merchant account — Cryptope" },
      {
        name: "description",
        content:
          "Open a Cryptope merchant account to accept crypto payments, generate invoices and settle to your own wallet.",
      },
      { property: "og:title", content: "Create a merchant account — Cryptope" },
      {
        property: "og:description",
        content: "Open a Cryptope merchant account to accept crypto payments and settle to your own wallet.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <AuthShell
      title="Create a merchant account"
      subtitle="It takes four short steps: your details, a password, your business and verification."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpWizard />
    </AuthShell>
  );
}
