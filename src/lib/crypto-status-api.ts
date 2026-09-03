/** Pay-In local crypto status stub (Phase S0/S1) — same store Status_300 polls. */
const PAYIN_BASE =
  (import.meta.env.VITE_PAYIN_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:1053";

export type LocalCryptoStatus = {
  order_status?: string;
  status?: string;
  payment_phase?: string;
  paid_crypto_amount?: string;
  crypto_amount?: string;
  response?: string;
};

export async function fetchLocalCryptoStatus(transID: string): Promise<LocalCryptoStatus> {
  const url = `${PAYIN_BASE}/v1/payments/status?reference=${encodeURIComponent(transID)}`;
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) {
    throw new Error(`status HTTP ${res.status}`);
  }
  return (await res.json()) as LocalCryptoStatus;
}

export async function simulateLocalCryptoDeposit(
  transID: string,
  amount: number,
): Promise<LocalCryptoStatus> {
  const res = await fetch(`${PAYIN_BASE}/v1/payments/simulate`, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference: transID, amount }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`simulate HTTP ${res.status}${body ? `: ${body.slice(0, 160)}` : ""}`);
  }
  const json = (await res.json()) as { gateway?: LocalCryptoStatus };
  return json.gateway || {};
}

export async function resetLocalCryptoDeposit(transID: string): Promise<void> {
  await fetch(`${PAYIN_BASE}/v1/payments/simulate`, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference: transID, reset: true }),
  });
}

const TX_API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:9003";

export type CheckoutS2sStatus = {
  order_status?: string | number;
  status?: string;
  response?: string;
  trans_response?: string;
  rrn?: string;
  upa?: string;
  connector_ref?: string;
};

/** Live Bitnob / connector status via TransactionsMs (HMAC Status_*). */
export async function fetchCheckoutS2sStatus(transID: string): Promise<CheckoutS2sStatus> {
  const url = `${TX_API_BASE}/api/status/s2s/checkout/${encodeURIComponent(transID)}`;
  const res = await fetch(url, { credentials: "omit", mode: "cors" });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`checkout status HTTP ${res.status}${body ? `: ${body.slice(0, 160)}` : ""}`);
  }
  return JSON.parse(body) as CheckoutS2sStatus;
}
