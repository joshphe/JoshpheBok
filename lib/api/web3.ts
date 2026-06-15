// ── Web3 Data: Fear & Greed, Halving, Trending, Gas ──

import { fetchJson } from './fetcher';
import type { FearGreedData, CryptoGlobalData, HalvingData, TrendingCoin, GasData, Web3Data } from './types';

// ── A. Fear & Greed Index ──

interface FNGResponse {
  data?: Array<{
    value: string;
    value_classification?: string;
  }>;
}

export async function fetchFearGreedIndex(): Promise<FearGreedData | null> {
  try {
    const json = await fetchJson<FNGResponse>('https://api.alternative.me/fng/?limit=1');
    const item = json?.data?.[0];
    if (!item) return null;
    return {
      value: parseInt(item.value, 10),
      classification: item.value_classification ?? 'Unknown',
    };
  } catch (err) {
    console.warn('[Web3Data] Fear & Greed fetch failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

// ── B. Crypto Market Overview ──

interface CoinGeckoGlobalResponse {
  data?: {
    total_market_cap?: { usd?: number };
    market_cap_percentage?: { btc?: number; eth?: number };
    total_volume?: { usd?: number };
  };
}

export async function fetchCryptoGlobal(): Promise<CryptoGlobalData | null> {
  try {
    const json = await fetchJson<CoinGeckoGlobalResponse>('https://api.coingecko.com/api/v3/global');
    const d = json?.data;
    if (!d) return null;
    return {
      totalMarketCapUsd: d.total_market_cap?.usd ?? 0,
      btcDominance: d.market_cap_percentage?.btc ?? 0,
      ethDominance: d.market_cap_percentage?.eth ?? 0,
      totalVolumeUsd: d.total_volume?.usd ?? 0,
    };
  } catch (err) {
    console.warn('[Web3Data] Crypto global fetch failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

// ── C. BTC Halving Countdown ──

const HALVING_BLOCK = 1_050_000;
const BLOCKS_PER_DAY = 144;

function computeHalving(currentBlock: number): HalvingData {
  const blocksRemaining = Math.max(0, HALVING_BLOCK - currentBlock);
  const progressPercent = Math.min(100, ((currentBlock - 840_000) / (HALVING_BLOCK - 840_000)) * 100);
  const daysRemaining = blocksRemaining / BLOCKS_PER_DAY;
  const estimatedTimestamp = Date.now() + daysRemaining * 86400 * 1000;
  const estimatedDate = new Date(estimatedTimestamp);
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return {
    currentBlock,
    blocksRemaining,
    progressPercent: Math.round(progressPercent * 10) / 10,
    estimatedDate: `${estimatedDate.getFullYear()}年${months[estimatedDate.getMonth()]}${estimatedDate.getDate()}日`,
  };
}

export async function fetchHalvingData(): Promise<HalvingData | null> {
  try {
    const text = await fetchJson<string>('https://blockchain.info/q/getblockcount');
    const block = parseInt(String(text).trim(), 10);
    if (isNaN(block)) throw new Error('Invalid block height');
    return computeHalving(block);
  } catch (err) {
    console.warn('[Web3Data] Halving fetch failed, falling back to time estimate:', err instanceof Error ? err.message : err);
    // Fallback: estimate from elapsed time since last halving
    const HALVING_DATE_ESTIMATE = new Date('2028-03-26').getTime();
    const sinceLastHalving = Date.now() - HALVING_DATE_ESTIMATE;
    const elapsedBlocks = Math.floor(sinceLastHalving / (86400 * 1000) * BLOCKS_PER_DAY);
    const estimatedBlock = 840_000 + Math.max(0, elapsedBlocks);
    const clampedBlock = Math.min(estimatedBlock, HALVING_BLOCK - 1);
    return computeHalving(clampedBlock);
  }
}

// ── D. Trending Coins ──

interface TrendingItem {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank?: number;
  price_btc?: number;
  thumb?: string;
}

interface TrendingResponse {
  coins?: Array<{ item: TrendingItem }>;
}

export async function fetchTrendingCoins(): Promise<TrendingCoin[]> {
  try {
    const json = await fetchJson<TrendingResponse>('https://api.coingecko.com/api/v3/search/trending');
    const coins = json?.coins;
    if (!Array.isArray(coins)) return [];
    const trending = coins.slice(0, 4).map((c) => ({
      id: c.item.id ?? '',
      symbol: (c.item.symbol ?? '').toUpperCase(),
      name: c.item.name ?? '',
      marketCapRank: c.item.market_cap_rank != null ? Number(c.item.market_cap_rank) : null,
      priceBtc: c.item.price_btc != null ? Number(c.item.price_btc) : null,
      priceUsd: null as number | null,
      thumb: c.item.thumb ?? '',
    }));

    // Batch-fetch USD prices for all trending coins
    const ids = trending.map((c) => c.id).filter(Boolean).join(',');
    if (ids) {
      try {
        const priceJson = await fetchJson<Record<string, { usd?: number }>>(
          `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd`,
        );
        if (priceJson) {
          for (const coin of trending) {
            const price = priceJson[coin.id];
            if (price?.usd != null) {
              coin.priceUsd = price.usd;
            }
          }
        }
      } catch {
        // USD prices are optional enhancement; don't fail the whole fetch
      }
    }

    return trending;
  } catch (err) {
    console.warn('[Web3Data] Trending fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

// ── E. Gas Tracker ──

interface CGSimplePrice {
  ethereum?: { usd?: number };
}

interface EtherscanGasOracle {
  status: string;
  result?: {
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
  };
}

async function fetchEthPrice(): Promise<number | null> {
  try {
    const json = await fetchJson<CGSimplePrice>(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
    );
    return json?.ethereum?.usd ?? null;
  } catch {
    return null;
  }
}

async function fetchGasOracle(): Promise<{ low: number; average: number; high: number } | null> {
  try {
    const json = await fetchJson<EtherscanGasOracle>(
      'https://api.etherscan.io/api?module=gastracker&action=gasoracle',
    );
    if (json?.status !== '1' || !json?.result) return null;
    return {
      low: Number(json.result.SafeGasPrice),
      average: Number(json.result.ProposeGasPrice),
      high: Number(json.result.FastGasPrice),
    };
  } catch {
    return null;
  }
}

export async function fetchGasData(): Promise<GasData | null> {
  try {
    const [ethPrice, gasOracle] = await Promise.allSettled([
      fetchEthPrice(),
      fetchGasOracle(),
    ]);

    const price = ethPrice.status === 'fulfilled' ? ethPrice.value : null;
    const gas = gasOracle.status === 'fulfilled' ? gasOracle.value : null;

    if (price == null && gas == null) return null;

    return {
      ethPrice: price ?? 0,
      low: gas?.low ?? null,
      average: gas?.average ?? null,
      high: gas?.high ?? null,
    };
  } catch (err) {
    console.warn('[Web3Data] Gas data fetch failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

// ── Web3 Aggregate ──

export async function fetchAllWeb3Data(): Promise<Web3Data> {
  const [fearGreed, cryptoGlobal, halving, trending, gas] = await Promise.allSettled([
    fetchFearGreedIndex(),
    fetchCryptoGlobal(),
    fetchHalvingData(),
    fetchTrendingCoins(),
    fetchGasData(),
  ]);

  return {
    fearGreed: fearGreed.status === 'fulfilled' ? fearGreed.value : null,
    cryptoGlobal: cryptoGlobal.status === 'fulfilled' ? cryptoGlobal.value : null,
    halving: halving.status === 'fulfilled' ? halving.value : null,
    trending: trending.status === 'fulfilled' ? trending.value : [],
    gas: gas.status === 'fulfilled' ? gas.value : null,
  };
}
