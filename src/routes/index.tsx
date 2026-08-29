import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Check, Code2, Globe, ShieldCheck, Wallet, Zap } from "lucide-react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SupportedAssets } from "@/components/site/SupportedAssets";
import { EmailPill } from "@/components/site/EmailPill";




export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cryptope — Digital Asset Payment Technology for Online Business" },
      {
        name: "description",
        content:
          "Cryptope is a payment technology provider. Our software gives online businesses a hosted payment page, WalletConnect checkout and on-chain confirmation, with settlement to the merchant's own wallet. Pricing from 0.5%.",
      },
      { property: "og:title", content: "Cryptope — Digital Asset Payment Technology" },
      {
        property: "og:description",
        content:
          "Payment page software for digital asset payments: WalletConnect checkout, multi-chain support, non-custodial settlement to your own wallet. From 0.5%, no commitment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Cryptope — Digital Asset Payment Technology" },
      {
        name: "twitter:description",
        content:
          "Payment page software with WalletConnect checkout, multi-chain support and non-custodial settlement. From 0.5%.",
      },

    ],
  }),
  component: HomePage,
});

const FEATURES = [
  {
    icon: Wallet,
    title: "WalletConnect checkout",
    body: "Customers pay from any WalletConnect wallet in a couple of taps, or scan a QR and send manually.",
  },
  {
    icon: Globe,
    title: "Multi-chain coverage",
    body: "Bitcoin, Ethereum, BNB Chain, Polygon, Arbitrum, Avalanche, Tron and major stablecoins.",
  },
  {
    icon: Zap,
    title: "Live confirmations",
    body: "Each deposit is tracked on-chain with under, exact and overpayment states handled automatically.",
  },
  {
    icon: ShieldCheck,
    title: "No chargebacks",
    body: "Settled on-chain. Once confirmed, a payment cannot be reversed by the payer.",
  },
];

const STEPS = [
  { n: "1", t: "Create a payment", b: "Send the order amount to Cryptope from your store or API." },
  { n: "2", t: "Customer pays in crypto", b: "They pick a coin and network, then pay by wallet or address." },
  { n: "3", t: "You get confirmed", b: "Cryptope watches the chain and confirms the order in crypto." },
];

const FAQS = [
  {
    q: "What is Cryptope?",
    a: "Cryptope is a payment gateway that lets online businesses accept cryptocurrency payments at their checkout and receive the funds in their own wallet.",
  },
  {
    q: "What kind of payments does Cryptope process?",
    a: "Payments are made and settled in digital assets on public blockchains. Cryptope does not process card, bank transfer or cash payments, and it does not convert what your customer sends into a national currency — you receive the asset itself in your own wallet.",
  },

  {
    q: "Which coins can I accept?",
    a: "Bitcoin, Ethereum, BNB, Polygon, Avalanche, Tron and major stablecoins such as USDT and USDC on their supported networks.",
  },
  {
    q: "How does a customer pay?",
    a: "They select a coin and network, then either connect a wallet through WalletConnect or send funds to the shown address or QR code.",
  },
  {
    q: "What happens if a customer underpays?",
    a: "The checkout stays open and shows the remaining balance so the customer can top up before the payment window ends.",
  },
  {
    q: "What happens with an overpayment?",
    a: "The order is marked paid and the extra amount can be refunded to the sending address from the refund flow.",
  },
  {
    q: "How long is a payment window open?",
    a: "Each payment page holds a live rate and address for one hour, with a countdown shown to the customer.",
  },
  {
    q: "Are there chargebacks?",
    a: "No. Crypto settlements are final once confirmed on-chain, so there is no chargeback risk.",
  },
  {
    q: "Do I need my own wallet?",
    a: "Yes. Settlement happens in crypto to the wallet addresses you configure for your business.",
  },
  {
    q: "How do I get started?",
    a: "Send us a message with your website and the coins you want to accept and we will share integration details.",
  },
];

function HomePage() {
  const [sent, setSent] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoKey, setDemoKey] = useState(0);


  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />


      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Bitcoin className="h-3.5 w-3.5 text-brand" aria-hidden="true" /> Digital asset payments
            for online business
          </span>

          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Accept crypto payments on your website
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Cryptope is a crypto payment gateway for online businesses. Give customers a clean
            checkout, let them pay from any wallet, and get confirmed on-chain — with no cards,
            banks or chargebacks involved.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Talk to us <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#demo" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              See the payment page
            </a>
          </div>

        </section>

        {/* Problem / solution */}
        <section className="border-y border-border bg-card/50">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 py-14 sm:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold">The problem</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Global customers want to pay in crypto, but most gateways bolt crypto onto a card
                stack: slow onboarding, fiat conversion rules, held funds and reversals.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold">The Cryptope way</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                One crypto-native checkout. Pick a coin and network, pay by wallet or address, and
                settle straight to your own wallet — the payment stays on-chain from start to
                finish, so there is no card network, bank hold or currency conversion in between.
              </p>

            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">What you get</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
                <f.icon className="h-5 w-5 text-brand" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <SupportedAssets />

        {/* How it works */}
        <section id="how" className="border-y border-border bg-card/50">

          <div className="mx-auto max-w-5xl px-4 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.n} className="rounded-2xl border border-border bg-background p-5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground">
                    {s.n}
                  </span>
                  <h3 className="mt-3 font-semibold">{s.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.b}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Demo */}
        <section id="demo" className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Preview the payment page</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            This is the page your customers see: coin and network selection, WalletConnect or QR
            payment, live status, top-up on a shortfall and the completed order screen. It opens
            below in a sample environment — the addresses and confirmations are generated for
            illustration, so nothing is charged and nothing is sent on-chain.
          </p>

          <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
            {[
              "Coin and network selection",
              "WalletConnect wallet payment",
              "Address + QR manual payment",
              "Live status and refund handling",
            ].map((i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-brand" aria-hidden="true" /> {i}
              </li>
            ))}
          </ul>

          {!demoOpen ? (
            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-input px-5 py-3 text-sm font-semibold hover:bg-accent"
            >
              Open the preview <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Preview · sample data · no real payment
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoKey((k) => k + 1)}
                    className="rounded-lg border border-input px-2.5 py-1 text-xs font-medium hover:bg-accent"
                  >
                    Restart
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoOpen(false)}
                    className="rounded-lg border border-input px-2.5 py-1 text-xs font-medium hover:bg-accent"
                  >
                    Close
                  </button>
                </div>
              </div>
              <iframe
                key={demoKey}
                src="/checkout"
                title="Cryptope demo checkout"
                loading="lazy"
                className="h-[720px] w-full border-0 bg-background"
              />
            </div>
          )}
        </section>

        {/* Important before you pay */}
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning-foreground" aria-hidden="true" />
              <h2 className="text-sm font-semibold">Important before you pay</h2>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                Blockchain payments are final. Once a transaction is confirmed it cannot be
                reversed, cancelled or charged back by anyone.
              </li>
              <li>
                Assets sent to a wrong address are permanently lost and cannot be recovered or
                refunded.
              </li>
              <li>
                Assets sent over the wrong network, or in an asset the address was not issued for,
                are lost in the same way. Match the coin and network exactly as shown at checkout.
              </li>
            </ul>
            <Link
              to="/legal/$slug"
              params={{ slug: "risk-disclaimer" }}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4"
            >
              Read the full risk disclaimer <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>


        {/* FAQ */}
        <section id="faq" className="border-y border-border bg-card/50">
          <div className="mx-auto max-w-5xl px-4 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
            <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-background">
              {FAQS.map((f) => (
                <details key={f.q} className="group px-5 py-4">
                  <summary className="cursor-pointer list-none text-sm font-medium">{f.q}</summary>
                  <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Contact us</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Tell us about your business and which coins you want to accept.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-border bg-card p-5">
            <div>
              <p className="text-sm font-semibold">Email us</p>
              <p className="text-xs text-muted-foreground">
                We usually reply within one business day.
              </p>
            </div>
            <EmailPill />
          </div>

          {sent ? (
            <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm">
              <p className="font-medium">Thanks — your message is ready to send.</p>
              <p className="mt-1 text-muted-foreground">
                Your email app should have opened with the details filled in. If it did not, copy
                the address below and write to us directly.
              </p>
              <div className="mt-3">
                <EmailPill />
              </div>
            </div>
          ) : (

            <form
              className="mt-6 grid max-w-xl gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const body = `Name: ${fd.get("name")}\nEmail: ${fd.get("email")}\nWebsite: ${fd.get("website")}\n\n${fd.get("message")}`;
                window.location.href = `mailto:gateway@cryptope.net?subject=${encodeURIComponent("Cryptope gateway enquiry")}&body=${encodeURIComponent(body)}`;
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
              <Field name="website" label="Website" placeholder="https://yourstore.com" hint="Helps us suggest the right coins and networks." />
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
              </div>
              <button
                type="submit"
                className="justify-self-start rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Send message
              </button>
            </form>
          )}
        </section>
      </main>

      <SiteFooter />

    </div>
  );
}

/** Text input with label, placeholder and a short helper tooltip line. */
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

