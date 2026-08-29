import { createFileRoute, Link, notFound } from "@tanstack/react-router";

/**
 * Single route that renders every legal / compliance document from one
 * content map. Keeps the policy pages lightweight (no per-page route files).
 */
type Policy = { title: string; summary: string; sections: { h: string; p: string }[] };

const CONTACT = "gateway@cryptope.net";
const COMPANY = "Onternity Tech Limited";

export const POLICIES: Record<string, Policy> = {
  terms: {
    title: "Terms & Conditions",
    summary: "The rules that apply when a business uses the Cryptope payment gateway.",
    sections: [
      {
        h: "Scope of service",
        p: `Cryptope, operated by ${COMPANY}, provides a hosted checkout that lets merchants receive digital asset payments from their customers. We are a technology provider, not a custodian, exchange, broker or lender.`,
      },
      {
        h: "Merchant eligibility",
        p: "Merchants must be lawfully established, must not operate a prohibited business, and must give accurate business and ownership information before going live.",
      },
      {
        h: "Settlement",
        p: "Payments settle in the same digital asset the customer sends, to the wallet addresses the merchant configures. The merchant is responsible for the accuracy and security of those addresses.",
      },
      {
        h: "Network conditions",
        p: "Confirmation times, network fees and asset availability depend on the underlying blockchains. We may pause an asset or network during congestion, forks or security incidents.",
      },
      {
        h: "Liability",
        p: "We are not liable for losses caused by incorrect wallet addresses, wrong network selection, lost private keys, or price movement between payment and settlement.",
      },
      {
        h: "Changes",
        p: `We may update these terms and will publish the current version on this page. Questions can be sent to ${CONTACT}.`,
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    summary: "What information we collect, why we collect it and how long we keep it.",
    sections: [
      {
        h: "What we collect",
        p: "Business contact details, onboarding and verification documents, technical data such as IP address and device information, and transaction data including wallet addresses, amounts and transaction hashes.",
      },
      {
        h: "Why we collect it",
        p: "To create and operate merchant accounts, process payment sessions, prevent fraud and abuse, and meet our legal and regulatory obligations.",
      },
      {
        h: "Sharing",
        p: "We share data with verification and analytics providers we rely on, and with authorities where we are legally required to. We do not sell personal data.",
      },
      {
        h: "Retention",
        p: "Verification and transaction records are retained for the period required by applicable financial-crime rules, then deleted or anonymised.",
      },
      {
        h: "Your rights",
        p: `You may request access, correction or deletion of your data by writing to ${CONTACT}. Some records must be kept even after an account closes.`,
      },
    ],
  },
  aml: {
    title: "AML & CFT Policy",
    summary:
      "Our approach to anti-money-laundering and counter-terrorist-financing across the gateway.",
    sections: [
      {
        h: "Risk-based approach",
        p: "Every merchant is risk-scored at onboarding based on business model, jurisdiction, ownership and expected volume, and is rescored when that profile changes.",
      },
      {
        h: "Transaction monitoring",
        p: "Incoming payments are screened against sanctions and known illicit-address data. Structuring patterns, mixer exposure and unusual volume trigger review.",
      },
      {
        h: "Sanctions screening",
        p: "Merchants, beneficial owners and counterparty addresses are screened against applicable sanctions and watch lists before and during the relationship.",
      },
      {
        h: "Reporting and record keeping",
        p: "Suspicious activity is escalated internally and reported to the relevant authority where required. Records are kept for the legally mandated period.",
      },
      {
        h: "Training",
        p: "Staff handling onboarding, monitoring or support receive periodic financial-crime training.",
      },
    ],
  },
  "customer-due-diligence": {
    title: "Customer Due Diligence",
    summary: "How we verify the businesses that use Cryptope, and when we go further.",
    sections: [
      {
        h: "Standard due diligence",
        p: "We collect incorporation details, registered address, the nature of the business, and identification for directors and beneficial owners holding a qualifying stake.",
      },
      {
        h: "Enhanced due diligence",
        p: "Higher-risk merchants — high volume, high-risk jurisdictions, politically exposed persons or unclear ownership — provide source-of-funds evidence and additional documentation.",
      },
      {
        h: "Ongoing review",
        p: "Merchant files are reviewed on a schedule set by risk score, and on any material change such as new ownership, a new product line or a sharp volume shift.",
      },
      {
        h: "Refusal and offboarding",
        p: "We may decline onboarding or end a relationship where verification cannot be completed, information appears false, or activity is inconsistent with the stated business.",
      },
    ],
  },
  obligations: {
    title: "Our Obligations",
    summary: "What merchants can expect from us, and what we expect in return.",
    sections: [
      {
        h: "Availability and integrity",
        p: "We operate the checkout, confirm payments against the relevant blockchain, and report each payment state — pending, short-paid, paid or over-paid — accurately.",
      },
      {
        h: "Security",
        p: "Access to merchant data is restricted, credentials and keys are stored using industry-standard protection, and changes to payout addresses require verification.",
      },
      {
        h: "Transparency",
        p: "Fees, supported assets and networks, and payment window rules are published before a merchant goes live and any change is communicated in advance.",
      },
      {
        h: "Merchant obligations",
        p: "Merchants must keep their business information current, publish clear refund terms to their own customers, and use the gateway only for lawful activity.",
      },
    ],
  },
  refunds: {
    title: "Refund Policy",
    summary: "How refunds and overpayments are handled on a blockchain settlement.",
    sections: [
      {
        h: "Finality",
        p: "A confirmed blockchain payment cannot be reversed. Any refund is a new outgoing transaction and is subject to the network's fee and minimum transfer amount.",
      },
      {
        h: "Overpayments",
        p: "If a customer sends more than the order amount, the surplus can be returned to the sending address from the checkout refund flow, minus network fees.",
      },
      {
        h: "Underpayments",
        p: "If less than the order amount arrives, the checkout stays open and shows the remaining balance until the payment window ends.",
      },
      {
        h: "Merchant refunds",
        p: "Commercial refunds are agreed between the merchant and their customer. The refunded value in an asset may differ from the value at the time of purchase.",
      },
    ],
  },
  "risk-disclaimer": {
    title: "Risk Disclaimer",
    summary:
      "Please read this before sending or accepting any digital asset payment through Cryptope. Blockchain payments behave differently from card or bank payments: they are final, they are routed by address and network rather than by name, and mistakes usually cannot be undone.",
    sections: [
      {
        h: "Payments are irreversible",
        p: "Once a transaction is confirmed on the blockchain it cannot be recalled, cancelled, reversed or charged back — not by the customer, not by the merchant, and not by Cryptope. There is no dispute or chargeback mechanism comparable to card schemes. Any return of funds is a new, separate transaction that depends entirely on the merchant's own decision and on the funds still being available.",
      },
      {
        h: "A wrong address means the assets are lost",
        p: "Assets sent to an incorrect, mistyped, outdated or unintended address are permanently lost. The same applies to assets sent to a smart contract or exchange deposit address that cannot return them. Cryptope does not control the receiving address and has no ability to freeze, reverse or restore such a transfer. No refund is owed by Cryptope or by the merchant in these circumstances. Always copy the address shown on the payment page, verify it in your wallet, and never send from a source you do not control.",
      },
      {
        h: "A wrong network means the assets are lost",
        p: "Every payment address on the checkout is valid for one specific network only. Sending over a different network — for example sending USDT on BNB Smart Chain to an address issued for Tron or Ethereum — will normally result in a permanent loss. Recovery is not possible in the general case, and where a third party might theoretically assist, that is entirely outside Cryptope's control. Select the network in your wallet exactly as it is shown on the payment page.",
      },
      {
        h: "A wrong asset means the assets are lost",
        p: "A deposit address is issued for the specific coin or token selected at checkout. Sending a different asset to that address — including tokens issued on the same network — is treated the same way as a wrong address: the funds are unrecoverable and no credit is applied to the order.",
      },
      {
        h: "Payment window and quoted amount",
        p: "When a coin and network are selected, the checkout quotes an exact amount in that asset and opens a payment window of 60 minutes, shown as a live countdown on the payment page. The quote is valid only inside that window. If nothing has been received when the countdown reaches zero, the page marks the payment as expired and the order should be restarted so a fresh amount can be quoted. Funds that arrive after expiry are not automatically credited: they may be re-quoted at the rate in force when they were received, applied to a new order, or returned less network and processing fees, at the merchant's discretion.",
      },
      {
        h: "Underpayment",
        p: "The checkout compares the total amount received against the amount due. If less than the full amount arrives, the order is not completed: the payment page stays open, shows every transaction received so far, and displays the exact remaining balance so the customer can send a top-up before the countdown ends. Multiple incoming transfers are added together. An order that is still short when the window closes is not fulfilled, and any partial amount already sent is handled under the merchant's refund terms rather than being automatically returned.",
      },
      {
        h: "Overpayment and refunds",
        p: "If more than the amount due is received, the order is marked as paid and the excess is treated as a refundable overpayment. A return is not automatic: it must be requested from the payment page, and it is paid net of costs. Two deductions apply — the on-chain network fee for sending the return on the chosen network, and a platform fee for executing it. What remains after those deductions must still be at or above the network's minimum sendable amount. If it is not, the return cannot be broadcast and the residual amount cannot be paid out. Returns are sent to the sending address recorded for the payment; an address that cannot receive funds (for example a custodial deposit address) may cause a further permanent loss.",
      },
      {
        h: "Price volatility",
        p: "Digital asset prices can move sharply and without warning. The value of an asset can change between the moment a payment is quoted, the moment it is broadcast and the moment it is confirmed. The amount received in asset terms is what settles; its value in any national currency is not guaranteed by Cryptope.",
      },
      {
        h: "Network conditions outside our control",
        p: "Public blockchains are operated by third parties. Congestion, fee spikes, stuck or dropped transactions, chain reorganisations, forks, validator outages, halted chains and node or explorer failures can delay or prevent confirmation. Cryptope cannot accelerate, alter or guarantee the behaviour of any blockchain network.",
      },
      {
        h: "Wallets, WalletConnect and device security",
        p: "Payments are made from the customer's own wallet. Custody of private keys, seed phrases, hardware devices and the approval of any transaction or token allowance is solely the customer's responsibility. Cryptope never holds keys and never asks for a seed phrase. Wallet software, browser extensions and WalletConnect are provided by third parties; connecting a wallet or approving a request that you did not initiate can result in loss of funds.",
      },
      {
        h: "Merchant responsibilities",
        p: "Merchants are responsible for the settlement addresses and networks they configure, for keeping those details accurate and under their sole control, for the goods and services they sell, for their own refund and cancellation terms, and for their own tax, accounting, licensing and regulatory obligations in every jurisdiction where they operate.",
      },
      {
        h: "Sanctions, AML and blocked funds",
        p: "Payments connected to sanctioned parties, sanctioned jurisdictions or apparently illicit sources may be delayed, withheld, frozen or reported to the relevant authorities, and the associated order may be cancelled without a return of funds where the law requires it. Screening and reporting obligations override any expectation of refund.",
      },
      {
        h: "No deposit protection",
        p: "Digital assets are not bank deposits, not electronic money and not covered by any deposit-guarantee or investor-compensation scheme. There is no central authority to compensate for loss, theft or error.",
      },
      {
        h: "No investment, tax or legal advice",
        p: "Nothing on this website, in the checkout or in any related material is investment, tax, accounting or legal advice, or a recommendation to acquire or dispose of any digital asset. Merchants and customers should take their own professional advice.",
      },
      {
        h: "Availability and limitation of liability",
        p: "The service is provided without a guarantee of uninterrupted or error-free operation, and may be interrupted for maintenance, upgrades or reasons beyond our control. To the maximum extent permitted by law, Cryptope and Onternity Tech Limited are not liable for indirect or consequential loss, loss of profit, or loss arising from a wrong address, wrong network, wrong asset, blockchain behaviour, third-party wallet software, or asset price movement.",
      },
      {
        h: "About the preview on this website",
        p: "The payment page shown on the home page of this website is a preview that runs on sample data. Addresses, transaction hashes and confirmations in it are generated for demonstration only. Nothing is charged, nothing is sent on-chain, and no real order is created. Never send real funds to any address displayed in the preview.",
      },
    ],
  },

  "acceptable-use": {
    title: "Acceptable Use Policy",
    summary: "Activity that may not be processed through the Cryptope gateway.",
    sections: [
      {
        h: "Prohibited activity",
        p: "Illegal goods or services, sanctioned parties, unlicensed financial services, fraud schemes, mixers or tumblers, ransomware, child sexual abuse material, and the sale of stolen data or credentials.",
      },
      {
        h: "Restricted activity",
        p: "Certain regulated sectors may be supported only with the relevant licence and enhanced monitoring.",
      },
      {
        h: "Enforcement",
        p: "We may suspend a payment session or a merchant account where we reasonably suspect a breach, and may notify authorities where required.",
      },
    ],
  },
  complaints: {
    title: "Complaints Policy",
    summary: "How to raise a complaint and what happens next.",
    sections: [
      {
        h: "How to complain",
        p: `Write to ${CONTACT} with your business name, the payment reference or transaction hash, and a description of the issue.`,
      },
      {
        h: "What happens next",
        p: "We acknowledge complaints and investigate using our transaction and support records, and we give a written outcome with the reasoning.",
      },
      {
        h: "Escalation",
        p: "If the outcome does not resolve the issue, you can ask for a senior review before pursuing any external remedy available to you.",
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    summary: "The small amount of browser storage this website uses.",
    sections: [
      {
        h: "Essential storage",
        p: "We store the demo access state and checkout session state in your browser so the pages work correctly. This cannot be turned off without breaking the site.",
      },
      {
        h: "No advertising cookies",
        p: "We do not use advertising or cross-site tracking cookies on this website.",
      },
      {
        h: "Managing storage",
        p: "You can clear this storage at any time from your browser settings.",
      },
    ],
  },
};

export const Route = createFileRoute("/legal/$slug")({
  loader: ({ params }) => {
    const policy = POLICIES[params.slug];
    if (!policy) throw notFound();
    return { policy };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable — Cryptope" }, { name: "robots", content: "noindex" }],
      };
    }
    const { title, summary } = loaderData.policy;
    return {
      meta: [
        { title: `${title} — Cryptope` },
        { name: "description", content: summary },
        { property: "og:title", content: `${title} — Cryptope` },
        { property: "og:description", content: summary },
      ],
    };
  },
  component: LegalPage,
});

function LegalPage() {
  const { policy } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            <span className="text-foreground">crypto</span>
            <span className="text-brand">pe</span>
            <span className="text-muted-foreground">.net</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">{policy.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{policy.summary}</p>

        <div className="mt-9 space-y-7">
          {policy.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-semibold">{s.h}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          {COMPANY} · Questions about this document?{" "}
          <a href={`mailto:${CONTACT}`} className="font-medium text-foreground underline">
            {CONTACT}
          </a>
        </p>
      </main>
    </div>
  );
}
