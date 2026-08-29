import { CRYPTO_CURRENCIES } from "@/data/cryptocurrencies";
import { CoinIcon } from "@/components/checkout/CoinIcon";
import { getNetworkIcon } from "@/components/checkout/icons/registry";


/** Coins highlighted on the home page, in checkout order. */
const HIGHLIGHT = ["USDT", "USDC", "BTC", "ETH", "SOL", "LTC", "LINK", "DOT", "MANA", "GRT", "IMX", "HBAR"];

const CURRENCIES = HIGHLIGHT.map((s) => CRYPTO_CURRENCIES.find((c) => c.symbol === s)).filter(
  (c): c is (typeof CRYPTO_CURRENCIES)[number] => Boolean(c),
);

/** Unique network list across the whole catalog, for the network row. */
const NETWORKS = Array.from(
  new Map(
    CRYPTO_CURRENCIES.flatMap((c) => c.networks).map((n) => [n.name, n] as const),
  ).values(),
);

/**
 * Shows the coins, token standards and blockchain networks the checkout can
 * accept, using the same icons the payment page renders.
 */
export function SupportedAssets() {
  return (
    <section id="assets" className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">Coins, tokens and networks</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Each asset is accepted on the networks shown below. The customer picks a coin and a
        network at checkout, and the deposit address is issued for that exact pair.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CURRENCIES.map((c) => (
          <div key={c.symbol} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
            <CoinIcon symbol={c.symbol} color={c.color} size={36} network={c.networks[0]} />
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {c.symbol} <span className="font-normal text-muted-foreground">· {c.name}</span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {c.networks.map((n) => `${n.name} (${n.standard})`).join(" · ")}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card/50 p-5">
        <h3 className="text-sm font-semibold">Networks we settle on</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {NETWORKS.map((n) => (
            <li
              key={n.name}
              className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs"
            >
              <NetworkChipIcon name={n.name} color={n.color} />
              {n.name}
              <span className="text-muted-foreground">{n.standard}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Small circular blockchain logo used in the network row. */
function NetworkChipIcon({ name, color }: { name: string; color: string }) {
  const Icon = getNetworkIcon(name);
  return (
    <span
      className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-white"
      style={{ backgroundColor: color }}
    >
      {Icon ? <Icon variant="mono" size={12} /> : (
        <span className="text-[9px] font-semibold">{name.slice(0, 1)}</span>
      )}
    </span>
  );
}
