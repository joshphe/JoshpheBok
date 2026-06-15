// ── Shared API Types ──

// ── Market Data ──

export interface IndexItem {
  symbol: string;
  name: string;
  price: number | null;
  changeAmount: number | null;
  changePercent: number | null;
}

export interface CryptoItem {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
}

export interface MarketData {
  aShares: IndexItem[];
  usStocks: IndexItem[];
  crypto: CryptoItem[];
}

// ── Web3 Data ──

export interface FearGreedData {
  value: number;
  classification: string;
}

export interface CryptoGlobalData {
  totalMarketCapUsd: number;
  btcDominance: number;
  ethDominance: number;
  totalVolumeUsd: number;
}

export interface HalvingData {
  currentBlock: number;
  blocksRemaining: number;
  progressPercent: number;
  estimatedDate: string;
}

export interface TrendingCoin {
  id: string;
  symbol: string;
  name: string;
  marketCapRank: number | null;
  priceBtc: number | null;
  priceUsd: number | null;
  thumb: string;
}

export interface GasData {
  ethPrice: number;
  low: number | null;
  average: number | null;
  high: number | null;
}

export interface Web3Data {
  fearGreed: FearGreedData | null;
  cryptoGlobal: CryptoGlobalData | null;
  halving: HalvingData | null;
  trending: TrendingCoin[];
  gas: GasData | null;
}
