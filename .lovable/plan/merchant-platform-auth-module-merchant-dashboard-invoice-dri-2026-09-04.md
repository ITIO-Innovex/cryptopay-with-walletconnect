# Merchant platform: auth module, merchant dashboard, invoice-driven checkout

Build a standalone authentication module, a merchant dashboard for accepting crypto payments, and connect the existing `/checkout` page to real invoices. Money movement stays mocked until the wallet-generation provider is plugged in — every other part of the workflow is real and functional.

## 1. Authentication (standalone module)

All auth code lives in one folder, `src/features/auth/`, and touches no other feature's tables.

- Email + password sign-in and sign-up using the built-in Cloud auth service.
- Its own profile table, `auth_user_profile` (linked to the auth user, auto-created on signup): full name, company name, contact phone, account status (pending / active / suspended), created/updated timestamps.
- A separate roles table, `auth_user_role` (merchant / admin), never stored on the profile — this is what lets the admin dashboard reuse the same database later.
- Routes: `/login` (rebuilt on the existing dummy page), `/signup`, `/forgot-password`, `/reset-password`.
- Sign-up keeps the existing UX: company name, work email, password strength meter, repeat password, and the "approval request received" message. New accounts start as `pending` and a merchant record is created for them.
- Space reserved for admin: `/admin/login` route and role gate scaffolded but not built out.

## 2. Merchant dashboard

New folder `src/features/merchant/` with one sub-folder per service so nothing mixes:

```text
src/features/merchant/
  layout/        sidebar, topbar, shell
  overview/      KPIs, charts, recent activity
  invoices/      create, list, detail, payment link
  transactions/  ledger with advanced filters + export
  payouts/       settlement batches and history
  wallets/       merchant payout wallets per asset/network
  settings/      payout schedule, business profile, notifications
  api-keys/      public/secret keys, terno, webhook URL
  shared/        tables, filters, status badges, formatters
```

Routes live under a protected `/dashboard/*` area; signing in lands on `/dashboard`.

### Pages
- **Overview** — balances (available / pending / settling), volume today / 7d / 30d, success vs expired rate, asset mix, recent invoices and payouts.
- **Invoices** — create an invoice (product name, description, amount, currency, customer email, expiry, redirect URL), get a shareable checkout link, see status, resend, cancel.
- **Transactions** — full ledger with advanced filtering: date range, status (awaiting, underpaid, paid, overpaid, expired, refunded), asset, network, amount range, invoice/order id, tx hash, customer email, sender address; sortable columns, saved page size, CSV export, and a detail drawer showing every on-chain deposit against the invoice, confirmations, fees and the merchant net.
- **Payouts** — settlement batches with mode (per-transaction / hourly / daily / manual), status (queued, processing, sent, failed), destination wallet, mock tx hash, fee breakdown, and a manual "settle now" action.
- **Wallets** — add/verify payout addresses per asset + network, mark a default per asset, minimum payout threshold.
- **Settings** — payout schedule selector (instant, 1h batch, 24h batch, manual), auto-refund rules for overpayment, notification email, business profile.
- **API keys** — public key, secret key (shown once, rotatable), terno (terminal number), webhook endpoint with signing secret and delivery log.
- Every page has loading, empty, error and success states.

## 3. Payments API + invoice-driven checkout

- Public endpoint `POST /api/public/v1/invoices` authenticated by the merchant's secret key: takes product name, amount, currency, customer email, terno, metadata, redirect URL and returns an invoice id plus a hosted checkout URL.
- `/checkout?invoice=<id>` loads the real invoice: merchant name, public key, terno, product, price, allowed assets. Without an invoice id it keeps working exactly as today's demo.
- The buyer picks asset + network; the system assigns a unique deposit address for that invoice. Today this comes from a mock address pool behind a single `WalletAddressProvider` interface — swapping in the real generation service later is one file, and the rest of the flow starts working automatically.
- Status transitions match what the checkout already renders: awaiting, underpaid (partial, top-up allowed), paid, overpaid, expired — plus refund handling that reuses the existing refund-economics rules.
- Webhook fired to the merchant on each status change, signed, with retries visible in the dashboard.

## 4. Simulated money engine

Since there is no live chain connection yet, a controlled simulator drives the same code paths real deposits will:

- A deposit simulator (in the dashboard's demo panel and the existing checkout simulation panel) creates deposits, confirmations and overpayments.
- A scheduled job creates payout batches according to each merchant's chosen timeline (instant / 1h / 24h), moves balances from pending to settling to paid, and stamps mock settlement tx hashes.
- All amounts, fees and balances are computed by the same code that will run against real funds.

## Technical notes

- New database tables, all standalone from the 33 imported legacy tables: `auth_user_profile`, `auth_user_role`, `merchant_account`, `merchant_api_key`, `merchant_wallet`, `merchant_payout_setting`, `payment_invoice`, `payment_deposit`, `payment_address_pool`, `payout_batch`, `payout_batch_item`, `webhook_endpoint`, `webhook_delivery`, `merchant_audit_log`. Every table gets id, created_at, updated_at, created_by, updated_by, is_active, row-level security scoped to the owning merchant, and explicit grants.
- Secret keys stored hashed; shown once at creation.
- Dashboard data access goes through server functions in each feature folder (`*.functions.ts`), authenticated per request — a page-level guard alone is never treated as security.
- The payout scheduler runs as a public cron-callable endpoint with a shared-secret check.
- Each feature sub-folder ships a short README describing purpose, tables and endpoints.

## Build order

1. Database schema + row-level security.
2. Auth module and protected dashboard shell.
3. API keys, invoice creation API, invoice-driven checkout.
4. Transactions ledger with advanced filters, overview KPIs.
5. Wallets, payout settings, simulated payout scheduler, webhooks.
