import { useState } from "react";
import { Wallet } from "lucide-react";
import type { CryptoCurrency, CryptoNetwork } from "@/data/cryptocurrencies";
import { WalletConnectMockModal } from "./WalletConnectMockModal";

interface WalletConnectPayProps {
  currency: CryptoCurrency;
  network: CryptoNetwork;
  /** Recipient (merchant) address on the target chain. */
  to: `0x${string}`;
  /** Human amount, e.g. "14.02" */
  amount: string;
  /** Called once a tx hash is returned from the wallet. */
  onTxSubmitted: (hash: string, amount: number) => void;
}

/**
 * Primary WalletConnect CTA for EVM chains.
 *
 * Frontend-only mock: opens a scripted WalletConnect-style modal
 * (`WalletConnectMockModal`) that walks through wallet pick → connect →
 * approve → signed, then returns a fake tx hash into the existing status
 * machine. To swap to the real AppKit + wagmi flow, restore the previous
 * `ensureAppKit()` / `sendTransactionAsync` implementation from git and set
 * `VITE_WALLETCONNECT_PROJECT_ID`.
 */
export function WalletConnectPay({
  currency,
  network,
  to,
  amount,
  onTxSubmitted,
}: WalletConnectPayProps) {
  const [open, setOpen] = useState(false);

  const handleApproved = (hash: string, _fromAddress: string) => {
    const amountNum = parseFloat(amount) || 0;
    onTxSubmitted(hash, amountNum);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3396FF] px-4 py-3 text-base font-semibold text-white shadow-[0_10px_24px_-10px_rgba(51,150,255,0.7)] transition-opacity hover:opacity-90"
      >
        <Wallet className="h-5 w-5" />
        Connect Wallet & Pay
      </button>
      <p className="text-center text-[11px] text-muted-foreground">
        Powered by WalletConnect · demo mode
      </p>

      <WalletConnectMockModal
        open={open}
        currency={currency}
        network={network}
        to={to}
        amount={amount}
        onClose={() => setOpen(false)}
        onApproved={handleApproved}
      />
    </div>
  );
}