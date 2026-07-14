## Goal

Add a WalletConnect  "Connect Wallet & Pay" action to the existing checkout page. EVM-only (Ethereum, BSC, Arbitrum, Avalanche C-Chain, Polygon). Frontend-only — no backend, no Supabase, no real chain watching. When the user signs an EVM transaction, we treat the returned tx hash as a simulated deposit and feed it into the existing payment-state machine (same path SimulationPanel already uses).

Everything else in your prompt (backend `/api/payments/create`, real polling, Supabase realtime, expiry from server, overpaid return-address flow, etc.) is already represented in the mock UI — those stay mock, per your "WalletConnect only" scope.

## What already exists (no work needed)

- Address + QR display with amount toggle (`PaymentQr.tsx`)
- Countdown timer, expiry, copy address, "Just address / With amount" QR
- Status states: awaiting / insufficient (partial) / completed / overpaid, plus Checking transition
- Report-a-problem dialog, overpayment refund flow
- 25+ assets and networks in `src/data/cryptocurrencies.ts`
- SimulationPanel that dispatches `handleReceive(amount)` → drives all statuses

## What's missing (this plan)

1. **WalletConnect wiring** (wagmi + `@reown/appkit` — the current WalletConnect SDK) configured for the 5 EVM chains only.
2. **"Connect Wallet & Pay" primary CTA** on the Send step, above the existing manual QR/address block. Manual address stays as the secondary path (already there).
3. **EVM-aware send flow**:
  - If selected `network` is one of the 5 EVM chains → show the WC button.
  - On click: open AppKit modal → connect → auto-switch chain if needed → send tx:
    - Native asset (ETH, BNB, AVAX, MATIC): `sendTransaction({ to, value })`
    - ERC-20 (USDT/USDC/etc.): `writeContract` `transfer(to, amount)` using a small token registry (address + decimals per chain) added to `src/data/`.
  - On tx-hash returned: call the existing `handleReceive(dueNum)` and push the real hash into `txs` instead of a random one, so `PaymentProcessing` / `PaymentCompleted` display the real explorer link.
4. **Non-EVM networks**: WC button is hidden; only the existing manual address/QR path is shown (unchanged).
5. **UX states**: connecting, wrong-chain (auto-switch), user-rejected, insufficient-funds — surfaced as inline messages under the button. No layout regressions on mobile (734px viewport is the current design target).
6. **No secrets committed**. WalletConnect project ID is read from `import.meta.env.VITE_WALLETCONNECT_PROJECT_ID`; if missing, the button renders disabled with a small "WalletConnect not configured" hint so the checkout still works in preview.

## Files

New:

- `src/lib/walletconnect.ts` — AppKit + wagmi config (5 EVM chains, projectId from env).
- `src/data/evm-tokens.ts` — `{ symbol → { chainId → { address, decimals } } }` for the ERC-20s already listed on EVM networks in `cryptocurrencies.ts`.
- `src/components/checkout/WalletConnectPay.tsx` — button + hooks (`useAccount`, `useSwitchChain`, `useSendTransaction`, `useWriteContract`), inline status.
- `src/lib/evm-chains.ts` — small helper mapping our `CryptoNetwork` name → wagmi chain object + chainId.

Edited:

- `src/routes/__root.tsx` — wrap `<Outlet />` in `WagmiProvider` + AppKit init (client-only, so guarded).
- `src/components/checkout/SendFunds.tsx` — render `<WalletConnectPay />` above the existing address block when network is EVM.
- `src/routes/index.tsx` — pass `handleReceive` + `pushTxHash` down; adjust `handleReceive` to optionally accept a real hash (backward-compatible signature).
- `package.json` — add `@reown/appkit`, `@reown/appkit-adapter-wagmi`, `wagmi`, `viem`.

Unchanged:

- SimulationPanel stays (still useful for non-EVM demo and for testing partial/overpaid).
- All existing components, routing, styles, refund flow, report dialog.

## Technical notes

- AppKit is the current name for the WalletConnect Web3Modal SDK; wagmi handles the low-level EIP-1193 + chain switching.
- SSR: AppKit + wagmi need a browser context. Init inside a `useEffect` in a client component wrapping `<Outlet />`, and mark the wallet button with a `useHydrated()` guard to avoid hydration mismatch.
- ERC-20 amount conversion uses `parseUnits(cryptoAmount, decimals)` from viem.
- After `sendTransaction` resolves with a hash, we do NOT wait for confirmations (frontend-only). The tx-hash is displayed and linked to the correct block explorer via the existing `explorerTxUrl(networkName, hash)` helper.
- No changes to backend contracts, no new env vars beyond the optional WalletConnect project ID.

## Out of scope (explicitly)

- Real payment creation API, real status polling, Supabase realtime, real overpayment refund on-chain, cross-chain routing, Solana/Tron/BTC signing. These stay mocked exactly as they are today.

## Verify

- Build passes (typecheck + lint).
- On preview at 734px viewport: selecting USDT-on-Ethereum shows the "Connect Wallet & Pay" button; selecting USDT-on-Tron does not.
- With `VITE_WALLETCONNECT_PROJECT_ID` unset, the button is disabled with a hint; the rest of the flow works.