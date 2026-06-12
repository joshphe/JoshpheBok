// ── Market & Web3 Data (barrel) ──
// Re-exports from lib/api/ — kept for backward compatibility.

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
} from './api/types';

export { fetchAllMarketData } from './api/market-aggregate';
export { fetchAShares, fetchUSStocks } from './api/market-shares';
export { fetchCrypto } from './api/market-crypto';
export {
  fetchFearGreedIndex,
  fetchCryptoGlobal,
  fetchHalvingData,
  fetchTrendingCoins,
  fetchGasData,
  fetchAllWeb3Data,
} from './api/web3';
