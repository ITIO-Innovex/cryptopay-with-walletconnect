# Authentication module

Stand-alone authentication for the Cryptope platform. Nothing outside this
folder owns auth logic, and it uses its own database tables only.

## Purpose

- Email + password sign-up / sign-in for merchants (built-in Cloud auth service).
- Own profile + role storage, kept separate from every other feature and from
  the imported legacy tables.
- Bootstraps a merchant account, payout setting and first API key on first login.

## Tables

| Table | Purpose |
| --- | --- |
| `auth_user_profile` | Full name, company, phone, website, account status |
| `auth_user_role` | `merchant` / `admin` role rows (never stored on the profile) |

The merchant records it bootstraps (`merchant_account`, `merchant_payout_setting`,
`merchant_api_key`) belong to the merchant feature; this module only creates the
first row so a new user lands on a working dashboard.

## Files

```
lib/auth-client.ts      browser-side sign in / up / out / password reset
lib/useSession.ts       React hook exposing the current session
server/account.functions.ts  authenticated server functions (profile + bootstrap)
components/             auth screens shared by the /login, /signup, /reset routes
```

## Routes

`/login`, `/signup`, `/forgot-password`, `/reset-password`.
Admin sign-in will live at `/admin/login` and reuse `auth_user_role`.

## Known limitations

- No KYC flow yet (planned as a separate module).
- Admin dashboard not built; the role table and gate already support it.
