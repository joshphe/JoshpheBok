// ── BNB Chain (Covalent API + public RPC fallback) ──

import { fetchJson, rpcCall } from './fetcher';
import type { ChainBalance, TokenBalance } from './types';

const BSC_RPCS = [
  'https://bsc.publicnode.com',
  'https://bsc-dataseed2.binance.org',
  'https://bsc-dataseed3.binance.org',
  'https://1rpc.io/bnb',
  'https://bsc-dataseed4.binance.org',
];

// ── Covalent API key (obfuscated at rest) ──

function decodeApiKey(encoded: string): string {
  if (!encoded) return '';
  try {
    const xorKey = 0x7b;
    const binary = atob(encoded);
    let result = '';
    for (let i = 0; i < binary.length; i++) {
      result += String.fromCharCode(binary.charCodeAt(i) ^ xorKey);
    }
    return result;
  } catch {
    return '';
  }
}

const COVALENT_KEY = decodeApiKey(process.env.NEXT_PUBLIC_COVALENT_API_KEY ?? '');

interface CovalentTokenItem {
  contract_address: string;
  contract_ticker_symbol: string;
  contract_name: string;
  contract_decimals: number;
  balance: string;
  quote: number | null;
  quote_rate: number | null;
  quote_rate_24h: number | null;
}

interface CovalentResponse {
  data?: {
    items?: CovalentTokenItem[];
  };
}

async function discoverBep20TokensCovalent(address: string): Promise<{
  tokens: TokenBalance[];
  nativeBalance: number;
}> {
  if (!COVALENT_KEY) {
    console.warn('[ChainData] No Covalent API key — falling back to RPC-only BNB balance');
    return { tokens: [], nativeBalance: 0 };
  }

  try {
    const data = await fetchJson<CovalentResponse>(
      `https://api.covalenthq.com/v1/56/address/${address}/balances_v2/?key=${COVALENT_KEY}&nft=false&no-nft-fetch=true`,
      { timeout: 10000 },
    );

    const items = data?.data?.items ?? [];
    const tokens: TokenBalance[] = [];
    let nativeBalance = 0;

    for (const item of items) {
      const addr = item.contract_address.toLowerCase();
      const decimals = item.contract_decimals || 18;
      const balanceNum = Number(item.balance || '0');
      if (!isFinite(balanceNum)) continue;
      const balance = balanceNum / 10 ** decimals;

      if (addr === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' || item.contract_ticker_symbol === 'BNB') {
        nativeBalance = balance;
        continue;
      }

      if (balance > 0) {
        const price = item.quote_rate ?? (item.quote != null ? item.quote / (balance || 1) : null);
        const change24h = (item.quote_rate_24h != null && item.quote_rate != null && item.quote_rate > 0)
          ? ((item.quote_rate_24h - item.quote_rate) / item.quote_rate) * 100
          : null;

        tokens.push({
          symbol: item.contract_ticker_symbol || 'UNKNOWN',
          name: item.contract_name || item.contract_ticker_symbol || 'Unknown',
          contractAddress: item.contract_address,
          balance,
          decimals,
          price,
          change24hPercent: change24h,
        });
      }
    }

    console.log(`[ChainData] Covalent: ${tokens.length} tokens + ${nativeBalance.toFixed(6)} BNB`);
    return { tokens, nativeBalance };
  } catch (err) {
    console.warn('[ChainData] Covalent fetch failed:', err instanceof Error ? err.message : err);
    return { tokens: [], nativeBalance: 0 };
  }
}

interface BinanceTicker {
  lastPrice: string;
  priceChangePercent: string;
}

export async function fetchBnbWallet(address: string): Promise<ChainBalance> {
  const addr = address.trim();
  if (!addr) {
    return { chain: 'bnb', nativeBalance: 0, nativePrice: null, nativeChange24h: null, tokens: [], error: '未配置地址' };
  }

  try {
    let nativeBalance = 0;
    let tokens: TokenBalance[] = [];

    const covalent = await discoverBep20TokensCovalent(addr);
    if (covalent.tokens.length > 0 || covalent.nativeBalance > 0) {
      nativeBalance = covalent.nativeBalance;
      tokens = covalent.tokens;
    } else {
      console.log('[ChainData] Covalent returned no data, falling back to RPC');
      const rawBalance = await rpcCall<string>(BSC_RPCS, 'eth_getBalance', [addr, 'latest']);
      nativeBalance = parseInt(rawBalance, 16) / 1e18;
    }

    // BNB price from Binance
    let nativePrice: number | null = null;
    let nativeChange24h: number | null = null;
    try {
      const ticker = await fetchJson<BinanceTicker>('https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT');
      nativePrice = parseFloat(ticker.lastPrice);
      nativeChange24h = parseFloat(ticker.priceChangePercent);
    } catch {
      console.warn('[ChainData] BNB price fetch failed');
    }

    // Token prices for RPC-fallback tokens (Covalent already includes quotes)
    if (tokens.length > 0 && tokens.some((t) => t.price == null)) {
      const contracts = tokens.filter((t) => t.price == null).map((t) => t.contractAddress).join(',');
      try {
        const priceData = await fetchJson<Record<string, { usd: number; usd_24h_change?: number }>>(
          `https://api.coingecko.com/api/v3/simple/token_price/bsc?contract_addresses=${contracts}&vs_currencies=usd&include_24hr_change=true`,
        );
        for (const t of tokens) {
          if (t.price == null) {
            const pd = priceData[t.contractAddress.toLowerCase()];
            if (pd) {
              t.price = pd.usd;
              t.change24hPercent = pd.usd_24h_change ?? null;
            }
          }
        }
      } catch {
        // tokens without prices filtered by $2 threshold anyway
      }
    }

    return { chain: 'bnb', nativeBalance, nativePrice, nativeChange24h, tokens };
  } catch (err) {
    console.warn('[ChainData] BNB fetch failed:', err instanceof Error ? err.message : err);
    return {
      chain: 'bnb', nativeBalance: 0, nativePrice: null, nativeChange24h: null,
      tokens: [], error: err instanceof Error ? err.message : 'BNB 查询失败',
    };
  }
}
