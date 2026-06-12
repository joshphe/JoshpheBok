// ── A-Share & US Stock Market Data (Eastmoney) ──

import { fetchJson } from './fetcher';
import type { IndexItem } from './types';

interface EastmoneyResponse {
  data?: {
    diff?: Array<{
      f12?: string;
      f14?: string;
      f2?: number;
      f3?: number;
      f4?: number;
    }>;
  };
}

async function fetchIndexBatch(secids: string[]): Promise<IndexItem[]> {
  const symbols = secids.join(',');
  try {
    const json = await fetchJson<EastmoneyResponse>(
      `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&secids=${symbols}&fields=f12,f14,f2,f3,f4`,
    );
    const data = json?.data?.diff;
    if (!data || !Array.isArray(data)) {
      console.warn('[MarketData] Unexpected response format for', secids);
      return [];
    }
    return data.map((d) => ({
      symbol: d.f12 ?? '',
      name: d.f14 ?? '',
      price: d.f2 != null ? Number(d.f2) : null,
      changeAmount: d.f4 != null ? Number(d.f4) : null,
      changePercent: d.f3 != null ? Number(d.f3) : null,
    }));
  } catch (err) {
    console.warn('[MarketData] Stock fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

export async function fetchAShares(): Promise<IndexItem[]> {
  return fetchIndexBatch(['1.000001', '1.000300', '0.399006']);
}

export async function fetchUSStocks(): Promise<IndexItem[]> {
  return fetchIndexBatch(['100.DJIA', '100.NDX', '100.SPX']);
}
