import { Copy } from "lucide-react";
import { explorerTxUrl, shortenMiddle } from "@/lib/payment";

interface ExplorerHashesProps {
  networkName: string;
  hashes: string[];
}

/** Renders clickable block-explorer links for one or more transaction hashes. */
export function ExplorerHashes({ networkName, hashes }: ExplorerHashesProps) {
  if (hashes.length === 0) return null;
  return (
    <div className="border-t border-border pt-6">
      <p className="text-base font-semibold text-foreground">View transaction status in explorer</p>
      <ul className="mt-3 space-y-2">
        {hashes.map((hash) => (
          <li key={hash} className="flex items-center gap-2">
            <a
              href={explorerTxUrl(networkName, hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm text-brand underline-offset-2 hover:underline"
            >
              Hash: {shortenMiddle(hash, 40, 6)}
            </a>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(hash).catch(() => {})}
              aria-label="Copy transaction hash"
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Copy className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
