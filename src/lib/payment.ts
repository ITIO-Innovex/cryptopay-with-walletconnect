/**
 * Helpers for the crypto payment outcome flow: amount math, address/hash
 * shortening and mock transaction hash generation used by the simulator.
 */

/** Tolerance for floating-point comparison of crypto amounts. */
const EPSILON = 1e-9;

export type PaymentStatus = "awaiting" | "insufficient" | "completed" | "overpaid";

/**
 * Derives the payment status from the amount due and the total amount received.
 */
export function derivePaymentStatus(due: number, received: number): PaymentStatus {
  if (received <= EPSILON) return "awaiting";
  if (received < due - EPSILON) return "insufficient";
  if (received > due + EPSILON) return "overpaid";
  return "completed";
}

/** Formats a crypto amount, trimming trailing zeros (max 6 decimals). */
export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const fixed = value.toFixed(6);
  return fixed.replace(/\.?0+$/, "");
}

/** Shortens a long string in the middle, e.g. 0x6843…2018b49. */
export function shortenMiddle(value: string, head = 6, tail = 8): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/** Generates a realistic-looking mock transaction hash. */
export function randomTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i += 1) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/** Generates a realistic-looking mock wallet address (sender's wallet). */
export function randomWalletAddress(): string {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i += 1) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

/** Generates a mock order id similar to the gateway format. */
export function makeOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 12; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
    date.getDate(),
  ).padStart(2, "0")}`;
  return `pay${stamp}${suffix}`;
}

/** Block-explorer base URLs keyed by network display name. */
const EXPLORER_BASES: Record<string, string> = {
  Tron: "https://tronscan.org/#/transaction/",
  Ethereum: "https://etherscan.io/tx/",
  "Avalanche C-Chain": "https://snowtrace.io/tx/",
  Avalanche: "https://snowtrace.io/tx/",
  "Binance Smart Chain": "https://bscscan.com/tx/",
  Near: "https://nearblocks.io/txns/",
  Solana: "https://solscan.io/tx/",
  Toncoin: "https://tonviewer.com/transaction/",
  Tezos: "https://tzkt.io/",
  Arbitrum: "https://arbiscan.io/tx/",
  Bitcoin: "https://mempool.space/tx/",
  Litecoin: "https://litecoinspace.org/tx/",
  Polkadot: "https://polkadot.subscan.io/extrinsic/",
  MultiversX: "https://explorer.multiversx.com/transactions/",
  Hedera: "https://hashscan.io/mainnet/transaction/",
  "Internet Computer": "https://dashboard.internetcomputer.org/transaction/",
  Injective: "https://explorer.injective.network/transaction/",
  Kava: "https://kavascan.com/tx/",
  Kusama: "https://kusama.subscan.io/extrinsic/",
};

/** Builds a block-explorer URL for a transaction hash on the given network. */
export function explorerTxUrl(networkName: string, hash: string): string {
  const base = EXPLORER_BASES[networkName] ?? "https://blockchair.com/search?q=";
  return `${base}${hash}`;
}
