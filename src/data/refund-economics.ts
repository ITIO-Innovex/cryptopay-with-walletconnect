/**
 * Refund economics for the overpayment return flow: market-based network
 * (on-chain) fees, the platform fee we charge to execute the return, and the
 * minimum amount each network is able to send (dust / withdrawal floor).
 *
 * All reference values are denominated in USD and converted into the refund
 * token's units via PRICE_PER_USD so the maths stays consistent across tokens.
 */

import { PRICE_PER_USD } from "./cryptocurrencies";

/**
 * Approximate on-chain withdrawal fee per network, expressed in USD.
 * These mirror typical real-world market costs for a simple transfer.
 */
const NETWORK_FEE_USD: Record<string, number> = {
  Tron: 1,
  Ethereum: 4,
  "Avalanche C-Chain": 0.1,
  Avalanche: 0.1,
  "Binance Smart Chain": 0.3,
  Near: 0.05,
  Solana: 0.01,
  Toncoin: 0.05,
  Tezos: 0.05,
  Arbitrum: 0.2,
  Bitcoin: 2,
  Litecoin: 0.05,
  Polkadot: 0.1,
  MultiversX: 0.05,
  Filecoin: 0.1,
  Hedera: 0.02,
  "Internet Computer": 0.05,
  Injective: 0.05,
  Kava: 0.05,
  Kusama: 0.1,
};

const DEFAULT_NETWORK_FEE_USD = 1;

/**
 * Minimum amount a network can practically send, expressed in USD. Sending
 * below this floor is rejected by the network / not economical (dust).
 */
const NETWORK_MIN_USD: Record<string, number> = {
  Tron: 1,
  Ethereum: 20,
  "Avalanche C-Chain": 1,
  Avalanche: 1,
  "Binance Smart Chain": 1,
  Near: 1,
  Solana: 0.5,
  Toncoin: 1,
  Tezos: 1,
  Arbitrum: 2,
  Bitcoin: 5,
  Litecoin: 0.5,
  Polkadot: 2,
  MultiversX: 1,
  Filecoin: 1,
  Hedera: 0.5,
  "Internet Computer": 1,
  Injective: 1,
  Kava: 1,
  Kusama: 2,
};

const DEFAULT_NETWORK_MIN_USD = 1;

/** Minimum platform fee (our service charge) per token, in USD. */
const PLATFORM_FEE_MIN_USD: Record<string, number> = {
  USDT: 1,
  BTC: 10,
};

const DEFAULT_PLATFORM_FEE_MIN_USD = 5;

/** Converts a USD amount into units of the given token. */
function usdToToken(symbol: string, usd: number): number {
  const unitsPerUsd = PRICE_PER_USD[symbol] ?? 1;
  return usd * unitsPerUsd;
}

/** Platform fee for executing a return of `symbol`, in token units. */
export function platformFeeFor(symbol: string): number {
  const usd = PLATFORM_FEE_MIN_USD[symbol] ?? DEFAULT_PLATFORM_FEE_MIN_USD;
  return usdToToken(symbol, usd);
}

/** Market network fee for sending `symbol` on `network`, in token units. */
export function networkFeeFor(symbol: string, networkName: string): number {
  const usd = NETWORK_FEE_USD[networkName] ?? DEFAULT_NETWORK_FEE_USD;
  return usdToToken(symbol, usd);
}

/** Minimum sendable amount for `symbol` on `network`, in token units. */
export function networkMinimumFor(symbol: string, networkName: string): number {
  const usd = NETWORK_MIN_USD[networkName] ?? DEFAULT_NETWORK_MIN_USD;
  return usdToToken(symbol, usd);
}

export interface RefundBreakdown {
  /** The overpaid amount being returned (token units). */
  extra: number;
  /** On-chain network fee (token units). */
  networkFee: number;
  /** Platform service fee (token units). */
  platformFee: number;
  /** Amount the recipient actually receives after fees (token units). */
  payout: number;
  /** Minimum the network can send (token units). */
  networkMinimum: number;
  /** True when payout is below the network minimum (refund not possible). */
  belowMinimum: boolean;
}

/**
 * Computes the full refund breakdown for an overpayment, deducting the market
 * network fee and the platform fee, and flagging when the resulting payout is
 * below what the network is able to send.
 */
export function computeRefund(
  extra: number,
  symbol: string,
  networkName: string,
): RefundBreakdown {
  const networkFee = networkFeeFor(symbol, networkName);
  const platformFee = platformFeeFor(symbol);
  const payout = Math.max(0, extra - networkFee - platformFee);
  const networkMinimum = networkMinimumFor(symbol, networkName);
  return {
    extra,
    networkFee,
    platformFee,
    payout,
    networkMinimum,
    belowMinimum: payout < networkMinimum,
  };
}
