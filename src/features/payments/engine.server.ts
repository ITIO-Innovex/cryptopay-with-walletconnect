/**
 * Payment + settlement engine.
 *
 * All money maths lives here so the same code runs for simulated deposits today
 * and for real on-chain deposits once the custody provider is connected.
 */

import { PRICE_PER_USD } from "@/data/cryptocurrencies";
import { networkFeeFor } from "@/data/refund-economics";
import { addressProvider } from "./address-provider.server";

/** Platform commission taken from each settlement (0.5%). */
export const PLATFORM_FEE_RATE = 0.005;

const EPSILON = 1e-9;

export type InvoiceStatus =
  | "awaiting"
  | "underpaid"
  | "paid"
  | "overpaid"
  | "expired"
  | "cancelled"
  | "refunded";

/** Converts an invoice's fiat amount into units of the chosen asset. */
export function dueAmountFor(amountUsd: number, asset: string): number {
  const unitsPerUsd = PRICE_PER_USD[asset] ?? 1;
  return Number((amountUsd * unitsPerUsd).toFixed(10));
}

/** Derives an invoice status from the amount due and the amount received. */
export function deriveStatus(due: number, received: number): InvoiceStatus {
  if (received <= EPSILON) return "awaiting";
  if (received < due - EPSILON) return "underpaid";
  if (received > due + EPSILON) return "overpaid";
  return "paid";
}

/** Allocates a deposit address for an invoice through the wallet provider. */
export async function allocateDepositAddress(input: {
  asset: string;
  network: string;
  invoiceId: string;
}) {
  return addressProvider.allocate(input);
}

/** Minutes between payout runs for each schedule. */
export function intervalMinutes(mode: string): number | null {
  switch (mode) {
    case "instant":
      return 0;
    case "hourly":
      return 60;
    case "daily":
      return 24 * 60;
    default:
      return null; // manual
  }
}

export interface SettlementMath {
  gross: number;
  platformFee: number;
  networkFee: number;
  net: number;
}

/** Fees charged on a settlement batch, in units of the settled asset. */
export function settlementMath(gross: number, asset: string, network: string): SettlementMath {
  const platformFee = Number((gross * PLATFORM_FEE_RATE).toFixed(10));
  const networkFee = Number(networkFeeFor(asset, network).toFixed(10));
  const net = Math.max(0, Number((gross - platformFee - networkFee).toFixed(10)));
  return { gross, platformFee, networkFee, net };
}

/** A mock settlement transaction hash for a network. */
export function mockSettlementHash(network: string): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return network === "Bitcoin" || network === "Litecoin" ? hex : `0x${hex}`;
}
