import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/walletconnect";

/**
 * Wagmi / WalletConnect provider. This module owns the only import of
 * `@/lib/walletconnect` (Reown AppKit), which touches browser globals such as
 * `HTMLElement` at module scope. It must be loaded lazily on the client only —
 * see `RootComponent` in `src/routes/__root.tsx`.
 */
export default function WalletProviders({ children }: { children: ReactNode }) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}
