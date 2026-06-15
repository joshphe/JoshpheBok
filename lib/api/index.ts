// ── API Layer Index ──

export { fetchJson, rpcCall } from './fetcher';
export type { FetchOptions } from './fetcher';

export type {
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
