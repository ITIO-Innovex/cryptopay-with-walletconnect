import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  HelpCircle,
  Loader2,
  QrCode as QrCodeIcon,
  Search,
  X,
} from "lucide-react";
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
  { id: "metamask", name: "MetaMask", color: "#F6851B", monogram: "M", tagline: "RECENT" },
  { id: "trust", name: "Trust Wallet", color: "#3375BB", monogram: "T" },
  { id: "rainbow", name: "Rainbow", color: "#001E59", monogram: "R" },
  { id: "coinbase", name: "Coinbase Wallet", color: "#2C5FF6", monogram: "C" },
  { id: "ledger", name: "Ledger Live", color: "#111111", monogram: "L" },
  { id: "safe", name: "Safe", color: "#12FF80", monogram: "S" },
  { id: "zerion", name: "Zerion", color: "#2461ED", monogram: "Z" },
  { id: "phantom", name: "Phantom", color: "#AB9FF2", monogram: "P" },
];

/** Native gas token symbol shown in fee estimate, per EVM chain name. */
const NATIVE_FEE_SYMBOL: Record<string, string> = {
  Ethereum: "ETH",
  "Binance Smart Chain": "BNB",
  Arbitrum: "ETH",
  "Avalanche C-Chain": "AVAX",
  Polygon: "MATIC",
};

/** Rough, chain-specific fee shown in the approve card (display-only). */
const NATIVE_FEE_AMOUNT: Record<string, string> = {
  Ethereum: "0.00124",
  "Binance Smart Chain": "0.00021",
  Arbitrum: "0.00008",
  "Avalanche C-Chain": "0.00095",
  Polygon: "0.00340",
};

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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/60 px-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Connect a wallet"
      onClick={onClose}
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[400px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06]"
      >
        <ModalHeader
          title={
            phase === "wallets"
              ? "Connect wallet"
              : phase === "approve"
                ? "Confirm transaction"
                : phase === "signing"
                  ? "Sign transaction"
                  : phase === "done"
                    ? "Success"
                    : selected?.name ?? ""
          }
          showBack={phase !== "wallets" && phase !== "done"}
          onBack={() => setPhase("wallets")}
          onClose={onClose}
        />

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

function ModalHeader({
  title,
  showBack,
  onBack,
  onClose,
}: {
  title: string;
  showBack: boolean;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative flex h-14 items-center justify-center px-4">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="absolute left-3 flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
      ) : (
        <div className="absolute left-3 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400">
          <HelpCircle className="h-[18px] w-[18px]" />
        </div>
      )}
      <h2 className="text-[15px] font-semibold tracking-tight text-neutral-900">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
      >
        <X className="h-[18px] w-[18px]" />
      </button>
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
    <div className="px-4 pb-4">
      <div className="flex items-center gap-2 rounded-2xl bg-[#F1F3F7] px-3.5 py-2.5">
        <Search className="h-4 w-4 text-neutral-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search wallet"
          className="w-full bg-transparent text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
      </div>

      <div className="mt-2 max-h-[280px] space-y-0.5 overflow-y-auto">
        {wallets.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => onPick(w)}
            className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-[#F8F9FB]"
          >
            <WalletMark wallet={w} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-neutral-900">{w.name}</p>
            </div>
            {w.tagline ? (
              <span className="rounded-md bg-[#EAF3FF] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-[#3396FF]">
                {w.tagline}
              </span>
            ) : (
              <ChevronRight className="h-4 w-4 text-neutral-300" />
            )}
          </button>
        ))}
        {wallets.length === 0 && (
          <p className="py-6 text-center text-xs text-neutral-500">
            No wallets match that name.
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#F8F9FB] p-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.06]">
          {qr ? (
            <img src={qr} alt="WalletConnect QR" className="h-full w-full object-contain p-1" />
          ) : (
            <QrCodeIcon className="h-6 w-6 text-neutral-400" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-neutral-900">Scan with your phone</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] leading-snug text-neutral-500">
            <WcLogoMark size="sm" /> Connect via WalletConnect
          </p>
        </div>
      </div>
    </div>
  );
}

function ConnectingScreen({ wallet }: { wallet: MockWallet }) {
  return (
    <div className="flex flex-col items-center px-6 pb-10 pt-2 text-center">
      <div className="relative">
        <span
          className="absolute inset-0 -m-2 rounded-[28px] ring-2 ring-[#3396FF]/70 animate-[ping_1.6s_ease-out_infinite]"
          aria-hidden
        />
        <WalletMark wallet={wallet} size="lg" />
      </div>
      <p className="mt-6 text-[15px] font-semibold text-neutral-900">
        Continue in {wallet.name}
      </p>
      <p className="mt-1.5 max-w-[260px] text-[13px] leading-relaxed text-neutral-500">
        Confirm the connection request in your wallet to continue.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#F1F3F7] px-3 py-1.5">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#3396FF]" />
        <span className="text-[11px] font-medium text-neutral-600">Requesting connection…</span>
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
  const feeSymbol = NATIVE_FEE_SYMBOL[network.name] ?? currency.symbol;
  const feeAmount = NATIVE_FEE_AMOUNT[network.name] ?? "0.00100";
  return (
    <div className="px-4 pb-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#F8F9FB] px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <WalletMark wallet={wallet} size="sm" />
          <div>
            <p className="text-[13px] font-semibold text-neutral-900">{wallet.name}</p>
            <p className="text-[11px] text-neutral-500">
              {shortenMiddle(fromAddress, 6, 4)}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-100">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Connected
        </span>
      </div>

      <div className="mt-3 rounded-2xl bg-[#F8F9FB] p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          You send
        </p>
        <p className="mt-1.5 text-[28px] font-bold leading-none tracking-tight text-neutral-900 tabular-nums">
          {amount}{" "}
          <span className="text-[20px] font-semibold text-neutral-500">{currency.symbol}</span>
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <NetworkPill name={network.name} standard={network.standard} />
          <span className="text-[11px] text-neutral-500">· {currency.name}</span>
        </div>
      </div>

      <dl className="mt-3 divide-y divide-neutral-100 rounded-2xl ring-1 ring-neutral-100">
        <DetailRow label="From">
          <span className="font-mono text-[12px]">{shortenMiddle(fromAddress, 6, 4)}</span>
        </DetailRow>
        <DetailRow label="To">
          <span className="font-mono text-[12px]">{shortenMiddle(to, 6, 4)}</span>
        </DetailRow>
        <DetailRow label="Amount">
          <span className="tabular-nums">
            {amount} {currency.symbol}
          </span>
        </DetailRow>
        <DetailRow label="Network">
          {network.name} · {network.standard}
        </DetailRow>
        <DetailRow label="Estimated fee">
          <span className="tabular-nums">
            ~{feeAmount} {feeSymbol}
          </span>
        </DetailRow>
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onReject}
          className="h-12 rounded-2xl bg-[#F1F3F7] text-[14px] font-semibold text-neutral-700 transition-colors hover:bg-[#E7EAF0]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onApprove}
          className="h-12 rounded-2xl bg-[#3396FF] text-[14px] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(51,150,255,0.55)] transition-opacity hover:opacity-95"
        >
          Confirm
        </button>
      </div>

      <p className="mt-3 text-center text-[10.5px] text-neutral-400">
        This is a simulated WalletConnect flow — no on-chain transaction is broadcast.
      </p>
    </div>
  );
}

function SigningScreen({ wallet }: { wallet: MockWallet }) {
  return (
    <div className="flex flex-col items-center px-6 pb-10 pt-2 text-center">
      <div className="relative">
        <span
          className="absolute inset-0 -m-2 rounded-[28px] ring-2 ring-[#3396FF]/70 animate-[ping_1.6s_ease-out_infinite]"
          aria-hidden
        />
        <WalletMark wallet={wallet} size="lg" />
      </div>
      <p className="mt-6 text-[15px] font-semibold text-neutral-900">Waiting for signature</p>
      <p className="mt-1.5 max-w-[260px] text-[13px] leading-relaxed text-neutral-500">
        Approve the transaction in {wallet.name} to broadcast it.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#F1F3F7] px-3 py-1.5">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#3396FF]" />
        <span className="text-[11px] font-medium text-neutral-600">Signing…</span>
      </div>
    </div>
  );
}

function DoneScreen() {
  return (
    <div className="flex flex-col items-center px-6 pb-10 pt-2 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3396FF]/10 ring-8 ring-[#3396FF]/5">
        <Check className="h-9 w-9 text-[#3396FF]" strokeWidth={2.5} />
      </span>
      <p className="mt-5 text-[15px] font-semibold text-neutral-900">Transaction submitted</p>
      <p className="mt-1.5 text-[13px] text-neutral-500">Returning to checkout…</p>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[12.5px]">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-neutral-900">{children}</dd>
    </div>
  );
}

function NetworkPill({ name, standard }: { name: string; standard: string }) {
  const short =
    name === "Binance Smart Chain"
      ? "BSC"
      : name === "Avalanche C-Chain"
        ? "Avalanche"
        : name;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10.5px] font-semibold text-neutral-700 ring-1 ring-neutral-200">
      <span className="h-1.5 w-1.5 rounded-full bg-[#3396FF]" />
      {short}
      <span className="text-neutral-400">· {standard}</span>
    </span>
  );
}

function WalletMark({
  wallet,
  size = "md",
}: {
  wallet: MockWallet;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg"
      ? "h-[72px] w-[72px] text-[28px] rounded-[20px]"
      : size === "sm"
        ? "h-9 w-9 text-[13px] rounded-[10px]"
        : "h-11 w-11 text-[15px] rounded-[13px]";
  return (
    <span
      aria-hidden
      className={`inline-flex ${dim} shrink-0 items-center justify-center font-bold text-white shadow-[0_2px_6px_-1px_rgba(0,0,0,0.12)]`}
      style={{ backgroundColor: wallet.color }}
    >
      {wallet.monogram}
    </span>
  );
}

/** WalletConnect brand-style mark — three stacked arcs on WC blue. */
function WcLogoMark({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-4 w-4 rounded-[5px]" : "h-7 w-7 rounded-lg";
  const inner = size === "sm" ? "h-2 w-3" : "h-3.5 w-5";
  return (
    <span
      aria-hidden
      className={`flex ${box} items-center justify-center bg-[#3396FF]`}
    >
      <svg viewBox="0 0 40 24" className={`${inner} text-white`} fill="none">
        <path
          d="M8.2 7.3c6.5-6.4 17.1-6.4 23.6 0l.8.8a1 1 0 0 1 0 1.4l-2.7 2.7a.5.5 0 0 1-.7 0l-1.1-1.1a8.4 8.4 0 0 0-11.9 0l-1.2 1.2a.5.5 0 0 1-.7 0l-2.7-2.7a1 1 0 0 1 0-1.4zM37 12.6l2.4 2.4a1 1 0 0 1 0 1.4l-10.9 10.7a1 1 0 0 1-1.4 0l-7.7-7.6a.3.3 0 0 0-.4 0l-7.7 7.6a1 1 0 0 1-1.4 0L-1 16.4a1 1 0 0 1 0-1.4L1.4 12.6a1 1 0 0 1 1.4 0l7.7 7.6a.3.3 0 0 0 .4 0l7.7-7.6a1 1 0 0 1 1.4 0l7.7 7.6a.3.3 0 0 0 .4 0l7.7-7.6a1 1 0 0 1 1.4 0z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}