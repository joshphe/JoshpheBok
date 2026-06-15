'use client';

import { useState, useCallback } from 'react';
import { usePolling } from '@/hooks/usePolling';
import { fetchCrypto } from '@/lib/api/market-crypto';
import { fetchJson } from '@/lib/api/fetcher';
import styles from '@/styles/components/FinanceTicker.module.scss';

interface TickerItem {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
}

const DOTS: Record<string, string> = {
  BTC: '#F7931A', ETH: '#627EEA', BNB: '#F3BA2F',
  NVDA: '#76B900', AAPL: '#555555', GOOGL: '#4285F4',
};

function formatPrice(p: number | null): string {
  if (p == null) return '—';
  if (p >= 1000) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1) return '$' + p.toFixed(2);
  return '$' + p.toPrecision(4);
}

function fmtChange(c: number | null): string {
  if (c == null) return '—';
  return `${c > 0 ? '+' : ''}${c.toFixed(2)}%`;
}

// ── US Stock fetch (individual tickers via Eastmoney) ──

interface StockApiResponse {
  data?: {
    f43?: number;   // price * 1000
    f57?: string;   // code
    f170?: number;  // changePercent * 100
  };
}

const STOCK_SYMBOLS = [
  { sym: 'NVDA', secid: '105.NVDA', name: 'NVIDIA' },
  { sym: 'AAPL', secid: '105.AAPL', name: 'Apple' },
  { sym: 'GOOGL', secid: '105.GOOGL', name: 'Alphabet' },
];

async function fetchStocks(): Promise<TickerItem[]> {
  const results: TickerItem[] = [];
  for (const s of STOCK_SYMBOLS) {
    try {
      const json = await fetchJson<StockApiResponse>(
        `https://push2.eastmoney.com/api/qt/stock/get?secid=${s.secid}&fields=f43,f57,f170`,
      );
      const d = json?.data;
      if (!d || d.f43 == null) {
        console.warn(`[Ticker] ${s.sym} missing data`);
        continue;
      }
      results.push({
        symbol: s.sym,
        name: s.name,
        price: d.f43 / 1000,
        changePercent: d.f170 != null ? d.f170 / 100 : null,
      });
    } catch (err) {
      console.warn(`[Ticker] ${s.sym} fetch failed:`, err instanceof Error ? err.message : err);
    }
  }
  return results;
}

// ── Component ──

export default function FinanceTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  const load = useCallback(async (_signal: AbortSignal) => {
    const settled = await Promise.allSettled([fetchCrypto(), fetchStocks()]);
    let all: TickerItem[] = [];
    for (const r of settled) {
      if (r.status === 'fulfilled') all = all.concat(r.value);
    }
    if (all.length > 0) setItems(all);
  }, []);

  usePolling(load);

  // Duplicate for seamless marquee
  const doubled = [...items, ...items];

  return (
    <div className={styles.strip}>
      <div className={styles.track}>
        <div className={styles.run}>
          {doubled.length > 0 ? (
            doubled.map((item, i) => {
              const up = item.changePercent != null && item.changePercent >= 0;
              const down = item.changePercent != null && item.changePercent < 0;
              return (
                <span key={i} className={styles.item}>
                  <span className={styles.dot} style={{ background: DOTS[item.symbol] ?? 'var(--color-primary)' }} />
                  <span className={styles.symbol}>{item.symbol}</span>
                  <span className={styles.price}>{formatPrice(item.price)}</span>
                  <span className={`${styles.change} ${up ? styles.up : ''} ${down ? styles.down : ''}`}>
                    {fmtChange(item.changePercent)}
                  </span>
                </span>
              );
            })
          ) : (
            <span className={styles.placeholder}>加载中...</span>
          )}
        </div>
      </div>
    </div>
  );
}
