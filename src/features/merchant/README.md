# Merchant dashboard module

Everything a merchant needs to accept crypto payments. Admin tooling will live
in a sibling `src/features/admin/` folder and reuse the same tables.

## Structure

| Folder | Purpose |
| --- | --- |
| `layout/` | Dashboard chrome (navigation, sign-out, metric card) |
| `shared/` | Formatters, status badge, page states, merchant resolver |
| `overview/` | Volume, paid/pending counts, recent activity |
| `invoices/` | Create, list, filter, cancel invoices; copy checkout links |
| `transactions/` | Incoming transfers with advanced filters and CSV export |
| `payouts/` | Settlement batches and "settle now" |
| `wallets/` | Payout wallets per asset and network |
| `settings/` | Business profile, payout schedule, webhooks |
| `api-keys/` | Public/secret key management |

## Routes

`/dashboard`, `/dashboard/invoices`, `/dashboard/transactions`,
`/dashboard/payouts`, `/dashboard/wallets`, `/dashboard/api-keys`,
`/dashboard/settings` — all under the authenticated layout.

## Database tables

`merchant_account`, `merchant_api_key`, `merchant_wallet`,
`merchant_payout_setting`, `payment_invoice`, `payment_deposit`,
`payment_address_pool`, `payout_batch`, `payout_batch_item`,
`webhook_endpoint`, `webhook_delivery`, `merchant_audit_log`.

Every server function resolves the merchant from the signed-in user, and row
level security scopes each table to the owning account.

## API endpoints

- `POST /api/public/v1/invoices` — create an invoice with a secret key, returns
  a hosted checkout URL.
- `POST /api/public/v1/settlement-run` — cron-authenticated settlement run.

## Known limitations

- Deposit addresses come from a mock generator (`address-provider.server.ts`).
  Swapping in the custody provider activates real addresses with no other
  change.
- Settlement transactions are simulated hashes; amounts, fees and batching are
  real.
- No KYC flow yet.
