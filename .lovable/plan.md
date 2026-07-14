# Advanced Refund, Fee & Error-Handling Plan

This plan upgrades three areas of the crypto checkout: (1) the overpayment **refund flow**, (2) **fees + minimum-payout** logic, and (3) **crypto-aware error handling** plus a **manual status check / report-error** system. All work is frontend/presentation — the simulator stays the data source; no real chain or backend calls.

---

## 1. Refund flow (overpayment → return extra)

Today the success screen just asks for a free-text refund address. New behaviour:

### Default = same as sender
When the buyer chooses to return the extra, the refund **token, network, and address are prefilled** with the ones used for the received transaction (sender's wallet/token/network). The buyer normally just confirms.

### Step-by-step UX

```text
[Overpayment detected banner]
        │  "Return the extra payment"  ← also links "Refund terms" (clickable)
        ▼
1. Refund Terms dialog  (same style as ImportantNotesDialog)
        │  shows terms + fee/min rules → button "I understand"
        ▼
2. Confirm Refund dialog
        ├─ Token:   USDT   [🔒 locked]      (pencil → blocked w/ reason)
        ├─ Network: Tron   [✏ pencil]       (editable ONLY for USDT)
        ├─ Address: 0x…    [✏ pencil]       (editable)
        ├─ Breakdown:
        │     Extra received      X.XXXXXX TOKEN
        │     – Network fee       n.nnnn  TOKEN (market based)
        │     – Platform fee      p       TOKEN (≥ rule below)
        │     = You receive       Y.YYYYYY TOKEN
        └─ button "Confirm refund"
        ▼
3a. If payout ≥ network minimum → "Refund request received… reviewed manually, processed within 48 hours"
3b. If payout < network minimum → "Cannot refund: amount is lower than the minimum the network allows to send."
        └─ button "I understand" → "Return to merchant"
```

### Token-change rule
- Changing the **token** is never allowed → tapping the token pencil shows an inline reason: *"We can only refund in the same token you sent (TOKEN). A different token cannot be returned."*
- For **USDT** only: the **network** pencil is enabled (USDT is multi-network), so the buyer can pick another USDT network and a matching address.
- For all other tokens: network is locked (single-network tokens), only the **address** is editable.

---

## 2. Fees & minimum payout

A new data module `src/data/refund-economics.ts` holds the rules. Values are realistic market estimates (denominated in the refund token, derived from a USD reference so they stay consistent).

### Platform fee (our charge for executing the return)
| Token | Platform fee (minimum) |
|-------|------------------------|
| USDT  | ≥ 1 USDT-equivalent    |
| BTC   | ≥ 10 USDT-equivalent   |
| all others | ≥ 5 USDT-equivalent |

Charged **on top of** the network fee. Both are deducted from the extra amount before payout.

### Network fee (market based, per network)
Approximate on-chain withdrawal fees, e.g.:
```text
Tron (TRC-20 USDT) ~1 USDT      Ethereum (ERC-20) ~3–6 USDT
BSC (BEP-20) ~0.3 USDT          Solana (SPL) ~0.01 USDT
Bitcoin ~ a few USD in BTC      Litecoin ~ small
Arbitrum ~0.1–0.3 USDT          Toncoin ~ small
```
Stored as a per-network value (in token units) and converted via the existing `PRICE_PER_USD` map.

### Minimum payout per token/network
Each network has a **minimum sendable amount** (dust/withdrawal floor), e.g. you can't send 0.4 USDT on some networks, you can't send sub-dust BTC. After deducting both fees, if the remaining payout falls below that floor → trigger flow **3b** above.

`net payout = extra − networkFee − platformFee`; refund only proceeds when `net payout ≥ networkMinimum`.

---

## 3. QR page button → manual status check

The current QR/awaiting screen has a primary action button ("Pay") that doesn't fit — buyers pay from their own wallet app, not from here.

- **Remove** that confusing pay/confirm button on the send/awaiting screen.
- Add a **"I've sent it — Check payment status"** action that runs a small client-side "checker": shows the existing `CheckingStatus` spinner for ~2s, then re-evaluates state (awaiting / partial / completed). Friendly copy explains it polls the network and that confirmations can take a few minutes.
- Keep the QR + address + amount as the primary content.

---

## 4. Status / error handling (crypto-aware)

Crypto has no "failed transaction" like cards. Real issues are *mismatches and pending states*. Handle these explicitly with clear what/why/how messages:

| Situation | Message + resolution |
|-----------|----------------------|
| **Still pending / 0 confirmations** | "Transaction seen, waiting for network confirmations (can take a few minutes)." Re-check available. |
| **Underpaid (shortfall)** | Existing flow — send the remaining amount. |
| **Overpaid** | Refund flow (section 1). |
| **Wrong network** | "Funds may have been sent on the wrong network. Report this with your transaction hash." → report dialog. |
| **Wrong token** | "A different token was received than expected." → report dialog. |
| **Smart-contract / exchange transfer** | "Payments from smart contracts/exchanges may be delayed or unsupported." Guidance + report. |
| **Window expired** | "The payment window closed. Do not send funds; start a new payment or contact the merchant." |
| **Below-minimum / dust** | Cannot be processed/refunded (section 2). |

### Report-error system
A **"Report a problem"** link on the awaiting/processing/completed screens opens a dialog:
- Fields: short description, transaction hash (optional), and **screenshot upload** (image input with preview, client-side validated type/size).
- On submit: confirmation "Your report and screenshot were sent to our team — we'll review and get back to you." (mock submit; no backend — payload assembled client-side, ready to wire to Cloud later).
- Always offer **"Return to merchant"** as an escape hatch so users never get stuck needing support.

---

## Technical changes

**New files**
- `src/data/refund-economics.ts` — `networkFee`, `platformFeeMin`, `networkMinimum` lookups + helper `computeRefund(extra, token, network)` returning `{ networkFee, platformFee, payout, belowMinimum }`.
- `src/components/checkout/RefundTermsDialog.tsx` — terms popup with "I understand".
- `src/components/checkout/ConfirmRefundDialog.tsx` — prefilled token(locked)/network/address with pencils, fee breakdown, min-payout guard, both outcome states.
- `src/components/checkout/StatusCheckButton.tsx` — manual "check status" control using `CheckingStatus`.
- `src/components/checkout/ReportProblemDialog.tsx` — description + tx hash + screenshot upload.

**Edited files**
- `src/components/checkout/PaymentCompleted.tsx` — replace inline refund input with the terms→confirm dialog chain; prefill sender token/network/address.
- `src/components/checkout/SendFunds.tsx` — remove the pay button, add status-check + report links.
- `src/components/checkout/PaymentProcessing.tsx` — add status-check + report links; expired-window state.
- `src/routes/index.tsx` — track sender's tx token/network/address for prefill; wire footer changes for the send step; pass economics into the refund flow.
- `src/lib/payment.ts` — small helpers if needed (token→USD conversion already via `PRICE_PER_USD`).

**Validation**: address length/format light check, screenshot type (png/jpg) + size (≤ ~5 MB) with zod; numeric fee math guarded against negatives. Verify the full flow (underpay, exact, overpay→refund confirm, below-minimum refund, report dialog) with Playwright.

No backend in this pass; the report submit and refund request are mocked and structured so they can later be sent to Lovable Cloud.
