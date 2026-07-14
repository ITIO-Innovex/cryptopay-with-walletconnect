import { cn } from "@/lib/utils";
import { getNetworkIcon, getTokenIcon } from "./icons/registry";

interface CoinIconProps {
  symbol: string;
  color: string;
  size?: number;
  /** When provided, overlays the blockchain logo as a small corner badge. */
  network?: { name: string; color: string } | null;
  className?: string;
}

/**
 * Renders the authentic token glyph (white) on the brand-colored circular chip.
 * When a network is supplied, the real blockchain logo is overlaid as a small
 * bottom-right badge. Falls back to a colored monogram when no asset exists.
 */
export function CoinIcon({ symbol, color, size = 40, network, className }: CoinIconProps) {
  const Token = getTokenIcon(symbol);
  const Network = network ? getNetworkIcon(network.name) : null;
  const badgeSize = Math.round(size * 0.46);
  const initial = symbol.slice(0, 1).toUpperCase();

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <span
        className="flex items-center justify-center rounded-full text-white"
        style={{ width: size, height: size, backgroundColor: color }}
      >
        {Token ? (
          <Token variant="mono" size={Math.round(size * 0.62)} />
        ) : (
          <span className="font-semibold" style={{ fontSize: size * 0.42 }}>
            {initial}
          </span>
        )}
      </span>

      {network && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-card"
          style={{ width: badgeSize + 4, height: badgeSize + 4 }}
        >
          <span
            className="flex items-center justify-center rounded-full text-white"
            style={{ width: badgeSize, height: badgeSize, backgroundColor: network.color }}
          >
            {Network && <Network variant="mono" size={Math.round(badgeSize * 0.66)} />}
          </span>
        </span>
      )}
    </span>
  );
}
