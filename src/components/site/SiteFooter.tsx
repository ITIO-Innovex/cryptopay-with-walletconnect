import { Link } from "@tanstack/react-router";

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
              A digital asset payment gateway for online businesses. Hosted checkout, on-chain
              confirmation, settlement to your own wallet.
            </p>
          </div>

          <FooterColumn title="Legal" items={LEGAL} />
          <FooterColumn title="Compliance & trust" items={TRUST} />

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Onternity Tech Limited</li>
              <li>
                <a href="mailto:gateway@cryptope.net" className="hover:text-foreground">
                  gateway@cryptope.net
                </a>
              </li>
              <li>
                <a href="/#contact" className="hover:text-foreground">
                  Contact us
                </a>
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
            Digital asset payments settle on public blockchains and are final once confirmed. Asset
            values can move quickly, and nothing on this website is investment, tax or legal advice.
            Merchants remain responsible for the wallet addresses and networks they configure.
          </p>
          <p className="mt-3">
            © {new Date().getFullYear()} Onternity Tech Limited. All rights reserved.
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
