import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { EmailPill } from "@/components/site/EmailPill";
import { useDomainBranding } from "@/hooks/useDomainBranding";
import { contactEmailForBrand } from "@/lib/domainUtils";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>) => ({
    feHost: typeof search.feHost === "string" ? search.feHost : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contact — Payment page technology" },
      {
        name: "description",
        content: "Contact us about payment page software, supported assets, integration and pricing.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const branding = useDomainBranding();
  const brand = branding.name || "PGX";
  const email = contactEmailForBrand(brand);
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Contact us</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Tell us about your business and which coins you want to accept. We usually reply within
          one business day.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {sent ? (
              <div className="rounded-2xl border border-border bg-card p-5 text-sm">
                <p className="font-medium">Thanks — your message is ready to send.</p>
                <p className="mt-1 text-muted-foreground">
                  Your email app should have opened with the details filled in. If it did not, copy
                  the address below and write to us directly.
                </p>
                <div className="mt-3">
                  <EmailPill email={email} />
                </div>
              </div>
            ) : (
              <form
                className="grid max-w-xl gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const body = `Name: ${fd.get("name")}\nEmail: ${fd.get("email")}\nWebsite: ${fd.get("website")}\n\n${fd.get("message")}`;
                  window.location.href = `mailto:${email}?subject=${encodeURIComponent(
                    `${brand} gateway enquiry`,
                  )}&body=${encodeURIComponent(body)}`;
                  setSent(true);
                }}
              >
                <Field name="name" label="Your name" placeholder="Alex Roy" hint="So we know who to reply to." required />
                <Field
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="you@company.com"
                  hint="We send integration details to this address only."
                  required
                />
                <Field
                  name="website"
                  label="Website"
                  placeholder="https://yourstore.com"
                  hint="Helps us suggest the right coins and networks."
                />
                <div>
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    placeholder="We sell digital goods and want to accept USDT and BTC."
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Please do not include passwords, private keys or wallet seed phrases.
                  </p>
                </div>
                <button
                  type="submit"
                  className="justify-self-start rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Send message
                </button>
              </form>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Company details</h2>
            <dl className="mt-3 space-y-3 text-sm text-muted-foreground">
              <div>
                <dt className="text-xs uppercase tracking-wide">Trading as</dt>
                <dd className="text-foreground">{brand}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Email</dt>
                <dd className="mt-1">
                  <EmailPill email={email} compact />
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              {brand} is a technology company providing payment page software. It is not a bank,
              exchange, broker or custodian and does not hold customer funds.
            </p>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Field({
  name,
  label,
  hint,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  label: string;
  hint: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        title={hint}
        className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
      />
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
