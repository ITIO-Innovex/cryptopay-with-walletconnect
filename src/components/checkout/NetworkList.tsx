import { ArrowLeft, Check } from "lucide-react";
import type { CryptoCurrency, CryptoNetwork } from "@/data/cryptocurrencies";
import { CoinIcon } from "./CoinIcon";
import { cn } from "@/lib/utils";

interface NetworkListProps {
  currency: CryptoCurrency;
  selectedNetwork: CryptoNetwork | null;
  onSelect: (network: CryptoNetwork) => void;
  onBack: () => void;
}

/**
 * Step 2 — choose the blockchain network for the selected currency, with a
 * prominent warning about sending on the wrong network.
 */
export function NetworkList({ currency, selectedNetwork, onSelect, onBack }: NetworkListProps) {
  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-base font-semibold text-brand transition-opacity hover:opacity-80"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>

      <div className="flex items-center gap-3">
        <CoinIcon symbol={currency.symbol} color={currency.color} size={44} />
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Select network</h2>
          <p className="text-sm">
            <span className="font-semibold text-foreground">{currency.symbol}</span>{" "}
            <span className="text-muted-foreground">{currency.name}</span>
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-warning/60 bg-warning/5 px-4 py-3 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Important</span>: Choose the same network as
        your {currency.symbol} wallet. Selecting the wrong network (blockchain) will result in lost
        funds.
      </div>

      <ul className="space-y-2.5">
        {currency.networks.map((network) => {
          const key = `${network.name}-${network.standard}`;
          const isSelected =
            selectedNetwork?.name === network.name &&
            selectedNetwork?.standard === network.standard;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onSelect(network)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-left transition-colors",
                  isSelected
                    ? "border-brand ring-1 ring-brand"
                    : "border-border hover:border-muted-foreground/30",
                )}
              >
                <CoinIcon
                  symbol={currency.symbol}
                  color={currency.color}
                  network={network}
                />
                <span className="flex-1 text-base">
                  <span className="font-semibold text-foreground">{network.name}</span>{" "}
                  <span className="text-muted-foreground">{network.standard}</span>
                </span>
                {isSelected && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-brand-foreground">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        Need help?{" "}
        <button type="button" className="font-semibold text-brand hover:opacity-80">
          Contact the support
        </button>
      </p>
    </div>
  );
}
