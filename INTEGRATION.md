# Backend Integration Guide (for Cursor)

This checkout is **frontend-only**. Every payment outcome is currently driven
by `SimulationPanel` and random helpers in `src/lib/payment.ts`. This document
lists **every seam** where a real backend must be wired in, with the exact
file/line, the current mock, and the required request/response contract.

Search the codebase for `BACKEND:` to jump to every integration point in code.

---

## 1. Order / Checkout Session

**Where:** `src/routes/index.tsx` — the `ORDER` constant + `orderId` state.

Today the order (`title`, `description`, `amountUsd`) is hardcoded and
`orderId` is generated locally via `makeOrderId()`.

**Backend must provide:**

```
GET /api/checkout/session/:sessionId
→ 200 {
    orderId: string,              // canonical order id
    title: string,
    description: string,
    amountUsd: number,
    amountFiatCurrency: "USD",
    customerEmail: string,        // masked or full — frontend masks display
    expiresAt: string (ISO),      // drives the countdown, replaces PAYMENT_WINDOW_SECONDS
    supportedCurrencies?: string[]// optional filter over CRYPTO_CURRENCIES
  }
```

The session id should arrive as a URL query param (`?session=…`) from the
merchant redirect. Replace the `ORDER` constant and `useState(makeOrderId)`
with a TanStack Query `useSuspenseQuery` in the route loader.

---

## 2. Deposit Address Issuance

**Where:** `src/data/cryptocurrencies.ts:201` (`MOCK_DEPOSIT_ADDRESS`) — used by
`SendFunds`, `PaymentProcessing`, `PaymentCompleted`, and passed to
`WalletConnectPay` as the `to` address.

A single shared string is used for every chain today. **This is not safe in
production** — each `(currency, network)` pair needs its own address.

**Backend must provide:**

```
POST /api/checkout/session/:sessionId/deposit-address
  body: { currency: string, network: string }
→ 200 {
    address: string,
    memo?: string,                // XRP/XLM/TON etc.
    amount: string,               // canonical crypto amount (already computed server-side)
    expiresAt: string (ISO)
  }
```

Call this on entering the "send" step (`startSend` in `index.tsx`). Remove
`MOCK_DEPOSIT_ADDRESS` and the client-side price table `PRICE_PER_USD` — the
server is authoritative on the crypto amount to charge.

---

## 3. Payment Status (polling or realtime)

**Where:** `src/routes/index.tsx` — the `txs`, `status`, `received` state, and
`SimulationPanel`'s `onReceive`. `derivePaymentStatus` currently classifies
`awaiting | insufficient | completed | overpaid` from the local `txs` array.

**Backend must provide** either polling or WebSocket:

```
GET /api/checkout/session/:sessionId/status
→ 200 {
    status: "awaiting" | "insufficient" | "completed" | "overpaid" | "expired",
    dueAmount: string,            // in token units
    receivedAmount: string,
    remainingAmount: string,
    transactions: [{
      hash: string,
      amount: string,
      confirmations: number,
      confirmed: boolean,
      receivedAt: string
    }],
    senderAddress?: string        // first sender — needed for refund flow
  }
```

**Or WebSocket:** `wss://…/checkout/session/:sessionId` emitting the same
payload on every state change.

Wire this in place of `SimulationPanel`. The panel should be gated behind
`import.meta.env.DEV` before shipping to production.

---

## 4. WalletConnect Deposit Notification

**Where:** `src/components/checkout/WalletConnectPay.tsx` (returns a tx hash) →
`handleWalletTx` in `src/routes/index.tsx:92`.

Today the returned hash is pushed straight into local `txs`. In production the
backend watches the deposit address on-chain and will discover the tx itself,
but the client should still notify to reduce latency:

```
POST /api/checkout/session/:sessionId/wallet-tx
  body: {
    hash: string,
    chainId: number,
    fromAddress: string,          // useAccount().address
    currency: string,
    network: string
  }
→ 202 Accepted
```

---

## 5. Refund Submission (overpayment)

**Where:** `src/components/checkout/ConfirmRefundDialog.tsx:58` — `handleConfirm`
currently just flips to `submitted` phase.

Fee math lives in `src/data/refund-economics.ts` and is **client-side only**.
The backend must recompute and be authoritative.

**Backend must provide:**

```
POST /api/checkout/session/:sessionId/refund
  body: {
    address: string,              // destination
    network: string,              // destination network (USDT can differ)
    currency: string
  }
→ 200 {
    refundId: string,
    payout: string,               // net after fees
    networkFee: string,
    platformFee: string,
    status: "queued"
  }
  409 { code: "below_minimum", minimum: string }
```

---

## 6. Report a Problem

**Where:** `src/components/checkout/ReportProblemDialog.tsx:55` — `handleSubmit`
parses with Zod then just flips `submitted = true`.

**Backend must provide:**

```
POST /api/checkout/session/:sessionId/report
  multipart/form-data:
    description: string (min 10)
    txHash?: string
    attachment?: File             // screenshot
→ 200 { ticketId: string }
```

The Zod schema (`reportSchema` in the same file) is the authoritative shape.

---

## 7. Sender Address (for refund prefill)

**Where:** `src/routes/index.tsx:62` — `useState(randomWalletAddress)`.

The sender address shown on the success screen and prefilled into the refund
dialog is randomly generated. Replace with the `senderAddress` field returned
by the status endpoint (§3).

---

## 8. Environment Variables

Frontend expects:

| Var | Purpose | Required |
|---|---|---|
| `VITE_WALLETCONNECT_PROJECT_ID` | Reown AppKit project id | for WalletConnect |
| `VITE_API_BASE_URL` | Backend base URL | **add when wiring §1–§6** |
| `VITE_WS_URL` | WebSocket URL for status | optional (§3) |

No secret keys must ever land in `VITE_*` — those are shipped to the browser.

---

## 9. What Stays Frontend-Only

- All UI state machines (`derivePaymentStatus`, step routing, timers).
- All formatting helpers in `src/lib/payment.ts` **except** the three random
  generators (`randomTxHash`, `randomWalletAddress`, `makeOrderId`) — those get
  deleted once §1, §3, §7 are wired.
- `SimulationPanel` — dev-only, remove or gate behind `import.meta.env.DEV`.
- WalletConnect / wagmi wiring (`src/lib/walletconnect.ts`, `evm-chains.ts`,
  `evm-tokens.ts`, `WalletConnectPay.tsx`) — signing happens client-side.

---

## 10. Suggested Wiring Order for Cursor

1. §1 Session fetch — unlocks real order data.
2. §2 Deposit address — unblocks correct `to` and per-chain addresses.
3. §3 Status endpoint / WS — replaces `SimulationPanel` as the source of truth.
4. §7 Sender address falls out of §3.
5. §4 WalletConnect notify — optimization, not a blocker.
6. §5 Refund + §6 Report — independent, can be done in parallel.
