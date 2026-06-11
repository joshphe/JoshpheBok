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

// ════════════════════════════════════════════════════════════════
// ── Web3 Data Types ──
// ════════════════════════════════════════════════════════════════

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

// ════════════════════════════════════════════════════════════════
// ── A. Fear & Greed Index (alternative.me) ──
// ════════════════════════════════════════════════════════════════

export async function fetchFearGreedIndex(): Promise<FearGreedData | null> {
  try {
    const res = await fetchWithTimeout('https://api.alternative.me/fng/?limit=1');
    if (!res.ok) throw new Error(`Fear & Greed HTTP ${res.status}`);
    const json = await res.json();
    const item = json?.data?.[0];
    if (!item) throw new Error('Fear & Greed: empty data');
    return {
      value: parseInt(item.value, 10),
      classification: item.value_classification ?? 'Unknown',
    };
  } catch (err) {
    console.warn('[Web3Data] Fear & Greed fetch failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

// ════════════════════════════════════════════════════════════════
// ── B. Crypto Market Overview (CoinGecko) ──
// ════════════════════════════════════════════════════════════════

export async function fetchCryptoGlobal(): Promise<CryptoGlobalData | null> {
  try {
    const res = await fetchWithTimeout('https://api.coingecko.com/api/v3/global');
    if (!res.ok) throw new Error(`CoinGecko global HTTP ${res.status}`);
    const json = await res.json();
    const d = json?.data;
    if (!d) throw new Error('CoinGecko global: empty data');
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

// ════════════════════════════════════════════════════════════════
// ── C. BTC Halving Countdown ──
// ════════════════════════════════════════════════════════════════

const HALVING_BLOCK = 1_050_000;
const BLOCKS_PER_DAY = 144; // ~10 min per block
const HALVING_DATE_ESTIMATE = new Date('2028-03-26').getTime();

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
    const res = await fetchWithTimeout('https://blockchain.info/q/getblockcount');
    if (!res.ok) throw new Error(`Blockchain.info HTTP ${res.status}`);
    const text = await res.text();
    const block = parseInt(text.trim(), 10);
    if (isNaN(block)) throw new Error('Blockchain.info: invalid block height');
    return computeHalving(block);
  } catch (err) {
    console.warn('[Web3Data] Halving fetch failed, falling back to time estimate:', err instanceof Error ? err.message : err);
    // Fallback: estimate from current time
    const sinceLastHalving = Date.now() - HALVING_DATE_ESTIMATE;
    const elapsedBlocks = Math.floor(sinceLastHalving / (86400 * 1000) * BLOCKS_PER_DAY);
    const estimatedBlock = 840_000 + Math.max(0, elapsedBlocks);
    const clampedBlock = Math.min(estimatedBlock, HALVING_BLOCK - 1);
    return computeHalving(clampedBlock);
  }
}

// ════════════════════════════════════════════════════════════════
// ── D. Trending Coins (CoinGecko) ──
// ════════════════════════════════════════════════════════════════

export async function fetchTrendingCoins(): Promise<TrendingCoin[]> {
  try {
    const res = await fetchWithTimeout('https://api.coingecko.com/api/v3/search/trending');
    if (!res.ok) throw new Error(`CoinGecko trending HTTP ${res.status}`);
    const json = await res.json();
    const coins = json?.coins;
    if (!Array.isArray(coins)) throw new Error('CoinGecko trending: unexpected format');
    return coins.slice(0, 4).map((c: { item: Record<string, unknown> }) => {
      const item = c.item;
      return {
        id: (item.id as string) ?? '',
        symbol: ((item.symbol as string) ?? '').toUpperCase(),
        name: (item.name as string) ?? '',
        marketCapRank: item.market_cap_rank != null ? Number(item.market_cap_rank) : null,
        priceBtc: item.price_btc != null ? Number(item.price_btc) : null,
        thumb: (item.thumb as string) ?? '',
      };
    });
  } catch (err) {
    console.warn('[Web3Data] Trending fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

// ════════════════════════════════════════════════════════════════
// ── E. Gas Tracker (CoinGecko ETH price + optional Etherscan) ──
// ════════════════════════════════════════════════════════════════

async function fetchEthPrice(): Promise<number | null> {
  try {
    const res = await fetchWithTimeout(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    );
    if (!res.ok) throw new Error(`ETH price HTTP ${res.status}`);
    const json = await res.json();
    return json?.ethereum?.usd ?? null;
  } catch (err) {
    console.warn('[Web3Data] ETH price fetch failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function fetchGasOracle(): Promise<{ low: number; average: number; high: number } | null> {
  // Etherscan gas oracle requires an API key — graceful degradation
  // If needed in the future, configure ETHERSCAN_API_KEY in env
  try {
    const res = await fetchWithTimeout(
      'https://api.etherscan.io/api?module=gastracker&action=gasoracle'
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.status !== '1' || !json?.result) return null;
    return {
      low: Number(json.result.SafeGasPrice ?? 0),
      average: Number(json.result.ProposeGasPrice ?? 0),
      high: Number(json.result.FastGasPrice ?? 0),
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

    let gas: { low: number; average: number; high: number } | null = null;
    if (gasOracle.status === 'fulfilled') gas = gasOracle.value;

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

// ════════════════════════════════════════════════════════════════
// ── Web3 Aggregate ──
// ════════════════════════════════════════════════════════════════

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
