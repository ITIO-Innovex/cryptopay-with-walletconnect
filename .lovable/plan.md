# Cleaning up demo links, a proper disclaimer, and a better contact block

## 1. One demo, one place

Right now the checkout is offered in four places: a "Live checkout" button in the header,
a "Demo" nav link, a "Try the checkout demo" hero button, and the demo section itself.
That repetition makes the site look like a demo instead of a product.

Changes:
- Header: remove the "Live checkout" button and the "Demo" nav link. Nav becomes
  Features / How it works / FAQ / Contact, with a single "Talk to us" action.
- Hero: primary action becomes "Talk to us"; the secondary link becomes a quiet
  text link "See the checkout" that scrolls to the demo section.
- Demo section: keep exactly one entry point — the in-page framed checkout with
  Restart / Close. Retitle it "Preview the payment page" and label it clearly as a
  sample environment, so it reads as a product preview, not the live service.
- Footer: no demo link. `/checkout` stays reachable directly but is not advertised.

## 2. A real disclaimer

Replace the two-line footer disclaimer with a short summary in the footer plus a full
`/legal/risk-disclaimer` page. The footer keeps 3 lines and links to "Read the full
disclaimer".

The full disclaimer will cover:
- **Irreversibility** — confirmed blockchain transactions cannot be recalled, reversed,
  cancelled or charged back by Cryptope, the merchant or the customer.
- **Wrong address or wrong network = permanent loss** — assets sent to an incorrect
  address, to a contract that cannot return them, or over a network that the receiving
  address does not support are unrecoverable. Cryptope cannot restore them, and no
  refund is owed by Cryptope or the merchant.
- **Wrong asset sent to a deposit address** — sending a token the address is not
  configured for is treated the same way: unrecoverable.
- **Payment window and rate quotes** — quotes are valid only for the displayed window;
  amounts arriving after expiry may be re-priced or returned less network fees.
- **Under and overpayment** — how shortfalls and excess amounts are handled, and that
  refunds of excess are net of network fees and subject to network minimums.
- **Price volatility** — asset value can move between quote, broadcast and confirmation.
- **Network conditions** — congestion, reorgs, forks, halted chains and stuck
  transactions are outside Cryptope's control.
- **Third-party wallets and WalletConnect** — the customer's wallet, seed phrase, device
  security and approvals are their own responsibility.
- **Merchant responsibility** — settlement addresses, supported networks and their own
  goods, tax and licensing obligations.
- **Sanctions, AML and blocked funds** — payments linked to sanctioned or illicit
  sources may be withheld or reported.
- **No investment, tax or legal advice**, no guarantee of uninterrupted service, and
  limitation of liability.
- **Demo/preview notice** — the on-site preview uses sample data and processes nothing.

An "Important before you pay" callout with the three highest-impact points
(irreversible, wrong address means loss, wrong network means loss) goes just above the
FAQ, so it is visible without opening a policy page.

## 3. Contact and email presented properly

- Replace the plain mailto sentence with a contact card: label "Email us", the address
  `gateway@cryptope.net` shown as a bordered pill with an envelope icon and a
  copy-to-clipboard button that confirms "Copied", plus a typical response-time line.
- Footer email gets the same envelope icon treatment instead of a bare link.
- The contact form keeps working the same way (opens the visitor's mail app,
  pre-filled), but the confirmation message will also show the copy pill so a visitor
  without a mail client can still reach us.

## Technical notes

- Edits: `src/routes/index.tsx` (header nav, hero, demo section, disclaimer callout,
  contact block), `src/components/site/SiteFooter.tsx` (short disclaimer + email pill,
  no demo link), `src/routes/legal.$slug.tsx` (expand the `risk-disclaimer` entry).
- New small component `src/components/site/EmailPill.tsx` for the copyable address,
  reused in the contact section and footer.
- No backend, no new dependencies; icons come from the existing lucide set.
