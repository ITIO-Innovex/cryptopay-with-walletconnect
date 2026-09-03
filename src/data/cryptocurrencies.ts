/**
 * Static catalog of crypto currencies and their supported networks for the
 * checkout. This is mock data that mirrors a typical crypto payment gateway.
 */

export interface CryptoNetwork {
  /** Display name of the blockchain, e.g. "Tron". */
  name: string;
  /** Token standard / protocol label, e.g. "TRC-20". */
  standard: string;
  /** Hex color used for the small network badge. */
  color: string;
}

export interface CryptoCurrency {
  /** Ticker symbol, e.g. "USDT". */
  symbol: string;
  /** Full name, e.g. "Tether". */
  name: string;
  /** Brand color for the coin icon background. */
  color: string;
  /** Networks the currency can be received on. */
  networks: CryptoNetwork[];
}

export const CRYPTO_CURRENCIES: CryptoCurrency[] = [
  {
    symbol: "USDT",
    name: "Tether",
    color: "#26A17B",
    networks: [
      { name: "Tron", standard: "TRC-20", color: "#EF0027" },
      { name: "Ethereum", standard: "ERC-20", color: "#627EEA" },
      { name: "Avalanche C-Chain", standard: "ERC-20", color: "#E84142" },
      { name: "Binance Smart Chain", standard: "BEP-20", color: "#F3BA2F" },
      { name: "Near", standard: "NEP141", color: "#111111" },
      { name: "Solana", standard: "SPL", color: "#14F195" },
      { name: "Toncoin", standard: "JETTON", color: "#0098EA" },
      { name: "Tezos", standard: "FA2", color: "#2C7DF7" },
    ],
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    color: "#2775CA",
    networks: [
      { name: "Ethereum", standard: "ERC-20", color: "#627EEA" },
      { name: "Solana", standard: "SPL", color: "#14F195" },
      { name: "Binance Smart Chain", standard: "BEP-20", color: "#F3BA2F" },
      { name: "Avalanche C-Chain", standard: "ERC-20", color: "#E84142" },
    ],
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    color: "#F7931A",
    networks: [{ name: "Bitcoin", standard: "Mainnet", color: "#F7931A" }],
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    color: "#627EEA",
    networks: [
      { name: "Ethereum", standard: "ERC-20", color: "#627EEA" },
      { name: "Arbitrum", standard: "ERC-20", color: "#28A0F0" },
    ],
  },
  {
    symbol: "SOL",
    name: "Solana",
    color: "#14B87A",
    networks: [{ name: "Solana", standard: "SPL", color: "#14F195" }],
  },
  {
    symbol: "LTC",
    name: "Litecoin",
    color: "#345D9D",
    networks: [{ name: "Litecoin", standard: "Mainnet", color: "#345D9D" }],
  },
  {
    symbol: "DOT",
    name: "Polkadot New",
    color: "#E6007A",
    networks: [{ name: "Polkadot", standard: "Mainnet", color: "#E6007A" }],
  },
  {
    symbol: "EGLD",
    name: "MultiversX",
    color: "#23F7DD",
    networks: [{ name: "MultiversX", standard: "Mainnet", color: "#1B1B2E" }],
  },
  {
    symbol: "FIL",
    name: "Filecoin",
    color: "#42C1CA",
    networks: [{ name: "Filecoin", standard: "Mainnet", color: "#42C1CA" }],
  },
  {
    symbol: "GALA",
    name: "Gala",
    color: "#1B98E0",
    networks: [{ name: "Ethereum", standard: "ERC-20", color: "#627EEA" }],
  },
  {
    symbol: "GMX",
    name: "GMX",
    color: "#5B6BF7",
    networks: [{ name: "Arbitrum", standard: "ERC-20", color: "#28A0F0" }],
  },
  {
    symbol: "GNO",
    name: "Gnosis",
    color: "#0DB2AC",
    networks: [{ name: "Ethereum", standard: "ERC-20", color: "#627EEA" }],
  },
  {
    symbol: "GRT",
    name: "The Graph",
    color: "#6747ED",
    networks: [{ name: "Ethereum", standard: "ERC-20", color: "#627EEA" }],
  },
  {
    symbol: "HBAR",
    name: "Hedera Hashgraph",
    color: "#222222",
    networks: [{ name: "Hedera", standard: "Mainnet", color: "#222222" }],
  },
  {
    symbol: "HMSTR",
    name: "Hamster Kombat",
    color: "#C6892C",
    networks: [{ name: "Toncoin", standard: "JETTON", color: "#0098EA" }],
  },
  {
    symbol: "ICP",
    name: "Internet Computer",
    color: "#9B33A6",
    networks: [{ name: "Internet Computer", standard: "Mainnet", color: "#9B33A6" }],
  },
  {
    symbol: "IMX",
    name: "Immutable X",
    color: "#111827",
    networks: [{ name: "Ethereum", standard: "ERC-20", color: "#627EEA" }],
  },
  {
    symbol: "INJ",
    name: "Injective Protocol",
    color: "#00B9FF",
    networks: [{ name: "Injective", standard: "Mainnet", color: "#00B9FF" }],
  },
  {
    symbol: "KAVA",
    name: "Kava",
    color: "#FF433E",
    networks: [{ name: "Kava", standard: "Mainnet", color: "#FF433E" }],
  },
  {
    symbol: "KSM",
    name: "Kusama",
    color: "#111111",
    networks: [{ name: "Kusama", standard: "Mainnet", color: "#111111" }],
  },
  {
    symbol: "LDO",
    name: "Lido DAO Token",
    color: "#F08C7A",
    networks: [{ name: "Ethereum", standard: "ERC-20", color: "#627EEA" }],
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    color: "#2A5ADA",
    networks: [{ name: "Ethereum", standard: "ERC-20", color: "#627EEA" }],
  },
  {
    symbol: "LRC",
    name: "Loopring",
    color: "#1C60FF",
    networks: [{ name: "Ethereum", standard: "ERC-20", color: "#627EEA" }],
  },
  {
    symbol: "MANA",
    name: "Decentraland",
    color: "#FF2D55",
    networks: [{ name: "Ethereum", standard: "ERC-20", color: "#627EEA" }],
  },
];

/** Approximate crypto units received per 1 USD, used for the amount estimate. */
export const PRICE_PER_USD: Record<string, number> = {
  USDT: 1.0066,
  USDC: 1.002,
  BTC: 0.0000154,
  ETH: 0.000292,
  SOL: 0.0067,
  LTC: 0.0119,
};

/**
 * @deprecated Prefer live deposit addresses from POST /api/checkout/session/:id/deposit-address.
 * Kept only as a fallback constant for local UI stories.
 */
export const MOCK_DEPOSIT_ADDRESS = "0x68436e61f2e5b07023d957c1584a53d982018b49";
