// ── 按持仓 symbol 获取实时市价（走 Next.js API Route 代理，无 CORS 问题）──

// ── 美股: API Route → 东方财富 ──

export async function fetchStockPrices(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};
  const uniqueSymbols = [...new Set(symbols.map((s) => s.toUpperCase()))];

  try {
    const res = await fetch(`/api/stock-prices?symbols=${uniqueSymbols.join(',')}`);
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

// ── 加密货币: API Route → Gate.io ──

export async function fetchCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};
  const uniqueSymbols = [...new Set(symbols.map((s) => s.toUpperCase()))];

  try {
    const res = await fetch(`/api/crypto-prices?symbols=${uniqueSymbols.join(',')}`);
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}
