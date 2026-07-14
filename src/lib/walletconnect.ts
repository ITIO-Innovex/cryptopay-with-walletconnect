import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { arbitrum, avalanche, bsc, mainnet, polygon } from "@reown/appkit/networks";

/**
 * WalletConnect / Reown AppKit setup, EVM-only.
 * Reads projectId from VITE_WALLETCONNECT_PROJECT_ID. When missing the module
 * still loads so the app doesn't crash — the WalletConnectPay button detects
 * this and renders a disabled state with a hint.
 */

export const WC_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as
  | string
  | undefined;

export const WC_ENABLED = Boolean(WC_PROJECT_ID);

const networks = [mainnet, bsc, arbitrum, avalanche, polygon] as const;

// Even without a project id we build the adapter so wagmi hooks are usable;
// AppKit modal simply won't open. Using a placeholder keeps SDK happy at init.
const projectId = WC_PROJECT_ID ?? "00000000000000000000000000000000";

export const wagmiAdapter = new WagmiAdapter({
  networks: [...networks],
  projectId,
  ssr: false,
});

// Cast to any to reconcile wagmi's nested @wagmi/core version with the
// adapter's version — they are structurally compatible at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const wagmiConfig: any = wagmiAdapter.wagmiConfig;

let appKitInitialized = false;

/** Initialize AppKit exactly once, on the client. Safe to call repeatedly. */
export function ensureAppKit(): void {
  if (appKitInitialized || typeof window === "undefined") return;
  createAppKit({
    adapters: [wagmiAdapter],
    networks: [...networks],
    projectId,
    metadata: {
      name: "Crypto Checkout",
      description: "Pay with crypto via WalletConnect",
      url: window.location.origin,
      icons: [],
    },
    features: {
      analytics: false,
      email: false,
      socials: false,
    },
    themeMode: "light",
  });
  appKitInitialized = true;
}