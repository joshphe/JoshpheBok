// ── Market Data Aggregate ──

import type { MarketData } from './types';
import { fetchAShares } from './market-shares';
import { fetchUSStocks } from './market-shares';
import { fetchCrypto } from './market-crypto';

export async function fetchAllMarketData(): Promise<MarketData> {
  const [aShares, usStocks, crypto] = await Promise.allSettled([
    fetchAShares(),
    fetchUSStocks(),
    fetchCrypto(),
  ]);

  return {
    aShares: aShares.status === 'fulfilled' ? aShares.value : [],
    usStocks: usStocks.status === 'fulfilled' ? usStocks.value : [],
    crypto: crypto.status === 'fulfilled' ? crypto.value : [],
  };
}
