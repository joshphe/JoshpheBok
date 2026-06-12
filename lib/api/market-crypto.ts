// ── Crypto Prices (Binance) ──

import { fetchJson } from './fetcher';
import type { CryptoItem } from './types';

interface BinanceTicker24h {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
}

const NAMES: Record<string, string> = {
  BTCUSDT: 'BTC',
  ETHUSDT: 'ETH',
  BNBUSDT: 'BNB',
};

export async function fetchCrypto(): Promise<CryptoItem[]> {
  try {
    const data = await fetchJson<BinanceTicker24h[]>(
      'https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22%2C%22ETHUSDT%22%2C%22BNBUSDT%22%5D',
    );
    return data.map((t) => ({
      symbol: NAMES[t.symbol] ?? t.symbol,
      name: NAMES[t.symbol] ?? t.symbol,
      price: parseFloat(t.lastPrice),
      changePercent: parseFloat(t.priceChangePercent),
    }));
  } catch (err) {
    console.warn('[MarketData] Crypto fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}
