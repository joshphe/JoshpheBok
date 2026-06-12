// ── API Layer Index ──
// Re-export everything from the new split modules.

export { fetchJson, rpcCall } from './fetcher';
export type { FetchOptions } from './fetcher';

export type {
  TokenBalance,
  ChainBalance,
  WalletConfig,
  IndexItem,
  CryptoItem,
  MarketData,
  FearGreedData,
  CryptoGlobalData,
  HalvingData,
  TrendingCoin,
  GasData,
  Web3Data,
} from './types';

export { fetchEthWallet } from './eth-chain';
export { fetchBnbWallet } from './bnb-chain';
export { fetchSolWallet } from './sol-chain';
export { fetchAllChainBalances } from './chain';

export { fetchAShares, fetchUSStocks } from './market-shares';
export { fetchCrypto } from './market-crypto';
export { fetchAllMarketData } from './market-aggregate';

export {
  fetchFearGreedIndex,
  fetchCryptoGlobal,
  fetchHalvingData,
  fetchTrendingCoins,
  fetchGasData,
  fetchAllWeb3Data,
} from './web3';
