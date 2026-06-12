// ── Ethereum Wallet (Ethplorer free API) ──

import { fetchJson } from './fetcher';
import type { ChainBalance, TokenBalance } from './types';

// ── Type Guards ──

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function safeString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function safeNumber(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return isFinite(n) ? n : null;
}

function parseEthToken(t: Record<string, unknown>): TokenBalance | null {
  const info = isRecord(t.tokenInfo) ? t.tokenInfo : {};
  const decimals = parseInt(String(info.decimals ?? '18'), 10) || 18;
  const balanceRaw = t.balance != null ? Number(t.balance) : 0;
  const balance = balanceRaw / 10 ** decimals;
  if (balance <= 0) return null;

  const priceInfo = isRecord(info.price) ? info.price : null;
  const price = priceInfo ? safeNumber(priceInfo.rate) : null;
  const change24hPercent = priceInfo ? safeNumber(priceInfo.diff) : null;

  return {
    symbol: safeString(info.symbol, 'UNKNOWN'),
    name: safeString(info.name, safeString(info.symbol, 'Unknown Token')),
    contractAddress: safeString(info.address),
    balance,
    decimals,
    price,
    change24hPercent,
  };
}

export async function fetchEthWallet(address: string): Promise<ChainBalance> {
  const addr = address.trim();
  if (!addr) {
    return { chain: 'eth', nativeBalance: 0, nativePrice: null, nativeChange24h: null, tokens: [], error: '未配置地址' };
  }

  try {
    const data = await fetchJson<Record<string, unknown>>(
      `https://api.ethplorer.io/getAddressInfo/${addr}?apiKey=freekey`,
    );

    if (data.error) {
      const errMsg = isRecord(data.error) ? safeString(data.error.message, '未知错误') : '未知错误';
      throw new Error(errMsg);
    }

    const eth = isRecord(data.ETH) ? data.ETH : null;
    const nativeBalance = eth?.balance != null ? Number(eth.balance) : 0;

    const ethPrice = isRecord(eth?.price) ? eth.price : null;
    const nativePrice = ethPrice ? safeNumber(ethPrice.rate) : null;
    const nativeChange24h = ethPrice ? safeNumber(ethPrice.diff) : null;

    const rawTokens = Array.isArray(data.tokens) ? data.tokens as Record<string, unknown>[] : [];
    const tokens: TokenBalance[] = [];
    for (const t of rawTokens) {
      if (!isRecord(t)) continue;
      const parsed = parseEthToken(t);
      if (parsed) tokens.push(parsed);
    }

    return { chain: 'eth', nativeBalance, nativePrice, nativeChange24h, tokens };
  } catch (err) {
    console.warn('[ChainData] ETH fetch failed:', err instanceof Error ? err.message : err);
    return {
      chain: 'eth', nativeBalance: 0, nativePrice: null, nativeChange24h: null,
      tokens: [], error: err instanceof Error ? err.message : 'ETH 查询失败',
    };
  }
}
