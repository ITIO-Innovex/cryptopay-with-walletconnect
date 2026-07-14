import { useEffect, useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { parseEther, parseUnits, erc20Abi } from "viem";
import {
  useAccount,
  useChainId,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import type { CryptoCurrency, CryptoNetwork } from "@/data/cryptocurrencies";
import { chainIdForNetwork } from "@/lib/evm-chains";
import { getErc20, isNativeAsset } from "@/data/evm-tokens";
import { ensureAppKit, WC_ENABLED } from "@/lib/walletconnect";
import { shortenMiddle } from "@/lib/payment";

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
 * Primary WalletConnect CTA for EVM chains. Opens the Reown AppKit modal,
 * switches chain if needed, and sends either a native transfer or an ERC-20
 * `transfer(to, amount)`. On success it hands the tx hash up so the existing
 * status machine can display it.
 */
export function WalletConnectPay({
  currency,
  network,
  to,
  amount,
  onTxSubmitted,
}: WalletConnectPayProps) {
  useEffect(() => {
    if (WC_ENABLED) ensureAppKit();
  }, []);

  const { address, isConnected, isConnecting } = useAccount();
  const currentChainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { sendTransactionAsync, isPending: isSendingNative } = useSendTransaction();
  const { writeContractAsync, isPending: isSendingErc20 } = useWriteContract();
  const { disconnect } = useDisconnect();

  const [error, setError] = useState<string | null>(null);

  const targetChainId = chainIdForNetwork(network.name);
  const wrongChain = isConnected && targetChainId != null && currentChainId !== targetChainId;
  const isSending = isSendingNative || isSendingErc20;

  const openModal = () => {
    // AppKit registers a global custom element <w3m-button> and exposes
    // window.modal via createAppKit. We use the custom event to open.
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyWindow = window as any;
    if (anyWindow?.appKit?.open) {
      anyWindow.appKit.open();
      return;
    }
    // Fallback: dispatch custom event that AppKit listens for.
    document.dispatchEvent(new CustomEvent("w3m:open"));
  };

  const handleConnect = () => {
    setError(null);
    if (!WC_ENABLED) {
      setError("WalletConnect is not configured for this preview.");
      return;
    }
    openModal();
  };

  const handlePay = async () => {
    setError(null);
    if (!targetChainId) {
      setError("This network is not supported for direct wallet payment.");
      return;
    }
    try {
      if (wrongChain) {
        await switchChainAsync({ chainId: targetChainId });
      }

      let hash: `0x${string}`;
      if (isNativeAsset(currency.symbol, targetChainId)) {
        hash = await sendTransactionAsync({
          to,
          value: parseEther(amount),
          chainId: targetChainId,
        });
      } else {
        const token = getErc20(currency.symbol, targetChainId);
        if (!token) {
          setError(
            `${currency.symbol} on ${network.name} is not available for direct payment. Use the address below.`,
          );
          return;
        }
        hash = await writeContractAsync({
          abi: erc20Abi,
          address: token.address,
          functionName: "transfer",
          args: [to, parseUnits(amount, token.decimals)],
          chainId: targetChainId,
        });
      }

      const amountNum = parseFloat(amount) || 0;
      onTxSubmitted(hash, amountNum);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyErr = err as any;
      const msg: string =
        anyErr?.shortMessage ||
        anyErr?.message ||
        "Transaction failed. Please try again from your wallet.";
      // Normalize common rejection wording.
      if (/reject|denied|User denied/i.test(msg)) {
        setError("Transaction rejected in wallet.");
      } else {
        setError(msg);
      }
    }
  };

  const busy = isConnecting || isSwitching || isSending;

  return (
    <div className="space-y-2">
      {!isConnected ? (
        <button
          type="button"
          onClick={handleConnect}
          disabled={!WC_ENABLED}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-base font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Wallet className="h-5 w-5" />
          Connect Wallet & Pay
        </button>
      ) : (
        <button
          type="button"
          onClick={handlePay}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-base font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Wallet className="h-5 w-5" />
          )}
          {isSwitching
            ? `Switching to ${network.name}…`
            : isSending
              ? "Confirm in wallet…"
              : wrongChain
                ? `Switch to ${network.name} & pay ${amount} ${currency.symbol}`
                : `Pay ${amount} ${currency.symbol} with ${shortenMiddle(address ?? "", 4, 4)}`}
        </button>
      )}

      {isConnected && (
        <button
          type="button"
          onClick={() => disconnect()}
          className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Disconnect wallet
        </button>
      )}

      {!WC_ENABLED && (
        <p className="text-center text-xs text-muted-foreground">
          WalletConnect not configured — set{" "}
          <code className="rounded bg-muted px-1">VITE_WALLETCONNECT_PROJECT_ID</code> to enable.
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}