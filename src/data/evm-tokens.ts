/**
 * ERC-20 token contract registry for supported EVM chains.
 * Keyed by symbol → chainId → { address, decimals }.
 * Native assets (ETH/BNB/AVAX/MATIC) are handled by chainId alone and
 * do NOT appear here.
 */

export interface Erc20Info {
  address: `0x${string}`;
  decimals: number;
}

export const ERC20_TOKENS: Record<string, Record<number, Erc20Info>> = {
  USDT: {
    1: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
    56: { address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
    43114: { address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", decimals: 6 },
  },
  USDC: {
    1: { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
    56: { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
    43114: { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 },
    137: { address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6 },
  },
  GALA: {
    1: { address: "0xd1d2Eb1B1e90B638588728b4130137D262C87cae", decimals: 8 },
  },
  GMX: {
    42161: { address: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", decimals: 18 },
  },
  GNO: {
    1: { address: "0x6810e776880C02933D47DB1b9fc05908e5386b96", decimals: 18 },
  },
  GRT: {
    1: { address: "0xc944E90C64B2c07662A292be6244BDf05Cda44a7", decimals: 18 },
  },
  IMX: {
    1: { address: "0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF", decimals: 18 },
  },
  LDO: {
    1: { address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", decimals: 18 },
  },
  LINK: {
    1: { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18 },
  },
  LRC: {
    1: { address: "0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD", decimals: 18 },
  },
  MANA: {
    1: { address: "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942", decimals: 18 },
  },
};

/** Native symbol expected on each EVM chain id. */
export const NATIVE_SYMBOL_BY_CHAIN_ID: Record<number, string> = {
  1: "ETH",
  56: "BNB",
  42161: "ETH",
  43114: "AVAX",
  137: "MATIC",
};

export function isNativeAsset(symbol: string, chainId: number): boolean {
  return NATIVE_SYMBOL_BY_CHAIN_ID[chainId] === symbol;
}

export function getErc20(symbol: string, chainId: number): Erc20Info | undefined {
  return ERC20_TOKENS[symbol]?.[chainId];
}