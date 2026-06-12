import { NextResponse } from 'next/server';

/**
 * 服务端代理美股价格 → 东方财富（无 CORS，服务端直连）
 * GET /api/stock-prices?symbols=AAPL,BB,NVDA
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
    // Try NASDAQ (105) + NYSE (106) prefixes in parallel
    const nasdaqIds = symbols.map((s) => `105.${s}`).join(',');
    const nyseIds = symbols.map((s) => `106.${s}`).join(',');

    const [nasdaqRes, nyseRes] = await Promise.all([
      fetch(`https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&secids=${encodeURIComponent(nasdaqIds)}&fields=f2,f12`),
      fetch(`https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&secids=${encodeURIComponent(nyseIds)}&fields=f2,f12`),
    ]);

    const prices: Record<string, number> = {};

    for (const res of [nasdaqRes, nyseRes]) {
      if (!res.ok) continue;
      const json = await res.json() as { data?: { diff?: Array<{ f2?: number; f12?: string }> } };
      const items = json?.data?.diff;
      if (!items || !Array.isArray(items)) continue;
      for (const item of items) {
        if (item.f12 && item.f2 != null && item.f2 > 0) {
          prices[item.f12.toUpperCase()] = item.f2;
        }
      }
    }

    return NextResponse.json(prices);
  } catch {
    return NextResponse.json({});
  }
}
