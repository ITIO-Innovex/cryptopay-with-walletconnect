import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bitcoin, Check, Globe, ShieldCheck, Wallet, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cryptope — Crypto Payment Gateway for Online Business" },
      {
        name: "description",
        content:
          "Cryptope is a crypto-only payment gateway. Accept Bitcoin, Ethereum, USDT and more with WalletConnect checkout, live confirmations and instant settlement in crypto.",
      },
      { property: "og:title", content: "Cryptope — Crypto Payment Gateway" },
      {
        property: "og:description",
        content:
          "Accept crypto payments on your website. WalletConnect checkout, multi-chain support, no fiat, no chargebacks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Cryptope — Crypto Payment Gateway" },
      {
        name: "twitter:description",
        content: "Crypto-only payment gateway with WalletConnect checkout and multi-chain support.",
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
    a: "Cryptope is a crypto-only payment gateway that lets online businesses accept cryptocurrency payments on their checkout.",
  },
  {
    q: "Do you support fiat payments?",
    a: "No. Cryptope is crypto only — there is no card, bank or fiat processing anywhere in the flow.",
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Wordmark />
          <nav className="flex items-center gap-5 text-sm">
            <a href="#features" className="hidden text-muted-foreground hover:text-foreground sm:inline">
              Features
            </a>
            <a href="#demo" className="hidden text-muted-foreground hover:text-foreground sm:inline">
              Demo
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground">
              Contact
            </a>
            <Link
              to="/checkout"
              className="rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Live checkout
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Bitcoin className="h-3.5 w-3.5 text-brand" aria-hidden="true" /> Crypto only · no fiat
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Accept crypto payments on your website
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Cryptope is a crypto payment gateway for online businesses. Give customers a clean
            checkout, let them pay from any wallet, and get confirmed on-chain — with no cards,
            banks or chargebacks involved.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/checkout"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Try the checkout demo <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center rounded-xl border border-input px-5 py-3 text-sm font-semibold hover:bg-accent"
            >
              Talk to us
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
                settle straight to your own wallet. Nothing touches fiat rails.
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

        {/* How it works */}
        <section className="border-y border-border bg-card/50">
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
          <h2 className="text-2xl font-semibold tracking-tight">See the checkout</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            A working demo of the Cryptope payment page, including WalletConnect, QR payment,
            underpayment top-up, overpayment refund and the completed order screen. It runs on
            sample data, so nothing is charged, and it opens right here on this page.
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
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Run the demo here <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Demo checkout · sample data
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
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us about your business and which coins you want to accept. Messages reach us at{" "}
            <a href="mailto:gateway@cryptope.net" className="font-medium text-foreground underline">
              gateway@cryptope.net
            </a>
            .
          </p>
          {sent ? (
            <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm">
              <p className="font-medium">Thanks — your message is ready to send.</p>
              <p className="mt-1 text-muted-foreground">
                Your email app should have opened with the details filled in. If it did not, write
                to gateway@cryptope.net directly.
              </p>
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

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
          <Wordmark />
          <p>Onternity Tech Limited</p>
          <a href="mailto:gateway@cryptope.net" className="hover:text-foreground">
            gateway@cryptope.net
          </a>
        </div>
      </footer>
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

/** Text-only styled logo. */
function Wordmark() {
  return (
    <div className="text-xl font-semibold tracking-tight">
      <span className="text-foreground">crypto</span>
      <span className="text-brand">pe</span>
      <span className="text-muted-foreground">.net</span>
    </div>
  );
}
