// ── 按持仓 symbol 获取实时市价 ──

import { fetchJson } from '@/lib/api/fetcher';

// ── 美股: 东方财富（单个/批量查询） ──

interface EastmoneyStockItem {
  f2?: number;  // latest price
  f12?: string; // symbol
}

interface EastmoneyStockResponse {
  data?: { diff?: EastmoneyStockItem[] };
}

/**
 * 批量查询美股实时价格
 * 尝试 NASDAQ(105) 和 NYSE(106) 前缀，并行合并
 */
export async function fetchStockPrices(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};

  const uniqueSymbols = [...new Set(symbols.map((s) => s.toUpperCase()))];

  // 并行尝试两种前缀（东方财富不区分交易所时可能会重复，用 Map 去重）
  const [nasdaq, nyse] = await Promise.all([
    tryFetchEastmoney(uniqueSymbols, '105'),
    tryFetchEastmoney(uniqueSymbols, '106'),
  ]);

  return { ...nasdaq, ...nyse };
}

async function tryFetchEastmoney(symbols: string[], prefix: string): Promise<Record<string, number>> {
  const secids = symbols.map((s) => `${prefix}.${s}`).join(',');
  try {
    const json = await fetchJson<EastmoneyStockResponse>(
      `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&secids=${encodeURIComponent(secids)}&fields=f2,f12`,
    );
    const items = json?.data?.diff;
    if (!items || !Array.isArray(items)) return {};

    const prices: Record<string, number> = {};
    for (const item of items) {
      if (item.f12 && item.f2 != null && item.f2 > 0) {
        prices[item.f12.toUpperCase()] = item.f2;
      }
    }
    return prices;
  } catch {
    return {};
  }
}

// ── 加密货币: Binance（已支持 CORS）+ CoinGecko 回退 ──

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
}

interface CoinGeckoPriceResponse {
  [id: string]: { usd: number };
}

// Binance 符号映射
const BINANCE_SYMBOLS: Record<string, string> = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  BNB: 'BNBUSDT',
  SOL: 'SOLUSDT',
  ADA: 'ADAUSDT',
  XRP: 'XRPUSDT',
  DOGE: 'DOGEUSDT',
  DOT: 'DOTUSDT',
  AVAX: 'AVAXUSDT',
  MATIC: 'MATICUSDT',
  LINK: 'LINKUSDT',
  UNI: 'UNIUSDT',
  ATOM: 'ATOMUSDT',
  LTC: 'LTCUSDT',
  ETC: 'ETCUSDT',
  FIL: 'FILUSDT',
  NEAR: 'NEARUSDT',
  APT: 'APTUSDT',
  ARB: 'ARBUSDT',
  OP: 'OPUSDT',
  SUI: 'SUIUSDT',
  TIA: 'TIAUSDT',
  SEI: 'SEIUSDT',
  INJ: 'INJUSDT',
  FET: 'FETUSDT',
  WIF: 'WIFUSDT',
  PEPE: 'PEPEUSDT',
  SHIB: 'SHIBUSDT',
  BONK: 'BONKUSDT',
  FLOKI: 'FLOKIUSDT',
};

// CoinGecko ID 映射（Binance 不支持的币种从这里查）
const COINGECKO_IDS: Record<string, string> = {
  RENDER: 'render-token',
  HNT: 'helium',
  TAO: 'bittensor',
  KAS: 'kaspa',
  CRO: 'crypto-com-chain',
  MNT: 'mantle',
  STRK: 'starknet',
  BLUR: 'blur',
  PYTH: 'pyth-network',
  JTO: 'jito',
  JUP: 'jupiter-exchange-solana',
  WLD: 'worldcoin-wld',
  ORDI: 'ordinals',
  SATS: 'sats',
  RUNE: 'thorchain',
  AAVE: 'aave',
  ALGO: 'algorand',
  ICP: 'internet-computer',
  VET: 'vechain',
  GRT: 'the-graph',
  THETA: 'theta-token',
  FLOW: 'flow',
  AXS: 'axie-infinity',
  SAND: 'the-sandbox',
  MANA: 'decentraland',
  APE: 'apecoin',
  ENS: 'ethereum-name-service',
  LDO: 'lido-dao',
  CRV: 'curve-dao-token',
  SNX: 'synthetix-network-token',
  COMP: 'compound-governance-token',
  MKR: 'maker',
  ZRX: '0x',
  BAT: 'basic-attention-token',
  ZIL: 'zilliqa',
  ONE: 'harmony',
  CELO: 'celo',
  KAVA: 'kava',
  OSMO: 'osmosis',
  DYDX: 'dydx',
  GMX: 'gmx',
  MAGIC: 'magic',
  STG: 'stargate-finance',
  RDNT: 'radiant-capital',
  PENDLE: 'pendle',
  ENA: 'ethena',
  EIGEN: 'eigenlayer',
  ZRO: 'layerzero',
  W: 'wormhole',
};

export async function fetchCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};

  const uniqueSymbols = [...new Set(symbols.map((s) => s.toUpperCase()))];

  // Step 1: 从 Binance 批量查
  const binanceSymbols = uniqueSymbols
    .filter((s) => BINANCE_SYMBOLS[s])
    .map((s) => `"${BINANCE_SYMBOLS[s]}"`);

  const prices: Record<string, number> = {};

  if (binanceSymbols.length > 0) {
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=[${binanceSymbols.join(',')}]`;
    try {
      const data = await fetchJson<BinanceTicker[]>(url);
      for (const item of data) {
        // Reverse lookup: BTCUSDT → BTC
        const base = Object.entries(BINANCE_SYMBOLS).find(
          ([, v]) => v === item.symbol,
        );
        if (base) {
          prices[base[0]] = parseFloat(item.lastPrice);
        }
      }
    } catch {
      // Binance failed, continue to CoinGecko
    }
  }

  // Step 2: Binance 查不到的币种，从 CoinGecko 查
  const remaining = uniqueSymbols.filter((s) => !(s in prices));
  const coingeckoIds = remaining
    .filter((s) => COINGECKO_IDS[s])
    .map((s) => COINGECKO_IDS[s]);

  if (coingeckoIds.length > 0) {
    try {
      const idStr = coingeckoIds.join(',');
      const data = await fetchJson<CoinGeckoPriceResponse>(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(idStr)}&vs_currencies=usd`,
      );
      for (const [id, val] of Object.entries(data)) {
        // Reverse lookup: coingecko id → symbol
        const entry = Object.entries(COINGECKO_IDS).find(([, v]) => v === id);
        if (entry && val?.usd) {
          prices[entry[0]] = val.usd;
        }
      }
    } catch {
      // CoinGecko failed, skip
    }
  }

  return prices;
}
