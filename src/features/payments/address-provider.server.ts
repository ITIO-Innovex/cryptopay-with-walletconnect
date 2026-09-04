/**
 * Deposit address provisioning.
 *
 * Today addresses come from a mock generator. When the custody provider that
 * generates real per-invoice wallets is connected, replace `mockProvider` with
 * a provider that calls it — nothing else in the payment flow changes.
 */

export interface DepositAddress {
  address: string;
  memo?: string | null;
}

export interface WalletAddressProvider {
  /** Returns a unique deposit address for an invoice on the given network. */
  allocate(input: {
    asset: string;
    network: string;
    invoiceId: string;
  }): Promise<DepositAddress>;
}

function randomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

function randomBase58(length: number): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => alphabet[b % alphabet.length])
    .join("");
}

/** Produces an address that looks right for the given network. */
export function mockAddressFor(network: string): DepositAddress {
  switch (network) {
    case "Tron":
      return { address: `T${randomBase58(33)}` };
    case "Bitcoin":
      return { address: `bc1q${randomBase58(38).toLowerCase()}` };
    case "Litecoin":
      return { address: `ltc1q${randomBase58(38).toLowerCase()}` };
    case "Solana":
      return { address: randomBase58(44) };
    case "Toncoin":
      return { address: `UQ${randomBase58(46)}`, memo: String(Math.floor(Math.random() * 1e9)) };
    case "Tezos":
      return { address: `tz1${randomBase58(33)}` };
    case "Polkadot":
    case "Kusama":
      return { address: randomBase58(47) };
    case "Near":
      return { address: `${randomHex(16)}.near` };
    case "Hedera":
      return { address: `0.0.${Math.floor(Math.random() * 9_000_000) + 1_000_000}` };
    case "MultiversX":
      return { address: `erd1${randomBase58(58).toLowerCase()}` };
    default:
      return { address: `0x${randomHex(40)}` };
  }
}

export const mockProvider: WalletAddressProvider = {
  async allocate({ network }) {
    return mockAddressFor(network);
  },
};

/** The provider the payment engine uses. Swap this line for the live one. */
export const addressProvider: WalletAddressProvider = mockProvider;
