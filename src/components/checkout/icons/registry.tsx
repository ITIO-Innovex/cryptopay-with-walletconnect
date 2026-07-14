import type { ComponentType, SVGProps } from "react";
import {
  TokenUSDT,
  TokenUSDC,
  TokenBTC,
  TokenETH,
  TokenSOL,
  TokenLTC,
  TokenDOT,
  TokenEGLD,
  TokenFIL,
  TokenGALA,
  TokenGMX,
  TokenGNO,
  TokenGRT,
  TokenHBAR,
  TokenICP,
  TokenIMX,
  TokenINJ,
  TokenKAVA,
  TokenKSM,
  TokenLDO,
  TokenLINK,
  TokenLRC,
  TokenMANA,
  NetworkTron,
  NetworkEthereum,
  NetworkAvalanche,
  NetworkBinanceSmartChain,
  NetworkNearProtocol,
  NetworkSolana,
  NetworkTon,
  NetworkArbitrumOne,
  NetworkBitcoin,
  NetworkLitecoin,
  NetworkPolkadot,
  NetworkMultiversx,
  NetworkHederaHashgraph,
  NetworkInjective,
  NetworkKava,
} from "@web3icons/react";

/** Shared prop shape for the web3icons branded SVG components. */
export type Web3IconProps = SVGProps<SVGSVGElement> & {
  size?: string | number;
  variant?: "mono" | "branded" | "background";
};

export type Web3Icon = ComponentType<Web3IconProps>;

/** Authentic token glyphs keyed by ticker symbol. */
const TOKEN_ICONS: Record<string, Web3Icon> = {
  USDT: TokenUSDT,
  USDC: TokenUSDC,
  BTC: TokenBTC,
  ETH: TokenETH,
  SOL: TokenSOL,
  LTC: TokenLTC,
  DOT: TokenDOT,
  EGLD: TokenEGLD,
  FIL: TokenFIL,
  GALA: TokenGALA,
  GMX: TokenGMX,
  GNO: TokenGNO,
  GRT: TokenGRT,
  HBAR: TokenHBAR,
  ICP: TokenICP,
  IMX: TokenIMX,
  INJ: TokenINJ,
  KAVA: TokenKAVA,
  KSM: TokenKSM,
  LDO: TokenLDO,
  LINK: TokenLINK,
  LRC: TokenLRC,
  MANA: TokenMANA,
};

/** Authentic blockchain logos keyed by the network display name in our data. */
const NETWORK_ICONS: Record<string, Web3Icon> = {
  Tron: NetworkTron,
  Ethereum: NetworkEthereum,
  "Avalanche C-Chain": NetworkAvalanche,
  Avalanche: NetworkAvalanche,
  "Binance Smart Chain": NetworkBinanceSmartChain,
  Near: NetworkNearProtocol,
  Solana: NetworkSolana,
  Toncoin: NetworkTon,
  Arbitrum: NetworkArbitrumOne,
  Bitcoin: NetworkBitcoin,
  Litecoin: NetworkLitecoin,
  Polkadot: NetworkPolkadot,
  MultiversX: NetworkMultiversx,
  Hedera: NetworkHederaHashgraph,
  Injective: NetworkInjective,
  Kava: NetworkKava,
};

/** Returns the branded token icon component, or null when none exists. */
export function getTokenIcon(symbol: string): Web3Icon | null {
  return TOKEN_ICONS[symbol] ?? null;
}

/** Returns the branded network icon component, or null when none exists. */
export function getNetworkIcon(name: string): Web3Icon | null {
  return NETWORK_ICONS[name] ?? null;
}
