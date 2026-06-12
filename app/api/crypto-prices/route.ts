import { NextResponse } from 'next/server';

/**
 * 服务端代理加密货币价格 → Gate.io
 * GET /api/crypto-prices?symbols=BTC,ETH,SOL
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');
  if (!symbolsParam) {
    return NextResponse.json({ error: 'Missing symbols' }, { status: 400 });
  }

  const symbols = symbolsParam.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (symbols.length === 0) return NextResponse.json({});

  try {
    const pairs = symbols.map((s) => `${s}_USDT`).join(',');
    const res = await fetch(
      `https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${encodeURIComponent(pairs)}`,
      { cache: 'no-store' },
    );

    if (!res.ok) return NextResponse.json({});

    const data = await res.json() as Array<{ currency_pair: string; last: string }>;
    const prices: Record<string, number> = {};

    for (const item of data) {
      const symbol = item.currency_pair.replace('_USDT', '');
      const price = parseFloat(item.last);
      if (!isNaN(price) && price > 0) {
        prices[symbol] = price;
      }
    }

    return NextResponse.json(prices);
  } catch {
    return NextResponse.json({});
  }
}
