const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:9005";

export type CheckoutSession = {
  orderId: string;
  title: string;
  description: string;
  amountUsd: number;
  amountFiatCurrency: string;
  customerEmail: string;
  expiresAt: string;
  supportedCurrencies?: string[] | null;
};

export type CheckoutTx = {
  hash: string;
  amount: string;
  confirmations: number;
  confirmed: boolean;
  receivedAt: string;
};

export type CheckoutStatus = {
  status: "awaiting" | "insufficient" | "completed" | "overpaid" | "expired";
  dueAmount: string;
  receivedAmount: string;
  remainingAmount: string;
  transactions: CheckoutTx[];
  senderAddress?: string | null;
};

export type DepositAddress = {
  address: string;
  memo?: string | null;
  amount: string;
  expiresAt: string;
};

async function parseError(res: Response): Promise<Error> {
  try {
    const body = (await res.json()) as { message?: string; code?: string };
    return new Error(body.message || body.code || res.statusText);
  } catch {
    return new Error(res.statusText || "Request failed");
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    throw await parseError(res);
  }
  if (res.status === 204 || res.status === 202) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function getCheckoutApiBase() {
  return API_BASE;
}

export function fetchCheckoutSession(sessionId: string) {
  return api<CheckoutSession>(`/api/checkout/session/${encodeURIComponent(sessionId)}`);
}

export function fetchCheckoutStatus(sessionId: string) {
  return api<CheckoutStatus>(`/api/checkout/session/${encodeURIComponent(sessionId)}/status`);
}

export function requestDepositAddress(
  sessionId: string,
  currency: string,
  network: string,
) {
  return api<DepositAddress>(
    `/api/checkout/session/${encodeURIComponent(sessionId)}/deposit-address`,
    {
      method: "POST",
      body: JSON.stringify({ currency, network }),
    },
  );
}

export function notifyWalletTx(
  sessionId: string,
  body: {
    hash: string;
    chainId?: number;
    fromAddress?: string;
    currency?: string;
    network?: string;
    amount?: number;
  },
) {
  return api<void>(`/api/checkout/session/${encodeURIComponent(sessionId)}/wallet-tx`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function simulateDeposit(
  sessionId: string,
  body: { amount: number; hash?: string; fromAddress?: string },
) {
  return api<CheckoutStatus>(
    `/api/checkout/session/${encodeURIComponent(sessionId)}/simulate-deposit`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export function reportProblem(
  sessionId: string,
  body: { description: string; txHash?: string },
) {
  return api<{ ticketId: string }>(
    `/api/checkout/session/${encodeURIComponent(sessionId)}/report`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}
