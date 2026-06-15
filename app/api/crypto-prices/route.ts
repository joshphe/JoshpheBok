import { NextResponse } from 'next/server';

/**
 * 服务端代理加密货币价格 → Gate.io 优先，CoinGecko 兜底
 * GET /api/crypto-prices?symbols=BTC,ETH,BGB
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');
  if (!symbolsParam) {
    return NextResponse.json({ error: 'Missing symbols' }, { status: 400 });
  }

  const symbols = symbolsParam.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (symbols.length === 0) return NextResponse.json({});

  const prices: Record<string, number> = {};

  // ── Primary: Gate.io (each pair individually) ──
  try {
    const gateResults = await Promise.allSettled(
      symbols.map(async (s) => {
        const res = await fetch(
          `https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${s}_USDT`,
          { cache: 'no-store' },
        );
        if (!res.ok) return null;
        const data = await res.json() as Array<{ currency_pair: string; last: string }>;
        return data?.[0] ?? null;
      }),
    );

    for (const r of gateResults) {
      if (r.status !== 'fulfilled' || !r.value) continue;
      const item = r.value;
      const sym = item.currency_pair.replace('_USDT', '');
      const price = parseFloat(item.last);
      if (!isNaN(price) && price > 0) {
        prices[sym] = price;
      }
    }
  } catch { /* continue to fallback */ }

  // ── Fallback: CoinGecko for symbols Gate.io doesn't cover ──
  const missing = symbols.filter((s) => !(s in prices));
  if (missing.length > 0) {
    const ids = missing
      .map((s) => COINGECKO_ID_MAP[s] ?? null)
      .filter(Boolean)
      .join(',');

    if (ids) {
      try {
        const cgRes = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
          { cache: 'no-store' },
        );
        if (cgRes.ok) {
          const cgData = await cgRes.json() as Record<string, { usd?: number }>;
          // Reverse-map: CoinGecko id → symbol
          const reverseMap: Record<string, string> = {};
          for (const [sym, id] of Object.entries(COINGECKO_ID_MAP)) {
            reverseMap[id] = sym;
          }
          for (const [id, val] of Object.entries(cgData)) {
            const sym = reverseMap[id];
            if (sym && val?.usd != null && val.usd > 0) {
              prices[sym] = val.usd;
            }
          }
        }
      } catch { /* best-effort fallback */ }
    }
  }

  return NextResponse.json(prices);
}

/** Symbol → CoinGecko ID mapping for coins not listed on Gate.io */
const COINGECKO_ID_MAP: Record<string, string> = {
  BGB: 'bitget-token',
  OKB: 'okb',
  LEO: 'leo-token',
  CRO: 'crypto-com-chain',
  MNT: 'mantle',
  TON: 'the-open-network',
};
