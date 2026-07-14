import { useEffect, useState } from "react";
import { Check, Loader2, QrCode as QrCodeIcon, Search, X } from "lucide-react";
import QRCode from "qrcode";
import type { CryptoCurrency, CryptoNetwork } from "@/data/cryptocurrencies";
import { randomWalletAddress, randomTxHash, shortenMiddle } from "@/lib/payment";

/**
 * Visual mock of the real WalletConnect / Reown AppKit modal.
 * Frontend-only: no real chain calls. Runs a scripted flow that mirrors the
 * actual product — brand blue header, wallet list, QR + "opening wallet"
 * transition, approval prompt with tx details, and a returned fake hash.
 *
 * NOTE: This is intentionally not the real AppKit — it works with no project
 * id and never leaves the browser. Toggle to the real modal by wiring
 * VITE_WALLETCONNECT_PROJECT_ID and calling ensureAppKit() instead.
 */

interface WalletConnectMockModalProps {
  open: boolean;
  currency: CryptoCurrency;
  network: CryptoNetwork;
  /** Recipient address (merchant deposit address). */
  to: string;
  /** Amount in token units, e.g. "14.02". */
  amount: string;
  onClose: () => void;
  /** Called with the "signed" tx hash + connected wallet address on approval. */
  onApproved: (hash: string, fromAddress: string) => void;
}

type Phase = "wallets" | "connecting" | "approve" | "signing" | "done";

interface MockWallet {
  id: string;
  name: string;
  color: string;
  monogram: string;
  tagline?: string;
}

const WALLETS: MockWallet[] = [
  { id: "metamask", name: "MetaMask", color: "#F6851B", monogram: "M", tagline: "Recent" },
  { id: "trust", name: "Trust Wallet", color: "#3375BB", monogram: "T" },
  { id: "rainbow", name: "Rainbow", color: "#001E59", monogram: "R" },
  { id: "coinbase", name: "Coinbase Wallet", color: "#2C5FF6", monogram: "C" },
  { id: "ledger", name: "Ledger Live", color: "#111111", monogram: "L" },
  { id: "safe", name: "Safe", color: "#12FF80", monogram: "S" },
  { id: "zerion", name: "Zerion", color: "#2461ED", monogram: "Z" },
  { id: "phantom", name: "Phantom", color: "#AB9FF2", monogram: "P" },
];

export function WalletConnectMockModal({
  open,
  currency,
  network,
  to,
  amount,
  onClose,
  onApproved,
}: WalletConnectMockModalProps) {
  const [phase, setPhase] = useState<Phase>("wallets");
  const [selected, setSelected] = useState<MockWallet | null>(null);
  const [fromAddress] = useState(randomWalletAddress);
  const [wcQr, setWcQr] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      setPhase("wallets");
      setSelected(null);
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const topic = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
    const key = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
    const uri = `wc:${topic}@2?relay-protocol=irn&symKey=${key}`;
    QRCode.toDataURL(uri, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 280,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(setWcQr)
      .catch(() => setWcQr(null));
  }, [open]);

  if (!open) return null;

  const pickWallet = (w: MockWallet) => {
    setSelected(w);
    setPhase("connecting");
    setTimeout(() => setPhase("approve"), 1400);
  };

  const approve = () => {
    setPhase("signing");
    setTimeout(() => {
      const hash = randomTxHash();
      setPhase("done");
      setTimeout(() => {
        onApproved(hash, fromAddress);
        onClose();
      }, 900);
    }, 1600);
  };

  const filteredWallets = WALLETS.filter((w) =>
    w.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Connect a wallet"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_-20px_rgba(51,153,252,0.35)] ring-1 ring-black/5"
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2">
            <WcLogoMark />
            <span className="text-sm font-semibold text-neutral-900">WalletConnect</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {phase === "wallets" && (
          <WalletsScreen
            query={query}
            onQuery={setQuery}
            wallets={filteredWallets}
            onPick={pickWallet}
            qr={wcQr}
          />
        )}

        {phase === "connecting" && selected && <ConnectingScreen wallet={selected} />}

        {phase === "approve" && selected && (
          <ApproveScreen
            wallet={selected}
            currency={currency}
            network={network}
            to={to}
            amount={amount}
            fromAddress={fromAddress}
            onApprove={approve}
            onReject={onClose}
          />
        )}

        {phase === "signing" && selected && <SigningScreen wallet={selected} />}

        {phase === "done" && <DoneScreen />}
      </div>
    </div>
  );
}

function WalletsScreen({
  query,
  onQuery,
  wallets,
  onPick,
  qr,
}: {
  query: string;
  onQuery: (v: string) => void;
  wallets: MockWallet[];
  onPick: (w: MockWallet) => void;
  qr: string | null;
}) {
  return (
    <div className="px-5 pb-5 pt-4">
      <h3 className="text-base font-semibold text-neutral-900">Connect wallet</h3>
      <p className="mt-0.5 text-xs text-neutral-500">
        Choose your wallet or scan with your phone
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2">
        <Search className="h-4 w-4 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search wallet"
          className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
      </div>

      <div className="mt-3 max-h-64 space-y-1 overflow-y-auto pr-1">
        {wallets.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => onPick(w)}
            className="flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors hover:bg-neutral-50"
          >
            <WalletMark wallet={w} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">{w.name}</p>
              {w.tagline && <p className="text-[11px] text-[#3396FF]">{w.tagline}</p>}
            </div>
            <span className="text-xs text-neutral-400">›</span>
          </button>
        ))}
        {wallets.length === 0 && (
          <p className="py-6 text-center text-xs text-neutral-500">
            No wallets match that name.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-neutral-200">
          {qr ? (
            <img src={qr} alt="WalletConnect QR" className="h-full w-full object-contain p-1" />
          ) : (
            <QrCodeIcon className="h-6 w-6 text-neutral-400" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900">Scan with your phone</p>
          <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
            Open your mobile wallet and scan the QR to connect via WalletConnect.
          </p>
        </div>
      </div>
    </div>
  );
}

function ConnectingScreen({ wallet }: { wallet: MockWallet }) {
  return (
    <div className="flex flex-col items-center px-6 pb-8 pt-6 text-center">
      <div className="relative">
        <WalletMark wallet={wallet} size="lg" />
        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-white">
          <Loader2 className="h-5 w-5 animate-spin text-[#3396FF]" />
        </span>
      </div>
      <p className="mt-4 text-sm font-semibold text-neutral-900">Opening {wallet.name}…</p>
      <p className="mt-1 text-xs text-neutral-500">
        Confirm the connection request in your wallet to continue.
      </p>

      <div className="mt-5 flex items-center gap-1.5">
        <BrandDot />
        <BrandDot delay={120} />
        <BrandDot delay={240} />
      </div>
    </div>
  );
}

function ApproveScreen({
  wallet,
  currency,
  network,
  to,
  amount,
  fromAddress,
  onApprove,
  onReject,
}: {
  wallet: MockWallet;
  currency: CryptoCurrency;
  network: CryptoNetwork;
  to: string;
  amount: string;
  fromAddress: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="px-5 pb-5 pt-4">
      <div className="flex items-center gap-3">
        <WalletMark wallet={wallet} />
        <div>
          <p className="text-sm font-semibold text-neutral-900">{wallet.name} · Connected</p>
          <p className="text-[11px] text-neutral-500">{shortenMiddle(fromAddress, 6, 4)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Review transaction
        </p>
        <p className="mt-2 text-2xl font-bold text-neutral-900">
          {amount} {currency.symbol}
        </p>
        <p className="text-xs text-neutral-500">
          {currency.name} · {network.name} ({network.standard})
        </p>

        <dl className="mt-4 space-y-2 text-xs">
          <Row label="From">{shortenMiddle(fromAddress, 6, 4)}</Row>
          <Row label="To">{shortenMiddle(to, 6, 4)}</Row>
          <Row label="Network fee">~ 0.0012 {currency.symbol === "ETH" ? "ETH" : "native"}</Row>
        </dl>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onReject}
          className="h-11 rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={onApprove}
          className="h-11 rounded-2xl bg-[#3396FF] text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(51,150,255,0.6)] transition-opacity hover:opacity-90"
        >
          Approve
        </button>
      </div>

      <p className="mt-3 text-center text-[11px] text-neutral-400">
        This is a simulated WalletConnect flow — no on-chain transaction is broadcast.
      </p>
    </div>
  );
}

function SigningScreen({ wallet }: { wallet: MockWallet }) {
  return (
    <div className="flex flex-col items-center px-6 pb-8 pt-6 text-center">
      <div className="relative">
        <WalletMark wallet={wallet} size="lg" />
        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-white">
          <Loader2 className="h-5 w-5 animate-spin text-[#3396FF]" />
        </span>
      </div>
      <p className="mt-4 text-sm font-semibold text-neutral-900">Waiting for signature…</p>
      <p className="mt-1 text-xs text-neutral-500">
        Approve the transaction in {wallet.name} to broadcast it.
      </p>
    </div>
  );
}

function DoneScreen() {
  return (
    <div className="flex flex-col items-center px-6 pb-8 pt-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3396FF]/10">
        <Check className="h-8 w-8 text-[#3396FF]" strokeWidth={2.5} />
      </span>
      <p className="mt-4 text-sm font-semibold text-neutral-900">Transaction submitted</p>
      <p className="mt-1 text-xs text-neutral-500">Returning to checkout…</p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-neutral-900">{children}</dd>
    </div>
  );
}

function WalletMark({
  wallet,
  size = "md",
}: {
  wallet: MockWallet;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? "h-16 w-16 text-2xl" : "h-10 w-10 text-base";
  return (
    <span
      aria-hidden
      className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-2xl font-bold text-white shadow-sm`}
      style={{ backgroundColor: wallet.color }}
    >
      {wallet.monogram}
    </span>
  );
}

/** WalletConnect brand-style mark — three stacked arcs on WC blue. */
function WcLogoMark() {
  return (
    <span
      aria-hidden
      className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3396FF]"
    >
      <svg viewBox="0 0 40 24" className="h-3.5 w-5 text-white" fill="none">
        <path
          d="M8.2 7.3c6.5-6.4 17.1-6.4 23.6 0l.8.8a1 1 0 0 1 0 1.4l-2.7 2.7a.5.5 0 0 1-.7 0l-1.1-1.1a8.4 8.4 0 0 0-11.9 0l-1.2 1.2a.5.5 0 0 1-.7 0l-2.7-2.7a1 1 0 0 1 0-1.4zM37 12.6l2.4 2.4a1 1 0 0 1 0 1.4l-10.9 10.7a1 1 0 0 1-1.4 0l-7.7-7.6a.3.3 0 0 0-.4 0l-7.7 7.6a1 1 0 0 1-1.4 0L-1 16.4a1 1 0 0 1 0-1.4L1.4 12.6a1 1 0 0 1 1.4 0l7.7 7.6a.3.3 0 0 0 .4 0l7.7-7.6a1 1 0 0 1 1.4 0l7.7 7.6a.3.3 0 0 0 .4 0l7.7-7.6a1 1 0 0 1 1.4 0z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function BrandDot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="h-2 w-2 animate-pulse rounded-full bg-[#3396FF]"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
