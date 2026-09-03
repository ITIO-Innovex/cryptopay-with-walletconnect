import { Link } from "@tanstack/react-router";
import { EmailPill } from "./EmailPill";


/** Site footer: policy navigation, support links and company details. No social links. */
const LEGAL = [
  { slug: "terms", label: "Terms & Conditions" },
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "aml", label: "AML & CFT Policy" },
  { slug: "customer-due-diligence", label: "Customer Due Diligence" },
  { slug: "acceptable-use", label: "Acceptable Use Policy" },
  { slug: "cookies", label: "Cookie Policy" },
];

const TRUST = [
  { slug: "obligations", label: "Our Obligations" },
  { slug: "refunds", label: "Refund Policy" },
  { slug: "complaints", label: "Complaints Policy" },
  { slug: "risk-disclaimer", label: "Risk Disclaimer" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-xl font-semibold tracking-tight">
              <span className="text-foreground">crypto</span>
              <span className="text-brand">pe</span>
              <span className="text-muted-foreground">.net</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Payment page technology for online businesses. Hosted checkout, on-chain
              confirmation, non-custodial settlement to the merchant's own wallet.
            </p>
          </div>

          <FooterColumn title="Legal" items={LEGAL} />
          <FooterColumn title="Compliance & trust" items={TRUST} />

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Cryptope</li>
              <li className="pt-1">
                <EmailPill compact />
              </li>
              <li>
                <Link to="/contact" rel="nofollow" className="hover:text-foreground">
                  Contact us
                </Link>
              </li>
              <li>
                <a href="/#faq" className="hover:text-foreground">
                  Help & FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          <p>
            Cryptope is a technology company providing payment page software. It is not a bank,
            money transmitter, exchange, broker or custodian, does not hold customer funds, and
            provides no financial, investment, tax or legal advice.
          </p>
          <p className="mt-3">
            Digital asset payments are final once confirmed on the blockchain and cannot be
            reversed. Assets sent to a wrong address, over an unsupported network, or in an asset
            the address is not configured for are permanently lost and cannot be recovered.{" "}
            <Link
              to="/legal/$slug"
              params={{ slug: "risk-disclaimer" }}
              className="font-medium text-foreground underline underline-offset-2"
            >
              Read the full disclaimer
            </Link>
            .
          </p>
          <p className="mt-3">
            © {new Date().getFullYear()} Cryptope. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}


function FooterColumn({ title, items }: { title: string; items: { slug: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i.slug}>
            <Link to="/legal/$slug" params={{ slug: i.slug }} className="hover:text-foreground">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
