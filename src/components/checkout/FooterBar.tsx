import { Info } from "lucide-react";
import type { CryptoCurrency, CryptoNetwork } from "@/data/cryptocurrencies";
import { CoinIcon } from "./CoinIcon";

type FooterMode = "select" | "selected" | "amount";

interface FooterBarProps {
  mode: FooterMode;
  totalLabel: string;
  currency: CryptoCurrency | null;
  network: CryptoNetwork | null;
  cryptoAmount: string;
  primaryLabel: string;
  canPrimary: boolean;
  onPrimary: () => void;
  showInfo?: boolean;
  onInfo?: () => void;
}

/**
 * Sticky bottom action bar. Its left-side summary and primary button label
 * adapt to where the buyer is in the checkout.
 */
export function FooterBar({
  mode,
  totalLabel,
  currency,
  network,
  cryptoAmount,
  primaryLabel,
  canPrimary,
  onPrimary,
  showInfo,
  onInfo,
}: FooterBarProps) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-border bg-card shadow-bar">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4">
        <div className="min-w-0">
          {mode === "select" && (
            <>
              <p className="text-sm text-muted-foreground">{totalLabel}</p>
              <p className="text-lg font-semibold text-muted-foreground">Select currency</p>
            </>
          )}

          {mode === "selected" && currency && (
            <div className="flex items-center gap-3">
              <CoinIcon symbol={currency.symbol} color={currency.color} size={40} />
              <div>
                <p className="text-sm text-muted-foreground">Selected currency</p>
                <p className="text-lg font-semibold text-foreground">
                  {currency.symbol} <span className="text-muted-foreground">{currency.name}</span>
                </p>
              </div>
            </div>
          )}

          {mode === "amount" && currency && network && (
            <div className="flex items-center gap-3">
              <CoinIcon
                symbol={currency.symbol}
                color={currency.color}
                network={network}
                size={40}
              />
              <div>
                <p className="text-sm text-muted-foreground">{totalLabel}</p>
                <p className="text-lg font-semibold text-foreground">
                  ≈ {cryptoAmount} {currency.symbol}
                </p>
                <p className="text-xs text-muted-foreground">
                  Network: {network.name} · {network.standard}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrimary}
            disabled={!canPrimary}
            className="h-12 rounded-2xl bg-primary px-10 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {primaryLabel}
          </button>
          {showInfo && (
            <button
              type="button"
              onClick={onInfo}
              aria-label="Important notes"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors hover:text-foreground"
            >
              <Info className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
