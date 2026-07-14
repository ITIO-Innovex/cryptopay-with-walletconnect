import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import type { CryptoCurrency } from "@/data/cryptocurrencies";
import { CoinIcon } from "./CoinIcon";
import { cn } from "@/lib/utils";

interface CurrencyListProps {
  currencies: CryptoCurrency[];
  selectedSymbol: string | null;
  onSelect: (symbol: string) => void;
}

/**
 * Step 1 — searchable list of supported crypto currencies to pay with.
 */
export function CurrencyList({ currencies, selectedSymbol, onSelect }: CurrencyListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return currencies;
    return currencies.filter(
      (c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    );
  }, [currencies, query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          aria-label="Search currencies"
          className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <ul className="space-y-2.5">
        {filtered.map((currency) => {
          const isSelected = currency.symbol === selectedSymbol;
          return (
            <li key={currency.symbol}>
              <button
                type="button"
                onClick={() => onSelect(currency.symbol)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-left transition-colors",
                  isSelected
                    ? "border-brand ring-1 ring-brand"
                    : "border-border hover:border-muted-foreground/30",
                )}
              >
                <CoinIcon symbol={currency.symbol} color={currency.color} />
                <span className="flex-1 text-base">
                  <span className="font-semibold text-foreground">{currency.symbol}</span>{" "}
                  <span className="text-muted-foreground">{currency.name}</span>
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
        {filtered.length === 0 && (
          <li className="py-10 text-center text-sm text-muted-foreground">
            No currencies match "{query}".
          </li>
        )}
      </ul>
    </div>
  );
}
