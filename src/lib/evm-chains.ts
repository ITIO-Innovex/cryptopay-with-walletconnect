import { arbitrum, avalanche, bsc, mainnet, polygon } from "wagmi/chains";
import type { Chain } from "viem";

/** Map our CryptoNetwork.name → wagmi/viem chain descriptor. */
export const EVM_CHAIN_BY_NETWORK_NAME: Record<string, Chain> = {
  Ethereum: mainnet,
  "Binance Smart Chain": bsc,
  Arbitrum: arbitrum,
  "Avalanche C-Chain": avalanche,
  Polygon: polygon,
};

export const EVM_CHAINS = [mainnet, bsc, arbitrum, avalanche, polygon] as const;

/** True if the given network name is an EVM chain we support signing on. */
export function isEvmNetwork(networkName: string): boolean {
  return networkName in EVM_CHAIN_BY_NETWORK_NAME;
}

/** Wagmi chain id for a supported network name, or undefined. */
export function chainIdForNetwork(networkName: string): number | undefined {
  return EVM_CHAIN_BY_NETWORK_NAME[networkName]?.id;
}