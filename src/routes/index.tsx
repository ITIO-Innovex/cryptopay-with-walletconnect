import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Check, Code2, Globe, ShieldCheck, Wallet, Zap } from "lucide-react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SupportedAssets } from "@/components/site/SupportedAssets";




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
    title: "Non-custodial by design",
    body: "Funds move from the customer's wallet to your wallet. Our software never holds or controls the money.",
  },
];

const STEPS = [
  { n: "1", t: "Create a payment", b: "Your store or API tells our software the order amount and the asset you accept." },
  { n: "2", t: "Customer pays from their wallet", b: "They pick an asset and network, then pay by connected wallet or to the displayed address." },
  { n: "3", t: "The chain confirms it", b: "Our software watches the public blockchain and reports the confirmed payment back to your order." },
];

const FAQS = [
  {
    q: "What is Cryptope?",
    a: "Cryptope is a payment technology product. It is software: a hosted payment page and integration tools that let an online business present a digital asset payment option at its own checkout.",
  },
  {
    q: "Is Cryptope a financial institution or a licensed crypto business?",
    a: "No. We are a technology company. We do not operate as a bank, money transmitter, exchange, broker or custodian, we do not hold client money, and we do not hold ourselves out as holding a financial services licence. Merchants are responsible for any licensing or registration their own activity requires.",
  },
  {
    q: "Does Cryptope hold or control funds?",
    a: "No. The design is non-custodial. A payment moves directly from the customer's wallet to the wallet addresses the merchant configures and controls. We do not pool funds, we cannot spend them, and we cannot reverse a confirmed transaction.",
  },
  {
    q: "Do you convert crypto to fiat currency?",
    a: "No. We do not buy, sell, exchange or convert digital assets, and we do not handle national currency. The merchant receives the asset the customer sent.",
  },
  {
    q: "What does the service cost?",
    a: "Pricing starts at 0.5% of the value processed through the payment page, with no setup fee, no monthly minimum and no commitment. High-volume businesses can connect with sales for a special rate. Blockchain network fees are separate, set by the network and paid by the sender.",
  },
  {
    q: "Which assets and networks are supported?",
    a: "Bitcoin, Ethereum, BNB, Polygon, Avalanche, Tron and major stablecoins such as USDT and USDC on their supported networks. The full list is shown on this page and at the payment page itself.",
  },
  {
    q: "How does a customer pay?",
    a: "They select an asset and network, then either connect a wallet through WalletConnect or send funds to the displayed address or QR code.",
  },
  {
    q: "What happens if a customer underpays?",
    a: "The payment page stays open and shows the remaining balance so the customer can top up before the payment window ends.",
  },
  {
    q: "What happens with an overpayment?",
    a: "The order is marked paid and the excess can be returned to the sending address through the refund flow, net of network fees and subject to network minimums.",
  },
  {
    q: "How long is a payment window open?",
    a: "Each payment page holds a quoted rate and address for one hour, with a countdown shown to the customer.",
  },
  {
    q: "Are there chargebacks?",
    a: "No. A blockchain transaction is final once confirmed, so there is no chargeback mechanism. That also means a payment sent to a wrong address or over a wrong network cannot be recovered.",
  },
  {
    q: "Do I need my own wallet?",
    a: "Yes. Settlement happens to the wallet addresses you configure for your business, so you must control a suitable wallet on each network you accept.",
  },
  {
    q: "What checks do you run before opening an account?",
    a: "Every merchant goes through onboarding and due diligence, including business identification and a review of the activity being sold, under our AML and CFT policy and Acceptable Use Policy. We may decline or withdraw access.",
  },
  {
    q: "How do I get started?",
    a: "Send us a message with your website and the assets you want to accept, and we will share integration details and confirm your pricing in writing.",
  },
];


function HomePage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoKey, setDemoKey] = useState(0);


  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />


      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Code2 className="h-3.5 w-3.5 text-brand" aria-hidden="true" /> Payment technology for
            online business
          </span>

          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Payment page software for digital asset payments
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Cryptope is a technology provider, not a financial institution. We build and operate the
            checkout software: your customer pays from their own wallet, the transaction is
            confirmed on the public blockchain, and the funds arrive at the wallet addresses you
            control. We never take possession of your customers' money.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Talk to us <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#demo" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              See the payment page
            </a>
          </div>

        </section>

        {/* Who we are */}
        <section className="border-y border-border bg-card/50">
          <div className="mx-auto max-w-5xl px-4 py-14">
            <h2 className="text-xl font-semibold">Who we are</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Cryptope is a software and technology company.
              Our product is a hosted payment page and the supporting integration tools that let a
              merchant present a digital asset payment option at their own checkout.
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "We provide software only. We do not offer banking, money transmission, brokerage, exchange or investment services, and we give no financial, tax or legal advice.",
                "We are non-custodial by design. Payments move directly from the customer's wallet to the merchant's own wallet addresses; we do not pool, hold or control customer funds.",
                "We do not buy, sell or convert digital assets, and we do not handle fiat currency for merchants or their customers.",
                "Wallet infrastructure, where used, is supplied by a specialist third-party provider under contract. Merchants remain responsible for their own licensing, tax and regulatory obligations in their markets.",
              ].map((point) => (
                <li key={point} className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-3xl text-xs text-muted-foreground">
              Merchant accounts are opened only after onboarding and due diligence checks. Access
              may be declined or withdrawn where a business or transaction falls outside our{" "}
              <Link
                to="/legal/$slug"
                params={{ slug: "acceptable-use" }}
                className="underline underline-offset-2"
              >
                Acceptable Use Policy
              </Link>{" "}
              or{" "}
              <Link to="/legal/$slug" params={{ slug: "aml" }} className="underline underline-offset-2">
                AML &amp; CFT Policy
              </Link>
              .
            </p>
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

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            One software fee, charged on the value of payments processed through the payment page.
            Use the service with no commitment: no setup fee, no monthly minimum and no lock-in
            contract.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-brand/40 bg-card p-6">
              <h3 className="text-sm font-semibold">Standard</h3>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                from 0.5%
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  per processed payment
                </span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {[
                  "Hosted payment page and WalletConnect checkout",
                  "All supported assets and networks",
                  "Live payment status, under and overpayment handling",
                  "No setup fee, no monthly minimum, no commitment",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" /> {i}
                  </li>
                ))}
              </ul>
              <a
                href="/contact"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold">High volume</h3>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                Custom
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  negotiated rate
                </span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {[
                  "Special pricing below the standard rate",
                  "Dedicated onboarding and integration support",
                  "Priority handling of payment queries",
                  "Connect with sales to discuss your volume",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" /> {i}
                  </li>
                ))}
              </ul>
              <a
                href="/contact"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-input px-5 py-3 text-sm font-semibold hover:bg-accent"
              >
                Connect to sales <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Our fee covers the use of our software only. Blockchain network fees are set by the
            network, are paid by the sender of a transaction, and are not received by Cryptope.
            Final pricing is confirmed in writing before your account is activated.
          </p>
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

        {/* Contact lives on its own /contact page (not indexed). */}

      </main>

      <SiteFooter />

    </div>
  );
}
