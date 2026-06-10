// ── Market data fetching utilities ──

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

const FETCH_TIMEOUT = 8000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ── A-Share indices (Eastmoney) ──

const A_SHARE_INDICES = [
  { secid: '1.000001', name: '上证指数' },
  { secid: '1.000300', name: '沪深300' },
  { secid: '0.399006', name: '创业板指' },
];

export async function fetchAShares(): Promise<IndexItem[]> {
  const symbols = A_SHARE_INDICES.map((s) => s.secid).join(',');
  try {
    const res = await fetchWithTimeout(
      `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&secids=${symbols}&fields=f12,f14,f2,f3,f4`
    );
    if (!res.ok) throw new Error(`Eastmoney A-shares HTTP ${res.status}`);
    const json = await res.json();
    const data = json?.data?.diff;
    if (!data || !Array.isArray(data)) {
      console.warn('[MarketData] A-shares: unexpected response format');
      return [];
    }
    return data.map((d: Record<string, unknown>) => ({
      symbol: (d.f12 as string) ?? '',
      name: (d.f14 as string) ?? '',
      price: d.f2 != null ? Number(d.f2) : null,
      changeAmount: d.f4 != null ? Number(d.f4) : null,
      changePercent: d.f3 != null ? Number(d.f3) : null,
    }));
  } catch (err) {
    console.warn('[MarketData] A-shares fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

// ── US stock indices (Eastmoney) ──

const US_INDICES = [
  { secid: '100.DJIA', name: '道琼斯' },
  { secid: '100.NDX', name: '纳斯达克' },
  { secid: '100.SPX', name: '标普500' },
];

export async function fetchUSStocks(): Promise<IndexItem[]> {
  const symbols = US_INDICES.map((s) => s.secid).join(',');
  try {
    const res = await fetchWithTimeout(
      `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&secids=${symbols}&fields=f12,f14,f2,f3,f4`
    );
    if (!res.ok) throw new Error(`Eastmoney US HTTP ${res.status}`);
    const json = await res.json();
    const data = json?.data?.diff;
    if (!data || !Array.isArray(data)) {
      console.warn('[MarketData] US stocks: unexpected response format');
      return [];
    }
    return data.map((d: Record<string, unknown>) => ({
      symbol: (d.f12 as string) ?? '',
      name: (d.f14 as string) ?? '',
      price: d.f2 != null ? Number(d.f2) : null,
      changeAmount: d.f4 != null ? Number(d.f4) : null,
      changePercent: d.f3 != null ? Number(d.f3) : null,
    }));
  } catch (err) {
    console.warn('[MarketData] US stocks fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

// ── Crypto (Binance) ──

export async function fetchCrypto(): Promise<CryptoItem[]> {
  try {
    const res = await fetchWithTimeout(
      'https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22%2C%22ETHUSDT%22%2C%22BNBUSDT%22%5D'
    );
    if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);
    const data = await res.json();
    const names: Record<string, string> = { BTCUSDT: 'BTC', ETHUSDT: 'ETH', BNBUSDT: 'BNB' };
    return data.map((t: { symbol: string; lastPrice: string; priceChangePercent: string }) => ({
      symbol: names[t.symbol] ?? t.symbol,
      name: names[t.symbol] ?? t.symbol,
      price: parseFloat(t.lastPrice),
      changePercent: parseFloat(t.priceChangePercent),
    }));
  } catch (err) {
    console.warn('[MarketData] Crypto fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

// ── Aggregate ──

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
